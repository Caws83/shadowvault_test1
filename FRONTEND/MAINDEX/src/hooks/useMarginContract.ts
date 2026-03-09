import { useCallback, useState } from 'react'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from 'wagmiConfig'
import contracts from 'config/constants/contracts'
import { SHADOW_VAULT_MARGIN_ABI } from 'config/abi/shadowVaultMargin'
import { getAddress } from 'utils/addressHelpers'

export function getMarginVaultAddress(chainId: number): string | null {
  if (!contracts.marginVault) return null
  return getAddress(contracts.marginVault as any, chainId) ?? null
}

export function useMarginOpen(chainId: number) {
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const address = getMarginVaultAddress(chainId)

  const openLong = useCallback(
    async (collateralWei: bigint, leverage: number) => {
      if (!address) {
        setError('Margin not available on this chain')
        return
      }
      setError(null)
      setIsPending(true)
      try {
        const hash = await writeContract(config, {
          address: address as `0x${string}`,
          abi: SHADOW_VAULT_MARGIN_ABI,
          functionName: 'openLong',
          args: [BigInt(leverage)],
          value: collateralWei,
        })
        setTxHash(hash)
        await waitForTransactionReceipt(config, { hash })
        return hash
      } catch (e: any) {
        setError(e?.message ?? 'Open long failed')
        throw e
      } finally {
        setIsPending(false)
      }
    },
    [address],
  )

  const openShort = useCallback(
    async (collateralWei: bigint, leverage: number) => {
      if (!address) {
        setError('Margin not available on this chain')
        return
      }
      setError(null)
      setIsPending(true)
      try {
        const hash = await writeContract(config, {
          address: address as `0x${string}`,
          abi: SHADOW_VAULT_MARGIN_ABI,
          functionName: 'openShort',
          args: [BigInt(leverage)],
          value: collateralWei,
        })
        setTxHash(hash)
        await waitForTransactionReceipt(config, { hash })
        return hash
      } catch (e: any) {
        setError(e?.message ?? 'Open short failed')
        throw e
      } finally {
        setIsPending(false)
      }
    },
    [address],
  )

  return { openLong, openShort, isPending, error, txHash, isSupported: !!address }
}
