import { ChainId } from 'sdk'

export const EPOCH_TIME = 1

export const shardConfig = {
  apiKey: '75077347-4585-422c-9dce-646f79469728',
  socketId: 'd5296476-24e3-4bc5-9d96-2c89c0dd6070',
}

export const BASE_BSC_SCAN_URLS = {
  245022926: 'https://devnet.neonscan.org/',
}

/**
 * ShadowVault frontend → DEX API (`DEX_API/DEXAPI`, Express on Railway etc.).
 *
 * - **Production does not run Vite.** You ship static files from `npm run build` (`dist/`). Vite is only the bundler.
 * - **Netlify:** set `VITE_API_URL=https://your-dex-api.up.railway.app` at *build* time so `prebuild` writes
 *   `public/_redirects` and same-origin `/api/*` proxies to your DEX API. Optional: bake URL into JS via `VITE_API_URL`.
 * - **Local dev:** `npm start` uses the Vite dev server; without `VITE_API_URL`, calls go to `http://<hostname>:3000`
 *   (run DEX API from `DEX_API/DEXAPI`: `npm run build && npm start`).
 *
 * `VITE_API_URL` (trimmed, no trailing slash): if set, always used as API origin.
 *
 * Use `getDexApiBaseUrl()` / `dexApiUrl()` when building fetch URLs (not only the static `API_URL` import)
 * so the hostname is correct on each request and `vite preview` can use same-origin `/api` + proxy.
 */
export function getDexApiBaseUrl(): string {
  const raw =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
      ? String(import.meta.env.VITE_API_URL).trim()
      : ''
  if (raw) return raw.replace(/\/$/, '')
  if (typeof import.meta !== 'undefined' && import.meta.env.DEV && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3000`
  }
  return ''
}

/** @deprecated Prefer getDexApiBaseUrl() inside hooks — evaluated once at import time */
export const API_URL = getDexApiBaseUrl()

export function dexApiUrl(path: string): string {
  const base = getDexApiBaseUrl().replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}
export const BLOCKS_PER_YEAR = (60 / EPOCH_TIME) * 60 * 24 * 365 // 10512000
export const BASE_URL = `${window.location.origin}/`
export const BASE_ADD_LIQUIDITY_URL = `${BASE_URL}/#/add`
export const BASE_REMOVE_LIQUIDITY_URL = `${BASE_URL}/#/remove`
export const BASE_LIQUIDITY_POOL_URL = `${BASE_URL}/#/pool`
export const DEFAULT_TOKEN_DECIMAL = 10 ** 18
export const DEFAULT_GAS_LIMIT = 300000
export const AUCTION_BIDDERS_TO_FETCH = 500
export const RECLAIM_AUCTIONS_TO_FETCH = 500
export const AUCTION_WHITELISTED_BIDDERS_TO_FETCH = 500

export const TOP_AD_ID = '2242934'
export const BOTTOM_AD_ID = '2242935'

export const MINIMUM_COMPOST = 5

