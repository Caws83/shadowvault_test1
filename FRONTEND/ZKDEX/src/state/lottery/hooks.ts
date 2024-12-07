import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useRefresh from 'hooks/useRefresh'
import { Token } from 'config/constants/types'
import { State } from '../types'
import { fetchCurrentLotteryId, fetchCurrentLottery, fetchUserTicketsAndLotteries, fetchPublicLotteries } from '.'
import { useProcessLotteryResponse } from './helpers'
import { useAccount } from 'wagmi'

// Lottery
export const useGetCurrentLotteryId = (lotteryToken: Token) => {
  return useSelector((state: State) => {
    return state.lottery[lotteryToken.symbol].currentLotteryId
  })
}

export const useGetUserLotteriesGraphData = (lotteryToken) => {
  return useSelector((state: State) => state.lottery[lotteryToken.symbol].userLotteryData)
}

export const useGetUserLotteryGraphRoundById = (lotteryId: string, lotteryToken: Token) => {
  const userLotteriesData = useGetUserLotteriesGraphData(lotteryToken)
  return userLotteriesData.rounds.find((userRound) => userRound.lotteryId === lotteryId)
}

export const useGetLotteriesGraphData = (lotteryToken: Token) => {
  return useSelector((state: State) => state.lottery[lotteryToken.symbol].lotteriesData)
}

export const useGetLotteryGraphDataById = (lotteryId: string, lotteryToken: Token) => {
  const lotteriesData = useGetLotteriesGraphData(lotteryToken)
  return lotteriesData?.find((lottery) => lottery.id === lotteryId)
}

export const useFetchLottery = (lotteryToken: Token, chainId: number) => {
  const { address: account } = useAccount()
  const { slowRefresh } = useRefresh()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // get current lottery ID & max ticket buy
    dispatch(fetchCurrentLotteryId({ lotteryToken, chainId }))
  }, [dispatch, lotteryToken])
  const currentLotteryId = useGetCurrentLotteryId(lotteryToken)
  useEffect(() => {
    if (currentLotteryId) {
      // Get historical lottery data from nodes +  last 100 subgraph entires
      dispatch(fetchPublicLotteries({ currentLotteryId, lotteryToken, chainId }))
      // get public data for current lottery
      dispatch(fetchCurrentLottery({ lotteryToken, currentLotteryId, chainId }))
    }
  }, [dispatch, currentLotteryId, slowRefresh, lotteryToken])

  useEffect(() => {
    // get user tickets for current lottery, and user lottery subgraph data
    if (account && currentLotteryId) {
      dispatch(fetchUserTicketsAndLotteries({ account, currentLotteryId, lotteryToken, chainId }))
    }
  }, [dispatch, currentLotteryId, account, lotteryToken])
}

export const useLotteryPricePerTicket = (lotteryToken: Token) => {
  const { priceTicketInCake } = useSelector((state: State) => state.lottery[lotteryToken.symbol].currentRound)
  return Number((priceTicketInCake as bigint) / (10n ^ BigInt(lotteryToken.decimals)))
}

export const useLotteryFarmId = (lotteryToken: Token) => {
  const farmIDForPrice = useSelector((state: State) => state.lottery[lotteryToken.symbol].farmIDForPrice)
  return farmIDForPrice
}

export const useLotteryDecimals = (lotteryToken: Token) => {
  const { displayTokenDecimals, displayBUSDDecimals } = useSelector(
    (state: State) => state.lottery[lotteryToken.symbol],
  )

  return { displayTokenDecimals, displayBUSDDecimals }
}
export const useLotteryTreasuryFee = (lotteryToken: Token) => {
  const { treasuryFee } = useSelector((state: State) => state.lottery[lotteryToken.symbol].currentRound)
  return treasuryFee
}
export const useLotteryRewardsBreakdown = (lotteryToken: Token) => {
  const { rewardsBreakdown } = useSelector((state: State) => state.lottery[lotteryToken.symbol].currentRound)
  return rewardsBreakdown
}

export const useHasLottery = (lotteryToken: Token) => {
  const gotLotto = useSelector((state: State) => state.lottery[lotteryToken.symbol])
  if (gotLotto !== undefined) {
    return true
  }
  return false
}

export const useLotteryDex = (lotteryToken: Token) => {
  const dex = useSelector((state: State) => state.lottery[lotteryToken.symbol].dex)
  return dex
}

export const useLottery = (lotteryToken: Token) => {
  const currentRound = useSelector((state: State) => state.lottery[lotteryToken.symbol].currentRound)
  const processedCurrentRound = useProcessLotteryResponse(currentRound)

  const isTransitioning = useSelector((state: State) => state.lottery[lotteryToken.symbol].isTransitioning)

  const currentLotteryId = useGetCurrentLotteryId(lotteryToken)
  const userLotteryData = useGetUserLotteriesGraphData(lotteryToken)
  const lotteriesData = useGetLotteriesGraphData(lotteryToken)
  const chainId = useSelector(
    (state: State) => state.lottery[lotteryToken.symbol].chainId,
  )

  const maxNumberTicketsPerBuyOrClaimAsString = useSelector(
    (state: State) => state.lottery[lotteryToken.symbol].maxNumberTicketsPerBuyOrClaim,
  )
  const maxNumberTicketsPerBuyOrClaim = useMemo(() => {
    return maxNumberTicketsPerBuyOrClaimAsString
  }, [maxNumberTicketsPerBuyOrClaimAsString])

  return {
    currentLotteryId,
    maxNumberTicketsPerBuyOrClaim,
    isTransitioning,
    userLotteryData,
    lotteriesData,
    currentRound: processedCurrentRound,
    lotteryToken,
    chainId
  }
}
