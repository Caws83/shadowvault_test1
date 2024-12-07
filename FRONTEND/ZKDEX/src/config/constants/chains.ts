import { chainConfig, ChainEIP712 } from 'viem/zksync'

export const CronosZKTest = {
  ...chainConfig,
  id: 282,
  name: 'zk Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'zkTCRO',
    symbol: 'zkTCRO',
  },
  rpcUrls: {
    public: { http: ['https://testnet.zkevm.cronos.org/'] },
    default: { http: ['https://testnet.zkevm.cronos.org/'] },
  },
  blockExplorers: {
    etherscan: { name: 'CroZK Scan', url: 'https://explorer.zkevm.cronos.org/testnet' },
    default: { name: 'CroZK Scan', url: 'https://explorer.zkevm.cronos.org/testnet' },
  },
} as ChainEIP712

export const CronosZK = {
  ...chainConfig,
  id: 388,
  name: 'Cronos ZK',
  nativeCurrency: {
    decimals: 18,
    name: 'zkCRO',
    symbol: 'zkCRO',
  },
  rpcUrls: {
    public: { http: ['https://mainnet.zkevm.cronos.org/'] },
    default: { http: ['https://mainnet.zkevm.cronos.org/'] },
  },
  blockExplorers: {
    etherscan: { name: 'CroZK Scan', url: 'https://explorer.zkevm.cronos.org' },
    default: { name: 'CroZK Scan', url: 'https://explorer.zkevm.cronos.org' },
  },
  contracts: {
    multicall3: {
      address: '0x06f4487D7C4a5983d2660DB965Cc6d2565E4cfaA',
      blockCreated: 20000,
    },
  },
} as ChainEIP712

export const defaultChain = CronosZK
export const defaultChainId = defaultChain.id
