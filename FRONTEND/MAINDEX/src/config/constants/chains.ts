import { defineChain } from 'viem'

export const BscMainnet = defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    public: { http: ['https://bsc-dataseed.binance.org/'] },
    default: { http: ['https://bsc-dataseed.binance.org/'] },
  },
  blockExplorers: {
    etherscan: { name: 'BscScan', url: 'https://bscscan.com/' },
    default: { name: 'BscScan', url: 'https://bscscan.com/' },
  },
})

export const BscTestnet = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    public: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'] },
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'] },
  },
  blockExplorers: {
    etherscan: { name: 'BscScan', url: 'https://testnet.bscscan.com/' },
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com/' },
  },
})

export const Sepolia = defineChain({
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.sepolia.org'] },
    default: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io/' },
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io/' },
  },
})

export const NeonDevNet = defineChain({
  id: 245022926,
  name: 'Neon Devnet',
  network: 'NeonDev',
  nativeCurrency: {
    decimals: 18,
    name: 'TNEON',
    symbol: 'TNEON',
  },
  rpcUrls: {
    public: { http: ['https://neon-evm-devnet.rpc.thirdweb.com/'] },
    default: { http: ['https://neon-evm-devnet.rpc.thirdweb.com/'] },
  },
  blockExplorers: {
    etherscan: { name: 'Neon Scan', url: 'https://devnet.neonscan.org/' },
    default: { name: 'Neon Scan', url: 'https://devnet.neonscan.org/' },
  },
})

// Default to BSC testnet for trading tests (tBNB)
export const defaultChain = BscTestnet
export const defaultChainId = defaultChain.id
