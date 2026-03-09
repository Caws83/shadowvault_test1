import { useCallback, useState, useEffect } from 'react'
import { writeContract, waitForTransactionReceipt, readContract, readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'
import contracts from 'config/constants/contracts'
import { SHADOW_VAULT_MARGIN_ABI } from 'config/abi/shadowVaultMargin'
import { getAddress } from 'utils/addressHelpers'

export interface MarginPosition {
  id: number
  user: string
  collateral: bigint
  leverage: number
  isLong: boolean
  openBlock: number
  closed: boolean
}

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

  const closePosition = useCallback(
    async (positionId: number) => {
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
          functionName: 'closePosition',
          args: [BigInt(positionId)],
        })
        setTxHash(hash)
        await waitForTransactionReceipt(config, { hash })
        return hash
      } catch (e: any) {
        setError(e?.message ?? 'Close position failed')
        throw e
      } finally {
        setIsPending(false)
      }
    },
    [address],
  )

  return { openLong, openShort, closePosition, isPending, error, txHash, isSupported: !!address }
}

export async function fetchUserPositions(
  chainId: number,
  userAddress: string | undefined,
): Promise<MarginPosition[]> {
  const address = getMarginVaultAddress(chainId)
  if (!address || !userAddress) return []
  try {
    const ids = await readContract(config, {
      address: address as `0x${string}`,
      abi: SHADOW_VAULT_MARGIN_ABI,
      functionName: 'getPositionIdsByUser',
      args: [userAddress as `0x${string}`],
      chainId,
    })
    if (!ids || ids.length === 0) return []
    const calls = (ids as bigint[]).map((id, i) => ({
      address: address as `0x${string}`,
      abi: SHADOW_VAULT_MARGIN_ABI,
      functionName: 'getPosition' as const,
      args: [id],
      chainId,
    }))
    const results = await readContracts(config, { contracts: calls })
    const positions: MarginPosition[] = []
    results.forEach((r, i) => {
      if (r.status === 'success' && r.result) {
        const [user, collateral, leverage, isLong, openBlock, closed] = r.result as [string, bigint, bigint, boolean, bigint, boolean]
        if (!closed) {
          positions.push({
            id: Number((ids as bigint[])[i]),
            user,
            collateral,
            leverage: Number(leverage),
            isLong,
            openBlock: Number(openBlock),
            closed,
          })
        }
      }
    })
    return positions
  } catch {
    return []
  }
}

export function useUserPositions(chainId: number, userAddress: string | undefined, refetchDeps?: unknown) {
  const [positions, setPositions] = useState<MarginPosition[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refetch = useCallback(() => {
    if (!userAddress || !getMarginVaultAddress(chainId)) {
      setPositions([])
      return
    }
    setIsLoading(true)
    fetchUserPositions(chainId, userAddress)
      .then(setPositions)
      .finally(() => setIsLoading(false))
  }, [chainId, userAddress])

  useEffect(() => {
    refetch()
  }, [refetch, refetchDeps])

  return { positions, isLoading, refetch }
}
