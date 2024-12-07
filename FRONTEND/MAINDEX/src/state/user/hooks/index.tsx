import { getETHER, Pair, Token } from 'sdk'
import flatMap from 'lodash/flatMap'
import { useCallback, useMemo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS } from 'config/constants'
import { useAllTokens } from 'hooks/Tokens'
import { Dex } from 'config/constants/types'
import { dexs, dexList } from 'config/constants/dex'
import { AppDispatch, AppState } from '../../index'
import BigNumber from 'bignumber.js'
import {
  addSerializedPair,
  addSerializedToken,
  FarmStakedOnly,
  muteAudio,
  removeSerializedToken,
  SerializedPair,
  toggleTheme as toggleThemeAction,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserFarmStakedOnly,
  updateUserSingleHopOnly,
  updateUserSlippageTolerance,
  updateGasPrice,
  updateDex,
  updateGasToken,
  updateUsePaymaster,
  toggleZap,
} from '../actions'
import { deserializeToken, GAS_PRICE, GAS_PRICE_GWEI, serializeToken } from './helpers'
import { useChainId, useEstimateFeesPerGas  } from 'wagmi'
import { defaultChainId } from 'config/constants/chains'
import { Token as tToken } from 'config/constants/types'

export function useAudioModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()

  const toggleSetAudioMode = useCallback(() => {
    dispatch(muteAudio())
  }, [dispatch])

  return [false, toggleSetAudioMode]
}


export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState['user']['userExpertMode']>((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}

export function useThemeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const isDark = useSelector<AppState, AppState['user']['isDark']>((state) => state.user.isDark)

  const toggleTheme = useCallback(() => {
    dispatch(toggleThemeAction())
  }, [dispatch])

  return [isDark, toggleTheme]
}

export function useUserSingleHopOnly(): [boolean, (newSingleHopOnly: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>()

  // Ensure that the useSelector does not return undefined
  const singleHopOnly = useSelector<AppState, AppState['user']['userSingleHopOnly']>(
    (state) => state?.user?.userSingleHopOnly
  ) ?? false

  const setSingleHopOnly = useCallback(
    (newSingleHopOnly: boolean) => {
      dispatch(updateUserSingleHopOnly({ userSingleHopOnly: newSingleHopOnly }))
    },
    [dispatch],
  )

  return [singleHopOnly, setSingleHopOnly]
}


export function useUserSlippageTolerance(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>();

  // Ensure that the useSelector does not return undefined
  const userSlippageTolerance = useSelector<AppState, AppState['user']['userSlippageTolerance']>((state) => {
    return state?.user?.userSlippageTolerance ?? 2500;
  });

  const setUserSlippageTolerance = useCallback(
    (slippage: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance: slippage }));
    },
    [dispatch],
  );

  return [userSlippageTolerance, setUserSlippageTolerance];
}


export function useUserFarmStakedOnly(): [boolean, (stakedOnly: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userFarmStakedOnly = useSelector<AppState, AppState['user']['userFarmStakedOnly']>((state) => {
    return state?.user?.userFarmStakedOnly ?? FarmStakedOnly.FALSE
  })

  const setUserFarmStakedOnly = useCallback(
    (stakedOnly: boolean) => {
      const farmStakedOnly = stakedOnly ? FarmStakedOnly.TRUE : FarmStakedOnly.FALSE
      dispatch(updateUserFarmStakedOnly({ userFarmStakedOnly: farmStakedOnly }))
    },
    [dispatch],
  )

  return [
    userFarmStakedOnly === FarmStakedOnly.TRUE,
    setUserFarmStakedOnly,
  ]
}

export function useUserTransactionTTL(): [number, (deadline: number) => void] {
  const dispatch = useDispatch<AppDispatch>();

  // Ensure that the useSelector does not return undefined
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>((state) => {
    return state?.user?.userDeadline ?? 1200;
  });

  const setUserDeadline = useCallback(
    (deadline: number) => {
      dispatch(updateUserDeadline({ userDeadline: deadline }));
    },
    [dispatch],
  );

  return [userDeadline, setUserDeadline];
}


export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch],
  )
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch],
  )
}

export function useGasPrice(): string {
  const chainId = useChainId()
  const {data} = useEstimateFeesPerGas({chainId})
  const gPrice = new BigNumber(data?.maxFeePerGas.toString())

  const setting = useSelector<AppState, AppState['user']['gasPrice']>((state) => state.user.gasPrice) ?? GAS_PRICE_GWEI.default

  if(data === undefined) return "0"
 
  const gasPrice = new BigNumber(gPrice).times(GAS_PRICE[setting]).dividedBy(100).plus(gPrice).toFixed(0)

return gasPrice
}

export function useGasPriceManager(): [string, (userGasPrice: string) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const setting = useSelector<AppState, AppState['user']['gasPrice']>((state) => state.user.gasPrice)

  const setGasPrice = useCallback(
    (gasPrice: string) => {
      dispatch(updateGasPrice({ gasPrice }))
    },
    [dispatch],
  )

  return [setting, setGasPrice]
}


export function useGasTokenManager(): [boolean, (usePaymaster: boolean) => void, tToken, (gasToken: tToken) => void] {
  const chainId = useChainId()
  const chainIdToUse = chainId ?? defaultChainId;
  const ETHER = getETHER(chainIdToUse) as tToken
  const dispatch = useDispatch<AppDispatch>();

  let payToken = useSelector<AppState, tToken | undefined>(
    (state) => state.user.gasToken?.[chainIdToUse]
  ) ?? undefined
  let enabled = useSelector<AppState, boolean | undefined>(
    (state) => state.user.usePaymaster?.[chainIdToUse]
  ) ?? undefined 

  if(payToken === undefined) {
    payToken = ETHER
    dispatch(updateGasToken({ chainId: chainIdToUse, gasToken: ETHER }));
  }
  if(enabled === undefined) {
    enabled = false
    dispatch(updateUsePaymaster({ chainId: chainIdToUse, usePaymaster: false }));
  }

  const setGasPrice = useCallback(
    (gasToken: tToken) => {
      payToken = gasToken
      dispatch(updateGasToken({ chainId: chainIdToUse, gasToken }));
    },
    [dispatch, chainIdToUse]
  );

  const setUsePaymaster = useCallback(
    (usePaymaster: boolean) => {
      enabled = usePaymaster
      dispatch(updateUsePaymaster({ chainId: chainIdToUse, usePaymaster }));
    },
    [dispatch, chainIdToUse]
  );

  return [enabled, setUsePaymaster, payToken, setGasPrice];
}




export function useUserDex(): [Dex, (newDex: Dex) => void] {
  const dispatch = useDispatch<AppDispatch>()
  let userDex = useSelector<AppState, AppState['user']['dex']>((state) => state.user.dex)
  if(userDex === undefined) {
    dispatch(updateDex({ dex: dexs.marsCZK }))
  }
  const actualUserDex = dexList.find((d) => d.id === userDex.id)
  if (userDex === undefined || actualUserDex === undefined) {
    userDex = dexs.marsCZK
    dispatch(updateDex({ dex: userDex }))
  } else if (userDex !== actualUserDex) {
    userDex = actualUserDex
    dispatch(updateDex({ dex: userDex }))
  }
  const setUserDex = useCallback(
    (dex: Dex) => {
      dispatch(updateDex({ dex }))
    },
    [dispatch],
  )

  return [userDex, setUserDex]
}

export function useZapManager(): [boolean, (newZap: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const zap = useSelector<AppState, AppState['user']['zap']>((state) => state.user.zap)

  const toggleSetZap = useCallback((newZap: boolean) => {
    dispatch(toggleZap({ zap: newZap }))
  }, [dispatch])

  return [zap, toggleSetZap]
}


function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch],
  )
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken(dex: Dex, [tokenA, tokenB]: [Token, Token]): Token {
  const lpName = dex.info.lpname
  const Name = dex.info.name
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB, dex.info), 18, lpName, Name)
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(chainId: number): [Token, Token][] {
  const tokens = useAllTokens(chainId)

  // pinned pairs
  const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
            const token = tokens[tokenAddress]
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null
                  }
                  return [base, token]
                })
                .filter((p): p is [Token, Token] => p !== null)
            )
          })
        : [],
    [tokens, chainId],
  )

  // pairs saved by users
  const savedSerializedPairs = useSelector<AppState, AppState['user']['pairs']>(({ user: { pairs } }) => pairs)

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return []
    const forChain = savedSerializedPairs[chainId]
    if (!forChain) return []

    return Object.keys(forChain).map((pairId) => {
      return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)]
    })
  }, [savedSerializedPairs, chainId])

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs],
  )

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])
}
