import { deployContract } from "../utils";

// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
// npx hardhat deploy-zksync --script farms/deployFarms.ts

/*

1) run this script
2) set owner of syrup to masterchef
3) add masterchef to factory
4) add masterchef to crolon mars
5) add host in dex
6) make crolon/zkcro pair as #1
7) make vUSD/zkcro pair as #2

*/


const cake = "0x447A1296AB0b8470d90a74bb90d36Aff9B3a2EbA"
const dev = "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"

const zeroAddress =   "0x0000000000000000000000000000000000000000"


export default async function () {
  const contractArtifactName = "SyrupBar";
  const constructorArguments = [cake];
  const syrup = await deployContract(contractArtifactName, constructorArguments);
  const syrupAddress = await syrup.getAddress();

  const contractArtifactName1 = "contracts/farms/masterchef.sol:MasterChef";
        const CakeToken = cake
        const SyrupBar = syrupAddress
        const devAddress  = dev
        const lottery  = zeroAddress
        const cakePerBlock = "100000000000000"  // 0.0001
        const startBlock = "9999999999"   // in epoch
  const constructorArguments1 = [CakeToken, SyrupBar, devAddress, lottery, cakePerBlock, startBlock];
  const mcContract = await deployContract(contractArtifactName1, constructorArguments1);
  const mcAddress = await mcContract.getAddress();

  console.log(`\n Farms are successfully deployed:`);
  console.log(` - Syrup address: ${syrupAddress}`);
  console.log(` - MasterChef address: ${mcAddress}`);
}
