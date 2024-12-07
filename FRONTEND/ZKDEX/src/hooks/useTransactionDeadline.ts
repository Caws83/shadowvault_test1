import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../state'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'
import BigNumber from 'bignumber.js'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(chainId: number): BigNumber | undefined {
  const ttl = useSelector<AppState, number>((state) => state.user?.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp(chainId)
  return useMemo(() => {
    if (blockTimestamp && ttl) return blockTimestamp.plus(ttl)
    return undefined
  }, [blockTimestamp, ttl])
}
