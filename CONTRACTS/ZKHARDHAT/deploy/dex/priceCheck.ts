import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const contractArtifactName = "TokenPriceCheck";
  const constructorArguments = ["0x7FEb19E2f6FFC7219d0EDdF95B681A7132855B7D","0x9d3A14825316Bf3F5704F5Ed05AF6b84a23E0fE2",["0x2cc4e3E6104c032ceB57D7DdAd7bb23d9D425A1B"]]
  await deployContract(contractArtifactName, constructorArguments);
}
