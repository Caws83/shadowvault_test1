const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", "..", "FRONTEND", "MAINDEX", ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account. Set PRIVATE_KEY in .env");
  }
  console.log("Deploying ShadowVaultMargin with account:", deployer.address);

  const Margin = await hre.ethers.getContractFactory("ShadowVaultMargin");
  const margin = await Margin.deploy();
  await margin.deployed();

  console.log("ShadowVaultMargin deployed to:", margin.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
