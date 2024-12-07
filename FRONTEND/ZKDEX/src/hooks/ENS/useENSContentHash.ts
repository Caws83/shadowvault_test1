import { useMemo } from 'react'
import { useReadContract, useEnsAddress } from 'wagmi'
import { ensRegistrarAbi } from 'config/abi/ens-registrar'
import { ensResolverAbi } from 'config/abi/ens-public-resolver'
import { namehash } from 'viem'

/**
 * Does a lookup for an ENS name to find its contenthash.
 */
export default function useENSContentHash(ensName?: string | null): { loading: boolean; contenthash: string | null } {
  const ensNodeArgument = useMemo(() => {
    if (!ensName) return [undefined]
    try {
      return ensName ? [namehash(ensName)] : [undefined]
    } catch (error) {
      return [undefined]
    }
  }, [ensName])
  const resolverAddressResult = useEnsAddress({ name: ensName })
  const resolverAddress = resolverAddressResult.data
  const contenthash = useReadContract({
    abi: ensResolverAbi,
    address: resolverAddress,
    functionName: 'contenthash',
    args: [ensNodeArgument[0]],
  })

  return {
    contenthash: contenthash.data ?? null,
    loading: resolverAddressResult.isLoading || contenthash.isLoading,
  }
}
