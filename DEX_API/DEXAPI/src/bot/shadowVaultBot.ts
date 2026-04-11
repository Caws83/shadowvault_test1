/**
 * ShadowVault Bot: trading assistant with Polymarkets data and trade intent parsing.
 * Used by /api/response (Bots tab). No UI changes; all logic in backend.
 */

import axios from 'axios'
import { OpenAI } from 'openai'

const SYSTEM_PROMPT = `You are ShadowVault AI Agent, a personal trading and DeFi assistant.
- You help users discover and interpret Polymarkets prediction markets: fetch, summarize, and explain odds, trends, and news.
- Users can ask for leveraged, long/short trades (with leverage, stop loss, take profit) on Shadow Vault Protocol.
- When the user requests a trade, always extract: market, side, amount, leverage, stop loss, take profit.
- Always clarify the trade and present potential liquidation/risk scenarios before executing.
- Only proceed after explicit user confirmation.
- Execute trades by calling the Shadow Vault Protocol API.
- Remember recent trades and preferences ("per-user agent").
- Never change the app UI or layout.
- Be clear, accurate, and user-protective.`

const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com/markets'
const SHADOW_VAULT_API_URL = process.env.SHADOW_VAULT_API_URL || ''
const SHADOW_VAULT_API_KEY = process.env.SHADOW_VAULT_API_KEY || ''

export interface ParsedTrade {
  side: 'long' | 'short'
  outcome?: 'yes' | 'no'
  market: string
  amount: number
  leverage: number
  stopLoss: number | null
  takeProfit: number | null
}

export interface PolymarketMarket {
  id: string
  question: string
  outcomePrices?: string
  lastTradePrice?: number
  closed?: boolean
  active?: boolean
}

const sessionStore = new Map<
  string,
  {
    pendingTrade: ParsedTrade | null
    pendingMarket: PolymarketMarket | null
    history: { role: 'user' | 'assistant' | 'system'; content: string }[]
  }
>()

const MAX_HISTORY = 20

function getSession(userId: string) {
  if (!sessionStore.has(userId)) {
    sessionStore.set(userId, {
      pendingTrade: null,
      pendingMarket: null,
      history: []
    })
  }
  return sessionStore.get(userId)!
}

/**
 * Fetch Polymarkets matching a query (e.g. "Biden wins 2024").
 */
export async function fetchPolymarkets(query: string): Promise<PolymarketMarket[]> {
  try {
    const resp = await axios.get<PolymarketMarket[]>(POLYMARKET_GAMMA_API, {
      params: { limit: 20, active: true, closed: false },
      timeout: 10000
    })
    const data = Array.isArray(resp.data) ? resp.data : (resp.data as any)?.data || []
    const q = (query || '').toLowerCase()
    if (!q) return data.slice(0, 10)
    return data.filter(
      (m: PolymarketMarket) => (m.question || '').toLowerCase().includes(q)
    ).slice(0, 10)
  } catch (e) {
    console.error('Polymarkets fetch error:', e)
    return []
  }
}

/**
 * Parse trade instruction from natural language (regex-based; can be improved with OpenAI function calling).
 */
export function parseTradeInstruction(message: string): ParsedTrade | null {
  const trimmed = message.trim()
  const longShort = /\b(long|short)\s+(yes|no)?/i.exec(trimmed)
  if (!longShort) return null

  const side = longShort[1].toLowerCase() as 'long' | 'short'
  const outcome = longShort[2]?.toLowerCase() as 'yes' | 'no' | undefined

  const amountMatch = /\$?\s*(\d+(?:\.\d+)?)\s*(?:with|at|,)?\s*(\d+)x\s*leverage/i.exec(trimmed)
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
  const leverage = amountMatch ? parseInt(amountMatch[2], 10) : 1

  const stopMatch = /stop\s*loss\s*(?:at)?\s*(\d+(?:\.\d+)?)\s*c?/i.exec(trimmed)
  const tpMatch = /take\s*profit\s*(?:at)?\s*(\d+(?:\.\d+)?)\s*c?/i.exec(trimmed)
  const stopLoss = stopMatch ? parseFloat(stopMatch[1]) : null
  const takeProfit = tpMatch ? parseFloat(tpMatch[1]) : null

  const marketMatch = /(?:on|for|market)\s+['"]?([^'"\n]+?)['"]?(?:\s+for\s+\$|\s+with\s+\d|\s+at\s+\d|$)/i.exec(trimmed)
  const market = (marketMatch ? marketMatch[1].trim() : trimmed).replace(/\s+/g, ' ')

  if (!market || amount <= 0) return null

  return { side, outcome, market, amount, leverage, stopLoss, takeProfit }
}

/**
 * Place trade via Shadow Vault API (stub until real endpoint is wired).
 */
export async function placeTrade(
  userId: string,
  payload: {
    side: string
    marketId: string
    amount: number
    leverage: number
    stopLoss: number | null
    takeProfit: number | null
  }
): Promise<{ status: string; message?: string }> {
  if (!SHADOW_VAULT_API_URL) {
    return { status: 'stub', message: 'Shadow Vault trade API not configured. Set SHADOW_VAULT_API_URL to enable live trading.' }
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (SHADOW_VAULT_API_KEY) headers['Authorization'] = `Bearer ${SHADOW_VAULT_API_KEY}`
    const resp = await axios.post(
      SHADOW_VAULT_API_URL.replace(/\/$/, '') + '/trade',
      { userId, ...payload },
      { headers, timeout: 15000 }
    )
    return resp.data && resp.data.status ? resp.data : { status: 'submitted', ...resp.data }
  } catch (e: any) {
    console.error('Place trade error:', e?.response?.data || e)
    return {
      status: 'error',
      message: e?.response?.data?.message || e?.message || 'Trade request failed.'
    }
  }
}

export interface BotResponse {
  reply: string
  tradeIntent?: { side: 'long' | 'short'; amount: number; leverage: number }
}

/** Detect polymarket-only query (no long/short trade). */
function isPolymarketQuery(message: string): boolean {
  const m = message.toLowerCase()
  return (
    /\/polymarket\b/.test(message) ||
    /\bpolymarket\b/.test(m) ||
    /\bodds?\s+(?:for|on)\b/.test(m) ||
    /\bprobability\s+(?:for|of)\b/.test(m) ||
    /\b(?:what(?:'s| is)\s+)?(?:the\s+)?(?:market|price)\s+for\b/.test(m)
  )
}

/** Extract search query for Polymarkets (e.g. "polymarket biden 2024" -> "biden 2024"). */
function extractPolymarketQuery(message: string): string {
  const trimmed = message.trim()
  const withoutCmd = trimmed.replace(/^\/polymarket\s*/i, '').trim()
  const match = withoutCmd.match(/(?:odds?\s+(?:for|on)|probability\s+(?:for|of)|(?:market|price)\s+for)\s+(.+)/i)
  if (match) return match[1].trim()
  if (/\bpolymarket\b/i.test(withoutCmd)) {
    const rest = withoutCmd.replace(/\bpolymarket\b/i, '').trim().replace(/^\s*[-:]\s*/, '')
    return rest || trimmed
  }
  return withoutCmd || trimmed
}

/**
 * Main handler: trade intent → Polymarkets + risk summary + pending; CONFIRM → place trade; polymarket-only → fetch odds; else OpenAI.
 */
export async function handleBotMessage(
  openai: OpenAI | null,
  userId: string,
  message: string
): Promise<BotResponse> {
  const session = getSession(userId)
  const trimmed = message.trim()
  const isConfirm = trimmed.toUpperCase() === 'CONFIRM'

  if (isConfirm && session.pendingTrade && session.pendingMarket) {
    const trade = session.pendingTrade
    const apiPayload = {
      side: trade.side,
      marketId: session.pendingMarket.id,
      amount: trade.amount,
      leverage: trade.leverage,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit
    }
    const result = await placeTrade(userId, apiPayload)
    session.pendingTrade = null
    session.pendingMarket = null
    const statusMsg = result.message ? ` ${result.message}` : ''
    return {
      reply: `Trade placed: ${result.status}.${statusMsg}`,
      tradeIntent: { side: trade.side, amount: trade.amount, leverage: trade.leverage }
    }
  }

  const parsed = parseTradeInstruction(trimmed)
  if (parsed) {
    const markets = await fetchPolymarkets(parsed.market)
    if (markets.length === 0) {
      return { reply: `Couldn't find a Polymarket matching "${parsed.market}". Try a different keyword or check spelling.` }
    }
    const m = markets[0]
    let prices = 'N/A'
    try {
      const arr = m.outcomePrices ? JSON.parse(m.outcomePrices as string) : []
      if (Array.isArray(arr) && arr.length >= 2) {
        prices = `YES ${(parseFloat(arr[0]) * 100).toFixed(0)}c / NO ${(parseFloat(arr[1]) * 100).toFixed(0)}c`
      }
    } catch (_) {}
    const riskFactor = parsed.leverage * (parsed.stopLoss != null ? Math.abs((m.lastTradePrice || 0.5) - parsed.stopLoss / 100) : 0.2)
    const riskNote = `Approx. risk if price hits stop: ${(riskFactor * 100).toFixed(0)}% move may affect margin/liquidation.`
    session.pendingTrade = parsed
    session.pendingMarket = m
    return {
      reply: `Market: "${m.question}"\nCurrent odds: ${prices}\n\nYou want to ${parsed.side} ${parsed.outcome || ''} with $${parsed.amount} at ${parsed.leverage}x leverage${parsed.stopLoss != null ? `, stop loss ${parsed.stopLoss}c` : ''}${parsed.takeProfit != null ? `, take profit ${parsed.takeProfit}c` : ''}.\n${riskNote}\n\nType CONFIRM to execute this trade.`,
      tradeIntent: { side: parsed.side, amount: parsed.amount, leverage: parsed.leverage }
    }
  }

  if (isPolymarketQuery(trimmed)) {
    const query = extractPolymarketQuery(trimmed)
    const markets = await fetchPolymarkets(query)
    if (markets.length === 0) {
      return { reply: `No active Polymarkets found for "${query || 'your query'}". Try different keywords.` }
    }
    const lines = markets.slice(0, 5).map((m) => {
      let prices = 'N/A'
      try {
        const arr = m.outcomePrices ? JSON.parse(m.outcomePrices as string) : []
        if (Array.isArray(arr) && arr.length >= 2) {
          prices = `YES ${(parseFloat(arr[0]) * 100).toFixed(0)}c / NO ${(parseFloat(arr[1]) * 100).toFixed(0)}c`
        }
      } catch (_) {}
      return `• ${m.question}\n  ${prices}`
    })
    return { reply: `Polymarkets (${query || 'recent'}):\n\n${lines.join('\n\n')}` }
  }

  if (!openai) {
    return {
      reply: 'AI chat is not configured on this server (missing OPENAI_API_KEY). Trade shortcuts and Polymarket search still work when applicable.'
    }
  }

  const history = session.history.slice(-MAX_HISTORY)
  const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: trimmed }
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 500,
    temperature: 0.5
  })

  const reply = completion.choices?.[0]?.message?.content ?? 'No response.'
  session.history.push({ role: 'user', content: trimmed })
  session.history.push({ role: 'assistant', content: reply })
  if (session.history.length > MAX_HISTORY * 2) session.history.splice(0, session.history.length - MAX_HISTORY * 2)
  return { reply }
}
