import { JSBI, Percent, Token, CurrencyAmount, Currency, getETHER } from 'sdk'
import { TokenAddressMap } from '../state/lists/hooks'
import { getAddress } from 'viem'
import { usePublicClient } from 'wagmi'
import { BASE_BSC_SCAN_URLS } from 'config'

// Returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): `0x${string}` | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// Shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// Add 10% gas margin
export function calculateGasMargin(value: bigint, margin = 1000n): bigint {
  return (value * (10000n + margin)) / 10000n
}

// Converts a basis points value to a SDK percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

// Calculate slippage amount
export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

// Escape regular expression special characters in a string
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

// Check if a token is on the list
export function isTokenOnList(defaultTokens: TokenAddressMap, chainId: number, currency?: Currency): boolean {
  if (currency === getETHER(chainId)) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

// Get BscScan link based on type and chainId
export function getBscScanLink(
  data: string | number,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainId: number,
): string {
  
  const blockExplorer = BASE_BSC_SCAN_URLS[chainId];

  if (!blockExplorer) {
    console.error(`Block explorer URL not found for chainId: ${chainId}`);
    return ''; // Or throw an error, depending on your requirements
  }

  switch (type) {
    case 'transaction': {
      return `${blockExplorer}/tx/${data}`;
    }
    case 'token': {
      return `${blockExplorer}/token/${data}`;
    }
    case 'block': {
      return `${blockExplorer}/block/${data}`;
    }
    case 'countdown': {
      return `${blockExplorer}/block/countdown/${data}`;
    }
    default: {
      return `${blockExplorer}/address/${data}`;
    }
  }
}

