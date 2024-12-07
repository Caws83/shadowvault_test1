import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const contractArtifactName = "NFTPoolFactory";
  const constructorArguments = ["10000000","0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"]
  await deployContract(contractArtifactName, constructorArguments);
}
