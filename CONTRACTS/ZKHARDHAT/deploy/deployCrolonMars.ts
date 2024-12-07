import { deployContract } from "./utils";

// This script is used to deploy an ERC20 token contract
// as well as verify it on Block Explorer if possible for the network

// Important: make sure to change contract name and symbol in contract source
// at contracts/erc20/MyERC20Token.sol

// npx hardhat deploy-zksync --script deployCrolonMars.ts

const zeroAddress =   "0x0000000000000000000000000000000000000000"


export default async function () {
  const contractArtifactName = "zkCrolon";
        const devFee = "10"
        const marketingFee = "10"
        const _burnFee = "0"
        const _liqFee = "0"
        const _router = "0xf532f287fE994e68281324C2e07426E2Fe7C7578"
        const _devWallet = "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"
        const _MarketingWallet = "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"
        const _burnToken = zeroAddress 
        const _burnRouter = zeroAddress
        const initialSupply = "100000000"
        const realOwner = "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"
  const constructorArguments = [devFee, marketingFee, _burnFee, _liqFee, _router, _devWallet, _MarketingWallet, _burnToken, _burnRouter, initialSupply, realOwner];
  await deployContract(contractArtifactName, constructorArguments);
}
