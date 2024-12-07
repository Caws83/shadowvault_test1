import { LotteryStatus, Token } from 'config/constants/types'
import usePreviousValue from 'hooks/usePreviousValue'
import { useEffect } from 'react'
import { useAppDispatch } from 'state'
import { useLottery } from 'state/lottery/hooks'
import { fetchPublicLotteries, fetchCurrentLotteryId, fetchUserLotteries } from 'state/lottery'
import { useAccount } from 'wagmi'

const useStatusTransitions = (lotteryToken: Token) => {
  const {
    currentLotteryId,
    isTransitioning,
    chainId,
    currentRound: { status },
  } = useLottery(lotteryToken)

  const { address: account } = useAccount()
  const dispatch = useAppDispatch()
  const previousStatus = usePreviousValue(status)

  useEffect(() => {
    // Only run if there is a status state change
    if (previousStatus !== status && currentLotteryId) {
      // Current lottery transitions from CLOSE > CLAIMABLE
      if (previousStatus === LotteryStatus.CLOSE && status === LotteryStatus.CLAIMABLE) {
        dispatch(fetchPublicLotteries({ currentLotteryId, lotteryToken, chainId }))
        if (account) {
          dispatch(fetchUserLotteries({ account, currentLotteryId, lotteryToken, chainId }))
        }
      }
      // Previous lottery to new lottery. From CLAIMABLE (previous round) > OPEN (new round)
      if (previousStatus === LotteryStatus.CLAIMABLE && status === LotteryStatus.OPEN) {
        dispatch(fetchPublicLotteries({ currentLotteryId, lotteryToken, chainId }))
        if (account) {
          dispatch(fetchUserLotteries({ account, currentLotteryId, lotteryToken, chainId }))
        }
      }
    }
  }, [currentLotteryId, status, previousStatus, account, dispatch, lotteryToken])

  useEffect(() => {
    // Current lottery is CLAIMABLE and the lottery is transitioning to a NEW round - fetch current lottery ID every 10s.
    // The isTransitioning condition will no longer be true when fetchCurrentLotteryId returns the next lottery ID
    if (previousStatus === LotteryStatus.CLAIMABLE && status === LotteryStatus.CLAIMABLE && isTransitioning) {
      dispatch(fetchCurrentLotteryId({ lotteryToken, chainId }))
      dispatch(fetchPublicLotteries({ currentLotteryId, lotteryToken, chainId }))
      const interval = setInterval(async () => {
        dispatch(fetchCurrentLotteryId({ lotteryToken, chainId }))
        dispatch(fetchPublicLotteries({ currentLotteryId, lotteryToken, chainId }))
      }, 10000)
      return () => clearInterval(interval)
    }
    return () => null
  }, [status, previousStatus, isTransitioning, currentLotteryId, dispatch, lotteryToken])
}

export default useStatusTransitions
