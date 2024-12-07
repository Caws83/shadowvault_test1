import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const contractArtifactName = "MainTokenFactory";
  const treasury = "0xE328E200B18b616224B2801f881ff9ddddcE8644"
  const createFee = "10000000"
  const constructorArguments = [treasury, createFee];
  await deployContract(contractArtifactName, constructorArguments);
}
