/**
 * Read Railway / process env with common copy-paste fixes (quotes, whitespace).
 * Never log raw values.
 */

/** Trim and strip a single pair of surrounding quotes. */
export function cleanEnvString(value: string | undefined): string {
  if (value == null) return ''
  let s = String(value).trim()
  if (s.length >= 2) {
    const q = s[0]
    if ((q === '"' || q === "'") && s[s.length - 1] === q) {
      s = s.slice(1, -1).trim()
    }
  }
  return s
}

/** First non-empty cleaned value among alternate variable names (typos / legacy). */
export function getFirstEnv(...keys: string[]): string {
  for (const k of keys) {
    const v = cleanEnvString(process.env[k])
    if (v) return v
  }
  return ''
}

export function resolveChangeNowConfig(): { baseUrl: string; apiKey: string } {
  const base =
    cleanEnvString(process.env.CHANGENOW_BASE_URL) || 'https://api.changenow.io'
  const apiKey = getFirstEnv('CHANGENOW_API_KEY', 'CHANGENOW_KEY')
  return {
    baseUrl: base.replace(/\/$/, ''),
    apiKey,
  }
}

/** Safe startup hints (booleans only). */
export function logServerEnvHints(): void {
  const changenow = !!resolveChangeNowConfig().apiKey
  const hlPk = !!getFirstEnv('HYPERLIQUID_AGENT_PRIVATE_KEY')
  const openai = !!getFirstEnv('OPENAI_API_KEY')
  const frontendOrigins = getFirstEnv('FRONTEND_ORIGINS', 'FRONTEND_ORIGIN')
  console.log('[env] service keys:', {
    changenow: changenow ? 'configured' : 'missing',
    hyperliquidAgent: hlPk ? 'configured' : 'missing',
    openai: openai ? 'configured' : 'missing',
    corsExtraOrigins: frontendOrigins ? 'set' : 'unset',
  })
  if (!frontendOrigins) {
    console.log(
      '[env] hint: set FRONTEND_ORIGINS on Railway (your Netlify URL(s), comma-separated) so browsers can call this API from a custom domain; *.netlify.app is allowed without it.',
    )
  }
}
