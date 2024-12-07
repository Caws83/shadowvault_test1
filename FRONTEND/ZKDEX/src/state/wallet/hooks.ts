import { Currency, CurrencyAmount, getETHER, JSBI, Token, TokenAmount } from 'sdk'
import { useMemo } from 'react'
import { useAllTokens } from 'hooks/Tokens'
import { isAddress } from 'utils'
import {  useAccount, useBalance, useReadContracts } from 'wagmi'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { Address } from 'viem'

export function useBONEBalance(account: Address, chainId?: number): CurrencyAmount {
  const balance = useBalance({address: account, chainId});
  const boneBalance = CurrencyAmount.ether(balance.data?.value ?? 0n, chainId);
  return boneBalance;
}


/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export const useTokenBalancesWithLoadingIndicator = (
  chainId: number,
  address?: Address,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: Address]: TokenAmount | undefined }, boolean] => {

  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  )
  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])
  const contracts = validatedTokenAddresses.map((vtAddress) => {
    return {
      abi: ERC20_ABI,
      address: vtAddress as Address,
      functionName: 'balanceOf',
      args: [address],
      chainId
    }
  })

  const {data, isLoading } = useReadContracts({ contracts })

  const balances = useMemo(() => {
    const infoArray = []
    if(data && data.length > 0){
    data.forEach((balance) => {
      if (balance.status === 'success') {
        infoArray.push(balance.result)
      }
    })
    }
    return infoArray
  }, [ isLoading, data])
  const anyLoading: boolean = useMemo(() => balances.some((balance) => (balance !== undefined ? false : true)), [balances])
  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              const value = balances[i]
              const amount = value !== undefined ? JSBI.BigInt(value.toString()) : undefined
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount)
              }
              return memo
            }, {})
          : {},
      [address, validatedTokens, balances],
    ),
    anyLoading,
  ]
}

export function useTokenBalances(
  chainId: number,
  address?: Address,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(chainId, address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(chainId: number, account: Address, token: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(chainId, account, [token])
  if(!token?.address || !chainId) return undefined
  return tokenBalances[token.address]
}


export function useCurrencyBalances(
  chainId: number,
  account?: Address,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies],
  )

  const tokenBalances = useTokenBalances(chainId, account, tokens)
  const ethBalance = useBONEBalance(account, chainId)
  const ETHER = getETHER(chainId)
  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        if (currency === ETHER) return ethBalance
        return undefined
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances],
  )
}

export function useCurrencyBalance(chainId: number, account?: Address, currency?: Currency): CurrencyAmount | undefined {
  return useCurrencyBalances(chainId, account, [currency])[0]
}

// mimics useAllBalances
export function useAllTokenBalances(chainId: number): { [tokenAddress: Address]: TokenAmount | undefined } {
  const { address: account } = useAccount()
  const allTokens = useAllTokens(chainId)
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(chainId, account ?? undefined, allTokensArray)
  return balances ?? {}
}
