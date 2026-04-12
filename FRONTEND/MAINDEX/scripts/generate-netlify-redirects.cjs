/**
 * Writes public/_redirects so Netlify proxies /api/* and /V2/* to Railway (same-origin in the browser).
 * Set VITE_API_URL or RAILWAY_PUBLIC_URL in Netlify to your API origin, e.g. https://xxx.up.railway.app
 * (no trailing slash). This runs at build time only; it does not embed secrets in the JS bundle.
 */
const fs = require('fs')
const path = require('path')

/** Netlify proxy rules require a full URL with scheme; bare hostnames are rejected. */
function normalizeOrigin(raw) {
  let s = String(raw || '')
    .trim()
    .replace(/\/$/, '')
  if (!s) return ''
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`
  }
  return s
}

const origin = normalizeOrigin(process.env.VITE_API_URL || process.env.RAILWAY_PUBLIC_URL || '')

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
    '[prebuild] Set VITE_API_URL (or RAILWAY_PUBLIC_URL) on Netlify — must include https:// (e.g. https://your-service.up.railway.app) so /api and /V2 proxy rules are valid.',
  )
} else {
  console.log('[prebuild] Wrote public/_redirects → proxy /api and /V2 to', origin)
}
