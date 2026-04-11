import { z } from 'zod'
import { getAddress, isAddress } from 'viem'

/** 0x-prefixed 32-byte private key (64 hex chars). */
export const hexPrivateKeySchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, 'Expected 0x-prefixed 32-byte hex private key')

/** Trim quotes; if 64 hex chars without 0x, add 0x (common Railway paste issue). */
export function normalizeHexPrivateKey(raw: string | undefined): string {
  if (raw == null) return ''
  let s = String(raw).trim()
  if (s.length >= 2) {
    const q = s[0]
    if ((q === '"' || q === "'") && s[s.length - 1] === q) {
      s = s.slice(1, -1).trim()
    }
  }
  if (/^[0-9a-fA-F]{64}$/.test(s)) {
    return `0x${s}`
  }
  return s
}

export const ethereumAddressSchema = z.string().refine((s) => isAddress(s), 'Invalid Ethereum address')

/** Normalize to checksummed address; throws if invalid. */
export function parseEthereumAddress(raw: string): `0x${string}` {
  return getAddress(raw.trim()) as `0x${string}`
}

/** Optional env address: empty string → null */
export function optionalAddress(raw: string | undefined): `0x${string}` | null {
  if (raw == null || String(raw).trim() === '') return null
  return parseEthereumAddress(String(raw).trim())
}

export const hyperliquidNetworkSchema = z.enum(['mainnet', 'testnet'])

/** Normalized L2 book level (UI / wire format). */
export const orderBookLevelSchema = z.object({
  price: z.string(),
  size: z.string(),
  n: z.number().int().nonnegative().optional(),
})

export const normalizedL2BookSchema = z.object({
  coin: z.string(),
  time: z.number().optional(),
  bids: z.array(orderBookLevelSchema),
  asks: z.array(orderBookLevelSchema),
})

export const normalizedTradeSchema = z.object({
  coin: z.string(),
  side: z.enum(['buy', 'sell']),
  px: z.string(),
  sz: z.string(),
  time: z.number(),
  hash: z.string().optional(),
})
