# ShadowVault Protocol

**Trade in Shadows. Leverage Fearless.**

A privacy-centric decentralized exchange (DEX) with AI-driven leverage trading, zero-knowledge privacy, and Uniswap liquidity integration.

## 🚀 Quick Start

See `QUICK_START.md` for 3-step setup, or `LOCAL_SETUP_GUIDE.md` for detailed instructions.

```bash
cd FRONTEND/MAINDEX
npm install
npm run start
```

## Core Features

- 🔒 **Zero-Knowledge Privacy** - Trade assets pseudonymously with zero-knowledge proofs
- 💧 **Uniswap Liquidity** - Deep liquidity from Uniswap V3 pools
- 🤖 **AI Trading Agent** - Optional AI agent for leveraged positions
  - **Safe Mode**: 5-10x leverage with automated risk controls
  - **Full Psycho Mode**: Up to 100x leverage (high risk, high reward)
- 🪙 **$SHDV Token** - Native token for governance, fee discounts, and premium features

## Project Structure

- `FRONTEND/MAINDEX/` - Main frontend application (React + TypeScript)
- `CONTRACTS/GENERALCONTRACTS/MSWAP/` - Smart contracts (Solidity)
- `DEX_API/DEXAPI/` - Backend API services

## 📁 Folder Name

**Current folder name:** `MARSWAP_PLATFORM`  
**Suggested rename:** `SHADOWVAULT_PROTOCOL` (optional, doesn't affect functionality)

You can rename the root folder after testing to match the new branding.

Optimized Contract modifications are found under - GENERALCONTRACTS/MSWAP/contracts with artifacts
Deploy optimized contracts with Hardhat

Install dependencies: npm install

Run the instance from MAINDEX: npx vite dev --host

## Quick Start

### Frontend Development
```bash
cd FRONTEND/MAINDEX
npm install
npx vite dev --host
```

### Smart Contract Development

-------------

# Deploying with HardHat

HardHat configs found on deploy.js and hardhat.config.js

npm install hardhat @nomiclabs/hardhat-ethers ethers

npx hardhat compile 

npx hardhat run deploy.js --network neonDevnet  

--------------

The ERC-20-for-SPL-Mintable variant has two additional methods that enable you to use the Neon EVM to mint a new SPL token and register it to the interface to be ERC-20-compatible. When the ERC-20 Factory Contract is constructed to this variant, it creates a new SPL token using Solana's Token Program and provides mint and freeze authority to the Neon account specified in the constructor.

Restrictions
According to the SPL token structure, an unsigned 64-bit integer is used to store the balance; in ERC-20, it's an unsigned 256-bit integer. Based on the unsigned 64-bit integer, the maximum balance and transfer amount is (2^64-1)/(10^9), with 9 decimals of accuracy.

---------------

Neon dependencies:

@neonevm/token-transfer-web3
@neonevm/token-transfer-ethers
@neonevm/token-transfer-core
neon-react-components

----------------

# Local Devnet environment 

Local Proxy to Remote Solana

Prerequisites
Docker; docker-compose v1.29 is recommended.
Operator keys. Test public keys are available.

Set up a local Proxy
First, set up and host a Proxy locally as per the following steps. After executing these commands, the Proxy is available at http://localhost:9090/solana. This address and port are set by default.

Step 1: Docker
Docker images themselves are never "started" and never "running". The docker run command takes the Docker image as a template and produces a container from it. Before starting your Proxy container, you need to start service containers.

Make sure that you have a daemon running by executing the following command:
docker info

run the daemon first:
sudo systemctl start docker

Step 2: Run the Database, Indexer, and Proxy services
In this step, you will create the services necessary for the function of the Proxy (including Database and Indexer services), as well as the Proxy service itself. These services, whose functions follow, are controlled by a docker-compose.yml file.

Database Services
This container aims to handle the database that stores all the relevant Ethereum processing metadata linked to each other: transactions, blocks, receipts, accounts, etc. This data is consumed by the Indexer service.

Currently, Neon EVM proxies are hard coded to work with PostgreSQL. To connect the Proxy to a database, you need to start a PostgreSQL container. The default settings are hard coded in the following docker-compose.yml file. If you want to use your Proxy with other settings, you need to register as an Operator so that Neon EVM can recognize your keys.

Only authorized Operators can change the settings of these parameters. Learn more about operating a Neon Proxy

# Indexer service
The Indexer service indexes all the relevant Ethereum processing metadata consisting of signatures, transactions, blocks, receipts, accounts, etc. It gathers all this data from the Solana blockchain, filtering them by the EVM contract address. It enables us to provide our users with the Ethereum API.

Proxy service
The Proxy service is a core service that allows Ethereum-like transactions to be processed on Solana, taking full advantage of Solana-native functionality, including the ability to execute transactions in parallel.

The Neon EVM address is registered inside neonlabsorg/proxy, so the Proxy knows which Neon EVM is running in the Solana cluster. After executing this command, the Proxy will be available at http://localhost:9090/solana. This address and port are set by default.

Create and run services with Docker Compose
In order to create and run these services:

Create a file id.json for storing an Operator key. Put Solana private key to the id.json.

# Set the following environment variables

EVM_LOADER, i.e. the contract address for Neon EVM
For Devnet/Testnet, use: eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU
For Mainnet, use: NeonVMyRX5GbCrsAHnUwx1nYYoJAtskU1bWUo6JGNyG
SOLANA_URL
Refer to the RPC Endpoints table
VERSION - neon proxy revision
SOLANA_KEY_FOR_EVM_CONFIG - operator key, should be a valid solana public key with SOLs on it
Example for devnet configuration:

export EVM_LOADER=eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU
export VERSION=v1.13.20
export SOLANA_URL=<SOLANA_NODE>
export SOLANA_KEY_FOR_EVM_CONFIG=<YOUR_SOLANA_PUBLIC_KEY>

Please note that public Solana nodes have rate limits and they may not work with the local Neon Proxy. If you want to host the local instance on your end you need a Solana node with no rate limits. You can set up your own node or just request one from a provider like P2P, Everstake or QuickNode.

Download the files needed to run services:
# docker-compose file
wget https://raw.githubusercontent.com/neonlabsorg/neon-proxy.py/develop/docker-compose/docker-compose-ro.yml

# directory to store the data in case you want to rerun indexer service
mkdir indexer_db

# db scheme
mkdir db
cd db
wget https://raw.githubusercontent.com/neonlabsorg/neon-proxy.py/develop/db/scheme.sql
cd ..


# Start the local environment.
docker-compose -f docker-compose-ro.yml up -d

Check the local environment. You can ensure that start is succesful by service statuses:
dbcreation - Exited
indexer - Up
postgres, proxy - Up (healthy)

If proxy works, the request

curl -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}' http://127.0.0.1:9090/solana


will return current block as in the example:

{"jsonrpc":"2.0","id":1,"result":"0x12b23ae0"}

Destroy the local environment. If you want to destroy the local environment, run the following command:
docker-compose down

Connect to a Solana cluster RPC endpoint
RPC endpoints

To use a Solana RPC endpoint, you need to specify the variable -e SOLANA_URL='http://<Solana node RPC endpoint>' on the command line.

When a Proxy is deployed, it generates a wallet containing a key pair. If you don't need the new wallet and want to use the keys you already have, you need to specify the path to your wallet on the command line.

# Command Line Options

~/.config/solana/id.json — absolute path to your key pair file stored locally
--name proxy — specifies the Proxy name