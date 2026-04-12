/**
 * Writes public/_redirects so Netlify proxies /api/* and /V2/* to Railway (same-origin in the browser).
 * Set VITE_API_URL or RAILWAY_PUBLIC_URL in Netlify to your API origin, e.g. https://xxx.up.railway.app
 * (no trailing slash). This runs at build time only; it does not embed secrets in the JS bundle.
 */
const fs = require('fs')
const path = require('path')

const origin = String(process.env.VITE_API_URL || process.env.RAILWAY_PUBLIC_URL || '')
  .trim()
  .replace(/\/$/, '')

const outDir = path.join(__dirname, '..', 'public')
const outFile = path.join(outDir, '_redirects')

const lines = []
if (origin) {
  lines.push(`/api/* ${origin}/api/:splat 200`)
  lines.push(`/V2/* ${origin}/V2/:splat 200`)
}
lines.push('/* /index.html 200')

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outFile, `${lines.join('\n')}\n`, 'utf8')

if (!origin) {
  console.warn(
    '[prebuild] Set VITE_API_URL (or RAILWAY_PUBLIC_URL) on Netlify to your Railway API URL so /api and /V2 proxy to the backend. Example: https://your-service.up.railway.app',
  )
} else {
  console.log('[prebuild] Wrote public/_redirects → proxy /api and /V2 to', origin)
}
