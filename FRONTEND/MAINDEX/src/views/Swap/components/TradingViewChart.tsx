import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 400px;
`

const SYMBOL_MAP: Record<string, string> = {
  BNB: 'BINANCE:BNBUSDT',
  ETH: 'BINANCE:ETHUSDT',
  BTC: 'BINANCE:BTCUSDT',
  TNEON: 'BINANCE:BNBUSDT',
  WBNB: 'BINANCE:BNBUSDT',
  WETH: 'BINANCE:ETHUSDT',
}

interface TradingViewChartProps {
  symbol: string
  height?: string
}

export default function TradingViewChart({ symbol, height = '450px' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tvSymbol = SYMBOL_MAP[symbol] ?? 'BINANCE:BNBUSDT'

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

  return (
    <ChartContainer style={{ height }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  )
}
