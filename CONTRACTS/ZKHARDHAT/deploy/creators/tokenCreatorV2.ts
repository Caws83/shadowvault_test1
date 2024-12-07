import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network

// npx hardhat deploy-zksync --script /creators/tokenCreatorV2.ts

export default async function () {
  const contractArtifactName = "TokenFactoryV2";
  const treasury = "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"
  const createFee = "10000000"
  const constructorArguments = [treasury, createFee];
  await deployContract(contractArtifactName, constructorArguments);
}
