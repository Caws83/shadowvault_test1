import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
// npx hardhat deploy-zksync --script deploy.ts

export default async function () {
  const contractArtifactName = "MarswapERC404";
  const constructorArguments = [
    "test",
    "ttt",
    "18",
    "ipfs://test/",
    ".json",
    "100",
    "0",
    '0x0000000000000000000000000000000000000000',
    "0",
    "100"
]
  // const constructorArguments = ["0x2909F0F72fE53F41e093dE06aDEA2758680DeF46"];
  await deployContract(contractArtifactName, constructorArguments);
}
