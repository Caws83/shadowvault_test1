/**
 * WebSocket transport + `SubscriptionClient` from `@nktkas/hyperliquid` (matches HL WS protocol).
 * Reconnect/backoff options follow the SDK’s `WebSocketTransport` API.
 *
 * TODO: Wire subscriptions (e.g. `l2Book`, `trades`, user fills) via `SubscriptionClient` only using
 * methods/types exported by this SDK version — do not hand-roll WS frames. Not used by HTTP routes yet.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket
 */
import { WebSocketTransport, SubscriptionClient } from '@nktkas/hyperliquid'
import type { HyperliquidResolvedConfig } from './types'

export function createHyperliquidWebSocketTransport(config: HyperliquidResolvedConfig): WebSocketTransport {
  return new WebSocketTransport({
    isTestnet: config.isTestnet,
    url: config.wsUrl,
    timeout: config.infoTimeoutMs,
    resubscribe: true,
    reconnect: {
      maxRetries: 10_000,
      reconnectionDelay: (attempt: number) => Math.min(2 ** attempt * 150, 10_000),
    },
  })
}

export function createHyperliquidSubscriptionClient(config: HyperliquidResolvedConfig): SubscriptionClient {
  const transport = createHyperliquidWebSocketTransport(config)
  return new SubscriptionClient({ transport })
}

export { SubscriptionClient, WebSocketTransport }
