import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network

// npx hardhat deploy-zksync --script dex/ifoFactory.ts

export default async function () {
  const contractArtifactName = "IFOFactoryV3";
  const treasury = "0x2909F0F72fE53F41e093dE06aDEA2758680DeF46"
  const subFee = "10000000"
  const constructorArguments = [treasury, subFee];
  await deployContract(contractArtifactName, constructorArguments);
}
