import React from 'react'
import { useAccount } from 'wagmi'
import { SwitchToNetwork } from './SwitchToNetWork'
import { defaultChainId } from 'config/constants/chains'

// 1) Import for Solana
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

function ConnectWalletButton({ chain }: { chain: number }) {
  // EVM address from wagmi
  const { address: evmAddress } = useAccount()
  // Solana connection state
  const { connected: solanaConnected, publicKey } = useWallet()

  const chainId = chain ?? defaultChainId

  // 2) Neither EVM nor Solana is connected
  if (!evmAddress && !solanaConnected) {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* EVM connect button (Web3Modal) */}
        <w3m-button balance='hide' label="Connect EVM" />

        {/* Solana connect button (Phantom, etc.) */}
        <WalletMultiButton />
      </div>
    )
  }

  // 3) If EVM is connected
  if (evmAddress) {
    // Show your existing "Switch Network" logic
    return <SwitchToNetwork chainId={chainId} />
  }

  // 4) If Solana is connected
  if (solanaConnected && publicKey) {
    return (
      <div>
        Connected Solana: <small>{publicKey.toBase58()}</small>
      </div>
    )
  }

  return null
}

export default ConnectWalletButton
