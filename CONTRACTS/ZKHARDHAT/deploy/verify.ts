import { verifyContract } from "./utils";
import factoryFile from '../deployments-zk/croZK/contracts/Dex/MarSwapFactoryV2.sol/MarSwapFactoryV2.json'
import { HardhatRuntimeEnvironment } from "hardhat/types";



//verify (source: https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan#using-programmatically)
/*
await hre.run("verify:verify", {
    address: myContract.address,
    contract: "contracts/MyContract.sol:MyContract", //Filename.sol:ClassName
    constructorArguments: [arg1, arg2, arg3],
 });
 */

// npx hardhat deploy-zksync --script verify.ts

export default async function (hre: HardhatRuntimeEnvironment) {


    const fullContractSource = `${factoryFile.sourceName}:${factoryFile.contractName}`;
    

      const address = factoryFile.entries[0].address
      const contract = fullContractSource
      const constructorArguments = "0x9c4d535b000000000000000000000000000000000000000000000000000000000000000001000165d04c27d63d4a764aaada70d709c6dc7e5ed7ea66a2df8047784b2c1e00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000060000000000000000000000000b6fa98c38a1ee369896fdfaf90306d827ac3b5b9000000000000000000000000449183e39d76fa4c1f516d3ea2feed3e8c99e8f10000000000000000000000000000000000000000000000000de0b6b3a7640000"
      const bytecode = factoryFile.bytecode
console.log("trying")
/*
 await verifyContract({
    address,
    contract,
    constructorArguments,
    bytecode
 })
*/
 const verificationData = {
   address,
   contract: fullContractSource,
   constructorArguments: constructorArguments,
   bytecode: bytecode
};
const verificationRequestId: number = await hre.run("verify:verify", {
   ...verificationData,
   noCompile: true,
});
console.log("Verification request id:", verificationRequestId);

 console.log("finished")
 }