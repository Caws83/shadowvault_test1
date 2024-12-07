import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const contractArtifactName = "SmartPoolFactory";
  const constructorArguments = ["0x2cc4e3E6104c032ceB57D7DdAd7bb23d9D425A1B","1000000000"]
  await deployContract(contractArtifactName, constructorArguments);
}
