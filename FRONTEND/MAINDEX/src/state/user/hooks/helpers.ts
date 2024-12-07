import { Token } from 'sdk'
import { SerializedToken } from '../actions'

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address as `0x${string}`,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  )
}
// modifier to called gas price in Percent
export const GAS_PRICE = {
    default: '1',
    fast: '5',
    instant: '10',
}

export const GAS_PRICE_GWEI = {
    default: 'default',
    fast: 'fast',
    instant: 'instant',
}
