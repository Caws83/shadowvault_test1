import React, { useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Trade, TradeType } from 'sdk'
import { Button, Text, Flex } from 'uikit'
import { Field } from 'state/swap/actions'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity,
} from 'utils/prices'
import { useGetFactoryTxFee } from 'utils/calls/factory'
import { AutoColumn } from 'components/Layout/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { Dex } from 'config/constants/types'
import FormattedPriceImpact from './FormattedPriceImpact'
import { SwapCallbackError } from './styleds'
import { useFetchSwapRequest } from 'hooks/useSwapCallback'
import { useAccount } from 'wagmi'
import { useGasTokenManager } from 'state/user/hooks'
import PayMasterPreview from 'components/Menu/UserMenu/payMasterPreview'
import { usePaymaster } from 'hooks/usePaymaster'
import { getAddress } from 'utils/addressHelpers'
import { useApproveCallbackFromTrade } from 'hooks/useApproveCallback'

const SwapModalFooterContainer = styled(AutoColumn)`
  margin-top: 24px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.default};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
`

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
  dex,
  isApproved
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
  dex: Dex
  isApproved: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const [disabledDoToPM, setDTTPM] = useState(true)
  const { fetchPaymaster } = usePaymaster()
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage, dex.chainId),
    [allowedSlippage, trade, dex.chainId],
  )
  const [payWithPM, setUsePaymaster, payToken, setPaytoken] = useGasTokenManager()
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(dex, trade), [trade, dex])
  const { address } = useAccount()
  const severity = warningSeverity(priceImpactWithoutFee)
  const FLAT_FEE = useGetFactoryTxFee(dex)
  const { request, error } = useFetchSwapRequest(trade, allowedSlippage, dex, address, FLAT_FEE)
  const [paymasterInfo, setPaymasterInfo] = useState<any | null>(null)
  const [ entireError, setEntireError ] = useState<string>(null)
  
  const [approval, approveCallback, getRequestCallback] = useApproveCallbackFromTrade(
    getAddress(dex.router, dex.chainId),
    dex.chainId,
    trade,
    allowedSlippage,
  )
  
  useEffect(() => {
    setEntireError(undefined)
    const fetchRequest = async () => {
      try {
        if (request && payWithPM) {
          let result
          if(isApproved){
            result = await request();
            console.log(result)
          } else {
            result = await getRequestCallback()
          }
          const info = await fetchPaymaster(result)
          setPaymasterInfo(info)
        } else {
          setPaymasterInfo(undefined)
        }
      } catch (e: any) {
        console.error('Error fetching swap request:', e);
        setEntireError(e.message)
        setDTTPM(false)
        setPaymasterInfo(undefined)
      }
    };

    fetchRequest();
  }, [request, trade, dex, address, payWithPM, payToken]); // Dependencies for the effect

  const handleDisableStatusChange = (disabled: boolean) => {
    setDTTPM(disabled)
  }

  return (
    <>
      <SwapModalFooterContainer>
        <RowBetween align="center">
          <Text fontSize="10px">Price</Text>
          <Text fontSize="10px">
            {formatExecutionPrice(trade, showInverted)}
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <Text fontSize="10px">
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </Text>
            <QuestionHelper
              text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
              ml="4px"
            />
          </RowFixed>
          <RowFixed>
            <Text fontSize="10px">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </Text>
            <Text fontSize="10px" marginLeft="4px">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <Text fontSize="10px">Price Impact</Text>
            <QuestionHelper text="The difference between the market price and your price due to trade size." ml="4px" />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>


          
        

      </SwapModalFooterContainer>
      <PayMasterPreview paymasterInfo={paymasterInfo} dex={dex} isApproved={isApproved} onDisableStatusChange={handleDisableStatusChange} error={!isApproved ? "Approval Will send first. Expect 2 txs." : entireError}/>

      <Flex justifyContent="center" alignItems="center" mt="30px" mb="20px">
        <Button
          variant={severity > 2 ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={disabledConfirm || (disabledDoToPM && isApproved)}
          mt="12px"
          id="confirm-swap-or-send"
        >
          {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
        </Button>
      </Flex>
      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </>
  )
}
