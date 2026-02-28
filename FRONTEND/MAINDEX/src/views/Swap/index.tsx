/* eslint-disable react/no-array-index-key */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CurrencyAmount, JSBI, Token, Trade } from 'sdk'
import { Button, Text, Box, useModal, Flex, Card, CardHeader, TextHeader } from 'uikit'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useTranslation } from 'contexts/Localization'
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { Dex } from 'config/constants/types'
// import GraphIndex, { showGraph } from 'views/graphs'
import { dexs, dexList } from 'config/constants/dex'
import { BigNumber } from 'bignumber.js'
import { useGetFactoryTxFee } from 'utils/calls/factory'
import { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Layout/Column'
import ConfirmSwapModal from './components/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow, RowBetween } from '../../components/Layout/Row'
import confirmPriceImpactWithoutFee from './components/confirmPriceImpactWithoutFee'
import { ArrowWrapper, Wrapper } from './components/styleds'
import ImportTokenWarningModal from './components/ImportTokenWarningModal'
import ProgressSteps from './components/ProgressSteps'
import { AppBody } from '../../components/App'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../config/constants'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useFetchSwapRequest, useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useUserSlippageTolerance, useUserDex, useGasTokenManager } from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import CircleLoader from '../../components/Loader/CircleLoader'
import Page from '../Page'
import { useAccount, usePublicClient } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'
import { defaultChainId } from 'config/constants/chains'
import FormattedPriceImpact from './components/FormattedPriceImpact'
import PMTokenSelector from 'components/Menu/UserMenu/payMasterSelectButton'
import { usePaymaster } from 'hooks/usePaymaster'
import PayMasterPreview from 'components/Menu/UserMenu/payMasterPreview'
import { MdSwapVerticalCircle } from "react-icons/md"
import LeverageModeSelector from './components/LeverageModeSelector'
import LiveChartSection from './components/LiveChartSection'
import TradeModeDropdown, { TradeMode } from './components/TradeModeDropdown'
import ChainSelector from './components/ChainSelector'
import OrderBook from './components/OrderBook'
import BitgetTradePanel from './components/BitgetTradePanel'
import PairSelectorDropdown from './components/PairSelectorDropdown'
import { LeverageMode } from 'features/ai-agent/types'
import CopyAddress from 'components/Menu/UserMenu/CopyAddress'
import useToast from 'hooks/useToast'

const Label = styled(Text)`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`
export const MenuWrapper = styled(Card)`
  border-radius: 10px;
`

const StyledCardHeader = styled(CardHeader)`
  background: #1b1b1f;
  border-bottom: 1px solid #3c3f44;
  padding: 0;
`;

const HeaderContainer = styled(Flex)`
  width: 100%;
  padding: 24px;
  background: #1b1b1f;
  padding-left: 48px;
`;

const StyledButton = styled(Button)`
  background-image: linear-gradient(9deg, rgb(156, 69, 69) 0%, rgb(110, 40, 40) 100%);
  color: white;
`

const AnimatedBorderBox = styled.div`
  position: relative;
  border-radius: 24px;
  padding: 4px;
  background: linear-gradient(90deg, #000000, #9c4545, #6e2828, #9c4545, #000000);
  background-size: 200% 100%;
  animation: gradient 4s linear infinite;
  box-shadow: 0 0 20px rgba(156, 69, 69, 0.25);

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }
`

const SwapPageLayout = styled.div`
  display: flex;
  width: 100%;
  max-width: 1600px;
  gap: 12px;
  min-height: 640px;
  flex-direction: row;
  flex-wrap: wrap;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`

const ChartPane = styled.div`
  flex: 1;
  min-width: 500px;
  background: #0d0d0d;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;

  @media (max-width: 968px) {
    min-width: 100%;
    min-height: 400px;
  }
`

const OrderBookPane = styled.div`
  width: 300px;
  min-width: 260px;

  @media (max-width: 1200px) {
    width: 100%;
    min-width: 100%;
  }
`

const TradePane = styled.div`
  width: 380px;
  min-width: 340px;

  @media (max-width: 968px) {
    width: 100%;
    min-width: 100%;
  }
`

const ChartSection = styled.div`
  width: 100%;
  flex: 1;
  min-height: 380px;
  display: flex;
  flex-direction: column;
`

const ChartHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`

const SwapBody = styled.div`
  width: 100%;
  max-width: 1400px;
  z-index: 1;
  background: transparent;
  overflow: hidden;
`

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  background: #1a1a1a;
  border-radius: 10px;
  margin-bottom: 12px;

  > * {
    flex-shrink: 0;
  }
`

const FeeBadge = styled.span`
  padding: 8px 14px;
  background: rgba(156, 69, 69, 0.15);
  border-radius: 8px;
  font-size: 13px;
  color: #9c4545;
  white-space: nowrap;
`

export default function Swap () {
  const { t } = useTranslation()
  const { chain } = useAccount()
  const [dex, setDex] = useUserDex()
  const [amountInp, setAmountInp] = useState<string | null>(null)
  const [autoAI, setAutoAI] = useState<boolean>(false)
  const [tradeMode, setTradeMode] = useState<TradeMode>('PUBLIC')
  const [leverageMode, setLeverageMode] = useState<LeverageMode>(LeverageMode.SAFE)
  const [orderType, setOrderType] = useState<'limit' | 'market'>('market')
  const [marginMode, setMarginMode] = useState<'isolated' | 'cross'>('isolated')
  const [leverage, setLeverage] = useState(10)
  const [tradeModeUI, setTradeModeUI] = useState<'open' | 'close'>('open')
  const [limitPrice, setLimitPrice] = useState('')
  const [quantityPercent, setQuantityPercent] = useState(0)
  const [chartSymbol, setChartSymbol] = useState('')
  

  useEffect(() => {
    const fetchData = async () => {
      const chainId = chain?.id ?? defaultChainId
      const hashParams = new URL(window.location.href).hash.split('?')[1];
      const urlParams = new URLSearchParams(hashParams);
      const outputToken = urlParams.get('outputToken');
      const inputToken = urlParams.get('inputToken');
      const amountInput = urlParams.get('amount');
      const auto = urlParams.get('auto');

      if (outputToken) {
        const calls = [
          {
            abi: ERC20_ABI,
            address: outputToken,
            functionName: 'decimals',
            chainId: chainId,
          },
          {
            abi: ERC20_ABI,
            address: outputToken,
            functionName: 'symbol',
            chainId: chainId,
          },
          {
            abi: ERC20_ABI,
            address: outputToken,
            functionName: 'name',
            chainId: chainId,
          }
        ];
        
        // Await the readContracts call
        const symbols = await readContracts(config, { contracts: calls });
        // Ensure symbols array is valid before accessing
        if (symbols && symbols.length > 0) {
          onCurrencySelection(Field.OUTPUT, new Token(chainId, outputToken, Number(symbols[0].result.toString()), String(symbols[1].result), String(symbols[2].result)), chainId)
        }
      }

      if (inputToken) {
        const calls = [
          {
            abi: ERC20_ABI,
            address: inputToken,
            functionName: 'decimals',
            chainId: chainId,
          },
          {
            abi: ERC20_ABI,
            address: inputToken,
            functionName: 'symbol',
            chainId: chainId,
          },
          {
            abi: ERC20_ABI,
            address: inputToken,
            functionName: 'name',
            chainId: chainId,
          }
        ];
        // Await the readContracts call
        const symbols = await readContracts(config, { contracts: calls });
        // Ensure symbols array is valid before accessing
        if (symbols && symbols.length > 0) {
          onCurrencySelection(Field.INPUT, new Token(chainId, inputToken, Number(symbols[0].result.toString()), String(symbols[1].result), String(symbols[2].result)), chainId)
        }
      }

      if (amountInput) {
        setAmountInp(amountInput);
      }

      if (auto) {
        setAutoAI(true);
      }
    };

    // Call the fetchData function
    fetchData().catch(console.error); // Handle potential errors
  }, [chain?.id, setAmountInp, setAutoAI]);

  useEffect(() => {
    handleTypeInput(amountInp)
    if (autoAI) {
      onPresentConfirmModal()
    }
  }, [amountInp, autoAI])

  const getDex = () => {
    for (const key in dexs) {
      if (dexs[key].chainId === chain?.id) {
        return dexs[key]
      }
    }
    return dex
  }
  const [localDex, setLocalDex] = useState<Dex>(getDex())

  useEffect(() => {
    handleDexChange(getDex())
  }, [chain])

  const loadedUrlParams = useDefaultsFromURLSearch(localDex)

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId, localDex.chainId),
    useCurrency(loadedUrlParams?.outputCurrencyId, localDex.chainId),
  ]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )
  const publicClient = usePublicClient({ chainId: localDex.chainId })
  const [urlDex, setUrlDex] = useState<Dex>(undefined)

  useEffect(() => {
    if (loadedUrlParams !== undefined && loadedUrlParams.dex !== undefined) {
      const { dex: newDex } = loadedUrlParams
      setUrlDex(newDex)
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
  const { toastInfo } = useToast()

  const navigate = useNavigate()

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
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    allTrades,
  } = useDerivedSwapInfo(dexList, localDex)

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
    getRequest
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue, localDex.chainId)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade

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
  const [ changed, setChanged ] = useState(false)
  const madeAChange = () => {
    setPaymasterInfo(undefined)
    setChanged(prevState => !prevState);
  }

  const handleTypeInput = useCallback(
    (value: string) => {
      madeAChange()
      onUserInput(Field.INPUT, value);
    },
    [onUserInput]
  );

  const handleTypeOutput = useCallback(
    (value: string) => {
      madeAChange()
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput]
  );

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
  const spender = localDex.router
  const [approval, approveCallback] = useApproveCallbackFromTrade(
    getAddress(spender, localDex.chainId),
    localDex.chainId,
    trade,
    allowedSlippage,
  )

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  // errors

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  const FLAT_FEE = useGetFactoryTxFee(localDex)

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    localDex,
    account,
    FLAT_FEE,
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(localDex, trade)

  const [paymasterInfo, setPaymasterInfo] = useState<any | null>(null)
  const [ entireError, setEntireError ] = useState<string>(null)
  const [payWithPM, setUsePaymaster, payToken, setPaytoken] = useGasTokenManager()
  const [disabledDoToPM, setDTTPM] = useState(true)
  const { fetchPaymaster } = usePaymaster()
  const { request, error } = useFetchSwapRequest(trade, allowedSlippage, dex, account, FLAT_FEE)


  const handleDisableStatusChange = (disabled: boolean) => {
    setDTTPM(disabled)
  }
    
  useEffect(() => {
    setEntireError(undefined)
    const fetchRequest = async () => {
      try {
        if (payWithPM) {
          let result
          if(showWrap){
            result = await getRequest()
          } else if(request) {
            result = await request();
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
  }, [ dex, payWithPM, payToken, showWrap, changed,swapInputError]); // Dependencies for the effect
  

  const handleSwap = useCallback(async () => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })

    if(approval !== ApprovalState.APPROVED){
      console.log("gere ger==")
      try {
        await approveCallback()
      } catch{
        console.log("failed approval")
        return
      }
     }
    

    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch(error => {
        console.log(error)
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
      madeAChange()
      onCurrencySelection(Field.INPUT, inputCurrency, chainId)
    },
    [onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
      setQuantityPercent(100)
    }
  }, [maxAmountInput, onUserInput])

  const handleQuantityPercentChange = useCallback(
    (p: number) => {
      setQuantityPercent(p)
      if (maxAmountInput && p > 0) {
        const amount = maxAmountInput.multiply(JSBI.BigInt(p)).divide(JSBI.BigInt(100))
        onUserInput(Field.INPUT, amount.toExact())
      } else if (p === 0) {
        onUserInput(Field.INPUT, '')
      }
    },
    [maxAmountInput, onUserInput],
  )

  const handleOutputSelect = useCallback(
    (outputCurrency, chainId) => {
      madeAChange()
      onCurrencySelection(Field.OUTPUT, outputCurrency, chainId)
    },

    [onCurrencySelection],
  )

  const swapIsUnsupported = useIsTransactionUnsupported(localDex.chainId, currencies?.INPUT, currencies?.OUTPUT)

  const [onPresentDepositModal] = useModal(
    <Box p="24px">
      <Text mb="16px" bold>Deposit</Text>
      {account ? (
        <>
          <Text fontSize="14px" color="textSubtle" mb="8px">Send assets to your wallet address:</Text>
          <CopyAddress account={account} mb="16px" />
        </>
      ) : (
        <Text>Connect wallet to view deposit address</Text>
      )}
    </Box>,
  )
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
      dex={localDex}
      customOnDismiss={handleConfirmDismiss}
      isApproved={approval === ApprovalState.APPROVED }
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

  const handleChainSelect = (chainId: number) => {
    const dexForChain = dexList.find((d) => d.chainId === chainId)
    if (dexForChain) handleDexChange(dexForChain)
  }
  const inputCurrency = currencies[Field.INPUT]
  const inputTokenAddress = inputCurrency
    ? (inputCurrency.symbol === publicClient?.chain?.nativeCurrency.symbol
        ? getWrappedAddress(localDex.chainId)
        : (inputCurrency as Token).address)
    : undefined
  const inputSymbol = inputCurrency?.symbol ?? ''
  const outputSymbol = currencies[Field.OUTPUT]?.symbol ?? ''
  const pairLabel = `${inputSymbol}/${outputSymbol}`.replace('//', '/') || '—'
  const midPrice = trade?.executionPrice ? trade.executionPrice.toSignificant(6) : '0'

  const handleBBO = () => setLimitPrice(midPrice)

  return (
    <Page>
      <SwapBody>
        <HeaderRow>
          <ChainSelector currentChainId={localDex.chainId} onChainChange={handleChainSelect} />
          <PMTokenSelector />
          <TradeModeDropdown value={tradeMode} onChange={setTradeMode} />
          <FeeBadge>
            Fee: {parseFloat(new BigNumber(FLAT_FEE).shiftedBy(-18).toFixed(5))} {publicClient?.chain?.nativeCurrency?.symbol ?? 'ETH'}
          </FeeBadge>
        </HeaderRow>

        <SwapPageLayout>
        <ChartPane>
          <Flex mb="12px" alignItems="center" gap="12px" flexWrap="wrap">
            <PairSelectorDropdown
              value={chartSymbol || inputSymbol || 'BTC'}
              onChange={(s) => setChartSymbol(s)}
            />
          </Flex>
          <ChartSection>
            <LiveChartSection tokenAddress={inputTokenAddress} symbol={inputSymbol || chartSymbol || 'BTC'} dex={localDex} height="420px" chartSymbol={chartSymbol || undefined} onChartSymbolChange={setChartSymbol} />
          </ChartSection>
        </ChartPane>

        <OrderBookPane>
          <OrderBook midPrice={midPrice} pairLabel={pairLabel} />
        </OrderBookPane>

        <TradePane>
        <BitgetTradePanel
          onDeposit={onPresentDepositModal}
          onTransfer={() => toastInfo('Transfer', 'Coming soon')}
          onOpenLong={() => {
            setSwapState({ tradeToConfirm: trade, attemptingTxn: false, swapErrorMessage: undefined, txHash: undefined })
            onPresentConfirmModal()
          }}
          onOpenShort={() => {
            setSwapState({ tradeToConfirm: trade, attemptingTxn: false, swapErrorMessage: undefined, txHash: undefined })
            onPresentConfirmModal()
          }}
          isLongDisabled={showConnectButton || swapIsUnsupported || showWrap || !isValid || priceImpactSeverity > 3 || !!swapCallbackError}
          isShortDisabled={showConnectButton || swapIsUnsupported || showWrap || !isValid || priceImpactSeverity > 3 || !!swapCallbackError}
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          marginMode={marginMode}
          onMarginModeChange={setMarginMode}
          leverage={leverage}
          onLeverageChange={setLeverage}
          mode={tradeModeUI}
          onModeChange={setTradeModeUI}
          price={limitPrice}
          onPriceChange={setLimitPrice}
          quantity={typedValue}
          onQuantityChange={(v) => onUserInput(Field.INPUT, v)}
          quantityPercent={quantityPercent}
          onQuantityPercentChange={handleQuantityPercentChange}
          inputSymbol={inputSymbol}
          midPrice={midPrice}
          onBBO={handleBBO}
          availableBalance={currencyBalances[Field.INPUT]?.toSignificant(6) ?? '0.00'}
        >
          <AnimatedBorderBox>
          <Wrapper style={{ padding: '16px' }}>
            <AutoColumn>
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
                id='swap-currency-input'
              />

              <Flex alignItems='right' justifyContent='right' mt='0.5rem'>
                <Button
                  onClick={() => {
                    handleMaxInput()
                  }}
                  scale='sm'
                  variant='primary'
                  style={{ textTransform: 'uppercase', padding: '1'}}
                >
                  {t('Max')}
                </Button>
              </Flex>

              <AutoColumn justify='center'>
                <AutoRow justify='center' style={{}} mb='0rem'>
                  <ArrowWrapper clickable>
                    <MdSwapVerticalCircle size={32} color="#9c4545" style={{ cursor: 'pointer' }} onClick={() => {
                      onSwitchTokens()
                    }} />
                  </ArrowWrapper>
                </AutoRow>
              </AutoColumn>

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
                id='swap-currency-output'
              />

              {showWrap ? null : (
                <AutoColumn gap='2px' style={{ padding: '0 16px' }}>
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align='center'>
                      <Label>{t('Slippage Tolerance')}</Label>
                      <Text bold color='primary' >
                        {allowedSlippage / 100}%
                      </Text>
                    </RowBetween>
                  )}
                    <RowBetween align='center'>
                      <Label>{t('Price Impact')}</Label>
                      <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
                    </RowBetween>
                 
                </AutoColumn>
                
              )}

            </AutoColumn>

            <PayMasterPreview paymasterInfo={paymasterInfo} dex={dex} onDisableStatusChange={handleDisableStatusChange} error={entireError}/>

            {showConnectButton && (
              <Flex justifyContent="center" alignItems="center" mt="12px" mb="8px">
                <Text color="textSubtle" fontSize="14px">
                  {t('Connect your wallet above to trade')}
                </Text>
              </Flex>
            )}
            {showWrap && (
              <Flex justifyContent="center" alignItems="center" mt="12px" mb="8px">
                <Button disabled={Boolean(wrapInputError) || disabledDoToPM} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                </Button>
              </Flex>
            )}
            {noRoute && userHasSpecifiedInputOutput && !showWrap && (
              <GreyCard style={{ textAlign: 'center', margin: '12px 0' }}>
                <Text color='textSubtle' mb='4px'>
                  {t('Insufficient liquidity for this trade.')}
                </Text>
              </GreyCard>
            )}

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Text fontSize="12px" color="textSubtle" mb="8px">Leverage: {leverage}x • {marginMode}</Text>
              <LeverageModeSelector selectedMode={leverageMode} onModeChange={setLeverageMode} />
            </div>
          </Wrapper>
          </AnimatedBorderBox>
        </BitgetTradePanel>
        </TradePane>
      </SwapPageLayout>
      </SwapBody>
    </Page>
  )
}
