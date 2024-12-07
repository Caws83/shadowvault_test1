/* eslint-disable react/no-array-index-key */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CurrencyAmount, JSBI, Token, Trade, TradeType } from 'sdk'
import { Button, Text, ArrowDownIcon, Box, useModal, Flex, ChartIcon } from 'uikit'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import { isMobile } from 'components/isMobile'
import { useTranslation } from 'contexts/Localization'
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { Dex } from 'config/constants/types'
// import GraphIndex, { showGraph } from 'views/graphs'
import { dexs, dexList } from 'config/constants/dex'
import { BigNumber } from 'bignumber.js'
import { useGetFactoryTxFee, getFullDivForChain } from 'utils/calls/factory'
import Chart from 'views/Charts'
import AddressInputPanel from './components/AddressInputPanel'
import { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Layout/Column'
import ConfirmSwapModal from './components/ConfirmSwapModal'
import ConfirmSwapModalBest from './components/ConfirmSwapModalBest'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow, RowBetween } from '../../components/Layout/Row'
import AdvancedSwapDetailsDropdown from './components/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from './components/confirmPriceImpactWithoutFee'
import { ArrowWrapper, SwapCallbackError, Wrapper } from './components/styleds'
import TradePrice from './components/TradePrice'
import ImportTokenWarningModal from './components/ImportTokenWarningModal'
import ProgressSteps from './components/ProgressSteps'
import { AppBody } from '../../components/App'
import AppHeader from './components/AppHeader'
import ConnectWalletButton from '../../components/ConnectWalletButton'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../config/constants'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade, useApproveCallbackFromTradeBest } from '../../hooks/useApproveCallback'
import { useSwapCallback, useSwapCallbackBest } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import {
  useExpertModeManager,
  useUserSlippageTolerance,
  useUserDex,
} from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import CircleLoader from '../../components/Loader/CircleLoader'
import Page from './Page'
import { useAccount, usePublicClient } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import contracts from 'config/constants/contracts'
import PageHeader from 'components/PageHeader'



const Label = styled(Text)`
  font-size: 12px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`

const BorderContainer = styled.div`
padding: 6px;  // Adjust the padding as needed
`

const StyledFlexColumn = styled(Flex)`
  flex-direction: column;
  width: 100%;
  margin-top: 20px;
  margin-left: 3%;
  margin-bottom: 20px;
`


export default function Swap({ hideGraph }: { hideGraph?: boolean }) {

  const { t } = useTranslation()
  const { chain } = useAccount()
  const [dex, setDex] = useUserDex()
  const [localDex, setLocalDex] = useState<Dex>(dex)
  const [ color, setColor ] = useState<string>(undefined)

  const loadedUrlParams = useDefaultsFromURLSearch(localDex)

  const [t0, setT0] = useState<string>()
  const [t1, setT1] = useState<string>()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId, localDex.chainId),
    useCurrency(loadedUrlParams?.outputCurrencyId, localDex.chainId),
  ]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )
  const publicClient = usePublicClient({chainId: localDex.chainId})
  const [urlDex, setUrlDex] = useState<Dex>(undefined)

  useEffect(() => {
    if (loadedUrlParams !== undefined && loadedUrlParams.dex !== undefined) {
      const { dex: newDex } = loadedUrlParams
      setUrlDex(newDex)
    }
    if(loadedUrlParams !== undefined && loadedUrlParams.color !== undefined) {
      setColor(loadedUrlParams.color)
    }
    if (
      loadedUrlParams !== undefined &&
      loadedUrlParams.inputCurrencyId !== undefined &&
      loadedUrlParams.inputCurrencyId !== ''
    ) {
      if (loadedUrlParams.inputCurrencyId === publicClient.chain.nativeCurrency.symbol) setT0(getWrappedAddress(localDex.chainId))
      else setT0(loadedUrlParams?.inputCurrencyId)
    }
    if (
      loadedUrlParams !== undefined &&
      loadedUrlParams.outputCurrencyId !== undefined &&
      loadedUrlParams.outputCurrencyId !== ''
    ) {
      if (loadedUrlParams.outputCurrencyId === publicClient.chain.nativeCurrency.symbol) setT1(getWrappedAddress(localDex.chainId))
      else setT1(loadedUrlParams?.outputCurrencyId)
    }
  }, [loadedUrlParams])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens(localDex.chainId)
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens)
    })

  const { address: account } = useAccount()

    const navigate = useNavigate()
  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // Multi Dex
  
  useEffect(() => {
    if (urlDex !== undefined) {
      // setLocalDex(urlDex)
      handleDexChange(urlDex)
    }
  }, [urlDex])
  // const showConnectButton = !account || currentChain !== localDex.chainId
  const showConnectButton = !account || chain?.id !== localDex.chainId
  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  
  const {
    v2Trade: origV2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    allTrades,
  } = useDerivedSwapInfo(dexList, localDex)

  const [ bestTrade, setBT ] = useState<number>(undefined)
  useEffect(() => {
    if(allTrades && allTrades.length > 0){
      for(let i=0; i<allTrades.length; i++) {
        if(isExactIn || allTrades[i]?.tradeType === 0){
          if(allTrades[i] !== null){
            if(bestTrade === undefined && allTrades[i] !== null){
              setBT(i)
              setLocalDex(dexList[i])
            } else if(new BigNumber(allTrades[i].outputAmount.numerator.toString()).gt(allTrades[bestTrade]?.outputAmount?.numerator.toString())) {
              setBT(i)
              setLocalDex(dexList[i])
            }
          }
        }
        if(isExactOut  || allTrades[i]?.tradeType === 1){
          if(allTrades[i] !== null){
            if(bestTrade === undefined && allTrades[i] !== null){
              setBT(i)
              setLocalDex(dexList[i])
            } else if(new BigNumber(allTrades[i].inputAmount.numerator.toString()).lt(allTrades[bestTrade]?.inputAmount?.numerator.toString())){
              setBT(i)
              setLocalDex(dexList[i])
            }
          }
        }
      }
    }
  },[allTrades])

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue, localDex.chainId)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : allTrades[bestTrade]

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      setBT(undefined)
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      setBT(undefined)
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })


  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const spender = dexList[bestTrade]?.isMars ? dexList[bestTrade]?.router : contracts.superRouter
  const [approval, approveCallback] = useApproveCallbackFromTrade(getAddress(spender, localDex.chainId), localDex.chainId, trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
   // errors
   const [showInverted, setShowInverted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  const FLAT_FEE = useGetFactoryTxFee(localDex)
  const divPerChain = getFullDivForChain(localDex)
  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    dexList[bestTrade],
    account,
    FLAT_FEE
  )
  
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(localDex, trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }

    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        console.log(error);
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm])

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])


  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash])



  
  const handleInputSelect = useCallback(
    (inputCurrency, chainId) => {
      setBT(undefined)
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency, chainId)
      setT0(inputCurrency?.symbol === publicClient.chain.nativeCurrency.symbol ? getWrappedAddress(chainId) : inputCurrency.address)
    },
    [onCurrencySelection],
  )

  const [currentClickedPercent, setCurrentClickedPercent] = useState('')

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
      setCurrentClickedPercent('MAX')
    }
  }, [maxAmountInput, onUserInput])

  /*
  const onPercentInput = (percent) => {
    const set = new BigNumber(maxAmountInput.toExact()).multipliedBy(percent).dividedBy(100).toFixed(currencies[Field.INPUT].decimals)
    onUserInput(Field.INPUT, set)
    setCurrentClickedPercent(percent.toString())
  }
*/
const onPercentInput = (percent) => {
  // Calculate the set value
  const set = new BigNumber(maxAmountInput.toExact())
    .multipliedBy(percent)
    .dividedBy(100)
    .toPrecision(15); // Using toPrecision to handle floating-point precision

  // Convert the result to a floating-point number and then limit to 6 decimals
  const setWithMaxDecimals = parseFloat(set).toFixed(6);

  // Remove trailing zeros
  const setWithoutTrailingZeros = setWithMaxDecimals.replace(/(\.[0-9]*[1-9])0+$/, '$1');

  // Call the onUserInput function with the modified value
  onUserInput(Field.INPUT, setWithoutTrailingZeros);

  // Update the current clicked percent
  setCurrentClickedPercent(percent.toString());
};

  const handleOutputSelect = useCallback(
    (outputCurrency, chainId) => {
      setBT(undefined)
      onCurrencySelection(Field.OUTPUT, outputCurrency, chainId)
      setT1(outputCurrency?.symbol === publicClient.chain.nativeCurrency.symbol ? getWrappedAddress(chainId) : outputCurrency.address)
    },

    [onCurrencySelection],
  )

  const swapIsUnsupported = useIsTransactionUnsupported(localDex.chainId, currencies?.INPUT, currencies?.OUTPUT)

  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => navigate('/swap/')} />,
  )

  useEffect(() => {
    if (importTokensNotInDefault.length > 0) {
      onPresentImportTokenWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importTokensNotInDefault.length])

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      originalTrade={tradeToConfirm}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      onConfirm={handleSwap}
      swapErrorMessage={swapErrorMessage}
      dex={dexList[bestTrade]}
      customOnDismiss={handleConfirmDismiss}
    />,
    true,
    true,
    'confirmSwapModal',
  )
 
  

  const handleDexChange = (newDex: Dex) => {
    if (localDex !== newDex) {
      setLocalDex(newDex)
    }
    if (dex !== newDex) {
      setDex(newDex)
    }
  }

  const [chartOption, setChartOption] = useState(4);

  const handleChartIconClick = () => {
    setChartOption((prevOption) => (prevOption % 4) + 1);
  };

  const showT0Chart = t0 && currencies[Field.INPUT]?.symbol && chartOption !== 3 && chartOption !== 4
  const showT1Chart = t1 && currencies[Field.OUTPUT]?.symbol && chartOption !== 2 && chartOption !== 4

  const isExactIn = trade?.tradeType === 0 || allTrades[bestTrade]?.tradeType === 0
  const isExactOut = trade?.tradeType === 1 || allTrades[bestTrade]?.tradeType === 1


  return (
    <>
    
    <Flex flexDirection="row" alignItems={hideGraph ? "center" : undefined} justifyContent={hideGraph ? "center" : undefined}>
      
      {!isMobile && (showT0Chart || showT1Chart) && (
      <StyledFlexColumn>
        {showT0Chart && (
          <BorderContainer >
            <Chart token={t0} symbol={currencies[Field.INPUT].symbol} setH={showT1Chart ? "250px" : "500px"} setW="100%" show dex={localDex} />
          </BorderContainer>
        )}
        {showT1Chart && (
          <BorderContainer>
            <Chart token={t1} symbol={currencies[Field.OUTPUT].symbol} setH={showT0Chart ? "250px" : "500px"} setW="100%" show dex={localDex} />
          </BorderContainer>
        )}
      </StyledFlexColumn>
    )}
   

   <Page hideGraph={true} style={{ width: !isMobile && (showT0Chart || showT1Chart) ? "40%" : "100%" }}>
     

        <AppBody >
        <AppHeader image={localDex.id} currentDex={localDex} UpdateDex={handleDexChange} hideDex={true} color={color} />
          
          <Flex 
            flexDirection="row" 
            justifyContent={FLAT_FEE > 0 ? "space-between" : "flex-end"} 
            marginLeft="5px"  // Adjust the left margin as needed
            marginRight="5px" // Adjust the right margin as needed
          >
          
          {FLAT_FEE > 0 && (
            <Flex flexDirection="row" alignItems="center">
              <Text color="textSubtle" fontSize='14px'>Flat Fee: </Text>
              <Text color={color ? `#${color}` : "secondary"} fontSize='14px'>{`${parseFloat(new BigNumber(FLAT_FEE).shiftedBy(-18).toFixed(5))} ${publicClient.chain.nativeCurrency.symbol}`}</Text>
            </Flex>
          )}
          {divPerChain.gt(0) && (
            <Flex flexDirection="row" alignItems="center">
              <Text color="textSubtle" fontSize='14px'>Dividends Paid: </Text>
              <Text color={color ? `#${color}` : "secondary"} fontSize='14px'>{`${parseFloat(new BigNumber(divPerChain).shiftedBy(-18).toFixed(5))} ${publicClient.chain.nativeCurrency.symbol}`}</Text>
            </Flex>
          )}

          </Flex>

       
          <Wrapper id="swap-page">
            <AutoColumn>
              {t0 && isMobile && currencies[Field.INPUT]?.symbol && !hideGraph &&(
                <Chart token={t0} symbol={currencies[Field.INPUT].symbol} setH="300px" setW="100%" show={false} dex={localDex} />
              )}
              <CurrencyInputPanel
                chainId={localDex.chainId}
                dex={localDex}
                label={independentField === Field.OUTPUT && !showWrap && trade ? t('From (estimated)') : t('From')}
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={false}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                id="swap-currency-input"
              />

              <Flex alignItems="right" justifyContent="right">
                {maxAmountInput &&
                  new BigNumber(maxAmountInput.toExact())?.gt('0') &&
                  [25, 50, 75].map((percent) => {
                    const isAtClickedPercent = currentClickedPercent === percent.toString()

                    return (
                      <Button
                        key={`btn_quickCurrency${percent}`}
                        onClick={() => {
                          onPercentInput(percent)
                        }}
                        scale="xs"
                        mr="5px"
                        variant={isAtClickedPercent ? 'primary' : 'tertiary'}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {percent}%
                      </Button>
                    )
                  })}
                {maxAmountInput && new BigNumber(maxAmountInput.toExact())?.gt('0') && (
                  <Button
                    onClick={() => {
                      handleMaxInput()
                    }}
                    scale="xs"
                    variant={currentClickedPercent === 'MAX' ? 'primary' : 'tertiary'}
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('Max')}
                  </Button>
                )}
              </Flex>

              <AutoColumn justify="space-between">
                <AutoRow justify={isExpertMode ? 'space-between' : 'flex-start'} style={{ padding: '0 1rem' }}>

                {isMobile && !hideGraph && (
                  <ChartIcon
                    width="24px"
                    color={chartOption === 1 ? "primary" : chartOption === 2 ? "secondary" : chartOption === 3 ? "warning" : "failure"}
                    onClick={handleChartIconClick}
                    style={{ cursor: 'pointer' }}
                  />
                )}

                  <ArrowWrapper clickable>
                    <ArrowDownIcon
                      width="24px"
                      onClick={() => {
                        setApprovalSubmitted(false) // reset 2 step UI for approvals
                        onSwitchTokens()
                        setT0(t1)
                        setT1(t0)
                        setBT(undefined)
                      }}
                      color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? 'primary' : 'text'}
                    />
                  </ArrowWrapper>
                  {recipient === null && !showWrap && isExpertMode ? (
                    <Button variant="text" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      {t('+ Add a send (optional)')}
                    </Button>
                  ) : null}
                </AutoRow>
              </AutoColumn>
              {t1 && isMobile && currencies[Field.OUTPUT]?.symbol && !hideGraph && (
                <Chart token={t1} symbol={currencies[Field.OUTPUT].symbol} setH="300px" setW="100%" show={false} dex={localDex} />
              )}
              <CurrencyInputPanel
                chainId={localDex.chainId}
                dex={localDex}
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label={independentField === Field.INPUT && !showWrap && trade ? t('To (estimated)') : t('To')}
                showMaxButton={false}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                id="swap-currency-output"
              />

              {isExpertMode && recipient !== null && !showWrap ? (
                <>
                  <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable={false}>
                      <ArrowDownIcon width="16px" />
                    </ArrowWrapper>
                    <Button variant="text" id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                      {t('- Remove send')}
                    </Button>
                  </AutoRow>
                  <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                </>
              ) : null}

              {showWrap ? null : (
                <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                  {Boolean(trade) && (
                    <RowBetween align="center">
                      <Label>{t('Price')}</Label>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                        dex={localDex}
                      />
                    </RowBetween>
                  )}
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <Label>{t('Slippage Tolerance')}</Label>
                      <Text bold color="primary">
                        {allowedSlippage / 100}%
                      </Text>
                    </RowBetween>
                  )}
                </AutoColumn>
              )}
            </AutoColumn>
            <Box mt="1rem">
              {showConnectButton ? (
               <></>
              ) : swapIsUnsupported ? (
                <Button width="100%" disabled mb="4px">
                  {t('Unsupported Asset')}
                </Button>
              ) : showWrap ? (
                <Button width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                </Button>
              ) : noRoute && userHasSpecifiedInputOutput ? (
                <GreyCard style={{ textAlign: 'center' }}>
                  <Text color="textSubtle" mb="4px">
                    {t('Insufficient liquidity for this trade.')}
                  </Text>
                  
                </GreyCard>
              ) : showApproveFlow ? (
                <RowBetween>
                  <Button
                    variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                    onClick={approveCallback}
                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    width="48%"
                  >
                    {approval === ApprovalState.PENDING ? (
                      <AutoRow gap="6px" justify="center">
                        {t('Enabling')} <CircleLoader stroke="white" />
                      </AutoRow>
                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                      t('Enabled')
                    ) : (
                      t('Enable %asset%', { asset: currencies[Field.INPUT]?.symbol ?? '' })
                    )}
                  </Button>

                  <Button
                    variant={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          txHash: undefined,
                        })
                        onPresentConfirmModal()
                      }
                    }}
                    width="48%"
                    id="swap-button"
                    disabled={
                      !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                    }
                  >
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? t('Price Impact High')
                      : priceImpactSeverity > 2
                      ? t('Swap Anyway')
                      : t('Swap')}
                  </Button>

                  
                </RowBetween>
              ) : (
                
                <Button
                  variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        txHash: undefined,
                      })
                      onPresentConfirmModal()
                    }
                  }}
                  id="swap-button"
                  width="100%"
                  disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                >
                  {swapInputError ||
                    (priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact Too High`
                      : priceImpactSeverity > 2
                      ? t('Swap Anyway')
                      : t('Swap'))}
                </Button>
              )}
              
              {showApproveFlow && (
                <Column style={{ marginTop: '1rem' }}>
                  <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                </Column>
              )}
              {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </Box>
          </Wrapper>
         
      
        </AppBody>

        {!swapIsUnsupported ? (
          <AdvancedSwapDetailsDropdown trade={trade} dex={localDex} />
        ) : (
          <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} chainId={localDex.chainId} />
        )}

      </Page>
    </Flex>
    </>
  )
}
