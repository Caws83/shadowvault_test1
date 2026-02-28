import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { BscMainnet, BscTestnet, Sepolia, NeonDevNet } from 'config/constants/chains'
import { BASE_URL } from 'config';


export const projectId = '2b6111ec844e3cd755c1792dfacc8533'

const chains = [BscMainnet, BscTestnet, Sepolia, NeonDevNet] as const

const metadata = {
  name: 'FORGE',
  description: 'FORGE Dex',
  url: `${BASE_URL}`,
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

export const config = defaultWagmiConfig({ 
  chains,
  projectId, 
  metadata,
})

const chainImages = {
}


createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableOnramp: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#41d1ff',
    // '--w3m-font-family': 'DM Sans',
    '--w3m-border-radius-master': '2px',
    '--w3m-font-size-master': '8px'

  },
  chainImages,
  enableAnalytics: true,
})

export { chains }
