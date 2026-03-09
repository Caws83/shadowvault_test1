require("@nomiclabs/hardhat-ethers");
const path = require("path");
const frontendEnv = path.join(__dirname, "..", "..", "..", "FRONTEND", "MAINDEX", ".env");
if (require("fs").existsSync(frontendEnv)) require("dotenv").config({ path: frontendEnv });
if (require("fs").existsSync(".env")) require("dotenv").config();

function getAccounts() {
    const raw = process.env.PRIVATE_KEY || process.env[" PRIVATE_KEY"] || "";
    const key = (typeof raw === "string" ? raw : "").trim();
    return key ? [key] : [];
}

module.exports = {
    solidity: {
        compilers: [
            { version: "0.6.6", settings: { optimizer: { enabled: true, runs: 200 } } },
            { version: "0.8.19", settings: { optimizer: { enabled: true, runs: 200 } } },
            { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
        ],
    },
    networks: {
        neonDevnet: {
            url: "https://neon-mainnet.everstake.one",
            accounts: getAccounts(),
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: getAccounts(),
        },
    },
};
