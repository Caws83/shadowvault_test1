import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import farmsConfig from 'config/constants/farms'
import priceHelperLpsConfig from 'config/constants/priceHelperLps'
import hosts from 'config/constants/hosts'

import fetchFarms from './fetchFarms'
import fetchFarmsPrices from './fetchFarmsPrices'
import {
  fetchFarmUserEarnings,
  fetchFarmUserAllowances,
  fetchFarmUserTokenBalances,
  fetchFarmUserStakedBalances,
} from './fetchFarmUser'
import { FarmsState, Farm } from '../types'

const initialState: FarmsState = {
  data: [],
  loadArchivedFarmsData: false,
  userDataLoaded: false,
  host: hosts.marstest,
}

export const fetchFarmsPublicDataAsync = createAsyncThunk<Farm[], number[]>(
  'farms/fetchFarmsPublicDataAsync',
  async (ids) => {
    const allFarms = await farmsConfig()
    const farmsToFetch = allFarms.filter((farmConfig) => ids.includes(farmConfig.id))
    const farms = await fetchFarms(farmsToFetch)
    const farmsWithPrices = await fetchFarmsPrices(farms)
    // Filter out price helper LP config farms
    const farmsWithoutHelperLps = farmsWithPrices.filter((farm: Farm) => {
      return farm.id || farm.id === 0
    })
    return farmsWithoutHelperLps
  },
)

interface FarmUserDataResponse {
  id: number
  pid: number
  allowance: string
  tokenBalance: string
  stakedBalance: string
  earnings: string
}

export const fetchFarmUserDataAsync = createAsyncThunk<
  FarmUserDataResponse[],
  { account: `0x${string}`; ids: number[] }
>('farms/fetchFarmUserDataAsync', async ({ account, ids }) => {
  const allFarms = await farmsConfig()
  const farmsToFetch = allFarms.filter((farmConfig) => ids.includes(farmConfig.id))
  const userFarmAllowances = await fetchFarmUserAllowances(account, farmsToFetch)
  const userFarmTokenBalances = await fetchFarmUserTokenBalances(account, farmsToFetch)
  const userStakedBalances = await fetchFarmUserStakedBalances(account, farmsToFetch)
  const userFarmEarnings = await fetchFarmUserEarnings(account, farmsToFetch)
  return userFarmAllowances.map((farmAllowance, index) => {
    return {
      id: farmsToFetch[index].id,
      pid: farmsToFetch[index].pid,
      allowance: farmAllowance,
      tokenBalance: userFarmTokenBalances[index],
      stakedBalance: userStakedBalances[index],
      earnings: userFarmEarnings[index],
    }
  })
})

export const farmsSlice = createSlice({
  name: 'Farms',
  initialState,
  reducers: {
    setLoadArchivedFarmsData: (state, action) => {
      const loadArchivedFarmsData = action.payload
      state.loadArchivedFarmsData = loadArchivedFarmsData
    },
    updateFarmHost: (state, action) => {
      state.host = action.payload
      state.userDataLoaded = false
    },
    setNewData: (state, action) => {
      if (action.payload.length !== state.data.length) {
        state.data = action.payload
        state.userDataLoaded = false
      }
    },
  },
  extraReducers: (builder) => {
    // Update farms with live data
    builder.addCase(fetchFarmsPublicDataAsync.fulfilled, (state, action) => {
      state.data = state.data.map((farm) => {
        const liveFarmData = action.payload.find((farmData) => farmData.id === farm.id)
        return { ...farm, ...liveFarmData }
      })
    })

    // Update farms with user data
    builder.addCase(fetchFarmUserDataAsync.fulfilled, (state, action) => {
      action.payload.forEach((userDataEl) => {
        const { id } = userDataEl
        const index = state.data.findIndex((farm) => farm.id === id)
        state.data[index] = { ...state.data[index], userData: userDataEl }
      })
      state.userDataLoaded = true
    })
  },
})

// Actions
export const { setLoadArchivedFarmsData, updateFarmHost, setNewData } = farmsSlice.actions

export default farmsSlice.reducer
