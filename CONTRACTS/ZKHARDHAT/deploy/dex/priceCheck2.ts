import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
// npx hardhat deploy-zksync --script priceCheck2.ts


export default async function () {
  const contractArtifactName = "TokenPriceCheck2";
  const constructorArguments = ["0x73Fd77Fb26192a3FE4f5EFb9EBa5BB5f6Cf96742","0x3e6f8fbcC20a4F470D232cEA9d44C8Df5d2a3c83",["0x375DA0314dDC5806694c73F14F9b7214E10ec553"]]
  await deployContract(contractArtifactName, constructorArguments);
}
