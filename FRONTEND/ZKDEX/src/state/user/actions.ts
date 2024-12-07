import { createAction } from '@reduxjs/toolkit'
import { Dex, Token } from 'config/constants/types'

export interface SerializedToken {
  chainId: number
  address: `0x${string}`
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export enum FarmStakedOnly {
  ON_FINISHED = 'onFinished',
  TRUE = 'true',
  FALSE = 'false',
}

export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>('user/updateUserExpertMode')
export const updateUserSingleHopOnly = createAction<{ userSingleHopOnly: boolean }>('user/updateUserSingleHopOnly')
export const updateUserSlippageTolerance = createAction<{ userSlippageTolerance: number }>(
  'user/updateUserSlippageTolerance',
)
export const updateUserDeadline = createAction<{ userDeadline: number }>('user/updateUserDeadline')
export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('user/addSerializedToken')
export const removeSerializedToken = createAction<{ chainId: number; address: string }>('user/removeSerializedToken')
export const addSerializedPair = createAction<{ serializedPair: SerializedPair }>('user/addSerializedPair')
export const removeSerializedPair = createAction<{ chainId: number; tokenAAddress: string; tokenBAddress: string }>(
  'user/removeSerializedPair',
)

export const muteAudio = createAction<void>('user/muteAudio')
export const unmuteAudio = createAction<void>('user/unmuteAudio')
export const toggleTheme = createAction<void>('user/toggleTheme')
export const toggleZap = createAction<{zap: boolean}>('user/toggleZap')
export const updateUserFarmStakedOnly = createAction<{ userFarmStakedOnly: FarmStakedOnly }>(
  'user/updateUserFarmStakedOnly',
)
export const updateGasPrice = createAction<{ gasPrice: string }>('user/updateGasPrice')
export const updateDex = createAction<{ dex: Dex }>('user/updateDex')

// Action creator to update usePaymaster, including chainId
export const updateUsePaymaster = createAction<{ chainId: number; usePaymaster: boolean }>('user/updateUsePaymaster')

// Action creator to update gasToken, including chainId
export const updateGasToken = createAction<{ chainId: number; gasToken: Token }>('user/updateGasToken')
