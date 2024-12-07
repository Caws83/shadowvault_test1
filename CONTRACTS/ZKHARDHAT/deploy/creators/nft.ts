import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
// npx hardhat deploy-zksync --script deploy.ts

export default async function () {
  const contractArtifactName = "MarSwapNFT";
  const constructorArguments = [
    "test",
    "ttt",
    "ipfs://test/",
    ".json",
    "1000",
    "0",
    '0x0000000000000000000000000000000000000000',
    "0",
    "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"
]
  // const constructorArguments = ["0x2909F0F72fE53F41e093dE06aDEA2758680DeF46"];
  await deployContract(contractArtifactName, constructorArguments);
}
