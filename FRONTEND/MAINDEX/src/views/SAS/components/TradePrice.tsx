import React from 'react'
import { Price } from 'sdk'
import { Text, AutoRenewIcon } from 'uikit'
import BigNumber from 'bignumber.js'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { StyledBalanceMaxMini } from './styleds'
import { Dex } from 'config/constants/types'
import { getPublicClient } from '@wagmi/core'
import { config } from 'wagmiConfig'

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
  dex: Dex
}

export default function TradePrice({ price, showInverted, setShowInverted, dex }: TradePriceProps) {
  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)
  const client = getPublicClient(config, {chainId: dex.chainId})
  const nativeSymbol = client.chain.nativeCurrency.symbol
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`
    : `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`

  const bnbPrice = usePriceBnbBusd(dex)
  const showUSD = price?.quoteCurrency.symbol === nativeSymbol || price?.baseCurrency.symbol === nativeSymbol

  const usdPrice =
    (showInverted && price?.baseCurrency.symbol === nativeSymbol) || (!showInverted && price?.quoteCurrency.symbol === nativeSymbol)
      ? new BigNumber(formattedPrice).dividedBy(bnbPrice.toString()).toFixed(8)
      : new BigNumber(formattedPrice).multipliedBy(bnbPrice.toString()).toFixed(8)

  const labelUSD =
    (showInverted && price?.baseCurrency.symbol === nativeSymbol) || (!showInverted && price?.quoteCurrency.symbol === nativeSymbol)
      ? ` ${
          price?.quoteCurrency?.symbol === nativeSymbol ? price?.baseCurrency?.symbol : price?.quoteCurrency?.symbol
        } per USD `
      : ` USD per ${
          price?.quoteCurrency?.symbol === nativeSymbol ? price?.baseCurrency?.symbol : price?.quoteCurrency?.symbol
        }`

  return (
    <Text style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      {show ? (
        <>
          {formattedPrice ?? '-'} {label}
          <br />
          {showUSD && `${usdPrice} ${labelUSD}`}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <AutoRenewIcon width="14px" />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
