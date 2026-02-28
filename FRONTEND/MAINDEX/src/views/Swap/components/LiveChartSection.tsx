/**
 * Live chart - TradingView for known pairs, DEXTools for DEX pairs
 */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'
import Chart from 'views/Charts'
import TradingViewChart from './TradingViewChart'
import { Dex } from 'config/constants/types'
import { dexList } from 'config/constants/dex'
import { Address, zeroAddress } from 'viem'
import { readContract } from '@wagmi/core'
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { farmFactoryAbi } from 'config/abi/farmFactory'
import tokens from 'config/constants/tokens'
import { config } from 'wagmiConfig'

const ChartWrap = styled.div`
  width: 100%;
  flex: 1;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
`

const ChartTabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 12px;
`

const ChartTab = styled.button<{ active?: boolean }>`
  padding: 12px 16px;
  background: none;
  border: none;
  color: ${({ active }) => (active ? '#fff' : 'rgba(255,255,255,0.5)')};
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid ${({ active }) => (active ? '#9c4545' : 'transparent')};
  margin-bottom: -1px;
`

const TRADINGVIEW_SYMBOLS = ['BNB', 'ETH', 'BTC', 'WBNB', 'WETH', 'TNEON', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC', 'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'ETC', 'XLM', 'ALGO', 'NEAR', 'APT', 'ARB', 'OP', 'SUI', 'SEI', 'INJ', 'TIA', 'PEPE', 'SHIB']

interface LiveChartSectionProps {
  tokenAddress: string | undefined
  symbol: string
  dex: Dex
  height?: string
  chartSymbol?: string
  onChartSymbolChange?: (s: string) => void
}

export default function LiveChartSection({ tokenAddress, symbol, dex, height = '420px', chartSymbol, onChartSymbolChange }: LiveChartSectionProps) {
  const [pairAddress, setPairAddress] = useState<Address>(zeroAddress)
  const [activeChartTab, setActiveChartTab] = useState<'chart' | 'about' | 'news' | 'data'>('chart')
  const chainId = dex.chainId

  useEffect(() => {
    if (!tokenAddress) return

    const native = getWrappedAddress(chainId)
    const usd = getAddress(tokens.usdForChat?.address ?? tokens.wneon?.address ?? '', chainId)

    const run = async () => {
      for (const d of dexList) {
        if (d.chainId !== chainId) continue
        const factory = getAddress(d.factory, chainId)
        const abi = d.dexABI ?? farmFactoryAbi
        try {
          const p = await readContract(config, {
            abi: abi as any,
            address: factory,
            functionName: 'getPair',
            args: [tokenAddress as Address, native],
            chainId,
          })
          if (p && p !== zeroAddress) {
            setPairAddress(p)
            return
          }
        } catch {}
        try {
          if (usd) {
            const p = await readContract(config, {
              abi: abi as any,
              address: factory,
              functionName: 'getPair',
              args: [tokenAddress as Address, usd],
              chainId,
            })
            if (p && p !== zeroAddress) setPairAddress(p)
          }
        } catch {}
      }
    }
    run()
  }, [tokenAddress, chainId])

  const displaySymbol = chartSymbol || symbol
  const useTradingView = TRADINGVIEW_SYMBOLS.includes(displaySymbol) || (!!chartSymbol && displaySymbol.length <= 10)

  if (!displaySymbol && !tokenAddress) {
    return (
      <ChartWrap>
        <Flex height="400px" alignItems="center" justifyContent="center">
          <Text color="textSubtle">Select a token or search a crypto to view chart</Text>
        </Flex>
      </ChartWrap>
    )
  }

  if (useTradingView) {
    return (
      <ChartWrap>
        <ChartTabs>
          <ChartTab active={activeChartTab === 'chart'} onClick={() => setActiveChartTab('chart')}>Chart</ChartTab>
          <ChartTab active={activeChartTab === 'about'} onClick={() => setActiveChartTab('about')}>About</ChartTab>
          <ChartTab active={activeChartTab === 'news'} onClick={() => setActiveChartTab('news')}>News</ChartTab>
          <ChartTab active={activeChartTab === 'data'} onClick={() => setActiveChartTab('data')}>Trading data</ChartTab>
        </ChartTabs>
        {activeChartTab === 'chart' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <TradingViewChart symbol={displaySymbol} onSymbolChange={onChartSymbolChange} searchable fill />
          </div>
        )}
        {activeChartTab !== 'chart' && (
          <Flex height="380px" alignItems="center" justifyContent="center" flexDirection="column" p="24px">
            <Text color="textSubtle" fontSize="14px">
              {activeChartTab === 'about' && 'Token info & contract details'}
              {activeChartTab === 'news' && 'Latest news & announcements'}
              {activeChartTab === 'data' && '24h volume, funding, open interest'}
            </Text>
            <Text color="textSubtle" fontSize="12px" mt="8px">Coming soon</Text>
          </Flex>
        )}
      </ChartWrap>
    )
  }

  if (pairAddress === zeroAddress && tokenAddress) {
    return (
      <ChartWrap>
        <Flex height="400px" alignItems="center" justifyContent="center">
          <Text color="textSubtle">No chart data for {symbol}</Text>
        </Flex>
      </ChartWrap>
    )
  }

  return (
    <ChartWrap>
      <div style={{ padding: 8 }}>
        <Chart token={tokenAddress} symbol={symbol} setH={height} setW="100%" show={false} dex={dex} />
      </div>
    </ChartWrap>
  )
}
