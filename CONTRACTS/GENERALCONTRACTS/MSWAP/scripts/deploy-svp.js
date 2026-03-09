const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", "..", "FRONTEND", "MAINDEX", ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const hre = require("hardhat");

// Real owner for testing (receives full 1B SVP supply)
const REAL_OWNER = "0xAd772981ede52C0365265d7e24E2F426210D809b";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account. Set PRIVATE_KEY in CONTRACTS/GENERALCONTRACTS/MSWAP/.env or FRONTEND/MAINDEX/.env");
  }
  console.log("Deploying SVP with account:", deployer.address);
  console.log("SVP owner (receives 1B supply):", REAL_OWNER);

  const SVPToken = await hre.ethers.getContractFactory("SVPToken");
  const token = await SVPToken.deploy(REAL_OWNER);
  await token.deployed();

  console.log("SVP token deployed to:", token.address);
  console.log("Total supply:", (await token.totalSupply()).toString());
  console.log("Owner balance:", (await token.balanceOf(REAL_OWNER)).toString());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
