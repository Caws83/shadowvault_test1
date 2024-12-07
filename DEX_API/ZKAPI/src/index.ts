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
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Contract, EventFilter } from 'ethers';

const EthDater = require('ethereum-block-by-date');


interface spinData {
  [user: string]: {
    [chain: string]: {
      spins: number
      lastFreeSpinEpoch: number
    }
  }
}
let spinAmounts: spinData = {}

interface history {
  chainId: string,
  user: string,
  balance: string,
  spin: string,
  matches: string,
  winnings: string,
  txHash?: string
}
let historyData: history[] = []

const routerAbi = require('../abis/routerAbi.json')
const marshotAbi = require('../abis/marshotAbi.json')
const tokenAbi = require('../abis/token.json')

const lpabi = require('../abis/lp.json');
const fabi = require('../abis/factory.json');
const infoAbi = require('../abis/info.json');
const marketAbi = require('../abis/nftMarket.json');
const nftColAbi = require('../abis/nftCollections.json');
const divTrackerAbi = require('../abis/divTracker.json')

                                                                                                   // pair api info
let mainInfo: { [x: string]: { chain_id: any; base_id: any; base_name: any; base_symbol: any; quote_id: any; quote_name: any; quote_symbol: any; pair_id: any; last_price: string; low_price_24hr: string; high_price_24hr: string; change_24hr: string; base_volume: string; quote_volume: string; tx_count: string; }; }[] = []
let dividendsPaid: { [x: string]: {amountPaid: string}}[] = []
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
    nfts:{[ nft_id: string]: nftInfo}
  }
}

interface cInfo {
  [collection: string]: {
    info: colInfo
  }
}

let marketInfo: allInfo = {};

const nftMarket = "0xeA6C532affBFA0A37fF89b907511fB38546A2337"
// const ipfsGateway = "https://amber-genuine-baboon-951.mypinata.cloud/ipfs/"
// const ipfsGateway = 'https://ipfs.io/ipfs/'
const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/'
// const ipfsGateway = 'https://dweb.link/'
const nftPovider =  new ethers.providers.JsonRpcProvider('https://www.shibrpc.com')
const marketContract = new ethers.Contract(nftMarket, marketAbi, nftPovider);




const chainConfig = [
  {
    chainId: 388,
    provider: new ethers.providers.JsonRpcProvider('https://mainnet.zkevm.cronos.org'),
    exploer: "https://explorer.zkevm.cronos.org",
    factory: "0xc547615d77b2d5c1add3d744342d8CB027873e82",
    infoGetter: "0x0078cb86b578272c0fd94f944bf6040B8f73f87C",
    BLOCK_LENGTH: 1,
    isV2: true,
  } 
]

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
app.get('/api/data', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://techposintegrations.azurewebsites.net/digitalsignage/carousel/1/468');

    // Check if the response is okay
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

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



const ai_response_desc = async (inp: string) => {
  console.log(inp)
  const response = await queryEngine.query({
    query: inp
  })
  return response.toString()
}

const ai_response = async (inp: string) => {
  const response = await queryEngine.query({
    query: inp
  })

  return response.toString()
  
}

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
    input = `You are given this text ${input}. Your role is expand on it and write a fun descriptive piece about a cryptocurrency in under 600 characters. Make it unique every time and dont use apostraphes`
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

// NFT SHIBARIUM & DEX API

app.get(`/V2/allPairs`, (test,res) => {
  if(!loaded) {
    res.status(500).json('Loading......');
    return
  }
    console.log("all pairs grabbed")

  try {
  
      const history = fs.readFileSync("./pairs.json", 'utf-8');
      const historyParsed = JSON.parse(history);
      res.json(historyParsed);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch the current price, volume, and token details of the pairs.' });
      return
    }
})
app.get(`/V2/pairs`, (test, res) => {
  if (!loaded) {
    res.status(500).json('Loading......');
    return;
  }
  console.log("pairs grabbed")
  try {
    // Filter pairs with baseVolume > 0
    const pairsWithBaseVolume = mainInfo.filter(pair => parseFloat(pair[Object.keys(pair)[0]].base_volume) > 0);

    // Slice to a maximum of 50 pairs
    const slicedPairs = pairsWithBaseVolume.slice(0, 50);

    // Send the response
    res.json(slicedPairs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch the current price, volume, and token details of the pairs.' });
    return;
  }
});
app.get(`/V2/divpaid`, (test, res) => {
  if (!loaded) {
    res.status(500).json('Loading......');
    return;
  }
  console.log("DivPaid Grabbed")
  try {
    // Send the response
    res.json(dividendsPaid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Dividends paid out' });
    return;
  }
});



async function listenForNewPairs() {
  console.log("listening for new pairs");

  for (const chain of chainConfig) {
    const {
      chainId,
      provider,
      exploer,
      factory,
      infoGetter,
      BLOCK_LENGTH,
    } = chain;

    const factoryContract = new ethers.Contract(factory, fabi, provider);
    const getterContract = new ethers.Contract(infoGetter, infoAbi, provider);

    factoryContract.on("PairCreated", async (pair, allPairslength) => {
      console.log(`new pair created on chain ${chainId}`);

      try {
        let index = new BigNumber(allPairslength.toString()).minus(1).toNumber();
        const allPairInfo = await getterContract.getApiInfo(
          factory,
          index,
          index
        );

        if (pair.toString() !== allPairInfo.pair[0].toString()) {
          console.log("pairs do not match");
          return;
        }
        const tokenAAddress = allPairInfo.tokenA[0];
        const tokenBAddress = allPairInfo.tokenB[0];

        const tokenAName = allPairInfo.aName[0];
        const tokenASymbol = allPairInfo.aSym[0];
        const decimalsA = new BigNumber(
          allPairInfo.aDec[0].toString()
        ).toNumber();
        const tokenBName = allPairInfo.bName[0];
        const tokenBSymbol = allPairInfo.bSym[0];
        const decimalsB = new BigNumber(
          allPairInfo.bDec[0].toString()
        ).toNumber();

        const price = new BigNumber(0);

        const label = `${tokenAAddress}_${tokenBAddress}`;
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
            low_price_24hr: "0",
            high_price_24hr: "0",
            change_24hr: "0",
            base_volume: "0",
            quote_volume: "0",
            tx_count: "0",
          },
        };
        mainInfo.push(responseData);

        const artifact = JSON.stringify(mainInfo);
        fs.writeFile(`pairs.json`, artifact, (err) => {
          if (err) {
            console.error("Error writing to file:", err);
          }
        });
      } catch {
        console.log(`Error setting up New Pair Created on chain ${chainId}`);
      }
    });
  }
}


async function GatherData() {
  console.log("starting up");

  let tmpInfo = [];
  let tmpDiv = []
  
  for (const chain of chainConfig) {
    let divPaid = new BigNumber(0)
    const {
      chainId,
      provider,
      infoGetter,
      factory,
      BLOCK_LENGTH,
      isV2
    } = chain;

    const dater = new EthDater(
      provider // Ethers provider, required.
  );

    const factoryContract = new ethers.Contract(factory, fabi, provider);
    const getterContract = new ethers.Contract(infoGetter, infoAbi, provider);
    const nowBlock = await provider.getBlockNumber();
    // const DayAgoBlock = new BigNumber(nowBlock).minus(86400 / BLOCK_LENGTH);
    let DayAgoBlockInfo = await dater.getDate(
      Date.now() - 86400000, // Date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
      true, // Block after, optional. Search for the nearest block before or after the given date. By default true.
      false // Refresh boundaries, optional. Recheck the latest block before request. By default false.
  );
  console.log(DayAgoBlockInfo.block)
  const DayAgoBlock = DayAgoBlockInfo.block
  //  try {
      const totalPairs = await factoryContract.allPairsLength();
      const runAmount = Math.ceil(totalPairs / getPairsAmount);
      for (let s = 0; s < runAmount; s++) {
        const promises = [];
        const start = s * getPairsAmount;
        const end = Math.min((s + 1) * getPairsAmount, totalPairs);
        const allPairInfo = await getterContract.getApiInfo(
          factory,
          start.toString(),
          end.toString()
        );
        const pairAddresses = allPairInfo.pair;
        let divPromises = []

        for (const pairAddress of pairAddresses) {
          const uniswapV2PairContract = new ethers.Contract(
            pairAddress,
            lpabi,
            provider
          );
          
          if(isV2){
          const divAddress = await uniswapV2PairContract.dividendTracker()
          const divContract = new ethers.Contract(
            divAddress,
            divTrackerAbi,
            provider
          );
          const divPromise = divContract.totalDividendsDistributed()
          divPromises.push(divPromise)
          }

          const filter = uniswapV2PairContract.filters.Swap();
          const promise = uniswapV2PairContract.queryFilter(
            filter,
            DayAgoBlock,
            nowBlock
          );
          promises.push(promise);
        }
        
        if(isV2){
          const divResponse1 = await Promise.all(divPromises)
          for(let i=0; i<divResponse1.length; i++){
            divPaid = divPaid.plus(divResponse1[i].toString())
          }
        }
        

        const responses = await Promise.all(promises);
       
        for (let i = 0; i < responses.length; i++) {
         
          const tokenAAddress = allPairInfo.tokenA[i];
          const tokenBAddress = allPairInfo.tokenB[i];

          const transferEventsToken0 = responses[i];

          let volumeToken0 = new BigNumber(0);
          let volumeToken1 = new BigNumber(0);
          let lowPrice = new BigNumber(0);
          let highPrice = new BigNumber(0);
          let dayOldPrice = new BigNumber(0);
          let price = new BigNumber(0);

          const tokenAName = allPairInfo.aName[i];
          const tokenASymbol = allPairInfo.aSym[i];
          const decimalsA = new BigNumber(
            allPairInfo.aDec[i].toString()
          ).toNumber();
          const tokenBName = allPairInfo.bName[i];
          const tokenBSymbol = allPairInfo.bSym[i];
          const decimalsB = new BigNumber(
            allPairInfo.bDec[i].toString()
          ).toNumber();

          let indexLength = 1;
          const eventLength = transferEventsToken0.length;

          await transferEventsToken0.forEach(async (event) => {
            const info = event.args;
          
            // Check if info is defined before accessing its properties
            if (info) {
              let newPrice = new BigNumber(0);
          
              if (new BigNumber(info[1].toString()).gt(0)) {
                newPrice = new BigNumber(info[4].toString())
                  .div(info[1].toString())
                  .times(new BigNumber(10).pow(decimalsA - decimalsB));
              }
          
              if (new BigNumber(info[2].toString()).gt(0)) {
                newPrice = new BigNumber(info[2].toString())
                  .div(info[3].toString())
                  .times(new BigNumber(10).pow(decimalsA - decimalsB));
              }
          
              if (indexLength === eventLength) price = newPrice;
          
              indexLength++;
          
              volumeToken0 = volumeToken0.plus(info[1].toString());
              volumeToken0 = volumeToken0.plus(info[3].toString());
              volumeToken1 = volumeToken1.plus(info[2].toString());
              volumeToken1 = volumeToken1.plus(info[4].toString());
          
              if (lowPrice.eq(0)) {
                lowPrice = newPrice;
                highPrice = newPrice;
                dayOldPrice = newPrice;
              }
              if (newPrice.gt(highPrice)) highPrice = newPrice;
              if (newPrice.lt(lowPrice)) lowPrice = newPrice;
            }
          });
          

          const label = `${tokenAAddress}_${tokenBAddress}`;
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
              tx_count: eventLength.toString(),
            },
          };
          tmpInfo.push(responseData);
        
        }
      }

      
   // } catch {
  //    console.log(`Error getting pair info (startAPI) on chain ${chain.chainId}`);
 //   }
    
    tmpDiv.push({[chainId.toString()]: {amountPaid: divPaid.toString()}})
  }

  dividendsPaid = tmpDiv;
  mainInfo = tmpInfo;
      const artifact = JSON.stringify(tmpInfo, null, 2);
      fs.writeFile(`pairs.json`, artifact, (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        }
      });

  loaded = true;
}





// 
//  NFT STUFF BELOW
//
//
//
//




app.get(`/V2/allMarketinfo`, (test,res) => {
  if(!loaded) {
    res.status(500).json('Loading......');
    return
  }
    console.log("All market info grabbed")

  try {
      res.json(marketInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch the NFT Info.' });
      return
    }
})

app.get(`/V2/marketinfo`, (test,res) => {
  if(!loaded) {
    res.status(500).json('Loading......');
    return
  }
  let collectionsInfo: cInfo = {};
  console.log("market info Grabbed")
  try {
    for(const key in marketInfo){
      const thisCol = marketInfo[key]
      const responseData = {
        [key]: {
          info: thisCol.info
        }
      };
        Object.assign(collectionsInfo, responseData)
    }

      res.json(collectionsInfo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch the NFT Info.' });
      return
    }
})

app.get(`/V2/market/:collection`, (req,res) => {
  if(!loaded) {
    res.status(500).json('Loading......');
    return
  }
    console.log("collection info grabbed")
  try {
      const collection = req.params.collection
      res.json(marketInfo[collection].info);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch the NFT Collection Info.' });
      return
    }
})

app.get(`/V2/market/:collection/:tokenId`, async (req,res) => {
  if(!loaded) {
    res.status(500).json('Loading......');
    return
  }
    console.log("tokenId info Grabbed")
  try {
      const collection = req.params.collection
      const tokenId = req.params.tokenId
      if(!(collection in marketInfo)) res.json(".. collection does not exist ...")
      if(!(tokenId in marketInfo[collection].nfts )) {
        await setNFTIDInfo(collection, tokenId)
        saveNftFile()
      }
      res.json(marketInfo[collection].nfts[tokenId]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch the NFT tokenId Info.' });
      return
    }
})



async function collectMarketData() {
  let tmpMarketInfo: allInfo = marketInfo;
let done = false
let start = 0
let size = getPairsAmount

    const promises = [];
    const nowBlock = await nftPovider.getBlockNumber()
    const DayAgoBlock = new BigNumber(nowBlock).minus(86400 / chainConfig[0].BLOCK_LENGTH);
    const filter = marketContract.filters.Trade()
    const promise = marketContract.queryFilter(filter, DayAgoBlock.toNumber(), nowBlock );
    promises.push(promise)
    const [responses] = await Promise.all(promises)
while(!done) {
  // get collection listing by size
  const collections = await marketContract.viewCollections(start, size);
  const length = new BigNumber(collections[2].toString())
  if(length.lt(size)) done = true
  else start += size

  for(let i=0; i < length.toNumber(); i++) {
    const thisCollection = collections[0][i]
  if (marketInfo ? !(thisCollection in marketInfo) : true ) {

    const nftColContract = new ethers.Contract(thisCollection, nftColAbi, nftPovider);
    let nfts: {[nft_id: string]: nftInfo} = {};
    // collection Info
    let volume = new BigNumber(0)
    let name = ""
    let lowP = "0"
    let highP = "0"
    let totalS = "0"
    let amountListed = new BigNumber(0)
    
    // get volume of this collection 
    for(let i=0; i<responses.length;i++) {
      if(thisCollection === responses[i].args?.collection)
      volume = volume.plus(responses[i].args?.askPrice.toString())
    }
    // get name of collection
    try {
      name = await nftColContract.name()
    } catch{ console.log("failed to get name")}
    // get total supply
    try {
      totalS = (await nftColContract.totalSupply()).toString()
  } catch{ console.log("failed to get supply")}

    // get all token_ids for sale
    let done2 = false
    let start2 = 0
    while(!done2) {
      const asks = await marketContract.viewAsksByCollection(thisCollection, start2, size);
      const length2 = new BigNumber(asks[2].toString())
      if(length2.lt(size)) done2 = true
      else start2 += size
      //get the json - and image from nft contract
      for(let t=0; t<asks[0].length; t++){
        // check for low and high
        amountListed = amountListed.plus(1)
        if(new BigNumber(asks[1][t][1].toString()).gt(highP)) highP = asks[1][t][1].toString()
        if(new BigNumber(asks[1][t][1].toString()).lt(lowP) || lowP === "0") lowP = asks[1][t][1].toString()

        let jsonUrl = ""
        let token_id = asks[0][t].toString()
        try {
        const tokenUri = await nftColContract.tokenURI(token_id);
        const checker = tokenUri.substring(0,4)
        if(checker === "http"){
          jsonUrl = tokenUri
        }else {
          const properSubUrl = tokenUri.substring(7)
          jsonUrl = `${ipfsGateway}${properSubUrl}`
        }
      } catch{ console.log("failed to get tokenUri")}

     
       try {
       const response2 = await axios.get(jsonUrl)
      
        
        const nftJson = response2.data
              const name = nftJson.name
              let imageUrl = ""
              const desc = nftJson.description
              const attributes = nftJson.attributes
              const checker2 = nftJson.image.substring(0,4)
              if(checker2 === "http"){
                imageUrl = nftJson.image
              }else {
                const imageBase = nftJson.image.substring(7)
                imageUrl = `${ipfsGateway}${imageBase}`
              }
        // set token info
        const thisNFt = {
          [token_id] : {
            name: `${name}`,
            image_url: imageUrl,
            description: `${desc}`,
            attributes
          }
        }
        Object.assign(nfts, thisNFt);
      } catch{
        console.log("failed")
       }
      }


    }

    const collectionAddress = `${collections[0][i]}`;
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
    };
      Object.assign(tmpMarketInfo, responseData)
  } else {
    // check volume & low and highs
    let volume = new BigNumber(0)
    let lowP = "0"
    let highP = "0"
    let amountListed = new BigNumber(0)
    for(let i=0; i<responses.length;i++) {
      if(thisCollection === responses[i].args?.collection)
      volume = volume.plus(responses[i].args?.askPrice.toString())
    }
    
    // high and lows
    let done2 = false
    let start2 = 0
    while(!done2) {
      const asks = await marketContract.viewAsksByCollection(thisCollection, start2, size);
      const length2 = new BigNumber(asks[2].toString())
      if(length2.lt(size)) done2 = true
      else start2 += size
      //get the json - and image from nft contract
      for(let t=0; t<asks[0].length; t++){
        // check for low and high
        amountListed = amountListed.plus(1)
        if(new BigNumber(asks[1][t][1].toString()).gt(highP)) highP = asks[1][t][1].toString()
        if(new BigNumber(asks[1][t][1].toString()).lt(lowP) || lowP === "0") lowP = asks[1][t][1].toString()
      }
    }
    // set new info
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
  const artifact = JSON.stringify(marketInfo, null, 2);
  fs.writeFile(`market.json`, artifact, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    }
  });
}

async function setNFTIDInfo(collection: string, tokenId: string) {
  const nftColContract = new ethers.Contract(collection, nftColAbi, nftPovider);

        let jsonUrl = ""
        let token_id = tokenId
      try {
        const tokenUri = await nftColContract.tokenURI(token_id);
        console.log(tokenUri, tokenId)
        const checker = tokenUri.substring(0,4)
        if(checker === "http"){
          jsonUrl = tokenUri
        }else {
          const properSubUrl = tokenUri.substring(7)
          jsonUrl = `${ipfsGateway}${properSubUrl}`
        }
      } catch { console.log("Failed to get TokenURI 2")}

      
      try {
       const response2 = await axios.get(jsonUrl)
      
              
        const nftJson = response2.data
              const name = nftJson.name
              let imageUrl = ""
              const desc = nftJson.description
              const attributes = nftJson.attributes
              const checker2 = nftJson.image.substring(0,4)
              if(checker2 === "http"){
                imageUrl = nftJson.image
              }else {
                const imageBase = nftJson.image.substring(7)
                imageUrl = `${ipfsGateway}${imageBase}`
              }
        // set token info
        const thisNFt = {
          [token_id] : {
            name: `${name}`,
            image_url: imageUrl,
            description: `${desc}`,
            attributes
          }
        }
        Object.assign(marketInfo[collection].nfts, thisNFt);
      } catch{
        console.log("failed")
       }
}

async function getHighLow(collection: string) {

     let lowP = "0"
     let highP = "0"
     let amountListed = new BigNumber(0)
     let totalS = "0"

     const nftColContract = new ethers.Contract(collection, nftColAbi, nftPovider);
    try {
      totalS = (await nftColContract.totalSupply()).toString()
    } catch{ console.log("failed to get supply")}
 
     // high and lows
     let done2 = false
     let start2 = 0
     while(!done2) {
       const asks = await marketContract.viewAsksByCollection(collection, start2, getPairsAmount);
       const length2 = new BigNumber(asks[2].toString())
       if(length2.lt(getPairsAmount)) done2 = true
       else start2 += getPairsAmount
       //get the json - and image from nft contract
       for(let t=0; t<asks[0].length; t++){
         // check for low and high
         amountListed = amountListed.plus(1)
         if(new BigNumber(asks[1][t][1].toString()).gt(highP)) highP = asks[1][t][1].toString()
         if(new BigNumber(asks[1][t][1].toString()).lt(lowP) || lowP === "0") lowP = asks[1][t][1].toString()
       }
     }
     // set new info
     marketInfo[collection].info.TotalSupply = totalS
     marketInfo[collection].info.HighPrice = highP
     marketInfo[collection].info.LowPrice = lowP
     marketInfo[collection].info.amountListed = amountListed.toString()
}

async function getVolume(collection: string) {
  const promises = [];
  const nowBlock = await nftPovider.getBlockNumber()
  const DayAgoBlock = new BigNumber(nowBlock).minus(86400 / chainConfig[0].BLOCK_LENGTH);
  const filter = marketContract.filters.Trade()
  const promise = marketContract.queryFilter(filter, DayAgoBlock.toNumber(), nowBlock );
  promises.push(promise)
  const [responses] = await Promise.all(promises)
  let volume = new BigNumber(0)
  for(let i=0; i<responses.length;i++) {
    if(collection === responses[i].args?.collection)
    volume = volume.plus(responses[i].args?.askPrice.toString())
  }
  marketInfo[collection].info.volume = volume.toString()
}


async function newCollectionListener() {
  marketContract.on("CollectionNew", async(collection) => {
    // addcollection??
      console.log("new collection added")

    const nftColContract = new ethers.Contract(collection, nftColAbi, nftPovider);
    let nfts: {[nft_id: string]: nftInfo} = {};
    // collection Info
    let volume = new BigNumber(0)
    let name = ""
    let lowP = "0"
    let highP = "0"
    let totalS = "0"
    
    // get name of collection
    try {
      name = await nftColContract.name()
    } catch{ console.log("failed to get name")}
    // get total supply
    try {
      totalS = (await nftColContract.totalSupply()).toString()
  } catch{ console.log("failed to get supply")}

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
    };
      Object.assign(marketInfo, responseData)
   
    saveNftFile()
  })
}
async function askUpdateListener() {
  marketContract.on("AskUpdate", async(collection) => {
    console.log("Ask updated")
    getHighLow(collection)
    saveNftFile()
  })
}
async function askCancelListener() {
  marketContract.on("AskCancel", async(collection) => {
    console.log("Ask Canceled")
    getHighLow(collection)
    saveNftFile()
  })
}
async function newAskListener() {
  marketContract.on("AskNew", async(collection) => {
    console.log("New Ask Added")
    getHighLow(collection)
    saveNftFile()
  })
}

async function buyListener() {
  marketContract.on("Trade", async(collection) => {
    console.log("NFT Bought")
    // recheck high lows and volume
    getHighLow(collection)
    getVolume(collection)
    saveNftFile()
  })
}


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  // Add other necessary CORS headers here
  next()
})



// jackpot game 

interface ChainConfig {
  TOKEN: string;
  ROUTER: string;
  MARSHOT: string;
  RPC: string;
  JACKPOT: number;
  WINNINGS: number[][];
}

interface GlobalConfig {
  PRIVATE_KEY: string;
  MAXRANDOM: number;
  CHAINS: Record<number, ChainConfig>;
}

const GLOBAL_CONFIG: GlobalConfig = {
  PRIVATE_KEY: process.env.PKEY ?? "",
  MAXRANDOM: 30000000000,
  CHAINS: {
    [282]: {
      TOKEN:"0xD640668a3D7194968b98553028BB36313B985Ead",
      ROUTER: "0xf532f287fE994e68281324C2e07426E2Fe7C7578",
      MARSHOT: "0xa7c0EFA392e324503EE86Ec9bD7861cB9a76A1A9",
      RPC: "https://testnet.zkevm.cronos.org/",
      JACKPOT: 8000, // 80%
      WINNINGS: [
        [0, 0],            // Match 0: 0% earnings, up to 0 CRO
        [10, 2000],          // Match 1: 0.1% earnings, up to 20 CRO ($2)
        [25, 20000],         // Match 2: 0.25% earnings, up to 200 CRO ($20)
        [100, 100000],       // Match 3: 1% earnings, up to 1000 CRO ($100)
        [250, 200000],       // Match 4: 2.5% earnings, up to 2000 CRO ($200)
        [500, 400000],      // Match 5: 5% earnings, up to 4000 CRO ($400)
        [1000, 800000],      // Match 6: 10% earnings, up to 8000 CRO ($800)
        [2000, 1600000],     // Match 7: 20% earnings, up to 16000 CRO ($1,600)
        [3000, 3200000],     // Match 8: 30% earnings, up to 32000 CRO ($3,200)
        [4000, 6400000],     // Match 9: 40% earnings, up to 64000 CRO ($6,400)
        [5000, 10000000]     // Match 10: 50% earnings, up to 100000 CRO ($10,000)
      ],
    },
    [388]: {
      TOKEN:"0x447A1296AB0b8470d90a74bb90d36Aff9B3a2EbA",
      ROUTER: "0xdF5D7a26d0Da5636eF60CcFe493C13A1c0F37B9B",
      MARSHOT: "0x1B103CaA4A089a621E447018dee53e254113da7B",
      RPC: "https://mainnet.zkevm.cronos.org/",
      JACKPOT: 8000, // 80%
      WINNINGS: [
        [0, 0],            // Match 0: 0% earnings, up to 0 CRO
        [10, 2000],          // Match 1: 0.1% earnings, up to 20 CRO ($2)
        [25, 20000],         // Match 2: 0.25% earnings, up to 200 CRO ($20)
        [100, 100000],       // Match 3: 1% earnings, up to 1000 CRO ($100)
        [250, 200000],       // Match 4: 2.5% earnings, up to 2000 CRO ($200)
        [500, 400000],      // Match 5: 5% earnings, up to 4000 CRO ($400)
        [1000, 800000],      // Match 6: 10% earnings, up to 8000 CRO ($800)
        [2000, 1600000],     // Match 7: 20% earnings, up to 16000 CRO ($1,600)
        [3000, 3200000],     // Match 8: 30% earnings, up to 32000 CRO ($3,200)
        [4000, 6400000],     // Match 9: 40% earnings, up to 64000 CRO ($6,400)
        [5000, 10000000]     // Match 10: 50% earnings, up to 100000 CRO ($10,000)
      ],
    }
  }
};


const getChainIds = (): number[] => {
  return Object.keys(GLOBAL_CONFIG.CHAINS).map(Number);
};


const getSigner = (chainId: number) => new Wallet(
  GLOBAL_CONFIG.PRIVATE_KEY,
  new JsonRpcProvider(GLOBAL_CONFIG.CHAINS[chainId].RPC)
);

const getRouterContract = (chainId: number) => {
  const signer = getSigner(chainId)
  let contractRaw = new Contract(
    GLOBAL_CONFIG.CHAINS[chainId].ROUTER,
    routerAbi,
    signer
  );
  
  const keeperContract = contractRaw.connect(signer);
  return keeperContract;
}

const getMarshotContract = (chainId: number) => {
  const signer = getSigner(chainId)
  let contractRaw = new Contract(
    GLOBAL_CONFIG.CHAINS[chainId].MARSHOT,
    marshotAbi,
    signer
  );
  
  const keeperContract = contractRaw.connect(signer);
  return keeperContract;
}
const getRewardTokenContract = (chainId: number) => {
  const signer = getSigner(chainId)
  let contractRaw = new Contract(
    GLOBAL_CONFIG.CHAINS[chainId].TOKEN,
    tokenAbi,
    signer
  );
  
  const keeperContract = contractRaw.connect(signer);
  return keeperContract;
}

const getWalletBalance = async (chainId: number) => {
  const signer = getSigner(chainId)
  const crolonContract = getRewardTokenContract(chainId);
  const balance = await crolonContract.balanceOf(signer.address);
  /*
  const signer = getSigner(chainId)
  const balance = await signer.provider.getBalance(signer.address);
  */
  return balance;
}

const checkMatches = (randomNumber: string, wholeNumber: string) => {
  let matchCount = 0;

  if (randomNumber === wholeNumber) {
    console.log("Jackpot!");
    matchCount = 9999
  } else {
    const randomLen = randomNumber.length;
    const wholeLen = wholeNumber.length;

    // Start comparing from the last character to the first
    for (let i = 0; i < randomLen && i < wholeLen; i++) {
      if (randomNumber[randomLen - 1 - i] === wholeNumber[wholeLen - 1 - i]) {
        matchCount++;
      } else {
        break; // Break on first non-match
      }
    }

    if (matchCount > 0) {
      console.log(`${matchCount} match${matchCount > 1 ? 'es' : ''}`);
    } else {
      console.log("no Matches");
    }
  }
  
  return matchCount;
}

async function generateRandomNumber(chainId: number, account: string ): Promise<history> {
  const supply = await getWalletBalance(chainId);
  const wholeNumber = new BigNumber(supply.toString()).shiftedBy(-18).toFixed(0);
  const randomNumber = new BigNumber(Math.floor(Math.random() * GLOBAL_CONFIG.MAXRANDOM)).toFixed(0);
  const chainConfig = GLOBAL_CONFIG.CHAINS[chainId];

  console.log(`Random number generated: ${randomNumber}`);
  console.log(`Supply number generated: ${wholeNumber}`);

  const matches = checkMatches(randomNumber, wholeNumber);

  const winningsPercentage = matches === 999 ? chainConfig.JACKPOT : chainConfig.WINNINGS[matches][0]; // Ensure matches is a valid index
  const winnings = new BigNumber(supply.toString()).multipliedBy(winningsPercentage).dividedBy(10000).toFixed(0); // Calculate winnings as a percentage of supply 
  let correctedWinningsBasedOnMax = '0'
  let txHash
  // Send winnings to user
  if (new BigNumber(winnings).gt(0)) {
    // calculate max
    const Max = matches === 999 ? 
      new BigNumber(9999999999999).shiftedBy(18) : 
      new BigNumber(chainConfig.WINNINGS[matches][1]).shiftedBy(18)
      
    // check is winnings % is more than max. if so return and send max otherwise send winnings %
    correctedWinningsBasedOnMax = new BigNumber(winnings).gt(Max) ? Max.toFixed(0) : winnings

    const crolonContract = getRewardTokenContract(chainId); // Obtain the token contract
    try {
      const txResponse  = await crolonContract.transfer(account, correctedWinningsBasedOnMax);
      const receipt = await txResponse .wait(); // Wait for the transaction to be mined
      
      console.log(`Winnings of ${correctedWinningsBasedOnMax} sent to ${account}. Transaction Hash: ${receipt.transactionHash}`);
      txHash = receipt.transactionHash
      if(receipt.status === 1) console.log("tx Success")
      else if(receipt.status === 0) console.log("tx Failed")
    } catch (error) {
      console.error(`Failed to send winnings to ${account}:`, error);
    }
  }
  

  return {
    chainId: chainId.toString(),
    user: account,
    balance: wholeNumber,
    spin: randomNumber,
    matches: matches.toFixed(0),
    winnings: correctedWinningsBasedOnMax,
    txHash: txHash
  };

}

const createSpinAmountEntry = (address: string, chainId: number, howMany: number): boolean => {
  const isValid = ethers.utils.isAddress(address);
  if (!isValid) {
    console.error('Invalid address:', address);
    return false;
  }

  if (!spinAmounts[address]) {
    spinAmounts[address] = {}; // Initialize the entry for the address if it doesn't exist
  }

  // Update or add chain-specific data for the address
  spinAmounts[address][chainId] = {
    spins: howMany,
    lastFreeSpinEpoch: 0 // You can set this to the current epoch time if needed
  };

  return true;
};


const watchMarshot = (chainId: number) => {
  const contract = getMarshotContract(chainId);
  
  // Create filters for both events
  const contributedFilter: EventFilter = contract.filters.Contributed();
  const roundStartedFilter: EventFilter = contract.filters.RoundStarted();

  console.log("Watching", contract.address);

  // Listen for Contributed event
  contract.on(contributedFilter, async (roundId: BigNumber, user: string, amount: BigNumber) => {
    console.log(`Contributed event detected for user: ${user}, amount: ${amount.toString()}`);
    
    // Ensure the user address exists in spinAmounts
    if (!spinAmounts[user] || !spinAmounts[user][chainId]) {
      createSpinAmountEntry(user, chainId, 2);
    } else {
      // If it exists, increment the spins
      spinAmounts[user][chainId].spins += 2;
    }
  });
   // Listen for Contributed event
   contract.on(roundStartedFilter, async (tokenContract: string, name: string, symbol: string, endEpoch: BigNumber, creator: string) => {
    console.log(`RoundStarted event detected for user: ${creator}`);
    
    
    // Ensure the user address exists in spinAmounts
    if (!spinAmounts[creator] || !spinAmounts[creator][chainId]) {
      createSpinAmountEntry(creator, chainId, 5);
    } else {
      // If it exists, increment the spins
      spinAmounts[creator][chainId].spins += 5;
    }
      
  });
};

const watchFlatFeeSwapMade = (chainId: number) => {
  const contract = getRouterContract(chainId)
  const filter: EventFilter = contract.filters.routerInteraction();
  console.log("watching", contract.address);
  contract.on(filter, async (event: Event) => {
    console.log(`event detected for user: ${event.toString()}`);
    const userAddress = event.toString(); // Adjust index based on your event structure

    // Ensure the user address exists in spinAmounts
    if (!spinAmounts[userAddress] || !spinAmounts[userAddress][chainId]) {
      createSpinAmountEntry(userAddress, chainId, 1)
    } else {
      // If it exists, increment the spins
      spinAmounts[userAddress][chainId].spins += 1;
    }

  });
}

const saveSpins = async () => {
  console.log("saving");
  const artifact = JSON.stringify(spinAmounts, null, 2);
  const artifact2 = JSON.stringify(historyData, null, 2);

  try {
    await fs.promises.writeFile('spins.json', artifact);
    console.log('Data successfully saved to spins.json');
  } catch (err) {
    console.error('Error writing to file:', err);
  }
  try {
    await fs.promises.writeFile('history.json', artifact2);
    console.log('Data successfully saved to history.json');
  } catch (err) {
    console.error('Error writing to file:', err);
  }
};


app.get('/api/userData', async (req: Request, res: Response) => {
  const userAddress = typeof req.query.user === 'string' ? req.query.user : undefined;
  const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined;
  if (!userAddress || !chainId) {
    return res.status(400).json({ error: 'Invalid Query' });
  }
  
  if (!GLOBAL_CONFIG.CHAINS[chainId]) {
      return res.status(400).json({ error: 'Invalid Chain ID' });
  }
  if (!spinAmounts[userAddress] || !spinAmounts[userAddress][chainId]) {
    const isValid = createSpinAmountEntry(userAddress, chainId, 0);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Address' });
    }
  }
  const userSpinData = spinAmounts[userAddress][chainId];
  return res.status(200).json({ userSpinData });
})

app.get('/api/publicData', async (req: Request, res: Response) => {
  const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined;
  if (!chainId) {
    return res.status(400).json({ error: 'Invalid Query' });
  }
  if (!GLOBAL_CONFIG.CHAINS[chainId]) {
      return res.status(400).json({ error: 'Invalid Chain ID' });
  }
  
  const publicData = {
    jackpot: GLOBAL_CONFIG.CHAINS[chainId].JACKPOT,
    winnings: GLOBAL_CONFIG.CHAINS[chainId].WINNINGS
  }

  return res.status(200).json({ publicData });
})

app.get('/api/history', async (req: Request, res: Response) => {
  const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined;

  if (!chainId) {
    return res.status(400).json({ error: 'Invalid Query' });
  }
  
  if (!GLOBAL_CONFIG.CHAINS[chainId]) {
      return res.status(400).json({ error: 'Invalid Chain ID' });
  }

  // Filter the historyData based on the provided chainId and reverse the array
  const chainHistory = historyData
    .filter((data) => data.chainId === chainId.toString())
    .reverse(); // Reverse the filtered array

  return res.status(200).json({ historyData: chainHistory });
});

app.get('/api/giveTest', async (req: Request, res: Response) => {
  const userAddress = typeof req.query.user === 'string' ? req.query.user : undefined;

  if (!userAddress) {
    return res.status(400).json({ error: 'Invalid Query' });
  }

 // Check if the user exists in spinAmounts, if not create a new entry
 if (!spinAmounts[userAddress] || !spinAmounts[userAddress][282]) {
  const isValid = createSpinAmountEntry(userAddress, 282, 999);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid Address' });
  }
}  else {
  spinAmounts[userAddress][282].spins += 999;
}

  return res.status(200).json('test spins given');
});


app.get('/api/spin', async (req: Request, res: Response) => {
  try {
    // Ensure userAddress and chainId are valid
    const userAddress = typeof req.query.user === 'string' ? req.query.user : undefined;
    const chainId = typeof req.query.chainId === 'string' ? Number(req.query.chainId) : undefined;
    
    if (!userAddress || !chainId) {
      return res.status(400).json({ error: 'Invalid Query' });
    }
     // Check if chainId exists in GLOBAL_CONFIG.CHAINS
     if (!GLOBAL_CONFIG.CHAINS[chainId]) {
      return res.status(400).json({ error: 'Invalid Chain ID' });
    }
    const currentEpoch = Math.floor(Date.now() / 1000); // Get current epoch time in seconds

    // Check if the user has any spins left
    if (!spinAmounts[userAddress] || !spinAmounts[userAddress][chainId]) {
      return res.status(400).json({ error: 'Account doesnt exist on this chain' });
    }

    const userSpinData = spinAmounts[userAddress][chainId];
    // Check if the user is eligible for a free spin based on lastFreeSpinEpoch
    const freeSpinInterval = 86400; // For example, 1 day interval
    if (currentEpoch - userSpinData.lastFreeSpinEpoch >= freeSpinInterval) {
      userSpinData.lastFreeSpinEpoch = currentEpoch;
    }else if (userSpinData.spins > 0) {
      userSpinData.spins -= 1;
    } else {
      return res.status(400).json({ error: 'No spins left' });
    }

    // Perform the spin and calculate winnings
    const spinResult = await generateRandomNumber(chainId, userAddress);

    // Update the history
    historyData.push(spinResult);

    // Return the result to the user
    return res.status(200).json({ spinResult });
  } catch (error) {
    console.error('Error processing spin:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


const setupGracefulShutdown = () => {
  const exitHandler = async () => {
    console.log("Exiting...");
    await saveSpins();
    process.exit();
  };

  // Catch exit signals
  process.on('SIGINT', exitHandler); // Ctrl+C
  process.on('SIGTERM', exitHandler); // kill command
  process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await saveSpins();
    process.exit(1);
  });
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await saveSpins();
    process.exit(1);
  });
};

const loadUp = async () => {
  try {
    const path2 = './spins.json'
    await fs.promises.access(path2, fs.constants.F_OK)
    const history = await fs.promises.readFile(path2, 'utf-8')
    const historyParsed = JSON.parse(history)
    spinAmounts = historyParsed
  } catch (e) {
    console.log(e, 'no Old user Data')
  }
  try {
    const path2 = './history.json'
    await fs.promises.access(path2, fs.constants.F_OK)
    const history = await fs.promises.readFile(path2, 'utf-8')
    const historyParsed = JSON.parse(history)
    historyData = historyParsed
  } catch (e) {
    console.log(e, 'no Old history Data')
  }
  const chainIds = getChainIds();
  for (let i = 0; i < chainIds.length; i++) {
    const chainId = chainIds[i];
    watchFlatFeeSwapMade(chainId);
    watchMarshot(chainId)
  }
  setupGracefulShutdown();
}

const TOKEN_ADDRESS = '0x447A1296AB0b8470d90a74bb90d36Aff9B3a2EbA'; // crolon mars
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dead';

const getCrolonContract = () => {
  const signer = getSigner(388)
  let contractRaw = new Contract(
    TOKEN_ADDRESS,
    tokenAbi,
    signer
  );
  
  const keeperContract = contractRaw.connect(signer);
  return keeperContract;
}
app.get('/api/crolon/:type', async (req: Request, res: Response) => {
  const supplyType = req.params.type;

  const crolonContract = getCrolonContract();

  try {
    const totalSupply = await crolonContract.totalSupply();
    let supply = new BigNumber(0);

    if (supplyType === 'totalsupply') {
      supply = new BigNumber(totalSupply.toString()).shiftedBy(-18); // Shift by -18 and convert to number
    } else if (supplyType === 'circulating') {
      const deadAddressBalance = await crolonContract.balanceOf(DEAD_ADDRESS);
      supply = new BigNumber(totalSupply.toString()).minus(deadAddressBalance.toString()).shiftedBy(-18)
    } else {
      return res.status(400).json({ error: 'Invalid supply type' });
    }
    return res.status(200).json(parseFloat(supply.toFixed(8)) ); // Output as a number
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const InitialStartupNFT = async () => {
  const path2 = './market.json';

  try {
    await fs.promises.access(path2, fs.constants.F_OK);
    const history = await fs.promises.readFile(path2, 'utf-8');
    const historyParsed = JSON.parse(history);
    marketInfo = historyParsed
  } catch (e) {
    console.log(e, "no Old Data")
  }
  await collectMarketData()
  newAskListener()
  buyListener()
  newCollectionListener()
  askUpdateListener()
  askCancelListener()
  await GatherData()
  // listenForNewPairs()
  console.log("Fully Loaded up!")

};







loadUp()
InitialStartupNFT()


const intervalInMilliseconds = 1 * 60 * 60 * 1000 // 1 hours
setInterval(() => {
  createQueryEngine()
  saveSpins()
}, intervalInMilliseconds)


const port = 3000 // Replace with your desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
