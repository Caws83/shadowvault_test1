import { ChainId, Currency, CurrencyAmount, getETHER, Token, TokenAmount, getWBONE } from 'sdk'

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  const WBONE = getWBONE()
  const ETHER = getETHER(chainId)
  return chainId && currency === ETHER ? WBONE[chainId] : currency instanceof Token ? currency : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined,
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token: Token): Currency {
  const WBONE = getWBONE()
  const ETHER = getETHER(token.chainId)
  if (token.equals(WBONE[token.chainId])) return ETHER
  return token
}
