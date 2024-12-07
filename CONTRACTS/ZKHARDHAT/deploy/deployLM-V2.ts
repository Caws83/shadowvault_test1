import { deployContract } from "./utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
// npx hardhat deploy-zksync --script deployLM-V2.ts

export default async function () {
  const contractArtifactName = "PreLaunchManagerV2";

  const zeroAddress =   "0x0000000000000000000000000000000000000000"
  const WETH = "0xC1bF55EE54E16229d9b369a5502Bfe5fC9F20b6d"
  
  const constructorArguments = [
    "1000000000000000000", // createion fee
    "2", // platformFeePercentage
    "0", // prize percent
    "3", // burn percentage
    zeroAddress, // "0xbEbafD9718216C79dd905C141085262CA6d4978F", // burntoken
    "0xDa2b95E31E3577cbDB767eEF1aE8942c163D6117", // Treasury
    "0xDa2b95E31E3577cbDB767eEF1aE8942c163D6117", // Prize Treasury
    WETH, // WETH
    "200000000000000000000", // sponshipFee
    "1000000000000000000000", // croHome Fee
  ];
  await deployContract(contractArtifactName, constructorArguments);
}
