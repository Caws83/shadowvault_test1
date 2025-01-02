import { defineChain } from 'viem'

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
    // public: { http: ['https://devnet.neonevm.org/'] },
    // default: { http: ['https://devnet.neonevm.org/'] },
  },
  blockExplorers: {
    etherscan: { name: 'Neon Scan', url: 'https://devnet.neonscan.org/' },
    default: { name: 'Neon Scan', url: 'https://devnet.neonscan.org/' },
  },
})



export const defaultChain = NeonDevNet
export const defaultChainId = defaultChain.id
