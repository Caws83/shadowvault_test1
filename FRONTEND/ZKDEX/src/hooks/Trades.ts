/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-param-reassign */
import { isTradeBetter } from 'utils/trades'
import { Currency, CurrencyAmount, Pair, Token, Trade } from 'sdk'
import flatMap from 'lodash/flatMap'
import { useMemo } from 'react'

import { useUserSingleHopOnly } from 'state/user/hooks'
import { Dex } from 'config/constants/types'
import { getAddress } from 'utils/addressHelpers'
import {
  BASES_TO_CHECK_TRADES_AGAINST,
  CUSTOM_BASES,
  BETTER_TRADE_LESS_HOPS_THRESHOLD,
  ADDITIONAL_BASES,
} from '../config/constants'
import { PairState, usePairs } from './usePairs'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useUnsupportedTokens } from './Tokens'

function useAllCommonPairs(dex: Dex[], currencyA?: Currency, currencyB?: Currency): any[][] {
  
  const pairGroup = []

  for (let i = 0; i < dex.length; i++) {
    const { factoryBase } = dex[i]
    const chainId = dex[i].chainId
    const [tokenA, tokenB] = chainId
      ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
      : [undefined, undefined]

    const bases: Token[] = useMemo(() => {
      if (!chainId) return []

      const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
      const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : []
      const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : []
      const factoryToken = new Token(
        chainId,
        getAddress(factoryBase.address, chainId),
        factoryBase.decimals,
        factoryBase.symbol,
        factoryBase.name,
      )

      return [...common, ...additionalA, ...additionalB, factoryToken]
    }, [ tokenA, tokenB, factoryBase])

    const basePairs: [Token, Token][] = useMemo(
      () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
      [bases],
    )

    const allPairCombinations: [Token, Token][] = useMemo(
      () =>
        tokenA && tokenB
          ? [
              // the direct pair
              [tokenA, tokenB],
              // token A against all bases
              ...bases.map((base): [Token, Token] => [tokenA, base]),
              // token B against all bases
              ...bases.map((base): [Token, Token] => [tokenB, base]),
              // each base against all bases
              ...basePairs,
            ]
              .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
              .filter(([t0, t1]) => t0.address !== t1.address)
              .filter(([tokenA_, tokenB_]) => {
                if (!chainId) return true
                const customBases = CUSTOM_BASES[chainId]

                const customBasesA: Token[] | undefined = customBases?.[tokenA_.address]
                const customBasesB: Token[] | undefined = customBases?.[tokenB_.address]

                if (!customBasesA && !customBasesB) return true

                if (customBasesA && !customBasesA.find((base) => tokenB_.equals(base))) return false
                if (customBasesB && !customBasesB.find((base) => tokenA_.equals(base))) return false

                return true
              })
          : [],
      [tokenA, tokenB, bases, basePairs],
    )
    const allPairs = usePairs(dex[i], allPairCombinations)
    // only pass along valid pairs, non-duplicated pairs
    const currentPairs = useMemo(
      () =>
        Object.values(
          allPairs
            // filter out invalid pairs
            .filter((result): result is [PairState.EXISTS, Pair] =>
              Boolean(result[0] === PairState.EXISTS && result[1]),
            )
            // filter out duplicated pairs
            .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
              memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
              return memo
            }, {}),
        ),
      [allPairs],
    )
    pairGroup.push(currentPairs)
  }
  return pairGroup
}

const MAX_HOPS = 3

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  dex: Dex[],
  currentDex: Dex,
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
): [Trade | null, Trade[] | null] {
  const allowedPairs = useAllCommonPairs(dex, currencyAmountIn?.currency, currencyOut)
  const [singleHopOnly] = useUserSingleHopOnly()
  return useMemo(() => {
    let bestTradeSoFar: Trade | null = null
    const allBestTrades: Trade[] = []

    for (let m = 0; m < dex.length; m++) {
      let currentBestForDex: Trade | null = null
      if (currencyAmountIn && currencyOut && allowedPairs[m].length > 0) {
        if (singleHopOnly) {
          const currentTrade: Trade | null =
            Trade.bestTradeExactIn(
              allowedPairs[m],
              currencyAmountIn,
              currencyOut,
              { maxHops: 1, maxNumResults: 1 },
              dex[m].info,
              currentDex.chainId
            )[0] ?? null

          if (isTradeBetter(currentBestForDex, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
            if (dex[m] === currentDex) bestTradeSoFar = currentTrade
            currentBestForDex = currentTrade
          }
        } else {
          // search through trades with varying hops, find best trade out of them

          for (let i = 1; i <= MAX_HOPS; i++) {
            const currentTrade: Trade | null =
              Trade.bestTradeExactIn(
                allowedPairs[m],
                currencyAmountIn,
                currencyOut,
                { maxHops: i, maxNumResults: 1 },
                dex[m].info,
                currentDex.chainId
              )[0] ?? null
            // if current trade is best yet, save it
            if (isTradeBetter(currentBestForDex, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
              if (dex[m] === currentDex) bestTradeSoFar = currentTrade
              currentBestForDex = currentTrade
            }
          }
        }
      }
      allBestTrades.push(currentBestForDex)
    }
    
    return [bestTradeSoFar, allBestTrades]
  }, [dex, currencyAmountIn, currencyOut, allowedPairs, singleHopOnly, currentDex])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  dex: Dex[],
  currentDex: Dex,
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
): [Trade | null, Trade[] | null] {
  const allowedPairs = useAllCommonPairs(dex, currencyIn, currencyAmountOut?.currency)

  const [singleHopOnly] = useUserSingleHopOnly()

  return useMemo(() => {
    let bestTradeSoFar: Trade | null = null
    const allBestTrades: Trade[] = []

    for (let m = 0; m < dex.length; m++) {
      let currentBestForDex: Trade | null = null
      if (currencyIn && currencyAmountOut && allowedPairs[m].length > 0) {
        if (singleHopOnly) {
          const currentTrade: Trade | null =
            Trade.bestTradeExactOut(
              allowedPairs[m],
              currencyIn,
              currencyAmountOut,
              { maxHops: 1, maxNumResults: 1 },
              dex[m].info,
              currentDex.chainId
            )[0] ?? null
          if (isTradeBetter(currentBestForDex, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
            if (dex[m] === currentDex) bestTradeSoFar = currentTrade
            currentBestForDex = currentTrade
          }
        } else {
          // search through trades with varying hops, find best trade out of them
          for (let i = 1; i <= MAX_HOPS; i++) {
            const currentTrade =
              Trade.bestTradeExactOut(
                allowedPairs[m],
                currencyIn,
                currencyAmountOut,
                { maxHops: i, maxNumResults: 1 },
                dex[m].info,
                currentDex.chainId
              )[0] ?? null
            if (isTradeBetter(currentBestForDex, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
              if (dex[m] === currentDex) bestTradeSoFar = currentTrade
              currentBestForDex = currentTrade
            }
          }
        }
      }
      allBestTrades.push(currentBestForDex)
    }
    return [bestTradeSoFar, allBestTrades]
  }, [dex, currencyIn, currencyAmountOut, allowedPairs, singleHopOnly, currentDex])
}

export function useIsTransactionUnsupported( chainId: number, currencyIn?: Currency, currencyOut?: Currency): boolean {
  const unsupportedTokens: { [address: string]: Token } = useUnsupportedTokens(chainId)

  const tokenIn = wrappedCurrency(currencyIn, chainId)
  const tokenOut = wrappedCurrency(currencyOut, chainId)

  // if unsupported list loaded & either token on list, mark as unsupported
  if (unsupportedTokens) {
    if (tokenIn && Object.keys(unsupportedTokens).includes(tokenIn.address)) {
      return true
    }
    if (tokenOut && Object.keys(unsupportedTokens).includes(tokenOut.address)) {
      return true
    }
  }

  return false
}
