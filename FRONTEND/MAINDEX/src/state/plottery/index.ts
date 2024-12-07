import { createSlice } from '@reduxjs/toolkit'
import { lotteries } from 'config/constants/lottery'
import { PLottery, PLotteryState } from 'state/types'
import { fetchPLotteryInfo } from './fetchplottery'
import { fetchNftHowManyUserInfo, fetchNftClaimedUserInfo } from './fetchPlotteryUser'

const initialState: PLotteryState = {
  data: [...lotteries],
  userDataLoaded: false,
}

export const PLotterySlice = createSlice({
  name: 'PLotteries',
  initialState,
  reducers: {
    setPLoteryPublicData: (state, action) => {
      const livePLotteryData: PLottery[] = action.payload
      state.data = state.data.map((plottery) => {
        const liveplotteryData = livePLotteryData.find((entry) => entry.lId === plottery.lId)
        return { ...plottery, ...liveplotteryData }
      })
    },

    setPlotteryUserData: (state, action) => {
      const userData = action.payload
      state.data = state.data.map((plottery) => {
        const userPlotteryData = userData.find((entry) => entry.lId === plottery.lId)
        return { ...plottery, userData: userPlotteryData }
      })
      state.userDataLoaded = true
    },
  },
})

export const fetchPLotteryPublicDataAsync = () => async (dispatch) => {
  const plotteryInfo = await fetchPLotteryInfo()
  dispatch(setPLoteryPublicData(plotteryInfo))
}

export const fetchPlotteryUserDataAsync = (account: string, currentId: number) => async (dispatch) => {
  const nftClaimed = await fetchNftClaimedUserInfo(account, currentId)
  const howManySpots = await fetchNftHowManyUserInfo(account)
  const userData = lotteries.map((plottery) => ({
    lId: plottery.lId,
    nftClaimed: nftClaimed[plottery.lId],
    howManySpots: howManySpots[plottery.lId],
  }))
  dispatch(setPlotteryUserData(userData))
}

// Actions
export const { setPLoteryPublicData, setPlotteryUserData } = PLotterySlice.actions

export default PLotterySlice.reducer
