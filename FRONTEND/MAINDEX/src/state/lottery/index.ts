/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LotteryTicket, LotteryStatus, Token } from 'config/constants/types'
import { LotteryRoundGraphEntity, LotteryUserGraphEntity, LotteryResponse, AllLotteryState } from 'state/types'
import { lotteries as lotteriesInfo } from 'config/constants/lottery'
import { fetchLottery, fetchCurrentLotteryIdAndMaxBuy } from './helpers'
import getLotteriesData from './getLotteriesData'
import getUserLotteryData, { getGraphLotteryUser } from './getUserLotteryData'
import BigNumber from 'bignumber.js'

interface PublicLotteryData {
  lotteryToken: Token
  currentLotteryId: string
  maxNumberTicketsPerBuyOrClaim: string
}

const initialState = (): AllLotteryState => {
  const alstate = {}
  lotteriesInfo.forEach((lottery) => {
    alstate[lottery.lotteryToken.symbol] = {
      currentLotteryId: null,
      isTransitioning: false,
      maxNumberTicketsPerBuyOrClaim: null,
      currentRound: {
        isLoading: true,
        lotteryId: "",
        status: LotteryStatus.PENDING,
        startTime: '',
        endTime: '',
        priceTicketInCake: '',
        discountDivisor: '',
        treasuryFee: '',
        firstTicketId: '',
        lastTicketId: '',
        amountCollectedInCake: '',
        finalNumber: null,
        cakePerBracket: [],
        countWinnersPerBracket: [],
        rewardsBreakdown: [],
        userTickets: {
          isLoading: true,
          tickets: [],
        },
        lotteryToken: lottery.lotteryToken,
      },
      displayTokenDecimals: lottery.displayTokenDecimals,
      displayBUSDDecimals: lottery.displayBUSDDecimals,
      dex: lottery.dex,
      chainId: lottery.chainId,
      lotteriesData: null,
      userLotteryData: { account: '', totalCake: '', totalTickets: '', rounds: [] },
    }
  })
  return alstate
}

export const fetchCurrentLottery = createAsyncThunk<LotteryResponse, { lotteryToken: Token; currentLotteryId: string; chainId: number }>(
  'lottery/fetchCurrentLottery',
  async ({ lotteryToken, currentLotteryId, chainId }) => {
    const lotteryInfo = await fetchLottery(lotteryToken, currentLotteryId, chainId)
    return lotteryInfo
  },
)

export const fetchCurrentLotteryId = createAsyncThunk<PublicLotteryData, { lotteryToken: Token; chainId: number }>(
  'lottery/fetchCurrentLotteryId',
  async ({ lotteryToken, chainId }) => {
    const currentIdAndMaxBuy = await fetchCurrentLotteryIdAndMaxBuy(lotteryToken, chainId)
    return currentIdAndMaxBuy
  },
)

export const fetchUserTicketsAndLotteries = createAsyncThunk<
  { userTickets: LotteryTicket[]; userLotteries: LotteryUserGraphEntity; lotteryToken: Token},
  { account: `0x${string}`; currentLotteryId: string; lotteryToken: Token; chainId: number  }
>('lottery/fetchUserTicketsAndLotteries', async ({ account, currentLotteryId, lotteryToken, chainId }) => {
  const userLotteriesRes = await getUserLotteryData(account, currentLotteryId, lotteryToken, chainId)
  const userParticipationInCurrentRound = userLotteriesRes.rounds?.find((round) => round.lotteryId === currentLotteryId)
  const userTickets = userParticipationInCurrentRound?.tickets

  // User has not bought tickets for the current lottery, or there has been an error
  if (!userTickets || userTickets.length === 0) {
    return { userTickets: null, userLotteries: userLotteriesRes, lotteryToken }
  }

  return { userTickets, userLotteries: userLotteriesRes, lotteryToken }
})

export const fetchPublicLotteries = createAsyncThunk<
  { lotteries: LotteryRoundGraphEntity[]; lotteryToken: Token },
  { currentLotteryId: string; lotteryToken: Token; chainId: number }
>('lottery/fetchPublicLotteries', async ({ currentLotteryId, lotteryToken, chainId }) => {
  const lotteries = await getLotteriesData(currentLotteryId, lotteryToken, chainId)
  return { lotteries, lotteryToken }
})

export const fetchUserLotteries = createAsyncThunk<
  { lotteries: LotteryUserGraphEntity; lotteryToken: Token },
  { account: `0x${string}`; currentLotteryId: string; lotteryToken: Token; chainId: number }
>('lottery/fetchUserLotteries', async ({ account, currentLotteryId, lotteryToken, chainId }) => {
  const userLotteries = await getUserLotteryData(account, currentLotteryId, lotteryToken, chainId)
  return { lotteries: userLotteries, lotteryToken }
})

export const fetchAdditionalUserLotteries = createAsyncThunk<
  { lotteries: LotteryUserGraphEntity; lotteryToken: Token },
  { account: string; skip?: number; lotteryToken: Token }
>('lottery/fetchAdditionalUserLotteries', async ({ account, skip, lotteryToken }) => {
  const additionalUserLotteries = await getGraphLotteryUser(account, undefined, skip)
  return { lotteries: additionalUserLotteries, lotteryToken }
})

export const setLotteryIsTransitioning = createAsyncThunk<
  { isTransitioning: boolean; lotteryToken: Token },
  { isTransitioning: boolean; lotteryToken: Token }
>(`lottery/setIsTransitioning`, async ({ isTransitioning, lotteryToken }) => {
  return { isTransitioning, lotteryToken }
})

export const LotterySlice = createSlice({
  name: 'Lottery',
  initialState: initialState(),
  reducers: {
    setLotteryPublicData: (state, action) => {
      state = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentLottery.fulfilled, (state, action: PayloadAction<LotteryResponse>) => {
      state[action.payload.lotteryToken.symbol].currentRound = {
        ...state[action.payload.lotteryToken.symbol].currentRound,
        ...action.payload,
      }
    })
    builder.addCase(fetchCurrentLotteryId.fulfilled, (state, action: PayloadAction<PublicLotteryData>) => {
      state[action.payload.lotteryToken.symbol].currentLotteryId = action.payload.currentLotteryId
      state[action.payload.lotteryToken.symbol].maxNumberTicketsPerBuyOrClaim =
        action.payload.maxNumberTicketsPerBuyOrClaim
    })
    builder.addCase(
      fetchUserTicketsAndLotteries.fulfilled,
      (
        state,
        action: PayloadAction<{
          userTickets: LotteryTicket[]
          userLotteries: LotteryUserGraphEntity
          lotteryToken: Token
        }>,
      ) => {
        if (state[action.payload.lotteryToken.symbol].currentRound.userTickets === undefined) {
          state[action.payload.lotteryToken.symbol].currentRound.userTickets = {}
        }
        state[action.payload.lotteryToken.symbol].currentRound.userTickets.isLoading = false
        state[action.payload.lotteryToken.symbol].currentRound.userTickets.tickets = action.payload.userTickets
        state[action.payload.lotteryToken.symbol].userLotteryData = action.payload.userLotteries
      },
    )
    builder.addCase(
      fetchPublicLotteries.fulfilled,
      (state, action: PayloadAction<{ lotteries: LotteryRoundGraphEntity[]; lotteryToken: Token }>) => {
        state[action.payload.lotteryToken.symbol].lotteriesData = action.payload.lotteries
      },
    )
    builder.addCase(
      fetchUserLotteries.fulfilled,
      (state, action: PayloadAction<{ lotteries: LotteryUserGraphEntity; lotteryToken: Token }>) => {
        state[action.payload.lotteryToken.symbol].userLotteryData = action.payload.lotteries
      },
    )
    builder.addCase(
      fetchAdditionalUserLotteries.fulfilled,
      (state, action: PayloadAction<{ lotteries: LotteryUserGraphEntity; lotteryToken: Token }>) => {
        const mergedRounds = [
          ...state[action.payload.lotteryToken.symbol].userLotteryData.rounds,
          ...action.payload.lotteries.rounds,
        ]
        state[action.payload.lotteryToken.symbol].userLotteryData.rounds = mergedRounds
      },
    )
    builder.addCase(
      setLotteryIsTransitioning.fulfilled,
      (state, action: PayloadAction<{ isTransitioning: boolean; lotteryToken: Token }>) => {
        state[action.payload.lotteryToken.symbol].isTransitioning = action.payload.isTransitioning
      },
    )
  },
})

// Actions
export const { setLotteryPublicData } = LotterySlice.actions

export default LotterySlice.reducer
