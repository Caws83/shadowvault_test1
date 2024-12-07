import tokens from 'config/constants/tokens'
import { getAddress } from './addressHelpers'

export const getToken = (symbol: string) => {
  if (symbol === 'WCRO') {
    /* eslint-disable-next-line no-param-reassign */
    symbol = 'WCRO'
  }
  const tokenOut = Object.values(tokens).filter((t) => t.symbol === symbol)
  return tokenOut[0]
}

export const getTokenFromAddress = (address: string) => {
  const tokenOut = Object.values(tokens).filter((t: any) => getAddress(t.address) === address)
  return tokenOut[0]
}
