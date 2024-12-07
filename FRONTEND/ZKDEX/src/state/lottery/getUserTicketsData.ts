import { TICKET_LIMIT_PER_REQUEST } from 'config/constants/lottery'
import { LotteryTicket, Token } from 'config/constants/types'
import { UserTicketsResponse } from 'state/types'
import { getLotteryAddress } from './helpers'
import { lotteryV3Abi } from 'config/abi/lotteryV3'
import { readContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import { useLottery } from './hooks'
import { config } from 'wagmiConfig'


export const processRawTicketsResponse = (
  ticketsResponse: UserTicketsResponse,
  lotteryToken: Token,
): LotteryTicket[] => {
  const [ticketIds, ticketNumbers, ticketStatuses] = ticketsResponse

  if (ticketIds?.length > 0) {
    return ticketIds.map((ticketId, index) => {
      return {
        id: ticketId.toString(),
        number: ticketNumbers[index].toString(),
        status: ticketStatuses[index],
        lotteryToken,
      }
    })
  }
  return []
}

export const viewUserInfoForLotteryId = async (
  account: `0x${string}`,
  lotteryId: string,
  cursor: number,
  perRequestLimit: number,
  lotteryToken: Token,
  chainId: number
): Promise<LotteryTicket[]> => {
  try {
    const info = (await readContract(config, {
      abi: lotteryV3Abi,
      address: getAddress(getLotteryAddress(lotteryToken.symbol), chainId),
      functionName: 'viewUserInfoForLotteryId',
      args: [account, BigInt(lotteryId), BigInt(cursor), BigInt(perRequestLimit)],
      chainId: chainId
    })) as unknown as UserTicketsResponse
    return processRawTicketsResponse(info, lotteryToken)
  } catch (error) {
    console.error('viewUserInfoForLotteryId', error)
    return null
  }
}

export const fetchUserTicketsForOneRound = async (
  account: `0x${string}`,
  lotteryId: string,
  lotteryToken: Token,
  chainId: number,
): Promise<LotteryTicket[]> => {
  let cursor = 0
  let numReturned = TICKET_LIMIT_PER_REQUEST
  const ticketData = []

  while (numReturned === TICKET_LIMIT_PER_REQUEST) {
    // eslint-disable-next-line no-await-in-loop
    const response = await viewUserInfoForLotteryId(account, lotteryId, cursor, TICKET_LIMIT_PER_REQUEST, lotteryToken, chainId)
    cursor += TICKET_LIMIT_PER_REQUEST
    numReturned = response.length
    ticketData.push(...response)
  }

  return ticketData
}

export const fetchUserTicketsForMultipleRounds = async (
  idsToCheck: string[],
  account: `0x${string}`,
  lotteryToken: Token,
  chainId: number,
): Promise<{ roundId: string; lotteryToken: Token; userTickets: LotteryTicket[] }[]> => {
  const ticketsForMultipleRounds = []
  for (let i = 0; i < idsToCheck.length; i += 1) {
    const roundId = idsToCheck[i]
    // eslint-disable-next-line no-await-in-loop
    const ticketsForRound = await fetchUserTicketsForOneRound(account, roundId, lotteryToken, chainId)
    ticketsForMultipleRounds.push({
      roundId,
      lotteryToken,
      userTickets: ticketsForRound,
    })
  }
  return ticketsForMultipleRounds
}
