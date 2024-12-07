import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
import "@matterlabs/hardhat-zksync-node";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";

dotenv.config();
const pkey = process.env.WALLET_PRIVATE_KEY ?? ""

  const config: HardhatUserConfig = {
    defaultNetwork: "croZK",
    networks: {
      croZK: {
        url: "https://mainnet.zkevm.cronos.org",
        ethNetwork: "mainnet",
        zksync: true,
        verifyURL: "https://explorer-api.zkevm.cronos.org/api/v1/contract/verify/hardhat?apikey=J60XE7DCSIZttzauOwOL0vOJdIwvM5T4",
        accounts: [pkey]
      },
      croZKTestnet: {
        url: "https://testnet.zkevm.cronos.org",
        ethNetwork: "sepolia",
        zksync: true,
        verifyURL: "https://explorer-api.testnet.zkevm.cronos.org/api/v1/contract/verify/hardhat?apikey=4IoAFfAze9hfWu4mYFVv4tRyuIVahvnm",
        accounts: [pkey]
      },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
    },
    zkSyncGoerliTestnet: { // deprecated network
      url: "https://zksync-era-sepolia.blockpi.network/v1/rpc/public",
      ethNetwork: "sepolia",
      zksync: true,
      verifyURL: "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
      accounts: [pkey]
    },
    dockerizedNode: {
      url: "http://localhost:3050",
      ethNetwork: "http://localhost:8545",
      zksync: true,
    },
    inMemoryNode: {
      url: "http://127.0.0.1:8011",
      ethNetwork: "localhost", // in-memory node doesn't support eth node; removing this line will cause an error
      zksync: true,
    },
    hardhat: {
      zksync: true,
    },
  },
  zksolc: {
    version: "1.4.1",
      settings: {
          libraries: {
                "contracts/Dex/IterableMapping.sol": {
                  "IterableMapping": "0x9775728D623BfDC55ce6d47C545918538f88D7f9"
                }
              }
    }
},
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};

export default config;
