import { JsonRpcProvider } from "@ethersproject/providers";
import { deployContract } from "../utils";

export default async function () {
  const contractArtifactName = "MarSwapFactoryV2";
  const constructorArguments = [
    "0xdB18B38ED15669785A34925856A91502e970975E", // div factory
    "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1", // treasury
    "100000000000000"
  ];

  const providerUrl = "https://testnet.zkevm.cronos.org/"; // Replace with your network URL
  const provider = new JsonRpcProvider(providerUrl);

  const watchAddress = "0x0000000000000000000000000000000000008004";
  const topic0 = "0xc94722ff13eacf53547c4741dab5228353a05938ffcdd5d4a2d533ae0e618287";

  const latestBlockNumber = await provider.getBlockNumber();
  const fromBlock = latestBlockNumber - 100; // Check logs from the last 100 blocks
  console.log(latestBlockNumber);

  const filter = {
    address: watchAddress,
    topics: [topic0],
    fromBlock: fromBlock,
    toBlock: 'latest'
  };

  const getLogsFromLast10Blocks = async () => {
    const logs = await provider.getLogs(filter);
    if (logs.length > 0) {
      const latestLog = logs[logs.length - 2];
      const topic1 = latestLog.topics[1];
      console.log(`Latest log found! Topic1: ${topic1}`);
      return topic1;
    } else {
      console.log("No logs found in the last 10 blocks.");
      return null;
    }
  }

  const factContract = await deployContract(contractArtifactName, constructorArguments);

  const latestLog = await getLogsFromLast10Blocks();
  const receipt = await factContract.deploymentTransaction()?.wait();
  const txHash = receipt?.hash ?? "";
  console.log(`Transaction hash: ${txHash}`);

  if (receipt && receipt.logs?.length > 0) {
    
    if (receipt.logs.length > 3) {
      const log3 = receipt.logs[3];
      if (log3.topics[0] === topic0) {
        const param1 = log3.topics[1]; // Access the first parameter if topic[0] matches topic0
        console.log(`Log 3 - First Parameter (topics[1]): ${param1}`);
      } else {
        console.log(`Log 3's topic[0] does not match the specified topic0.`);
      }
    } else {
      console.log("Log 3 not found.");
    }
  } else {
    console.log("No logs found in the transaction.");
  }

  console.log(`CodeHash: ${latestLog}`);
}
