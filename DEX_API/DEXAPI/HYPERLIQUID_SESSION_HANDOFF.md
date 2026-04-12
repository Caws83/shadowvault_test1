# Hyperliquid integration — handoff (saved for next session)

## What’s in place

- **Backend (`src/hyperliquid/`)**: Config, Info client, Exchange client (server-side agent signing), WebSocket transport + `SubscriptionClient` factory, validators, normalizers, meta cache, orderbook poll + reconcile, REST routes under `/api/hyperliquid/*`.
- **Signing**: `HYPERLIQUID_AGENT_PRIVATE_KEY` only on the server (`agentWallet.ts` + `ExchangeClient`). Never in Netlify.
- **ChangeNOW**: Unchanged; still `index.ts` `/api/changenow/*` before `mountHyperliquidApi`.
- **Frontend**: `useHyperliquidPerp.ts` → `API_URL` + HL routes; Swap perp mode wired (from prior work).

## Env (see `.env.example` + `hyperliquid-railway.env.example`)

- `HYPERLIQUID_NETWORK`, `HYPERLIQUID_API_URL` / `HYPERLIQUID_WS_URL` (optional overrides)
- `HYPERLIQUID_AGENT_PRIVATE_KEY`, optional `HYPERLIQUID_AGENT_ADDRESS`, `HYPERLIQUID_VAULT_ADDRESS`
- `HYPERLIQUID_MAINNET_ENABLED` — mainnet write kill-switch (default true; testnet ignores)
- Poll/stale: `HYPERLIQUID_ORDERBOOK_POLL_MS`, `HYPERLIQUID_STALE_MS`, `HYPERLIQUID_RECONCILE_MS`

## Official docs (code comments point here)

- Info: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint  
- Exchange: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint  
- WebSocket: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket  
- Signing: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing  

## TODOs (next steps)

1. **Market orders**: Confirm slippage / tick rounding for `FrontendMarket` in `routes.ts` (TODO in file).
2. **WebSocket**: Wire `SubscriptionClient` for live L2/trades per SDK — no hand-rolled frames (`wsClient.ts` TODO).
3. **Reconciliation**: Stronger worker (WS vs Info) for orders/fills after reconnect.
4. **`GET /api/hyperliquid/user`**: Add real auth (signed challenge / session) before production — address-only today.
5. **Amend orders**: Only if SDK/docs support; else cancel + replace, no blind retries on signed posts.

## Quick checks

- Health: `GET /api/hyperliquid/health`
- Build API: `cd DEX_API/DEXAPI && npm run build`

Sleep well — gm next time.
