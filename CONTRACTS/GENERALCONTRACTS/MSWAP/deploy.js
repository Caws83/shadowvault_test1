const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);

    // Replace these with actual addresses for Neon Devnet or Mainnet
    // Mainnet ER20 to SPL factory address
    const FACTORY_ADDRESS = "0x6B226a13F5FE3A5cC488084C08bB905533804720";

    // Mainnet WETH Address for ERC20 implementations
    // wSOL address: 
    const WETH_ADDRESS = "0xcFFd84d468220c11be64dc9dF64eaFE02AF60e8A";

    // Change accordingly based what is been deployed from /contracts folder
    const router = await MswapRouter.deploy(FACTORY_ADDRESS, WETH_ADDRESS);
    
    // Change accordingly based what is been deployed from /contracts folder
    const MswapRouter = await ethers.getContractFactory("Router"); 


    await router.deployed();

    console.log("Contract deployed to Neon EVM:", router.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
