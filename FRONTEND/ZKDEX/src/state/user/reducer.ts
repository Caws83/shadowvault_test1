import { createReducer } from '@reduxjs/toolkit'
import { dexs } from 'config/constants/dex'
import { Dex } from 'config/constants/types'
import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from '../../config/constants'
import { updateVersion } from '../global/actions'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  updateUserDeadline,
  updateUserSingleHopOnly,
  updateGasPrice,
  muteAudio,
  unmuteAudio,
  toggleTheme,
  updateUserFarmStakedOnly,
  FarmStakedOnly,
  updateDex,
  toggleZap,
  updateGasToken,
  updateUsePaymaster
} from './actions'
import { GAS_PRICE_GWEI } from './hooks/helpers'
import { Token } from 'config/constants/types'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  lastUpdateVersionTimestamp?: number
  userExpertMode: boolean
  userSingleHopOnly: boolean
  userSlippageTolerance: number
  userDeadline: number
  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }
  pairs: {
    [chainId: number]: {
      [key: string]: SerializedPair
    }
  }
  timestamp: number
  audioPlay: boolean
  isDark: boolean
  userFarmStakedOnly: FarmStakedOnly
  gasPrice: string
  dex: Dex
  zap: boolean
  gasToken: {
    [chainId: number]: Token
  }
  usePaymaster: {
    [chainId: number]: boolean
  }
}

const initialState: UserState = {
  userExpertMode: false,
  userSingleHopOnly: false,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  pairs: {},
  timestamp: currentTimestamp(),
  audioPlay: false,
  isDark: false,
  userFarmStakedOnly: FarmStakedOnly.ON_FINISHED,
  gasPrice: GAS_PRICE_GWEI.default,
  dex: dexs.marsCZK,
  zap: false,
  gasToken: JSON.parse(localStorage.getItem('gasToken') || '{}'),
  usePaymaster: JSON.parse(localStorage.getItem('usePaymaster') || '{}')
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      if (typeof state.userSlippageTolerance !== 'number') {
        state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE
      }
      if (typeof state.userDeadline !== 'number') {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }
      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSingleHopOnly, (state, action) => {
      state.userSingleHopOnly = action.payload.userSingleHopOnly
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      const { chainId } = serializedToken
      state.tokens[chainId] = state.tokens[chainId] || {}
      state.tokens[chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      if (state.tokens[chainId]) {
        delete state.tokens[chainId][address]
        state.timestamp = currentTimestamp()
      }
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const { chainId } = serializedPair.token0
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedPair, (state, { payload: { chainId, tokenAAddress, tokenBAddress } }) => {
      if (state.pairs[chainId]) {
        delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)]
        delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)]
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(muteAudio, (state) => {
      state.audioPlay = false
    })
    .addCase(unmuteAudio, (state) => {
      state.audioPlay = true
    })
    .addCase(toggleTheme, (state) => {
      state.isDark = !state.isDark
    })
    .addCase(updateUserFarmStakedOnly, (state, { payload: { userFarmStakedOnly } }) => {
      state.userFarmStakedOnly = userFarmStakedOnly
    })
    .addCase(updateGasPrice, (state, action) => {
      state.gasPrice = action.payload.gasPrice
    })
    .addCase(updateDex, (state, action) => {
      state.dex = action.payload.dex
    })
    .addCase(toggleZap, (state, action) => {
      state.zap = action.payload.zap
    })
    .addCase(updateGasToken, (state, action) => {
      const { chainId, gasToken } = action.payload
      state.gasToken = state.gasToken || {}
      state.gasToken[chainId] = gasToken
      localStorage.setItem('gasToken', JSON.stringify(state.gasToken))
    })
    .addCase(updateUsePaymaster, (state, action) => {
      const { chainId, usePaymaster } = action.payload
      state.usePaymaster = state.usePaymaster || {}
      state.usePaymaster[chainId] = usePaymaster
      localStorage.setItem('usePaymaster', JSON.stringify(state.usePaymaster))
    })
)
