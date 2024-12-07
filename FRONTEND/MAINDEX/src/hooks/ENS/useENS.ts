import { isAddress } from '../../utils'
import { useEnsAddress, useEnsName } from 'wagmi'

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
export default function useENS(nameOrAddress?: string | null): {
  loading: boolean
  address: string | null
  name: string | null
} {
  const validated = isAddress(nameOrAddress)
  const { data: reverseLookup } = useEnsName({ address: validated || undefined })
  const { data: lookup } = useEnsAddress({ name: nameOrAddress })

  return {
    loading: false,
    address: validated || lookup,
    name: reverseLookup ? reverseLookup : !validated && lookup ? nameOrAddress || null : null,
  }
}
