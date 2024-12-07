import { deployContract } from "./utils";
import { JsonRpcProvider } from "@ethersproject/providers"; // Correct import path

// npx hardhat deploy-zksync --script deployAll.ts

// info for token itself
// const name = "Crolon Mars" 
// const symbol = "CRLMRS"
// const initialSupply = "10000000"

const WETH = "0xC1bF55EE54E16229d9b369a5502Bfe5fC9F20b6d" 
const USDT = "0x5b91e29Ae5A71d9052620Acb813d5aC25eC7a4A2"  // VUSD mainnet
const treasury = "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"
const initFlatFee = "1000000000000000000" // 5 cro
const presaleSubFee = "50000000000000000000" //50 cro
const tokenCreateFee = "50000000000000000000" // 50 cro
const marshotCreation = "1000000000000000000" // 1 cro
const marshotSponship = "1000000000000000000000" // 1000
const marshotPercentFee = "2" // 2%
const marshotBurnPercent = "0" // 0%
const marshotPrizePercent = "2" // 2%
const prizeTreasury = "0xa6B1Fd0d19f7561d2f245f32c371c3C39e757d56"
const zeroAddress =   "0x0000000000000000000000000000000000000000"

// Set up a provider with the correct network URL
const providerUrl = "https://mainnet.zkevm.cronos.org"; // Replace with your network URL
const provider = new JsonRpcProvider(providerUrl);



// The address to watch for events
const watchAddress = "0x0000000000000000000000000000000000008004";
// The event topic0 to filter by
const topic0 = "0xc94722ff13eacf53547c4741dab5228353a05938ffcdd5d4a2d533ae0e618287";

// this will deploy all contracts needed for ZK

export default async function () {
/*
    // for testnet use our own zUSD
    const USDTContract = await deployContract("BEP20Token");
    const USDT = await USDTContract.getAddress();
*/
    // depliy div factory
    const divContract = await deployContract("DividendFactory");
    const divAddress = await divContract.getAddress();

    const latestBlockNumber = await provider.getBlockNumber();
    const fromBlock = latestBlockNumber - 10; // Check logs from the last 10 blocks
    // Create a filter for the last 10 blocks
    const filter = {
      address: watchAddress,
      topics: [topic0],
      fromBlock: fromBlock,
      toBlock: 'latest'
    };


// Function to fetch logs from the last 10 blocks
async function getLogsFromLast10Blocks() {
  const logs = await provider.getLogs(filter);
  if (logs.length > 0) {

    for(let i=0; i <logs.length; i++){
      console.log(`log ${i}: ${logs[i].topics[1]}`)
    }


    const latestLog = logs[logs.length - 2];
      // Decode the log data (Assuming topic1 is the second topic)
      const topic1 = latestLog.topics[1];
      console.log(`Latest log found! Topic1: ${topic1}`);
      return topic1;

  } else {
    console.log("No logs found in the last 10 blocks.");
    return null;
  }
  
}


  // const contractArtifactName = "CrolonMars";
  // const constructorArguments9 = [name, symbol, initialSupply];
  // const CroContract = await deployContract(contractArtifactName, constructorArguments9);
  // const CrolonMarsAddress = await CroContract.getAddress();
    
    // divFactory / Treasury / initialFlatFee --- deploy factory
    const constructorArguments1 = [divAddress, treasury, initFlatFee];
    const factContract = await deployContract("MarSwapFactoryV2", constructorArguments1);
    const factAddress = await factContract.getAddress();

    const latestLog = await getLogsFromLast10Blocks();
    console.log(`CodeHash: ${latestLog}`);

    const receipt = await factContract.deploymentTransaction()?.wait();
    const txHash = receipt?.hash ?? "";
    console.log(`Transaction hash: ${txHash}`);
    
    let codeHashV2
    if (receipt && receipt.logs?.length > 0) {
    
      if (receipt.logs.length > 3) {
        const log3 = receipt.logs[3];
        if (log3.topics[0] === topic0) {
          const codeHashV2 = log3.topics[1]; // Access the first parameter if topic[0] matches topic0
          console.log(`Log 3 - First Parameter (topics[1]): ${codeHashV2}`);
        } else {
          console.log(`Log 3's topic[0] does not match the specified topic0.`);
        }
      } else {
        console.log("Log 3 not found.");
      }
    } else {
      console.log("No logs found in the transaction.");
    }

    // deploy router -- set WETH ABOVE
    const constructorArguments2 = [factAddress, WETH];
    const routerContract = await deployContract("MarsRouter", constructorArguments2);
    const routerAddress = await routerContract.getAddress();

    // Presales
    const constructorArguments3 = [treasury, presaleSubFee];
    const ifoContract = await deployContract("IFOFactoryV3", constructorArguments3);
    const ifoAddress = await ifoContract.getAddress();

    // priceCheker -- 
    const constructorArguments4 = [WETH,USDT,[factAddress]]
    const priceCheckerContract = await deployContract("TokenPriceCheck2", constructorArguments4);
    const priceAddress = await priceCheckerContract.getAddress();

    // QuickCalls
    const constructorArguments = [WETH,treasury]
    const compostContract = await deployContract("QuickCalls", constructorArguments);
    const compostAddress = await compostContract.getAddress();

    // token creator
    const constructorArguments5 = [treasury, tokenCreateFee];
    const tokenCreateContract = await deployContract("TokenFactoryV2", constructorArguments5);
    const tokenCreateAddress = await tokenCreateContract.getAddress();

    // deploy airDropper
    const airContract = await deployContract("Airdrop");
    const airAddress = await airContract.getAddress();

    const infoChefContract = await deployContract("FarmCollection");
    const infoAddress = await infoChefContract.getAddress();

    const constructorArguments6 = [
      marshotCreation, // createion fee
      marshotPercentFee, // platformFeePercentage
      marshotPrizePercent,
      marshotBurnPercent, // burnPercentage
      // CrolonMarsAddress, // token to burn
      zeroAddress, // token to brun
      treasury, // Treasury
      prizeTreasury, // prize Treasury
      routerAddress, // router
      marshotSponship, // sponshipFee
    ];
    const marShotContract = await deployContract("PreLaunchManager",constructorArguments6)
    const marshotAddress = await marShotContract.getAddress();
    
  console.log(`\n Entire PlatFrom was successfully deployed:`);
  // console.log(` - Crolon Mars address: ${CrolonMarsAddress}`);
  console.log(` - Div Factory address: ${divAddress}`);
  console.log(` - Factory address: ${factAddress}`);
  console.log(` - Factory CodeHash: ${latestLog}`);
  console.log(` - Factory CodeHash: ${codeHashV2}`);
  console.log(` - Router address: ${routerAddress}`);
  console.log(` - AirDropper address: ${airAddress}`);
  console.log(` - InfoChef address: ${infoAddress}`);
  console.log(` - priceChcker address: ${priceAddress}`);
  console.log(` - PreSales address: ${ifoAddress}`);
  console.log(` - Compost address: ${compostAddress}`);
  console.log(` - TokenCreator address: ${tokenCreateAddress}`);
  console.log(` - Marshot address: ${marshotAddress}`);

  }

