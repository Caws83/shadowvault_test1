import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network

// npx hardhat deploy-zksync --script dex/router.ts
export default async function () {
  const contractArtifactName = "MarsRouter";
  const constructorArguments = ["0x02936dE4fD09B7435E060Bb8733c41c88390BacF","0x73Fd77Fb26192a3FE4f5EFb9EBa5BB5f6Cf96742"]; // factory - WETH
  await deployContract(contractArtifactName, constructorArguments);
}
