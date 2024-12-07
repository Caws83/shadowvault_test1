import { useState, useEffect } from 'react'
import { useGetLotteriesGraphData, useGetUserLotteriesGraphData, useLottery } from 'state/lottery/hooks'
import fetchUnclaimedUserRewards from 'state/lottery/fetchUnclaimedUserRewards'
import { Token } from 'config/constants/types'
import { useAccount } from 'wagmi'

export enum FetchStatus {
  NOT_FETCHED = 'not-fetched',
  IN_PROGRESS = 'in-progress',
  SUCCESS = 'success',
}

const useGetUnclaimedRewards = (lotteryToken: Token) => {
  const { address: account } = useAccount()
  const { isTransitioning, currentLotteryId, chainId } = useLottery(lotteryToken)
  const userLotteryData = useGetUserLotteriesGraphData(lotteryToken)
  const lotteriesData = useGetLotteriesGraphData(lotteryToken)
  const [unclaimedRewards, setUnclaimedRewards] = useState([])
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.NOT_FETCHED)

  useEffect(() => {
    // Reset on account change and round transition
    setFetchStatus(FetchStatus.NOT_FETCHED)
  }, [account, isTransitioning, lotteryToken])

  const fetchAllRewards = async () => {
    setFetchStatus(FetchStatus.IN_PROGRESS)
    const unclaimedRewardsResponse = await fetchUnclaimedUserRewards(
      account,
      userLotteryData,
      lotteriesData,
      currentLotteryId,
      lotteryToken,
      chainId
    )
    setUnclaimedRewards(unclaimedRewardsResponse)
    setFetchStatus(FetchStatus.SUCCESS)
  }

  return { fetchAllRewards, unclaimedRewards, fetchStatus }
}

export default useGetUnclaimedRewards
