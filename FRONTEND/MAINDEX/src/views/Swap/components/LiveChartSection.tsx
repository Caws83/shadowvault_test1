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
  min-height: 420px;
  background: #0d0d0d;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
`

const TRADINGVIEW_SYMBOLS = ['BNB', 'ETH', 'BTC', 'WBNB', 'WETH', 'TNEON']

interface LiveChartSectionProps {
  tokenAddress: string | undefined
  symbol: string
  dex: Dex
  height?: string
}

export default function LiveChartSection({ tokenAddress, symbol, dex, height = '420px' }: LiveChartSectionProps) {
  const [pairAddress, setPairAddress] = useState<Address>(zeroAddress)
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

  const useTradingView = TRADINGVIEW_SYMBOLS.includes(symbol)

  if (!tokenAddress || !symbol) {
    return (
      <ChartWrap>
        <Flex height="400px" alignItems="center" justifyContent="center">
          <Text color="textSubtle">Select a token to view chart</Text>
        </Flex>
      </ChartWrap>
    )
  }

  if (useTradingView) {
    return (
      <ChartWrap>
        <TradingViewChart symbol={symbol} height={height} />
      </ChartWrap>
    )
  }

  if (pairAddress === zeroAddress) {
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
