/**
 * Mini trading view - DexScreener-style chart for the swap pair
 */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'
import Chart from 'views/Charts'
import { Dex } from 'config/constants/types'

const ChartBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt2};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  min-height: 260px;
`

interface MiniTradingViewProps {
  tokenAddress: string | undefined
  symbol: string
  dex: Dex
}

export default function MiniTradingView({ tokenAddress, symbol, dex }: MiniTradingViewProps) {

  if (!tokenAddress) {
    return (
      <ChartBox>
        <Flex height="260px" alignItems="center" justifyContent="center">
          <Text color="textSubtle" fontSize="14px">
            Select a token to view chart
          </Text>
        </Flex>
      </ChartBox>
    )
  }

  return (
    <ChartBox>
      <Flex
        px="12px"
        py="8px"
        borderBottom="1px solid"
        borderColor="cardBorder"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text bold fontSize="14px" color="text">
          {symbol} Chart
        </Text>
      </Flex>
      <Flex p="8px">
        <Chart
          token={tokenAddress}
          symbol={symbol}
          setH="280px"
          setW="100%"
          show={false}
          dex={dex}
        />
      </Flex>
    </ChartBox>
  )
}
