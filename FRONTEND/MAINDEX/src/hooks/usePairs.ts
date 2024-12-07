import { TokenAmount, Pair, Currency } from 'sdk'
import { useEffect, useMemo, useState } from 'react'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { Dex } from '../config/constants/types'
import { useReadContracts } from 'wagmi'
import { lpTokenAbi } from 'config/abi/lpToken'
import useRefresh from './useRefresh'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(
  dex: Dex,
  currencies: [Currency | undefined, Currency | undefined][],
): [PairState, Pair | null][] {
  const chainId = dex.chainId
  const { slowRefresh } = useRefresh()
  const tokens = useMemo(
    () =>{
      if (currencies === undefined) return [];
      return currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ])
    },
    [chainId, currencies],
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB, dex.info) : undefined
      }),
    [tokens, dex],
  )
  const calls = pairAddresses.map((pair) => {
    return {
      abi: lpTokenAbi,
      address: pair as `0x${string}`,
      functionName: 'getReserves',
      chainId
    }
  })
  const { data: results, isLoading, refetch } = useReadContracts({ contracts: calls})
  useEffect(() =>{
    refetch()
  },[slowRefresh])


  return useMemo(() => {
    if (isLoading) return [[PairState.LOADING, null]]
    if (results === undefined) return [[PairState.INVALID, null]];
    return results.map((result, i) => {
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!result.result) return [PairState.NOT_EXISTS, null]
      const _reserve0 = result.result[0]
      const _reserve1 = result.result[1]
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, _reserve0.toString()),
          new TokenAmount(token1, _reserve1.toString()),
          dex.info,
        ),
      ]
    })
  }, [results, tokens, dex])
}

export function usePair(dex: Dex, tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs(dex, [[tokenA, tokenB]])[0]
}
