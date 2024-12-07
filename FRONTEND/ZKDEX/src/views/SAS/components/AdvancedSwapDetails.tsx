import React from 'react'
import { JSBI, Trade, TradeType } from 'sdk'
// import { BigNumber } from 'bignumber.js'
import { Text } from 'uikit'
import { Field } from 'state/swap/actions'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from 'utils/prices'
// import { useGetFactoryTxFee } from 'utils/calls/factory'
import { AutoColumn } from 'components/Layout/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { Dex } from 'config/constants/types'
// import { dexs } from 'config/constants/dex'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'
// import { getPublicClient } from '@wagmi/core'

function TradeSummary({ trade, allowedSlippage, dex }: { trade: Trade; allowedSlippage: number; dex: Dex }) {
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(dex, trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage, dex.chainId)
  // const isFarm = dex === dexs.marswap || dexs.marswapbsc
  // const FLAT_FEE = useGetFactoryTxFee(dex)
  // const client = getPublicClient(config, {chainId: dex.chainId})

  // const fullFee = FLAT_FEE * trade.route.pairs.length - 1
  // const inputIsEth = trade.inputAmount.currency.symbol === client.chain.nativeCurrency.symbol
  // const inputIsOverThreshhold = JSBI.toNumber(trade.inputAmount.raw) > fullFee * 50
  // const isEthAndAboveThreshhold = inputIsOverThreshhold && inputIsEth
  // const showFlatFee = isEthAndAboveThreshhold || !inputIsEth

  // const [onPresentGraph] = useModal(<GraphModal t0={trade.route.path[0].address} t1={trade.route.path[1].address} dex={dex} />)

  return (
    <AutoColumn style={{ padding: '0 16px' }}>
      <RowBetween>
        <RowFixed>
          <Text fontSize="14px" color="textSubtle">
            {isExactIn ? 'Minimum received' : 'Maximum sold'}
          </Text>
          <QuestionHelper
            text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
            ml="4px"
          />
        </RowFixed>
        <RowFixed>
          <Text fontSize="14px">
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                '-'
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ?? '-'}
          </Text>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <Text fontSize="14px" color="textSubtle">
            Price Impact
          </Text>
          <QuestionHelper
            text="The difference between the market price and estimated price due to trade size."
            ml="4px"
          />
        </RowFixed>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </RowBetween>

    </AutoColumn>
  )
}

export interface AdvancedSwapDetailsProps {
  dex: Dex
  trade?: Trade
}

export function AdvancedSwapDetails({ dex, trade }: AdvancedSwapDetailsProps) {
  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <AutoColumn gap="0px">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} dex={dex} />
          {showRoute && (
            <>
              <RowBetween style={{ padding: '0 16px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Text fontSize="14px" color="textSubtle">
                    Route
                  </Text>
                  <QuestionHelper
                    text="Routing through these tokens resulted in the best price for your trade."
                    ml="4px"
                  />
                </span>
                <SwapRoute trade={trade} />
              </RowBetween>
            </>
          )}
        </>
      )}
    </AutoColumn>
  )
}
