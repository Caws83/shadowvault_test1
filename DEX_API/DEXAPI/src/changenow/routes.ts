/**
 * ChangeNOW swap API — server-side only. Keys stay in env; browser calls `/api/changenow/*` on this backend.
 * Paths and payloads follow ChangeNOW REST (v2 primary, v1 fallback).
 */
import type { Express, Request, Response } from 'express'
import { resolveChangeNowConfig } from '../env/envRead'

const resolved = resolveChangeNowConfig()
const CHANGENOW_BASE_URL = resolved.baseUrl
const CHANGENOW_API_KEY = resolved.apiKey

type ChangeNowAttempt = {
  method: 'GET' | 'POST'
  path: string
  query?: Record<string, string>
  body?: Record<string, unknown>
}

const withApiKey = (query: Record<string, string> = {}) => {
  if (!CHANGENOW_API_KEY) return query
  return { ...query, api_key: CHANGENOW_API_KEY }
}

async function callChangeNow(attempt: ChangeNowAttempt): Promise<unknown> {
  const url = new URL(`${CHANGENOW_BASE_URL}${attempt.path}`)
  const query = withApiKey(attempt.query)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url.toString(), {
    method: attempt.method,
    headers: {
      'Content-Type': 'application/json',
      ...(CHANGENOW_API_KEY ? { 'x-changenow-api-key': CHANGENOW_API_KEY } : {}),
    },
    ...(attempt.method === 'POST' ? { body: JSON.stringify(attempt.body || {}) } : {}),
  })

  const rawBody = await response.text()
  let parsedBody: unknown = rawBody
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    parsedBody = rawBody
  }

  if (!response.ok) {
    throw new Error(
      `[${response.status}] ${typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody)}`,
    )
  }

  return parsedBody
}

async function callChangeNowWithFallback(attempts: ChangeNowAttempt[]): Promise<unknown> {
  const errors: string[] = []
  for (const attempt of attempts) {
    try {
      return await callChangeNow(attempt)
    } catch (err) {
      errors.push(`${attempt.method} ${attempt.path}: ${(err as Error).message}`)
    }
  }
  throw new Error(errors.join(' | '))
}

export function mountChangeNowApi(app: Express): void {
  app.get('/api/changenow/currencies', async (_req: Request, res: Response) => {
    if (!CHANGENOW_API_KEY) {
      return res.status(500).json({ error: 'CHANGENOW_API_KEY is not configured' })
    }
    try {
      const data = await callChangeNowWithFallback([
        {
          method: 'GET',
          path: '/v2/exchange/currencies',
          query: { active: 'true', flow: 'standard' },
        },
        {
          method: 'GET',
          path: '/v1/currencies',
          query: { active: 'true' },
        },
      ])
      return res.json(data)
    } catch (error) {
      console.error('ChangeNOW currencies error:', error)
      return res.status(500).json({ error: 'Failed to fetch ChangeNOW currencies' })
    }
  })

  app.get('/api/changenow/estimate', async (req: Request, res: Response) => {
    if (!CHANGENOW_API_KEY) {
      return res.status(500).json({ error: 'CHANGENOW_API_KEY is not configured' })
    }

    const from = (req.query.from as string)?.toLowerCase()
    const to = (req.query.to as string)?.toLowerCase()
    const amount = req.query.amount as string
    const fromNetwork = (req.query.fromNetwork as string)?.toLowerCase()
    const toNetwork = (req.query.toNetwork as string)?.toLowerCase()

    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'from, to and amount are required' })
    }

    try {
      const data = await callChangeNowWithFallback([
        {
          method: 'GET',
          path: '/v2/exchange/estimated-amount',
          query: {
            fromCurrency: from,
            toCurrency: to,
            ...(fromNetwork ? { fromNetwork } : {}),
            ...(toNetwork ? { toNetwork } : {}),
            fromAmount: amount,
            flow: 'standard',
          },
        },
        {
          method: 'GET',
          path: `/v1/exchange-amount/${amount}/${from}_${to}`,
        },
      ])
      return res.json(data)
    } catch (error) {
      console.error('ChangeNOW estimate error:', error)
      return res.status(500).json({ error: 'Failed to estimate ChangeNOW swap' })
    }
  })

  app.post('/api/changenow/transaction', async (req: Request, res: Response) => {
    if (!CHANGENOW_API_KEY) {
      return res.status(500).json({ error: 'CHANGENOW_API_KEY is not configured' })
    }

    const from = (req.body.from as string)?.toLowerCase()
    const to = (req.body.to as string)?.toLowerCase()
    const fromNetwork = (req.body.fromNetwork as string)?.toLowerCase()
    const toNetwork = (req.body.toNetwork as string)?.toLowerCase()
    const amount = req.body.amount as string
    const address = req.body.address as string
    const refundAddress = (req.body.refundAddress as string) || address

    if (!from || !to || !amount || !address) {
      return res.status(400).json({ error: 'from, to, amount and address are required' })
    }

    try {
      const data = await callChangeNowWithFallback([
        {
          method: 'POST',
          path: '/v2/exchange',
          body: {
            fromCurrency: from,
            toCurrency: to,
            ...(fromNetwork ? { fromNetwork } : {}),
            ...(toNetwork ? { toNetwork } : {}),
            fromAmount: amount,
            address,
            refundAddress,
            flow: 'standard',
            type: 'direct',
          },
        },
        {
          method: 'POST',
          path: '/v1/transactions',
          body: {
            from,
            to,
            amount,
            address,
            refundAddress,
          },
        },
      ])
      return res.json(data)
    } catch (error) {
      console.error('ChangeNOW create transaction error:', error)
      return res.status(500).json({
        error: (error as Error)?.message || 'Failed to create ChangeNOW transaction',
      })
    }
  })

  app.get('/api/changenow/status/:id', async (req: Request, res: Response) => {
    if (!CHANGENOW_API_KEY) {
      return res.status(500).json({ error: 'CHANGENOW_API_KEY is not configured' })
    }

    const id = req.params.id
    if (!id) {
      return res.status(400).json({ error: 'transaction id is required' })
    }

    try {
      const data = await callChangeNowWithFallback([
        {
          method: 'GET',
          path: '/v2/exchange/by-id',
          query: { id },
        },
        {
          method: 'GET',
          path: `/v1/transactions/${id}`,
        },
      ])
      return res.json(data)
    } catch (error) {
      console.error('ChangeNOW status error:', error)
      return res.status(500).json({ error: 'Failed to fetch ChangeNOW transaction status' })
    }
  })
}
