import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const ChartContainer = styled.div<{ fill?: boolean }>`
  width: 100%;
  height: ${({ fill }) => (fill ? '100%' : '450px')};
  min-height: ${({ fill }) => (fill ? '380px' : '400px')};
  display: flex;
  flex-direction: column;
  flex: ${({ fill }) => (fill ? 1 : 'none')};
`

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
`

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  max-width: 140px;

  &::placeholder {
    color: rgba(255,255,255,0.4);
  }
`

const SYMBOL_MAP: Record<string, string> = {
  BNB: 'BINANCE:BNBUSDT',
  ETH: 'BINANCE:ETHUSDT',
  BTC: 'BINANCE:BTCUSDT',
  TNEON: 'BINANCE:BNBUSDT',
  WBNB: 'BINANCE:BNBUSDT',
  WETH: 'BINANCE:ETHUSDT',
  SOL: 'BINANCE:SOLUSDT',
  XRP: 'BINANCE:XRPUSDT',
  ADA: 'BINANCE:ADAUSDT',
  DOGE: 'BINANCE:DOGEUSDT',
  AVAX: 'BINANCE:AVAXUSDT',
  DOT: 'BINANCE:DOTUSDT',
  MATIC: 'BINANCE:MATICUSDT',
  LINK: 'BINANCE:LINKUSDT',
  UNI: 'BINANCE:UNIUSDT',
  ATOM: 'BINANCE:ATOMUSDT',
  LTC: 'BINANCE:LTCUSDT',
  BCH: 'BINANCE:BCHUSDT',
  XLM: 'BINANCE:XLMUSDT',
  ALGO: 'BINANCE:ALGOUSDT',
  NEAR: 'BINANCE:NEARUSDT',
  APT: 'BINANCE:APTUSDT',
  ARB: 'BINANCE:ARBUSDT',
  OP: 'BINANCE:OPUSDT',
  SUI: 'BINANCE:SUIUSDT',
  SEI: 'BINANCE:SEIUSDT',
  INJ: 'BINANCE:INJUSDT',
  TIA: 'BINANCE:TIAUSDT',
  PEPE: 'BINANCE:PEPEUSDT',
  SHIB: 'BINANCE:SHIBUSDT',
  FLOKI: 'BINANCE:FLOKIUSDT',
  TRX: 'BINANCE:TRXUSDT',
  FIL: 'BINANCE:FILUSDT',
  LDO: 'BINANCE:LDOUSDT',
  MKR: 'BINANCE:MKRUSDT',
  AAVE: 'BINANCE:AAVEUSDT',
  CRV: 'BINANCE:CRVUSDT',
}

function symbolToTradingView(s: string): string {
  const upper = s?.toUpperCase?.()?.replace(/\s/g, '') || ''
  if (SYMBOL_MAP[upper]) return SYMBOL_MAP[upper]
  if (upper.length <= 8) return `BINANCE:${upper}USDT`
  return 'BINANCE:BTCUSDT'
}

interface TradingViewChartProps {
  symbol: string
  height?: string
  searchable?: boolean
  fill?: boolean
  onSymbolChange?: (s: string) => void
}

export default function TradingViewChart({ symbol, height = '450px', searchable, fill, onSymbolChange }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchVal, setSearchVal] = useState('')
  const tvSymbol = symbolToTradingView(symbol || searchVal || 'BTC')

  useEffect(() => {
    if (!containerRef.current) return
    const id = 'tv_chart_' + Math.random().toString(36).slice(2)
    containerRef.current.id = id

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      const w = window as any
      if (!w.TradingView) return
      new w.TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: 'D',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#1a1a1a',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: id,
      })
    }
    document.head.appendChild(script)
    return () => {
      const el = document.getElementById(id)
      if (el) el.innerHTML = ''
    }
  }, [tvSymbol])

  const handleSearch = () => {
    const s = searchVal.trim().toUpperCase()
    if (s) {
      onSymbolChange?.(s)
    }
  }

  return (
    <ChartContainer fill={!!fill}>
      {searchable && (
        <SearchWrap>
          <SearchInput
            placeholder="Search crypto (e.g. SOL, PEPE)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            type="button"
            onClick={handleSearch}
            style={{
              padding: '8px 14px',
              background: '#9c4545',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Go
          </button>
        </SearchWrap>
      )}
      <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: 0 }} />
    </ChartContainer>
  )
}
