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
import { GitbookLoader } from '@langchain/community/document_loaders/web/gitbook'
import { Document as GitbookDocument } from '@langchain/core/documents'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import requestIp from 'request-ip'

const cors = require('cors')
dotenv.config()
const app = express()

// Allow all origins and specify allowed headers
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
  })
)

app.use(bodyParser.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

let queryEngine: any

const redis = new Redis({
  url: 'https://holy-jaybird-32203.upstash.io',
  token: 'AX3LAAIncDE3NjZjMmU4YmE0MDg0MTZjYjBhMzJmNmFhMmY0MjBhN3AxMzIyMDM',
})

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(10, '3 m')
})

function transformGitbookDocument (doc: GitbookDocument): Document {
  return new Document({
    text: doc.pageContent,
    metadata: {
      source: doc.metadata.source,
      title: doc.metadata.title
    }
  })
}

const getDexScreenerPrice = async (address: string) => {
  console.log(address)
  const response = await fetch(
    'https://api.dexscreener.com/latest/dex/tokens/' + address,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText)
  }
  const data = await response.json()

  // Log the parsed data to the console

  const name = data['pairs'][0]['baseToken']['name']
  const volume = data['pairs'][0]['volume']['h24']
  const price = data['pairs'][0]['priceUsd']
  const marketcap = data['pairs'][0]['fdv']

  return [name, price, volume, marketcap]
}

const appendToJson = (
  obj: { [key: string]: any },
  newKey: string,
  newValue: any
) => {
  obj[newKey] = newValue
}

interface InputCommand {
  address: string
}

const getTokenDetails = async (inputCommand: InputCommand) => {
  try {
    const res = await getDexScreenerPrice(inputCommand.address)
    appendToJson(inputCommand, 'name', res[0])
    appendToJson(inputCommand, 'price', res[1])
    appendToJson(inputCommand, 'volume', res[2])
    appendToJson(inputCommand, 'marketcap', res[3])
    const jsonString = JSON.stringify(inputCommand)
    return jsonString
  } catch (e) {
    appendToJson(
      inputCommand,
      'error',
      'The token price details could not be found.'
    )
    const jsonString = JSON.stringify(inputCommand)
    return jsonString
  }
}

function isValidJson (str: string) {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

const ai_response_desc = async (inp: string) => {
  if (!process.env.OPENAI_API_KEY) {
    console.log("Mocking OpenAI API descriptive response...");
    return `Mock descriptive response for input: ${inp}`;
  }

  try {
    const response = await queryEngine.query({ query: inp });
    return response.toString();
  } catch (error) {
    console.error("Error in ai_response_desc:", error);
    return "Failed to generate descriptive response";
  }
};

const ai_response = async (inp: string) => {
  if (!process.env.OPENAI_API_KEY) {
    console.log("Mocking OpenAI API response...");
    return JSON.stringify({
      mock: true,
      message: `Mock response for input: ${inp}`
    });
  }

  try {
    const response = await queryEngine.query({ query: inp });
    if (isValidJson(response.toString())) {
      const inputCommand = JSON.parse(response.toString());
      if (
        inputCommand.command == 'swap_token' ||
        inputCommand.command == 'check_price'
      ) {
        return getTokenDetails(inputCommand);
      }
    } else {
      return response.toString();
    }
  } catch (error) {
    console.error("Error in ai_response:", error);
    return JSON.stringify({
      error: true,
      message: "Failed to get AI response"
    });
  }
};

const createQueryEngine = async () => {
  try {
    // Load local documents
    const docsPath = path.join(process.cwd(), './docs_marswap')
    const reader = new SimpleDirectoryReader()
    const documents: Document[] = await reader.loadData(docsPath)

    // Load documents from GitBook
    const gitbookLoader = new GitbookLoader('https://zkdocs.marswap.exchange', {
      shouldLoadAllPaths: true
    })

    const gitbookDocuments = await gitbookLoader.load()
    const convertedGitbookDocuments: Document[] = gitbookDocuments.map(
      transformGitbookDocument
    )

    // Combine both local and GitBook documents
    const allDocuments = [...documents, ...convertedGitbookDocuments]

    // Create the index from all documents
    const index = await VectorStoreIndex.fromDocuments(allDocuments)

    // Assign the query engine
    queryEngine = index.asQueryEngine()
  } catch (error) {
    console.error('Error creating query engine:', error)
  }
}
const rateLimit =
  'You have exceeded the AI helper limit. Please wait 10 minutes and try again.'

createQueryEngine()

app.post('/api/response', async (req: Request, res: Response) => {
  try {
    const detectedIp = requestIp.getClientIp(req)
    console.log(detectedIp)

    if (!detectedIp) {
      throw new Error('Client IP could not be detected')
    }

    const result = await ratelimit.limit(detectedIp)
    if (!result.success) {
      console.log('The request has been rate limited.')

      return res.status(200).json({ message: rateLimit })
    }
  } catch (ex) {
    console.log(ex)

    return res.status(200).json({ message: rateLimit })
  }

  let input = req.body.inp
  console.log(input)

  if (input.startsWith('ADD DESC')) {
    input = input.replace('ADD DESC: ', '')
    input = `You are given this text ${input}. Your role is expand on it and write a fun descriptive piece about a cryptocurrency in under 600 characters. Make it unique every time`
    try {
      const output = await ai_response_desc(input)
      console.log(output)

      res.status(200).json({ message: output })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  } else {
    try {
      const output = await ai_response(input)
      console.log(output)

      res.status(200).json({ message: output })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
})

const lpabi = require('../abis/lp.json')
const fabi = require('../abis/factory.json')
const infoAbi = require('../abis/info.json')
const marketAbi = require('../abis/nftMarket.json')
const nftColAbi = require('../abis/nftCollections.json')
const divTrackerAbi = require('../abis/divTracker.json')

const apiKey = '75077347-4585-422c-9dce-646f79469728' // Replace with your API key
const providerUrl = 'http://api.web3shards.io/v1/rpc/bsc'
const connectionInfo = { url: providerUrl, headers: { 'x-api-key': apiKey } }

// pair api info
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
const getPairsAmount = 50

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

let marketInfo: allInfo = {}

const nftMarket = '0xeA6C532affBFA0A37fF89b907511fB38546A2337'
const EVENT_TOPIC_PAIRCREATED =
  '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9' // pairCreated
// const ipfsGateway = "https://amber-genuine-baboon-951.mypinata.cloud/ipfs/"
// const ipfsGateway = 'https://ipfs.io/ipfs/'
const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/'
// const ipfsGateway = 'https://dweb.link/'
const nftPovider = new ethers.providers.JsonRpcProvider(
  'https://www.shibrpc.com'
)
const marketContract = new ethers.Contract(nftMarket, marketAbi, nftPovider)

const chainConfig = [
  {
    chainId: 109,
    provider: new ethers.providers.JsonRpcProvider('https://www.shibrpc.com'),
    exploer: 'https://www.shibariumscan.io:443',
    factory: '0xBe0223f65813C7c82E195B48F8AAaAcb304FbAe7',
    infoGetter: '0x90DDe37945d5F181123eB3c8E934B22dfEbDc24F',
    BLOCK_LENGTH: 5,
    isV2: false
  },
  {
    chainId: 109,
    provider: new ethers.providers.JsonRpcProvider('https://www.shibrpc.com'),
    exploer: 'https://www.shibariumscan.io:443',
    factory: '0xd871a3f5d3bB9c00DDB0cC772690351B9712968D',
    infoGetter: '0x90DDe37945d5F181123eB3c8E934B22dfEbDc24F',
    BLOCK_LENGTH: 5,
    isV2: true
  },
  {
    chainId: 56,
    provider: new ethers.providers.JsonRpcProvider(connectionInfo),
    exploer: 'https://bscscan.com/',
    factory: '0xe19165248159B6cB2A2e35bF398581C777C9979A',
    infoGetter: '0x35a89a4D8A46670B95bb9C3d2F3FEa09b35EF124',
    BLOCK_LENGTH: 3,
    isV2: true
  }
]

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  // Add other necessary CORS headers here
  next()
})

app.get(`/V2/allPairs`, (test, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }
  console.log('all pairs grabbed')

  try {
    const history = fs.readFileSync('./pairs.json', 'utf-8')
    const historyParsed = JSON.parse(history)
    res.json(historyParsed)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error:
        'Failed to fetch the current price, volume, and token details of the pairs.'
    })
    return
  }
})
app.get(`/V2/pairs`, (test, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }
  console.log('pairs grabbed')
  try {
    // Filter pairs with baseVolume > 0
    const pairsWithBaseVolume = mainInfo.filter(
      pair => parseFloat(pair[Object.keys(pair)[0]].base_volume) > 0
    )

    // Slice to a maximum of 50 pairs
    const slicedPairs = pairsWithBaseVolume.slice(0, 50)

    // Send the response
    res.json(slicedPairs)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error:
        'Failed to fetch the current price, volume, and token details of the pairs.'
    })
    return
  }
})
app.get(`/V2/divpaid`, (test, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }
  console.log('DivPaid Grabbed')
  try {
    // Send the response
    res.json(dividendsPaid)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch Dividends paid out' })
    return
  }
})

async function listenForNewPairs () {
  console.log('listening for new pairs')

  for (const chain of chainConfig) {
    const { chainId, provider, exploer, factory, infoGetter, BLOCK_LENGTH } =
      chain

    const factoryContract = new ethers.Contract(factory, fabi, provider)
    const getterContract = new ethers.Contract(infoGetter, infoAbi, provider)

    factoryContract.on('PairCreated', async (pair, allPairslength) => {
      console.log(`new pair created on chain ${chainId}`)

      try {
        let index = new BigNumber(allPairslength.toString()).minus(1).toNumber()
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
        const decimalsA = new BigNumber(
          allPairInfo.aDec[0].toString()
        ).toNumber()
        const tokenBName = allPairInfo.bName[0]
        const tokenBSymbol = allPairInfo.bSym[0]
        const decimalsB = new BigNumber(
          allPairInfo.bDec[0].toString()
        ).toNumber()

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

        const artifact = JSON.stringify(mainInfo)
        fs.writeFile(`pairs.json`, artifact, err => {
          if (err) {
            console.error('Error writing to file:', err)
          }
        })
      } catch {
        console.log(`Error setting up New Pair Created on chain ${chainId}`)
      }
    })
  }
}

async function GatherData () {
  console.log('starting up')

  let tmpInfo = []
  let tmpDiv = []

  for (const chain of chainConfig) {
    let divPaid = new BigNumber(0)
    const { chainId, provider, infoGetter, factory, BLOCK_LENGTH, isV2 } = chain

    const factoryContract = new ethers.Contract(factory, fabi, provider)
    const getterContract = new ethers.Contract(infoGetter, infoAbi, provider)
    const nowBlock = await provider.getBlockNumber()
    const DayAgoBlock = new BigNumber(nowBlock).minus(86400 / BLOCK_LENGTH)

    try {
      const totalPairs = await factoryContract.allPairsLength()
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
        let divPromises = []

        for (const pairAddress of pairAddresses) {
          const uniswapV2PairContract = new ethers.Contract(
            pairAddress,
            lpabi,
            provider
          )

          if (isV2) {
            const divAddress = await uniswapV2PairContract.dividendTracker()
            const divContract = new ethers.Contract(
              divAddress,
              divTrackerAbi,
              provider
            )
            const divPromise = divContract.totalDividendsDistributed()
            divPromises.push(divPromise)
          }

          const filter = uniswapV2PairContract.filters.Swap()
          const promise = uniswapV2PairContract.queryFilter(
            filter,
            DayAgoBlock.toNumber(),
            nowBlock
          )
          promises.push(promise)
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
          const decimalsA = new BigNumber(
            allPairInfo.aDec[i].toString()
          ).toNumber()
          const tokenBName = allPairInfo.bName[i]
          const tokenBSymbol = allPairInfo.bSym[i]
          const decimalsB = new BigNumber(
            allPairInfo.bDec[i].toString()
          ).toNumber()

          let indexLength = 1
          const eventLength = transferEventsToken0.length

          await transferEventsToken0.forEach(async event => {
            const info = event.args

            // Check if info is defined before accessing its properties
            if (info) {
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
            }
          })

          const label = `${tokenAAddress}_${tokenBAddress}`
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
              change_24hr: price
                .minus(dayOldPrice)
                .dividedBy(dayOldPrice)
                .multipliedBy(100)
                .toFixed(2),
              base_volume: volumeToken0
                .shiftedBy(-decimalsA.toString())
                .toString(),
              quote_volume: volumeToken1
                .shiftedBy(-decimalsB.toString())
                .toString(),
              tx_count: eventLength.toString()
            }
          }
          tmpInfo.push(responseData)
        }
      }
    } catch {
      console.log(
        `Error getting pair info (startAPI) on chain ${chain.chainId}`
      )
    }

    tmpDiv.push({ [chainId.toString()]: { amountPaid: divPaid.toString() } })
  }

  dividendsPaid = tmpDiv
  mainInfo = tmpInfo
  const artifact = JSON.stringify(tmpInfo, null, 2)
  fs.writeFile(`pairs.json`, artifact, err => {
    if (err) {
      console.error('Error writing to file:', err)
    }
  })

  loaded = true
}

//
//  NFT STUFF BELOW
//
//
//
//

app.get(`/V2/allMarketinfo`, (test, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }
  console.log('All market info grabbed')

  try {
    res.json(marketInfo)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch the NFT Info.' })
    return
  }
})

app.get(`/V2/marketinfo`, (test, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }
  let collectionsInfo: cInfo = {}
  console.log('market info Grabbed')
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
    return
  }
})

app.get(`/V2/market/:collection`, (req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }
  console.log('collection info grabbed')
  try {
    const collection = req.params.collection
    res.json(marketInfo[collection].info)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch the NFT Collection Info.' })
    return
  }
})

app.get(`/V2/market/:collection/:tokenId`, async (req, res) => {
  if (!loaded) {
    res.status(500).json('Loading......')
    return
  }
  console.log('tokenId info Grabbed')
  try {
    const collection = req.params.collection
    const tokenId = req.params.tokenId
    if (!(collection in marketInfo))
      res.json('.. collection does not exist ...')
    if (!(tokenId in marketInfo[collection].nfts)) {
      await setNFTIDInfo(collection, tokenId)
      saveNftFile()
    }
    res.json(marketInfo[collection].nfts[tokenId])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch the NFT tokenId Info.' })
    return
  }
})

async function collectMarketData () {
  let tmpMarketInfo: allInfo = marketInfo
  let done = false
  let start = 0
  let size = getPairsAmount

  const promises = []
  const nowBlock = await nftPovider.getBlockNumber()
  const DayAgoBlock = new BigNumber(nowBlock).minus(
    86400 / chainConfig[0].BLOCK_LENGTH
  )
  const filter = marketContract.filters.Trade()
  const promise = marketContract.queryFilter(
    filter,
    DayAgoBlock.toNumber(),
    nowBlock
  )
  promises.push(promise)
  const [responses] = await Promise.all(promises)
  while (!done) {
    // get collection listing by size
    const collections = await marketContract.viewCollections(start, size)
    const length = new BigNumber(collections[2].toString())
    if (length.lt(size)) done = true
    else start += size

    for (let i = 0; i < length.toNumber(); i++) {
      const thisCollection = collections[0][i]
      if (marketInfo ? !(thisCollection in marketInfo) : true) {
        const nftColContract = new ethers.Contract(
          thisCollection,
          nftColAbi,
          nftPovider
        )
        let nfts: { [nft_id: string]: nftInfo } = {}
        // collection Info
        let volume = new BigNumber(0)
        let name = ''
        let lowP = '0'
        let highP = '0'
        let totalS = '0'
        let amountListed = new BigNumber(0)

        // get volume of this collection
        for (let i = 0; i < responses.length; i++) {
          if (thisCollection === responses[i].args?.collection)
            volume = volume.plus(responses[i].args?.askPrice.toString())
        }
        // get name of collection
        try {
          name = await nftColContract.name()
        } catch {
          console.log('failed to get name')
        }
        // get total supply
        try {
          totalS = (await nftColContract.totalSupply()).toString()
        } catch {
          console.log('failed to get supply')
        }

        // get all token_ids for sale
        let done2 = false
        let start2 = 0
        while (!done2) {
          const asks = await marketContract.viewAsksByCollection(
            thisCollection,
            start2,
            size
          )
          const length2 = new BigNumber(asks[2].toString())
          if (length2.lt(size)) done2 = true
          else start2 += size
          //get the json - and image from nft contract
          for (let t = 0; t < asks[0].length; t++) {
            // check for low and high
            amountListed = amountListed.plus(1)
            if (new BigNumber(asks[1][t][1].toString()).gt(highP))
              highP = asks[1][t][1].toString()
            if (
              new BigNumber(asks[1][t][1].toString()).lt(lowP) ||
              lowP === '0'
            )
              lowP = asks[1][t][1].toString()

            let jsonUrl = ''
            let token_id = asks[0][t].toString()
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
              // set token info
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
              name: name,
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
        // check volume & low and highs
        let volume = new BigNumber(0)
        let lowP = '0'
        let highP = '0'
        let amountListed = new BigNumber(0)
        for (let i = 0; i < responses.length; i++) {
          if (thisCollection === responses[i].args?.collection)
            volume = volume.plus(responses[i].args?.askPrice.toString())
        }

        // high and lows
        let done2 = false
        let start2 = 0
        while (!done2) {
          const asks = await marketContract.viewAsksByCollection(
            thisCollection,
            start2,
            size
          )
          const length2 = new BigNumber(asks[2].toString())
          if (length2.lt(size)) done2 = true
          else start2 += size
          //get the json - and image from nft contract
          for (let t = 0; t < asks[0].length; t++) {
            // check for low and high
            amountListed = amountListed.plus(1)
            if (new BigNumber(asks[1][t][1].toString()).gt(highP))
              highP = asks[1][t][1].toString()
            if (
              new BigNumber(asks[1][t][1].toString()).lt(lowP) ||
              lowP === '0'
            )
              lowP = asks[1][t][1].toString()
          }
        }
        // set new info
        tmpMarketInfo[thisCollection].info.volume = volume.toString()
        tmpMarketInfo[thisCollection].info.HighPrice = highP
        tmpMarketInfo[thisCollection].info.LowPrice = lowP
        tmpMarketInfo[thisCollection].info.amountListed =
          amountListed.toString()
      }
    }
  }

  marketInfo = tmpMarketInfo
  saveNftFile()
}

const saveNftFile = () => {
  const artifact = JSON.stringify(marketInfo, null, 2)
  fs.writeFile(`market.json`, artifact, err => {
    if (err) {
      console.error('Error writing to file:', err)
    }
  })
}

async function setNFTIDInfo (collection: string, tokenId: string) {
  const nftColContract = new ethers.Contract(collection, nftColAbi, nftPovider)

  let jsonUrl = ''
  let token_id = tokenId
  try {
    const tokenUri = await nftColContract.tokenURI(token_id)
    console.log(tokenUri, tokenId)
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
    // set token info
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

async function getHighLow (collection: string) {
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

  // high and lows
  let done2 = false
  let start2 = 0
  while (!done2) {
    const asks = await marketContract.viewAsksByCollection(
      collection,
      start2,
      getPairsAmount
    )
    const length2 = new BigNumber(asks[2].toString())
    if (length2.lt(getPairsAmount)) done2 = true
    else start2 += getPairsAmount
    //get the json - and image from nft contract
    for (let t = 0; t < asks[0].length; t++) {
      // check for low and high
      amountListed = amountListed.plus(1)
      if (new BigNumber(asks[1][t][1].toString()).gt(highP))
        highP = asks[1][t][1].toString()
      if (new BigNumber(asks[1][t][1].toString()).lt(lowP) || lowP === '0')
        lowP = asks[1][t][1].toString()
    }
  }
  // set new info
  marketInfo[collection].info.TotalSupply = totalS
  marketInfo[collection].info.HighPrice = highP
  marketInfo[collection].info.LowPrice = lowP
  marketInfo[collection].info.amountListed = amountListed.toString()
}

async function getVolume (collection: string) {
  const promises = []
  const nowBlock = await nftPovider.getBlockNumber()
  const DayAgoBlock = new BigNumber(nowBlock).minus(
    86400 / chainConfig[0].BLOCK_LENGTH
  )
  const filter = marketContract.filters.Trade()
  const promise = marketContract.queryFilter(
    filter,
    DayAgoBlock.toNumber(),
    nowBlock
  )
  promises.push(promise)
  const [responses] = await Promise.all(promises)
  let volume = new BigNumber(0)
  for (let i = 0; i < responses.length; i++) {
    if (collection === responses[i].args?.collection)
      volume = volume.plus(responses[i].args?.askPrice.toString())
  }
  marketInfo[collection].info.volume = volume.toString()
}

async function newCollectionListener () {
  marketContract.on('CollectionNew', async collection => {
    // addcollection??
    console.log('new collection added')

    const nftColContract = new ethers.Contract(
      collection,
      nftColAbi,
      nftPovider
    )
    let nfts: { [nft_id: string]: nftInfo } = {}
    // collection Info
    let volume = new BigNumber(0)
    let name = ''
    let lowP = '0'
    let highP = '0'
    let totalS = '0'

    // get name of collection
    try {
      name = await nftColContract.name()
    } catch {
      console.log('failed to get name')
    }
    // get total supply
    try {
      totalS = (await nftColContract.totalSupply()).toString()
    } catch {
      console.log('failed to get supply')
    }

    const responseData = {
      [collection]: {
        info: {
          volume: volume.toString(),
          name: name,
          TotalSupply: totalS,
          LowPrice: lowP,
          HighPrice: highP
        },
        nfts
      }
    }
    Object.assign(marketInfo, responseData)

    saveNftFile()
  })
}
async function askUpdateListener () {
  marketContract.on('AskUpdate', async collection => {
    console.log('Ask updated')
    getHighLow(collection)
    saveNftFile()
  })
}
async function askCancelListener () {
  marketContract.on('AskCancel', async collection => {
    console.log('Ask Canceled')
    getHighLow(collection)
    saveNftFile()
  })
}
async function newAskListener () {
  marketContract.on('AskNew', async collection => {
    console.log('New Ask Added')
    getHighLow(collection)
    saveNftFile()
  })
}

async function buyListener () {
  marketContract.on('Trade', async collection => {
    console.log('NFT Bought')
    // recheck high lows and volume
    getHighLow(collection)
    getVolume(collection)
    saveNftFile()
  })
}

// CRONOS CHAIN STUFF
const providerCro = new ethers.providers.JsonRpcProvider(
  'https://evm.cronos.org'
)
const nftAddress = '0xcae06e7b36cbb3bce19f41640f1104e99f5395f4'

app.get(`/MV/getNFTInfo/:walletAddress`, async (req, res) => {
  const walletAddress = req.params.walletAddress
  console.log('Cronos wallet info')
  try {
    const nftContract = new ethers.Contract(
      nftAddress,
      [
        'function walletOfOwner(address) external view returns (uint256[])',
        'function tokenURI(uint256) external view returns (string)'
      ],
      providerCro
    )
    const nftIds = await nftContract.walletOfOwner(walletAddress)
    const info: any[] = []

    for (const id of nftIds) {
      const urlRaw = await nftContract.tokenURI(
        new BigNumber(id.toString()).toString()
      )
      const url = ipfsGateway + urlRaw.substring(7)
      const response = await axios(url)
      const infoData = {
        id: id.toString(),
        image: response.data.image,
        type: response.data.attributes[0].value,
        type2: response.data.attributes[1].value
      }
      info.push(infoData)
    }
    const responseData = {
      [nftAddress]: {
        [walletAddress]: info
      }
    }

    res.json(responseData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch the NFT Info.' })
  }
})

const InitialStartupNFT = async () => {
  const path2 = './market.json'

  try {
    await fs.promises.access(path2, fs.constants.F_OK)
    const history = await fs.promises.readFile(path2, 'utf-8')
    const historyParsed = JSON.parse(history)
    marketInfo = historyParsed
  } catch (e) {
    console.log(e, 'no Old Data')
  }
  await collectMarketData()
  newAskListener()
  buyListener()
  newCollectionListener()
  askUpdateListener()
  askCancelListener()
  await GatherData()
  // listenForNewPairs()
  console.log('Fully Loaded up!')
}

InitialStartupNFT()

const intervalInMilliseconds = 6 * 60 * 60 * 1000 // 6 hours
setInterval(() => {
  GatherData()
  createQueryEngine()
}, intervalInMilliseconds)

const port = 3000 // Replace with your desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
