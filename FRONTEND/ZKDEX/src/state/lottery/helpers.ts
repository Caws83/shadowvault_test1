import { LotteryStatus, LotteryTicket, Token } from 'config/constants/types'
import { LotteryRound, LotteryRoundUserTickets, LotteryResponse } from 'state/types'
import { useMemo } from 'react'
import { lotteries, NUM_ROUNDS_TO_FETCH_FROM_NODES } from 'config/constants/lottery'
import { getAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import { lotteryV3Abi } from 'config/abi/lotteryV3'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'


const processViewLotterySuccessResponse = (response, lotteryId: string, lotteryToken: Token): LotteryResponse => {
  const {
    status,
    startTime,
    endTime,
    priceTicketInCake,
    discountDivisor,
    treasuryFee,
    firstTicketId,
    firstTicketIdNextLottery,
    amountCollectedInCake,
    finalNumber,
    cakePerBracket,
    countWinnersPerBracket,
    rewardsBreakdown,
  } = response

  const statusKey = Object.keys(LotteryStatus)[status]
  const serializedCakePerBracket = cakePerBracket.map((cakeInBracket) => cakeInBracket.toString())
  const serializedCountWinnersPerBracket = countWinnersPerBracket.map((winnersInBracket) => winnersInBracket.toString())
  const serializedRewardsBreakdown = rewardsBreakdown.map((reward) => reward.toString())
  return {
    isLoading: false,
    lotteryId,
    status: LotteryStatus[statusKey],
    startTime: startTime?.toString(),
    endTime: endTime?.toString(),
    priceTicketInCake: priceTicketInCake.toString(),
    discountDivisor: discountDivisor?.toString(),
    treasuryFee: treasuryFee?.toString(),
    firstTicketId: firstTicketId?.toString(),
    lastTicketId: firstTicketIdNextLottery?.toString(),
    amountCollectedInCake: amountCollectedInCake.toString(),
    finalNumber,
    cakePerBracket: serializedCakePerBracket,
    countWinnersPerBracket: serializedCountWinnersPerBracket,
    rewardsBreakdown: serializedRewardsBreakdown,
    lotteryToken,
  }
}

const processViewLotteryErrorResponse = (lotteryId: string, lotteryToken: Token): LotteryResponse => {
  return {
    isLoading: true,
    lotteryId,
    status: LotteryStatus.PENDING,
    startTime: '',
    endTime: '',
    priceTicketInCake: '0',
    discountDivisor: '0',
    treasuryFee: '',
    firstTicketId: '',
    lastTicketId: '',
    amountCollectedInCake: '0',
    finalNumber: null,
    cakePerBracket: [],
    countWinnersPerBracket: [],
    rewardsBreakdown: [],
    lotteryToken,
  }
}

export const fetchLottery = async (lotteryToken: Token, lotteryId: string, chainId: number): Promise<LotteryResponse> => {
  try {
    const lotteryData = await readContract(config, {
      abi: lotteryV3Abi,
      address: getAddress(getLotteryAddress(lotteryToken.symbol), chainId),
      functionName: 'viewLottery',
      args: [BigInt(lotteryId)],
      chainId: chainId
    })
    return processViewLotterySuccessResponse(lotteryData, lotteryId, lotteryToken)
  } catch (error) {
    return processViewLotteryErrorResponse(lotteryId, lotteryToken)
  }
}
export const fetchMultipleLotteries = async (lotteryToken: Token, lotteryIds: string[], chainId: number): Promise<LotteryResponse[]> => {
  const calls = lotteryIds.map((id) => ({
    abi: lotteryV3Abi,
    functionName: 'viewLottery',
    address: getAddress(getLotteryAddress(lotteryToken.symbol), chainId),
    args: [id],
    chainId: chainId
  }))
  try {
    const multicallRes = await readContracts(config, { contracts: calls })
    const processedResponses = multicallRes.map((res, index) =>
      processViewLotterySuccessResponse(res.result, lotteryIds[index], lotteryToken),
    )
    return processedResponses
  } catch (error) {
    console.error(error)
    return calls.map((call, index) => processViewLotteryErrorResponse(lotteryIds[index], lotteryToken))
  }
}

export const fetchCurrentLotteryIdAndMaxBuy = async (lotteryToken: Token, chainId: number) => {
  try {
    const calls = ['currentLotteryId', 'maxNumberTicketsPerBuyOrClaim'].map((method) => ({
      abi: lotteryV3Abi,
      functionName: method,
      address: getAddress(getLotteryAddress(lotteryToken.symbol), chainId),
      args: [],
      chainId: chainId
    }))

    const info = await readContracts(config, { contracts: calls });
    
    const currentLotteryId = info[0].result
    const maxNumberTicketsPerBuyOrClaim = info[1].result
    return {
      lotteryToken,
      currentLotteryId: currentLotteryId ? currentLotteryId.toString() : null,
      maxNumberTicketsPerBuyOrClaim: maxNumberTicketsPerBuyOrClaim ? maxNumberTicketsPerBuyOrClaim.toString() : null,
    }
  } catch (error) {
    return {
      lotteryToken,
      currentLotteryId: null,
      maxNumberTicketsPerBuyOrClaim: null,
    }
  }
}

export const getRoundIdsArray = (currentLotteryId: string): string[] => {
  const currentIdAsInt = parseInt(currentLotteryId, 10)
  const roundIds = []
  for (let i = 0; i < NUM_ROUNDS_TO_FETCH_FROM_NODES; i++) {
    roundIds.push(currentIdAsInt - i)
  }
  return roundIds.map((roundId) => roundId.toString())
}

export const useProcessLotteryResponse = (
  lotteryData: LotteryResponse & { userTickets?: LotteryRoundUserTickets },
): LotteryRound => {
  const {
    priceTicketInCake: priceTicketInCakeAsString,
    discountDivisor: discountDivisorAsString,
    amountCollectedInCake: amountCollectedInCakeAsString,
  } = lotteryData
  const discountDivisor = useMemo(() => {
    return discountDivisorAsString
  }, [discountDivisorAsString])

  const priceTicketInCake = useMemo(() => {
    return priceTicketInCakeAsString
  }, [priceTicketInCakeAsString])

  const amountCollectedInCake = useMemo(() => {
    return amountCollectedInCakeAsString
  }, [amountCollectedInCakeAsString])

  return {
    isLoading: lotteryData.isLoading,
    lotteryId: lotteryData.lotteryId,
    userTickets: lotteryData.userTickets,
    status: lotteryData.status,
    startTime: lotteryData.startTime,
    endTime: lotteryData.endTime,
    priceTicketInCake,
    discountDivisor,
    treasuryFee: lotteryData.treasuryFee,
    firstTicketId: lotteryData.firstTicketId,
    lastTicketId: lotteryData.lastTicketId,
    amountCollectedInCake,
    finalNumber: lotteryData.finalNumber,
    cakePerBracket: lotteryData.cakePerBracket,
    countWinnersPerBracket: lotteryData.countWinnersPerBracket,
    rewardsBreakdown: lotteryData.rewardsBreakdown,
  }
}

export const hasRoundBeenClaimed = (tickets: LotteryTicket[]): boolean => {
  const claimedTickets = tickets.filter((ticket) => ticket.status)
  return claimedTickets.length > 0
}

export const getLotteryAddress = (symbol: string) => {
  const lotteryInfo = lotteries.filter((l) => l.lotteryToken.symbol === symbol)
  return lotteryInfo[0].lotteryAddress
}
