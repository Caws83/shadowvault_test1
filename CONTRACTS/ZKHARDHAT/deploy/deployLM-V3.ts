import { deployContract } from "./utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
// npx hardhat deploy-zksync --script deployLM-V3.ts

export default async function () {
  const contractArtifactName = "PreLaunchManager3";
  const constructorArguments = [
    "1000000000000000000", // createion fee
    "2", // platformFeePercentage
    "2", // prize percent
    "0", // burn percentage
    "0x0000000000000000000000000000000000000000", // burntoken
    "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1", // Treasury
    "0xa6B1Fd0d19f7561d2f245f32c371c3C39e757d56", // Prize Treasury
    "0xdF5D7a26d0Da5636eF60CcFe493C13A1c0F37B9B", // router
    "1000000000000000000000", // sponshipFee
  ];
  await deployContract(contractArtifactName, constructorArguments);
}
