![alt text]([http://url/to/img.png](https://i.ibb.co/zxcd6Fk/banner.png))

# Sol Forge Frontend with cleaned up Backend 
# Utilizing EVM to SPL

# Optimized Contract modifications are found under - GENERALCONTRACTS/MSWAP/contracts with artifacts
# Deploy optimized contracts with Hardhat

# Install dependencies: npm install

# Run the instance from MAINDEX: npx vite dev --host

# ZkDex removed and code cleanup under progress

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
