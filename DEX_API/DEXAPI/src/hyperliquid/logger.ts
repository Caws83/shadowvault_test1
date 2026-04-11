/** Structured prefix logging for Hyperliquid integration (server-side only). */

const PREFIX = '[hyperliquid]'

export const hlLog = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (meta && Object.keys(meta).length) {
      console.log(PREFIX, msg, meta)
    } else {
      console.log(PREFIX, msg)
    }
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    if (meta && Object.keys(meta).length) {
      console.warn(PREFIX, msg, meta)
    } else {
      console.warn(PREFIX, msg)
    }
  },
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => {
    const base = { ...meta, err: err instanceof Error ? err.message : err }
    console.error(PREFIX, msg, base)
  },
}
