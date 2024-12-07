/* eslint-disable no-param-reassign */
import { Currency, getETHER, Token, currencyEquals } from 'sdk'
import { useMemo } from 'react'
import {
  TokenAddressMap,
  useDefaultTokenList,
  useUnsupportedTokenList,
  useCombinedActiveList,
  useCombinedInactiveList,
  easyTokenMap,
} from '../state/lists/hooks'

import useUserAddedTokens from '../state/user/hooks/useUserAddedTokens'
import { isAddress } from '../utils'

import { filterTokens } from '../components/SearchModal/filtering'
import { useToken as useToken_ } from 'wagmi'

interface tmap {
  [address: string]: Token
}

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap, includeUserAdded: boolean, chainId: number): tmap {
  const userAddedTokens = useUserAddedTokens()
  try {
    return useMemo(() => {
      // reduce to just tokens
      const mapWithoutUrls = Object.keys(tokenMap[chainId]).reduce<{ [address: string]: Token }>((newMap, address) => {
        newMap[address] = tokenMap[chainId][address].token
        return newMap
      }, {})

      if (includeUserAdded) {
        return (
          userAddedTokens
            // reduce into all ALL_TOKENS filtered by the current chain
            .reduce<tmap>(
              (tokenMap_, token) => {
                tokenMap_[token.address] = token
                return tokenMap_
              },
              // must make a copy because reduce modifies the map, and we do not
              // want to make a copy in every iteration
              { ...mapWithoutUrls },
            )
        )
      }
      return mapWithoutUrls;
    }, [chainId, userAddedTokens, tokenMap, includeUserAdded]);
  } catch (error) {
    return {};
  }
}


export function useDefaultTokens(chainId: number): { [address: string]: Token } {
  const defaultList = useDefaultTokenList()
  return useTokensFromMap(defaultList, false, chainId)
}

export function useEasyTokenList(chainId: number): { [address: string]: Token } {
  const tokenMap = easyTokenMap()
  return useTokensFromMap(tokenMap, false, chainId)
}

export function useAllTokens(chainId: number): { [address: string]: Token } {
  const allTokens = useCombinedActiveList()
  const finalList = useTokensFromMap(allTokens, true, chainId)
  return finalList
}

export function useAllInactiveTokens(chainId: number): { [address: string]: Token } {
  // get inactive tokens
  const inactiveTokensMap = useCombinedInactiveList()
  const inactiveTokens = useTokensFromMap(inactiveTokensMap, false, chainId)

  // filter out any token that are on active list
  const activeTokensAddresses = Object.keys(useAllTokens(chainId))
  const filteredInactive = activeTokensAddresses
    ? Object.keys(inactiveTokens).reduce<{ [address: string]: Token }>((newMap, address) => {
        if (!activeTokensAddresses.includes(address)) {
          newMap[address] = inactiveTokens[address]
        }
        return newMap
      }, {})
    : inactiveTokens

  return filteredInactive
}

export function useUnsupportedTokens(chainId: number): { [address: string]: Token } {
  const unsupportedTokensMap = useUnsupportedTokenList()
  return useTokensFromMap(unsupportedTokensMap, false, chainId)
}

export function useIsTokenActive(token: Token | undefined | null, chainId: number): boolean {
  const activeTokens = useAllTokens(chainId)

  if (!activeTokens || !token) {
    return false
  }

  return !!activeTokens[token.address]
}

// used to detect extra search results
export function useFoundOnInactiveList(searchQuery: string, chainId: number): Token[] | undefined {
  const inactiveTokens = useAllInactiveTokens(chainId)

  return useMemo(() => {
    if (!chainId || searchQuery === '') {
      return undefined
    }
    const tokens = filterTokens(Object.values(inactiveTokens), searchQuery)
    return tokens
  }, [chainId, inactiveTokens, searchQuery])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency) {
    return false
  }

  return !!userAddedTokens.find((token) => currencyEquals(currency, token))
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(chainId: number, tokenAddress?: `0x${string}`): Token | undefined | null {
  const tokens = useAllTokens(chainId)

  const address = isAddress(tokenAddress)

  const token: Token | undefined = address ? tokens[address] : undefined

  const { data, isLoading } = useToken_({
    address: tokenAddress || undefined,
    chainId,
    enabled: Boolean(!!address && !token),
  })

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (isLoading) return null
    if (data) {
      return new Token(chainId, data.address, data.decimals, data.symbol ?? 'UNKNOWN', data.name ?? 'Unknown Token')
    }
    return undefined
  }, [address, chainId, data, token])
}

export function useCurrency(currencyId: string | undefined, chainId: number): Currency | null | undefined {
  const native = getETHER(chainId)
  const isBNB = currencyId === native.symbol
  const token = useToken(chainId, isBNB ? undefined : (currencyId as `0x${string}`))
  return isBNB ? native : token
}
