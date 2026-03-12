import axios from 'axios'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import fs from 'fs'
import express, { Request, Response } from 'express'
import { OpenAI } from 'openai'
import { SimpleDirectoryReader, VectorStoreIndex, Document } from 'llamaindex'
import path from 'path'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import requestIp from 'request-ip'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { Contract, EventFilter } from 'ethers'

const EthDater = require('ethereum-block-by-date')
const cors = require('cors')

dotenv.config()

interface spinData {
  [user: string]: {
    [chain: string]: {
      spins: number
      lastFreeSpinEpoch: number
    }
  }
}

interface history {
  chainId: string
  user: string
  balance: string
  spin: string
  matches: string
  winnings: string
  txHash?: string
}

interface colInfo {
  volume: string
  name: string
  TotalSupply: string
  LowPrice: string
  HighPrice: string
  amountListed: string
}

interface nftInfo {
  name: string
  image_url: string
  description: string
  attributes: []
}

interface allInfo {
  [collection: string]: {
    info: colInfo
    nfts: { [nft_id: string]: nftInfo }
  }
}

interface cInfo {
  [collection: string]: {
    info: colInfo
  }
}

interface ChainConfigDex {
  chainId: number
  provider: ethers.providers.JsonRpcProvider
  exploer: string
  factory: string
  infoGetter: string
  BLOCK_LENGTH: number
  isV2: boolean
}

interface ChainConfigGame {
  TOKEN: string
  ROUTER: string
  MARSHOT: string
  RPC: string
  JACKPOT: number
  WINNINGS: number[][]
}

interface GlobalConfig {
  PRIVATE_KEY: string
  MAXRANDOM: number
  CHAINS: Record<number, ChainConfigGame>
}

const routerAbi = require('../abis/routerAbi.json')
const marshotAbi = require('../abis/marshotAbi.json')
const tokenAbi = require('../abis/token.json')
const lpabi = require('../abis/lp.json')
const fabi = require('../abis/factory.json')
const infoAbi = require('../abis/info.json')
const marketAbi = require('../abis/nftMarket.json')
const nftColAbi = require('../abis/nftCollections.json')
const divTrackerAbi = require('../abis/divTracker.json')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EVENT_TOPIC_PAIRCREATED =
  '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'

const app = express()

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://venerable-cupcake-ec1bc0.netlify.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
  })
)

app.use(bodyParser.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const redisConfigured =
  !!process.env.UPSTASH_REDIS_URL && !!process.env.UPSTASH_REDIS_TOKEN

const redis = redisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL as string,
      token: process.env.UPSTASH_REDIS_TOKEN as string
    })
  : null

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(10, '3 m')
    })
  : null

let spinAmounts: spinData = {}
let historyData: history[] = []
let mainInfo: {
  [x: string]: {
    chain_id: any
    base_id: any
    base_name: any
    base_symbol: any
    quote_id: any
    quote_name: any
    quote_symbol: any
    pair_id: any
    last_price: string
    low_price_24hr: string
    high_price_24hr: string
    change_24hr: string
    base_volume: string
    quote_volume: string
    tx_count: string
  }
}[] = []
let dividendsPaid: { [x: string]: { amountPaid: string } }[] = []
let loaded = false
let marketInfo: allInfo = {}
let queryEngine: any

const getPairsAmount = 50
const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/'

const nftMarket = process.env.NFT_MARKET_ADDRESS || ZERO_ADDRESS
const nftPovider = new ethers.providers.JsonRpcProvider(
  process.env.NFT_CHAIN_RPC_URL || process.env.BSC_TESTNET_RPC_URL
)
const marketContract = new ethers.Contract(nftMarket, marketAbi, nftPovider)

const chainConfig: ChainConfigDex[] = [
  {
    chainId: 97,
    provider: new ethers.providers.JsonRpcProvider(
      process.env.BSC_TESTNET_RPC_URL
    ),
    exploer: 'https://testnet.bscscan.com/',
    factory: process.env.BSC_TESTNET_FACTORY || ZERO_ADDRESS,
    infoGetter: process.env.BSC_TESTNET_INFO_GETTER || ZERO_ADDRESS,
    BLOCK_LENGTH: 3,
    isV2: true
  },
  {
    chainId: 11155111,
    provider: new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL),
    exploer: 'https://sepolia.etherscan.io/',
    factory: process.env.SEPOLIA_FACTORY || ZERO_ADDRESS,
    infoGetter: process.env.SEPOLIA_INFO_GETTER || ZERO_ADDRESS,
    BLOCK_LENGTH: 12,
    isV2: true
  },
  {
    chainId: 1,
    provider: new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL),
    exploer: 'https://etherscan.io/',
    factory: process.env.ETHEREUM_FACTORY || ZERO_ADDRESS,
    infoGetter: process.env.ETHEREUM_INFO_GETTER || ZERO_ADDRESS,
    BLOCK_LENGTH: 12,
    isV2: true
  }
]

const createGameChain = (
  chainId: number,
  prefix: string,
  defaultRpc = ''
): [number, ChainConfigGame] | null => {
  const TOKEN = process.env[`${prefix}_TOKEN`] || ''
  const ROUTER = process.env[`${prefix}_ROUTER`] || ''
  const MARSHOT = process.env[`${prefix}_MARSHOT`] || ''
  const RPC = process.env[`${prefix}_RPC`] || defaultRpc

  if (!TOKEN || !ROUTER || !MARSHOT || !RPC) return null

  return [
    chainId,
    {
      TOKEN,
      ROUTER,
      MARSHOT,
      RPC,
      JACKPOT: Number(process.env[`${prefix}_JACKPOT`] || 8000),
      WINNINGS: [
        [0, 0],
        [10, 2000],
        [25, 20000],
        [100, 100000],
        [250, 200000],
        [500, 400000],
        [1000, 800000],
        [2000, 1600000],
        [3000, 3200000],
        [4000, 6400000],
        [5000, 10000000]
      ]
    }
  ]
}

const gameChains = [
  createGameChain(
    97,
    'BSC_TESTNET_GAME',
    process.env.BSC_TESTNET_RPC_URL || ''
  ),
  createGameChain(11155111, 'SEPOLIA_GAME', process.env.SEPOLIA_RPC_URL || ''),
  createGameChain(1, 'ETHEREUM_GAME', process.env.ETHEREUM_RPC_URL || '')
].filter(Boolean) as [number, ChainConfigGame][]

const GLOBAL_CONFIG: GlobalConfig = {
  PRIVATE_KEY: process.env.PKEY ?? '',
  MAXRANDOM: 30000000000,
  CHAINS: Object.fromEntries(gameChains)
}

const rateLimitMessage =
  'You have exceeded the AI helper limit. Please wait 10 minutes and try again.'

const isZeroAddress = (value?: string) =>
  !value || value === ZERO_ADDRESS || value.trim() === ''

const createQueryEngine = async () => {
  try {
    const docsPath = path.join(process.cwd(), './docs_marswap')
    const reader = new SimpleDirectoryReader()
    const documents: Document[] = await reader.loadData(docsPath)

    const index = await VectorStoreIndex.fromDocuments(documents)
    queryEngine = index.asQueryEngine()
    console.log('Query engine ready')
  } catch (error) {
    console.error('Error creating query engine:', error)
  }
}

const askOpenAI = async (inp: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are the ShadowVault AI assistant. Help users understand DeFi strategies, wallet activity, and portfolio insights. Explain transactions clearly and provide educational guidance. Do not present financial advice as guaranteed outcomes.'
      },
      {
        role: 'user',
        content: inp
      }
    ]
  })

  return completion.choices?.[0]?.message?.content || 'No response available.'
}

const ai_response_desc = async (inp: string) => {
  console.log(inp)
  if (queryEngine) {
    const response = await queryEngine.query({ query: inp })
    return response.toString()
  }
  return askOpenAI(inp)
}

const ai_response = async (inp: string) => {
  if (queryEngine) {
    const response = await queryEngine.query({ query: inp })
    return response.toString()
  }
  return askOpenAI(inp)
}

app.get('/api/data', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(
      'https://techposintegrations.azurewebsites.net/digitalsignage/carousel/1/468'
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

if (process.env.ENABLE_DOCS_BOOT === 'true') {
  createQueryEngine()
}

app.post('/api/response', async (req: Request, res: Response) => {
  try {
    if (ratelimit) {
      const detectedIp = requestIp.getClientIp(req)

      if (!detectedIp) {
        throw new Error('Client IP could not be detected')
      }

      const result = await ratelimit.limit(detectedIp)
      if (!result.success) {
        return res.status(200).json({ message: rateLimitMessage })
      }
    }
  } catch (ex) {
    console.log(ex)
    return res.status(200).json({ message: rateLimitMessage })
  }

  let input = req.body.inp
  console.log(input)

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'inp is required' })
  }

  if (input.startsWith('ADD DESC')) {
    input = input.replace('ADD DESC: ', '')
    input = `You are given this text ${input}. Your role is expand on it and write a fun descriptive piece about a cryptocurrency in under 600 characters. Make it unique every time and dont use apostraphes`
    try {
      const output = await ai_response_desc(input)
      return res.status(200).json({ message: output })
    } catch (error) {
      console.error('Error:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  try {
    const output = await ai_response(input)
    return res.status(200).json({ message: output })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/api/ai-agent', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages?: { role: string; content: string }[]
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' })
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages.map((m) => ({
        role:
          m.role === 'system' || m.role === 'assistant' || m.role === 'user'
            ? (m.role as any)
            : 'user',
        content: m.content
      })),
      stream: true
    } as any)

    for await (const chunk of completion as any) {
      const delta = (chunk as any).choices?.[0]?.delta?.content
      if (delta) {
        res.write(delta)
      }
    }

    res.end()
  } catch (error) {
    console.error('Error in /api/ai-agent:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'ShadowVault AI agent error' })
    } else {
      res.end()
    }
  }
})

app.get('/V2/allPairs', (_req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }

  try {
    const history = fs.readFileSync('./pairs.json', 'utf-8')
    const historyParsed = JSON.parse(history)
    res.json(historyParsed)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Failed to fetch the current price, volume, and token details of the pairs.'
    })
  }
})

app.get('/V2/pairs', (_req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }

  try {
    const pairsWithBaseVolume = mainInfo.filter(
      (pair) => parseFloat(pair[Object.keys(pair)[0]].base_volume) > 0
    )
    const slicedPairs = pairsWithBaseVolume.slice(0, 50)
    res.json(slicedPairs)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Failed to fetch the current price, volume, and token details of the pairs.'
    })
  }
})

app.get('/V2/divpaid', (_req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }

  try {
    res.json(dividendsPaid)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch Dividends paid out' })
  }
})

async function listenForNewPairs() {
  console.log('listening for new pairs')

  for (const chain of chainConfig) {
    if (
      isZeroAddress(chain.factory) ||
      isZeroAddress(chain.infoGetter)
    ) {
      console.log(
        `Skipping pair listener for chain ${chain.chainId} - missing contract addresses`
      )
      continue
    }

    const { chainId, provider, factory, infoGetter } = chain

    try {
      const factoryContract = new ethers.Contract(factory, fabi, provider)
      const getterContract = new ethers.Contract(infoGetter, infoAbi, provider)

      factoryContract.on('PairCreated', async (pair, allPairslength) => {
        console.log(`new pair created on chain ${chainId}`)

        try {
          const index = new BigNumber(allPairslength.toString())
            .minus(1)
            .toNumber()
          const allPairInfo = await getterContract.getApiInfo(
            factory,
            index,
            index
          )

          if (pair.toString() !== allPairInfo.pair[0].toString()) {
            console.log('pairs do not match')
            return
          }

          const tokenAAddress = allPairInfo.tokenA[0]
          const tokenBAddress = allPairInfo.tokenB[0]
          const tokenAName = allPairInfo.aName[0]
          const tokenASymbol = allPairInfo.aSym[0]
          const tokenBName = allPairInfo.bName[0]
          const tokenBSymbol = allPairInfo.bSym[0]
          const price = new BigNumber(0)

          const label = `${tokenAAddress}_${tokenBAddress}`
          const responseData = {
            [label]: {
              chain_id: chainId,
              base_id: tokenAAddress,
              base_name: tokenAName,
              base_symbol: tokenASymbol,
              quote_id: tokenBAddress,
              quote_name: tokenBName,
              quote_symbol: tokenBSymbol,
              pair_id: allPairInfo.pair[0],
              last_price: price.toFixed(18),
              low_price_24hr: '0',
              high_price_24hr: '0',
              change_24hr: '0',
              base_volume: '0',
              quote_volume: '0',
              tx_count: '0'
            }
          }

          mainInfo.push(responseData)

          fs.writeFile('pairs.json', JSON.stringify(mainInfo), (err) => {
            if (err) console.error('Error writing to file:', err)
          })
        } catch {
          console.log(`Error setting up New Pair Created on chain ${chainId}`)
        }
      })
    } catch (err) {
      console.log(`Failed to initialize pair listener on chain ${chainId}`, err)
    }
  }
}

async function GatherData() {
  console.log('starting up')

  const tmpInfo: any[] = []
  const tmpDiv: any[] = []

  for (const chain of chainConfig) {
    if (
      isZeroAddress(chain.factory) ||
      isZeroAddress(chain.infoGetter)
    ) {
      console.log(
        `Skipping data gather for chain ${chain.chainId} - missing contract addresses`
      )
      continue
    }

    let divPaid = new BigNumber(0)

    const { chainId, provider, infoGetter, factory, BLOCK_LENGTH, isV2 } = chain

    try {
      const dater = new EthDater(provider)
      const factoryContract = new ethers.Contract(factory, fabi, provider)
      const getterContract = new ethers.Contract(infoGetter, infoAbi, provider)

      const nowBlock = await provider.getBlockNumber()
      const DayAgoBlockInfo = await dater.getDate(Date.now() - 86400000, true, false)
      const DayAgoBlock = DayAgoBlockInfo.block

      const totalPairsRaw = await factoryContract.allPairsLength()
      const totalPairs = Number(totalPairsRaw.toString())
      const runAmount = Math.ceil(totalPairs / getPairsAmount)

      for (let s = 0; s < runAmount; s++) {
        const promises = []
        const start = s * getPairsAmount
        const end = Math.min((s + 1) * getPairsAmount, totalPairs)
        const allPairInfo = await getterContract.getApiInfo(
          factory,
          start.toString(),
          end.toString()
        )

        const pairAddresses = allPairInfo.pair
        const divPromises = []

        for (const pairAddress of pairAddresses) {
          const uniswapV2PairContract = new ethers.Contract(
            pairAddress,
            lpabi,
            provider
          )

          if (isV2) {
            const divAddress = await uniswapV2PairContract.dividendTracker()
            const divContract = new ethers.Contract(divAddress, divTrackerAbi, provider)
            divPromises.push(divContract.totalDividendsDistributed())
          }

          const filter = uniswapV2PairContract.filters.Swap()
          promises.push(
            uniswapV2PairContract.queryFilter(filter, DayAgoBlock, nowBlock)
          )
        }

        if (isV2) {
          const divResponse1 = await Promise.all(divPromises)
          for (let i = 0; i < divResponse1.length; i++) {
            divPaid = divPaid.plus(divResponse1[i].toString())
          }
        }

        const responses = await Promise.all(promises)

        for (let i = 0; i < responses.length; i++) {
          const tokenAAddress = allPairInfo.tokenA[i]
          const tokenBAddress = allPairInfo.tokenB[i]
          const transferEventsToken0 = responses[i]

          let volumeToken0 = new BigNumber(0)
          let volumeToken1 = new BigNumber(0)
          let lowPrice = new BigNumber(0)
          let highPrice = new BigNumber(0)
          let dayOldPrice = new BigNumber(0)
          let price = new BigNumber(0)

          const tokenAName = allPairInfo.aName[i]
          const tokenASymbol = allPairInfo.aSym[i]
          const decimalsA = new BigNumber(allPairInfo.aDec[i].toString()).toNumber()
          const tokenBName = allPairInfo.bName[i]
          const tokenBSymbol = allPairInfo.bSym[i]
          const decimalsB = new BigNumber(allPairInfo.bDec[i].toString()).toNumber()

          let indexLength = 1
          const eventLength = transferEventsToken0.length

          transferEventsToken0.forEach((event: any) => {
            const info = event.args
            if (!info) return

            let newPrice = new BigNumber(0)

            if (new BigNumber(info[1].toString()).gt(0)) {
              newPrice = new BigNumber(info[4].toString())
                .div(info[1].toString())
                .times(new BigNumber(10).pow(decimalsA - decimalsB))
            }

            if (new BigNumber(info[2].toString()).gt(0)) {
              newPrice = new BigNumber(info[2].toString())
                .div(info[3].toString())
                .times(new BigNumber(10).pow(decimalsA - decimalsB))
            }

            if (indexLength === eventLength) price = newPrice
            indexLength++

            volumeToken0 = volumeToken0.plus(info[1].toString())
            volumeToken0 = volumeToken0.plus(info[3].toString())
            volumeToken1 = volumeToken1.plus(info[2].toString())
            volumeToken1 = volumeToken1.plus(info[4].toString())

            if (lowPrice.eq(0)) {
              lowPrice = newPrice
              highPrice = newPrice
              dayOldPrice = newPrice
            }
            if (newPrice.gt(highPrice)) highPrice = newPrice
            if (newPrice.lt(lowPrice)) lowPrice = newPrice
          })

          const label = `${tokenAAddress}_${tokenBAddress}`
          const safeChange = dayOldPrice.eq(0)
            ? '0'
            : price.minus(dayOldPrice).dividedBy(dayOldPrice).multipliedBy(100).toFixed(2)

          const responseData = {
            [label]: {
              chain_id: chain.chainId,
              base_id: tokenAAddress,
              base_name: tokenAName,
              base_symbol: tokenASymbol,
              quote_id: tokenBAddress,
              quote_name: tokenBName,
              quote_symbol: tokenBSymbol,
              pair_id: allPairInfo.pair[i],
              last_price: price.toFixed(18),
              low_price_24hr: lowPrice.toFixed(18),
              high_price_24hr: highPrice.toFixed(18),
              change_24hr: safeChange,
              base_volume: volumeToken0.shiftedBy(-decimalsA).toString(),
              quote_volume: volumeToken1.shiftedBy(-decimalsB).toString(),
              tx_count: eventLength.toString()
            }
          }

          tmpInfo.push(responseData)
        }
      }

      tmpDiv.push({ [chainId.toString()]: { amountPaid: divPaid.toString() } })
    } catch (err) {
      console.log(`Error getting pair info on chain ${chain.chainId}`, err)
    }
  }

  dividendsPaid = tmpDiv
  mainInfo = tmpInfo

  fs.writeFile('pairs.json', JSON.stringify(tmpInfo, null, 2), (err) => {
    if (err) console.error('Error writing to file:', err)
  })

  loaded = true
}

app.get('/V2/allMarketinfo', (_req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }

  try {
    res.json(marketInfo)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch the NFT Info.' })
  }
})

app.get('/V2/marketinfo', (_req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }

  const collectionsInfo: cInfo = {}

  try {
    for (const key in marketInfo) {
      const thisCol = marketInfo[key]
      const responseData = {
        [key]: {
          info: thisCol.info
        }
      }
      Object.assign(collectionsInfo, responseData)
    }

    res.json(collectionsInfo)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch the NFT Info.' })
  }
})

app.get('/V2/market/:collection', (req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }

  try {
    const collection = req.params.collection
    res.json(marketInfo[collection]?.info || {})
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch the NFT Collection Info.' })
  }
})

app.get('/V2/market/:collection/:tokenId', async (req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }

  try {
    const collection = req.params.collection
    const tokenId = req.params.tokenId

    if (!(collection in marketInfo)) {
      return res.json('.. collection does not exist ...')
    }

    if (!(tokenId in marketInfo[collection].nfts)) {
      await setNFTIDInfo(collection, tokenId)
      saveNftFile()
    }

    res.json(marketInfo[collection].nfts[tokenId])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch the NFT tokenId Info.' })
  }
})

async function collectMarketData() {
  if (isZeroAddress(nftMarket)) {
    console.log('Skipping NFT market collection - NFT_MARKET_ADDRESS not configured')
    return
  }

  let tmpMarketInfo: allInfo = marketInfo
  let done = false
  let start = 0
  const size = getPairsAmount

  const promises = []
  const nowBlock = await nftPovider.getBlockNumber()
  const DayAgoBlock = new BigNumber(nowBlock).minus(
    86400 / (chainConfig[0]?.BLOCK_LENGTH || 3)
  )
  const filter = marketContract.filters.Trade()
  const promise = marketContract.queryFilter(filter, DayAgoBlock.toNumber(), nowBlock)
  promises.push(promise)
  const [responses] = await Promise.all(promises)

  while (!done) {
    const collections = await marketContract.viewCollections(start, size)
    const length = new BigNumber(collections[2].toString())

    if (length.lt(size)) done = true
    else start += size

    for (let i = 0; i < length.toNumber(); i++) {
      const thisCollection = collections[0][i]

      if (!(thisCollection in marketInfo)) {
        const nftColContract = new ethers.Contract(thisCollection, nftColAbi, nftPovider)
        const nfts: { [nft_id: string]: nftInfo } = {}

        let volume = new BigNumber(0)
        let name = ''
        let lowP = '0'
        let highP = '0'
        let totalS = '0'
        let amountListed = new BigNumber(0)

        for (let r = 0; r < responses.length; r++) {
          if (thisCollection === responses[r].args?.collection) {
            volume = volume.plus(responses[r].args?.askPrice.toString())
          }
        }

        try {
          name = await nftColContract.name()
        } catch {
          console.log('failed to get name')
        }

        try {
          totalS = (await nftColContract.totalSupply()).toString()
        } catch {
          console.log('failed to get supply')
        }

        let done2 = false
        let start2 = 0

        while (!done2) {
          const asks = await marketContract.viewAsksByCollection(thisCollection, start2, size)
          const length2 = new BigNumber(asks[2].toString())

          if (length2.lt(size)) done2 = true
          else start2 += size

          for (let t = 0; t < asks[0].length; t++) {
            amountListed = amountListed.plus(1)

            if (new BigNumber(asks[1][t][1].toString()).gt(highP)) {
              highP = asks[1][t][1].toString()
            }
            if (
              new BigNumber(asks[1][t][1].toString()).lt(lowP) ||
              lowP === '0'
            ) {
              lowP = asks[1][t][1].toString()
            }

            let jsonUrl = ''
            const token_id = asks[0][t].toString()

            try {
              const tokenUri = await nftColContract.tokenURI(token_id)
              const checker = tokenUri.substring(0, 4)
              if (checker === 'http') {
                jsonUrl = tokenUri
              } else {
                const properSubUrl = tokenUri.substring(7)
                jsonUrl = `${ipfsGateway}${properSubUrl}`
              }
            } catch {
              console.log('failed to get tokenUri')
            }

            try {
              const response2 = await axios.get(jsonUrl)
              const nftJson = response2.data
              const name = nftJson.name
              let imageUrl = ''
              const desc = nftJson.description
              const attributes = nftJson.attributes
              const checker2 = nftJson.image.substring(0, 4)

              if (checker2 === 'http') {
                imageUrl = nftJson.image
              } else {
                const imageBase = nftJson.image.substring(7)
                imageUrl = `${ipfsGateway}${imageBase}`
              }

              const thisNFt = {
                [token_id]: {
                  name: `${name}`,
                  image_url: imageUrl,
                  description: `${desc}`,
                  attributes
                }
              }

              Object.assign(nfts, thisNFt)
            } catch {
              console.log('failed')
            }
          }
        }

        const collectionAddress = `${collections[0][i]}`
        const responseData = {
          [collectionAddress]: {
            info: {
              volume: volume.toString(),
              name,
              TotalSupply: totalS,
              LowPrice: lowP,
              HighPrice: highP,
              amountListed: amountListed.toString()
            },
            nfts
          }
        }

        Object.assign(tmpMarketInfo, responseData)
      } else {
        let volume = new BigNumber(0)
        let lowP = '0'
        let highP = '0'
        let amountListed = new BigNumber(0)

        for (let r = 0; r < responses.length; r++) {
          if (thisCollection === responses[r].args?.collection) {
            volume = volume.plus(responses[r].args?.askPrice.toString())
          }
        }

        let done2 = false
        let start2 = 0
        while (!done2) {
          const asks = await marketContract.viewAsksByCollection(thisCollection, start2, size)
          const length2 = new BigNumber(asks[2].toString())

          if (length2.lt(size)) done2 = true
          else start2 += size

          for (let t = 0; t < asks[0].length; t++) {
            amountListed = amountListed.plus(1)
            if (new BigNumber(asks[1][t][1].toString()).gt(highP)) {
              highP = asks[1][t][1].toString()
            }
            if (
              new BigNumber(asks[1][t][1].toString()).lt(lowP) ||
              lowP === '0'
            ) {
              lowP = asks[1][t][1].toString()
            }
          }
        }

        tmpMarketInfo[thisCollection].info.volume = volume.toString()
        tmpMarketInfo[thisCollection].info.HighPrice = highP
        tmpMarketInfo[thisCollection].info.LowPrice = lowP
        tmpMarketInfo[thisCollection].info.amountListed = amountListed.toString()
      }
    }
  }

  marketInfo = tmpMarketInfo
  saveNftFile()
}

const saveNftFile = () => {
  fs.writeFile('market.json', JSON.stringify(marketInfo, null, 2), (err) => {
    if (err) console.error('Error writing to file:', err)
  })
}

async function setNFTIDInfo(collection: string, tokenId: string) {
  const nftColContract = new ethers.Contract(collection, nftColAbi, nftPovider)

  let jsonUrl = ''
  const token_id = tokenId

  try {
    const tokenUri = await nftColContract.tokenURI(token_id)
    const checker = tokenUri.substring(0, 4)
    if (checker === 'http') {
      jsonUrl = tokenUri
    } else {
      const properSubUrl = tokenUri.substring(7)
      jsonUrl = `${ipfsGateway}${properSubUrl}`
    }
  } catch {
    console.log('Failed to get TokenURI 2')
  }

  try {
    const response2 = await axios.get(jsonUrl)
    const nftJson = response2.data
    const name = nftJson.name
    let imageUrl = ''
    const desc = nftJson.description
    const attributes = nftJson.attributes
    const checker2 = nftJson.image.substring(0, 4)

    if (checker2 === 'http') {
      imageUrl = nftJson.image
    } else {
      const imageBase = nftJson.image.substring(7)
      imageUrl = `${ipfsGateway}${imageBase}`
    }

    const thisNFt = {
      [token_id]: {
        name: `${name}`,
        image_url: imageUrl,
        description: `${desc}`,
        attributes
      }
    }

    Object.assign(marketInfo[collection].nfts, thisNFt)
  } catch {
    console.log('failed')
  }
}

async function getHighLow(collection: string) {
  let lowP = '0'
  let highP = '0'
  let amountListed = new BigNumber(0)
  let totalS = '0'

  const nftColContract = new ethers.Contract(collection, nftColAbi, nftPovider)

  try {
    totalS = (await nftColContract.totalSupply()).toString()
  } catch {
    console.log('failed to get supply')
  }

  let done2 = false
  let start2 = 0
  while (!done2) {
    const asks = await marketContract.viewAsksByCollection(collection, start2, getPairsAmount)
    const length2 = new BigNumber(asks[2].toString())
    if (length2.lt(getPairsAmount)) done2 = true
    else start2 += getPairsAmount

    for (let t = 0; t < asks[0].length; t++) {
      amountListed = amountListed.plus(1)
      if (new BigNumber(asks[1][t][1].toString()).gt(highP)) {
        highP = asks[1][t][1].toString()
      }
      if (
        new BigNumber(asks[1][t][1].toString()).lt(lowP) ||
        lowP === '0'
      ) {
        lowP = asks[1][t][1].toString()
      }
    }
  }

  marketInfo[collection].info.TotalSupply = totalS
  marketInfo[collection].info.HighPrice = highP
  marketInfo[collection].info.LowPrice = lowP
  marketInfo[collection].info.amountListed = amountListed.toString()
}

async function getVolume(collection: string) {
  const nowBlock = await nftPovider.getBlockNumber()
  const DayAgoBlock = new BigNumber(nowBlock).minus(
    86400 / (chainConfig[0]?.BLOCK_LENGTH || 3)
  )
  const filter = marketContract.filters.Trade()
  const responses = await marketContract.queryFilter(
    filter,
    DayAgoBlock.toNumber(),
    nowBlock
  )

  let volume = new BigNumber(0)
  for (let i = 0; i < responses.length; i++) {
    if (collection === responses[i].args?.collection) {
      volume = volume.plus(responses[i].args?.askPrice.toString())
    }
  }

  marketInfo[collection].info.volume = volume.toString()
}

async function newCollectionListener() {
  marketContract.on('CollectionNew', async (collection) => {
    console.log('new collection added')

    const nftColContract = new ethers.Contract(collection, nftColAbi, nftPovider)
    const nfts: { [nft_id: string]: nftInfo } = {}

    let volume = new BigNumber(0)
    let name = ''
    let lowP = '0'
    let highP = '0'
    let totalS = '0'

    try {
      name = await nftColContract.name()
    } catch {
      console.log('failed to get name')
    }

    try {
      totalS = (await nftColContract.totalSupply()).toString()
    } catch {
      console.log('failed to get supply')
    }

    const responseData = {
      [collection]: {
        info: {
          volume: volume.toString(),
          name,
          TotalSupply: totalS,
          LowPrice: lowP,
          HighPrice: highP,
          amountListed: '0'
        },
        nfts
      }
    }

    Object.assign(marketInfo, responseData)
    saveNftFile()
  })
}

async function askUpdateListener() {
  marketContract.on('AskUpdate', async (collection) => {
    console.log('Ask updated')
    await getHighLow(collection)
    saveNftFile()
  })
}

async function askCancelListener() {
  marketContract.on('AskCancel', async (collection) => {
    console.log('Ask Canceled')
    await getHighLow(collection)
    saveNftFile()
  })
}

async function newAskListener() {
  marketContract.on('AskNew', async (collection) => {
    console.log('New Ask Added')
    await getHighLow(collection)
    saveNftFile()
  })
}

async function buyListener() {
  marketContract.on('Trade', async (collection) => {
    console.log('NFT Bought')
    await getHighLow(collection)
    await getVolume(collection)
    saveNftFile()
  })
}

const getChainIds = (): number[] => {
  return Object.keys(GLOBAL_CONFIG.CHAINS).map(Number)
}

const getSigner = (chainId: number) =>
  new Wallet(
    GLOBAL_CONFIG.PRIVATE_KEY,
    new JsonRpcProvider(GLOBAL_CONFIG.CHAINS[chainId].RPC)
  )

const getRouterContract = (chainId: number) => {
  const signer = getSigner(chainId)
  const contractRaw = new Contract(
    GLOBAL_CONFIG.CHAINS[chainId].ROUTER,
    routerAbi,
    signer
  )
  return contractRaw.connect(signer)
}

const getMarshotContract = (chainId: number) => {
  const signer = getSigner(chainId)
  const contractRaw = new Contract(
    GLOBAL_CONFIG.CHAINS[chainId].MARSHOT,
    marshotAbi,
    signer
  )
  return contractRaw.connect(signer)
}

const getRewardTokenContract = (chainId: number) => {
  const signer = getSigner(chainId)
  const contractRaw = new Contract(
    GLOBAL_CONFIG.CHAINS[chainId].TOKEN,
    tokenAbi,
    signer
  )
  return contractRaw.connect(signer)
}

const getWalletBalance = async (chainId: number) => {
  const signer = getSigner(chainId)
  const tokenContract = getRewardTokenContract(chainId)
  return tokenContract.balanceOf(signer.address)
}

const checkMatches = (randomNumber: string, wholeNumber: string) => {
  let matchCount = 0

  if (randomNumber === wholeNumber) {
    console.log('Jackpot!')
    matchCount = 9999
  } else {
    const randomLen = randomNumber.length
    const wholeLen = wholeNumber.length

    for (let i = 0; i < randomLen && i < wholeLen; i++) {
      if (randomNumber[randomLen - 1 - i] === wholeNumber[wholeLen - 1 - i]) {
        matchCount++
      } else {
        break
      }
    }

    if (matchCount > 0) {
      console.log(`${matchCount} match${matchCount > 1 ? 'es' : ''}`)
    } else {
      console.log('no Matches')
    }
  }

  return matchCount
}

async function generateRandomNumber(
  chainId: number,
  account: string
): Promise<history> {
  const supply = await getWalletBalance(chainId)
  const wholeNumber = new BigNumber(supply.toString()).shiftedBy(-18).toFixed(0)
  const randomNumber = new BigNumber(
    Math.floor(Math.random() * GLOBAL_CONFIG.MAXRANDOM)
  ).toFixed(0)

  const thisChainConfig = GLOBAL_CONFIG.CHAINS[chainId]
  const matches = checkMatches(randomNumber, wholeNumber)

  const winningsPercentage =
    matches === 999
      ? thisChainConfig.JACKPOT
      : thisChainConfig.WINNINGS[matches]?.[0] || 0

  const winnings = new BigNumber(supply.toString())
    .multipliedBy(winningsPercentage)
    .dividedBy(10000)
    .toFixed(0)

  let correctedWinningsBasedOnMax = '0'
  let txHash

  if (new BigNumber(winnings).gt(0)) {
    const Max =
      matches === 999
        ? new BigNumber(9999999999999).shiftedBy(18)
        : new BigNumber(thisChainConfig.WINNINGS[matches]?.[1] || 0).shiftedBy(18)

    correctedWinningsBasedOnMax = new BigNumber(winnings).gt(Max)
      ? Max.toFixed(0)
      : winnings

    const tokenContract = getRewardTokenContract(chainId)
    try {
      const txResponse = await tokenContract.transfer(
        account,
        correctedWinningsBasedOnMax
      )
      const receipt = await txResponse.wait()
      txHash = receipt.transactionHash
    } catch (error) {
      console.error(`Failed to send winnings to ${account}:`, error)
    }
  }

  return {
    chainId: chainId.toString(),
    user: account,
    balance: wholeNumber,
    spin: randomNumber,
    matches: matches.toFixed(0),
    winnings: correctedWinningsBasedOnMax,
    txHash
  }
}

const createSpinAmountEntry = (
  address: string,
  chainId: number,
  howMany: number
): boolean => {
  const isValid = ethers.utils.isAddress(address)
  if (!isValid) {
    console.error('Invalid address:', address)
    return false
  }

  if (!spinAmounts[address]) {
    spinAmounts[address] = {}
  }

  spinAmounts[address][chainId] = {
    spins: howMany,
    lastFreeSpinEpoch: 0
  }

  return true
}

const watchMarshot = (chainId: number) => {
  const contract = getMarshotContract(chainId)
  const contributedFilter: EventFilter = contract.filters.Contributed()
  const roundStartedFilter: EventFilter = contract.filters.RoundStarted()

  console.log('Watching', contract.address)

  contract.on(
    contributedFilter,
    async (_roundId: BigNumber, user: string, _amount: BigNumber) => {
      if (!spinAmounts[user] || !spinAmounts[user][chainId]) {
        createSpinAmountEntry(user, chainId, 2)
      } else {
        spinAmounts[user][chainId].spins += 2
      }
    }
  )

  contract.on(
    roundStartedFilter,
    async (
      _tokenContract: string,
      _name: string,
      _symbol: string,
      _endEpoch: BigNumber,
      creator: string
    ) => {
      if (!spinAmounts[creator] || !spinAmounts[creator][chainId]) {
        createSpinAmountEntry(creator, chainId, 5)
      } else {
        spinAmounts[creator][chainId].spins += 5
      }
    }
  )
}

const watchFlatFeeSwapMade = (chainId: number) => {
  const contract = getRouterContract(chainId)
  const filter: EventFilter = contract.filters.routerInteraction()
  console.log('watching', contract.address)

  contract.on(filter, async (event: any) => {
    const userAddress = event.toString()
    if (!spinAmounts[userAddress] || !spinAmounts[userAddress][chainId]) {
      createSpinAmountEntry(userAddress, chainId, 1)
    } else {
      spinAmounts[userAddress][chainId].spins += 1
    }
  })
}

const saveSpins = async () => {
  try {
    await fs.promises.writeFile('spins.json', JSON.stringify(spinAmounts, null, 2))
    await fs.promises.writeFile('history.json', JSON.stringify(historyData, null, 2))
  } catch (err) {
    console.error('Error writing to file:', err)
  }
}

app.get('/api/userData', async (req: Request, res: Response) => {
  const userAddress = typeof req.query.user === 'string' ? req.query.user : undefined
  const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined

  if (!userAddress || !chainId) {
    return res.status(400).json({ error: 'Invalid Query' })
  }

  if (!GLOBAL_CONFIG.CHAINS[chainId]) {
    return res.status(400).json({ error: 'Invalid Chain ID' })
  }

  if (!spinAmounts[userAddress] || !spinAmounts[userAddress][chainId]) {
    const isValid = createSpinAmountEntry(userAddress, chainId, 0)
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Address' })
    }
  }

  const userSpinData = spinAmounts[userAddress][chainId]
  return res.status(200).json({ userSpinData })
})

app.get('/api/publicData', async (req: Request, res: Response) => {
  const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined

  if (!chainId) {
    return res.status(400).json({ error: 'Invalid Query' })
  }

  if (!GLOBAL_CONFIG.CHAINS[chainId]) {
    return res.status(400).json({ error: 'Invalid Chain ID' })
  }

  const publicData = {
    jackpot: GLOBAL_CONFIG.CHAINS[chainId].JACKPOT,
    winnings: GLOBAL_CONFIG.CHAINS[chainId].WINNINGS
  }

  return res.status(200).json({ publicData })
})

app.get('/api/history', async (req: Request, res: Response) => {
  const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined

  if (!chainId) {
    return res.status(400).json({ error: 'Invalid Query' })
  }

  if (!GLOBAL_CONFIG.CHAINS[chainId]) {
    return res.status(400).json({ error: 'Invalid Chain ID' })
  }

  const chainHistory = historyData
    .filter((data) => data.chainId === chainId.toString())
    .reverse()

  return res.status(200).json({ historyData: chainHistory })
})

app.get('/api/giveTest', async (req: Request, res: Response) => {
  const userAddress = typeof req.query.user === 'string' ? req.query.user : undefined
  const chainIds = getChainIds()

  if (!userAddress) {
    return res.status(400).json({ error: 'Invalid Query' })
  }

  if (chainIds.length === 0) {
    return res.status(400).json({ error: 'No game chains configured' })
  }

  const chainId = chainIds[0]

  if (!spinAmounts[userAddress] || !spinAmounts[userAddress][chainId]) {
    const isValid = createSpinAmountEntry(userAddress, chainId, 999)
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Address' })
    }
  } else {
    spinAmounts[userAddress][chainId].spins += 999
  }

  return res.status(200).json('test spins given')
})

app.get('/api/spin', async (req: Request, res: Response) => {
  try {
    const userAddress = typeof req.query.user === 'string' ? req.query.user : undefined
    const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined

    if (!userAddress || !chainId) {
      return res.status(400).json({ error: 'Invalid Query' })
    }

    if (!GLOBAL_CONFIG.CHAINS[chainId]) {
      return res.status(400).json({ error: 'Invalid Chain ID' })
    }

    const currentEpoch = Math.floor(Date.now() / 1000)

    if (!spinAmounts[userAddress] || !spinAmounts[userAddress][chainId]) {
      return res.status(400).json({ error: 'Account doesnt exist on this chain' })
    }

    const userSpinData = spinAmounts[userAddress][chainId]
    const freeSpinInterval = 86400

    if (currentEpoch - userSpinData.lastFreeSpinEpoch >= freeSpinInterval) {
      userSpinData.lastFreeSpinEpoch = currentEpoch
    } else if (userSpinData.spins > 0) {
      userSpinData.spins -= 1
    } else {
      return res.status(400).json({ error: 'No spins left' })
    }

    const spinResult = await generateRandomNumber(chainId, userAddress)
    historyData.push(spinResult)

    return res.status(200).json({ spinResult })
  } catch (error) {
    console.error('Error processing spin:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

const setupGracefulShutdown = () => {
  const exitHandler = async () => {
    console.log('Exiting...')
    await saveSpins()
    process.exit()
  }

  process.on('SIGINT', exitHandler)
  process.on('SIGTERM', exitHandler)
  process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err)
    await saveSpins()
    process.exit(1)
  })
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    await saveSpins()
    process.exit(1)
  })
}

const loadUp = async () => {
  try {
    await fs.promises.access('./spins.json', fs.constants.F_OK)
    const history = await fs.promises.readFile('./spins.json', 'utf-8')
    spinAmounts = JSON.parse(history)
  } catch (e) {
    console.log(e, 'no Old user Data')
  }

  try {
    await fs.promises.access('./history.json', fs.constants.F_OK)
    const history = await fs.promises.readFile('./history.json', 'utf-8')
    historyData = JSON.parse(history)
  } catch (e) {
    console.log(e, 'no Old history Data')
  }

  if (!GLOBAL_CONFIG.PRIVATE_KEY || getChainIds().length === 0) {
    console.log('Game listeners skipped - missing PKEY or game chain config')
    setupGracefulShutdown()
    return
  }

  const chainIds = getChainIds()
  for (let i = 0; i < chainIds.length; i++) {
    const chainId = chainIds[i]
    try {
      watchFlatFeeSwapMade(chainId)
      watchMarshot(chainId)
    } catch (err) {
      console.log(`Failed to start game listeners for chain ${chainId}`, err)
    }
  }

  setupGracefulShutdown()
}

app.get('/api/crolon/:type', async (req: Request, res: Response) => {
  const supplyType = req.params.type
  const chainIds = getChainIds()

  if (!GLOBAL_CONFIG.PRIVATE_KEY || chainIds.length === 0) {
    return res.status(400).json({ error: 'Game config not set' })
  }

  try {
    const chainId = chainIds[0]
    const tokenContract = getRewardTokenContract(chainId)
    const totalSupply = await tokenContract.totalSupply()
    let supply = new BigNumber(0)

    if (supplyType === 'totalsupply') {
      supply = new BigNumber(totalSupply.toString()).shiftedBy(-18)
    } else if (supplyType === 'circulating') {
      const deadAddressBalance = await tokenContract.balanceOf(
        '0x000000000000000000000000000000000000dead'
      )
      supply = new BigNumber(totalSupply.toString())
        .minus(deadAddressBalance.toString())
        .shiftedBy(-18)
    } else {
      return res.status(400).json({ error: 'Invalid supply type' })
    }

    return res.status(200).json(parseFloat(supply.toFixed(8)))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

const InitialStartupNFT = async () => {
  try {
    await fs.promises.access('./market.json', fs.constants.F_OK)
    const history = await fs.promises.readFile('./market.json', 'utf-8')
    marketInfo = JSON.parse(history)
  } catch (e) {
    console.log(e, 'no Old Data')
  }

  if (isZeroAddress(nftMarket)) {
    console.log('NFT startup skipped - NFT_MARKET_ADDRESS not configured')
    await GatherData()
    loaded = true
    console.log('API loaded without NFT startup')
    return
  }

  try {
    await collectMarketData()
    await newAskListener()
    await buyListener()
    await newCollectionListener()
    await askUpdateListener()
    await askCancelListener()
  } catch (err) {
    console.log('NFT startup failed', err)
  }

  await GatherData()
  console.log('Fully Loaded up!')
}

loadUp()
InitialStartupNFT()

const intervalInMilliseconds = 1 * 60 * 60 * 1000
setInterval(() => {
  if (process.env.ENABLE_DOCS_BOOT === 'true') {
    createQueryEngine()
  }
  saveSpins()
}, intervalInMilliseconds)

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})