import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
// npx hardhat deploy-zksync --script deploy.ts

export default async function () {
  const contractArtifactName = "UltimateToken";
  const constructorArguments = [
    "name",
    "symbol",
    "18",
    "100000000000000000000",
    "100000000000000000000",
    "100000000000000000000",
    ["0x2909F0F72fE53F41e093dE06aDEA2758680DeF46", "0x8C120870291C1a79771c5374598D8522b265975a", "0x7FEb19E2f6FFC7219d0EDdF95B681A7132855B7D", "0xa6B1Fd0d19f7561d2f245f32c371c3C39e757d56"],
    true,
    [
      "0", 
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
    ],
    "0x2909F0F72fE53F41e093dE06aDEA2758680DeF46"
  ]
  // const constructorArguments = ["0x2909F0F72fE53F41e093dE06aDEA2758680DeF46"];
  await deployContract(contractArtifactName, constructorArguments);
}
