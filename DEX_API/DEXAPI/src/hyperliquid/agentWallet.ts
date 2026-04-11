/**
 * Agent / API wallet (viem) for Hyperliquid L1 signing.
 * Per docs, use a dedicated API wallet; master account must approve the agent on Hyperliquid.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing
 */
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import { getAddress } from 'viem'
import { hexPrivateKeySchema, normalizeHexPrivateKey } from './validators'
import { hlLog } from './logger'
import type { HyperliquidResolvedConfig } from './types'

export interface ResolvedAgentWallet {
  account: PrivateKeyAccount
  /** Checksummed address of the signing key */
  address: `0x${string}`
}

/**
 * Create viem LocalAccount from HYPERLIQUID_AGENT_PRIVATE_KEY.
 * Returns null if unset or invalid.
 */
export function createAgentWallet(config: HyperliquidResolvedConfig): ResolvedAgentWallet | null {
  const raw = normalizeHexPrivateKey(process.env.HYPERLIQUID_AGENT_PRIVATE_KEY)
  if (!raw) {
    return null
  }
  const parsed = hexPrivateKeySchema.safeParse(raw)
  if (!parsed.success) {
    hlLog.warn('Agent private key invalid', { issues: parsed.error.issues })
    return null
  }

  const account = privateKeyToAccount(parsed.data as `0x${string}`)
  const address = getAddress(account.address) as `0x${string}`

  if (config.agentAddressExpected && getAddress(config.agentAddressExpected) !== address) {
    hlLog.warn('HYPERLIQUID_AGENT_ADDRESS does not match private key; using derived address', {
      expected: config.agentAddressExpected,
      derived: address,
    })
  }

  return { account, address }
}
