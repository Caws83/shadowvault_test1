import { Currency, Token } from 'sdk'

export function currencyId(currency: Currency): string {
  if (currency instanceof Token) return currency.address
  if(currency.symbol) return currency.symbol
  throw new Error('invalid currency')
}

export default currencyId
