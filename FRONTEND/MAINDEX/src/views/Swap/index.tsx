/* eslint-disable react/no-array-index-key */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CurrencyAmount, JSBI, Token, Trade } from 'sdk'
import { Button, Text, Box, useModal, Flex } from 'uikit'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useTranslation } from 'contexts/Localization'
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { Dex } from 'config/constants/types'
// import GraphIndex, { showGraph } from 'views/graphs'
import { dexs, dexList, defaultDex } from 'config/constants/dex'
import { BigNumber } from 'bignumber.js'
import { useGetFactoryTxFee } from 'utils/calls/factory'
import { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Layout/Column'
import ConfirmSwapModal from './components/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow, RowBetween } from '../../components/Layout/Row'
import confirmPriceImpactWithoutFee from './components/confirmPriceImpactWithoutFee'
import { ArrowWrapper, Wrapper } from './components/styleds'
import ImportTokenWarningModal from './components/ImportTokenWarningModal'
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
import { useMarginOpen, useUserPositions } from 'hooks/useMarginContract'
import { API_URL } from 'config'

const Label = styled(Text)`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`
const SwapPageLayout = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
  height: calc(100vh - 120px);
  min-height: 600px;
  flex-direction: row;
  align-items: stretch;

  @media (max-width: 1200px) {
    flex-direction: column;
    height: auto;
  }
`

const ChartPane = styled.div`
  flex: 1;
  min-width: 0;
  background-color: #121316;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    min-height: 480px;
  }
`

const OrderBookPane = styled.div`
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: 1200px) {
    width: 100%;
    min-width: 100%;
  }
`

const TradePane = styled.div`
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    width: 100%;
    min-width: 100%;
  }
`

const ChartSection = styled.div`
  width: 100%;
  flex: 1;
  min-height: 480px;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    min-height: 420px;
  }
`

const SwapBody = styled.div`
  width: 100%;
  max-width: 100%;
  z-index: 1;
  background: transparent;
`

const FeeBadge = styled.span`
  padding: 8px 14px;
  background: rgba(230, 57, 70, 0.12);
  border-radius: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`

const SwapPrimaryButton = styled(Button)`
  width: 100%;
  margin-top: 12px;
  font-weight: 600;
  text-transform: none;
`

type ChangeNowTransaction = {
  id?: string
  payinAddress?: string
  payinAmount?: string
  payoutAddress?: string
  payoutAmount?: string
}

const CHANGE_NOW_TICKER_MAP: Record<string, string> = {
  weth: 'eth',
  wbnb: 'bnb',
  wmatic: 'matic',
  wbtc: 'btc',
}

function normalizeChangeNowTicker(symbol: string): string {
  const s = symbol.trim().toLowerCase()
  return CHANGE_NOW_TICKER_MAP[s] ?? s
}

const CHANGENOW_NETWORK_BY_CHAIN: Record<number, string> = {
  1: 'eth',
  56: 'bsc',
  97: 'bsc',
  11155111: 'eth',
  137: 'matic',
}

const SUPPORTED_PERP_BASES = new Set([
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC',
  'LINK', 'UNI', 'ATOM', 'LTC', 'ARB', 'OP', 'SUI', 'PEPE', 'SHIB'
])

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
  const [deepLinkMarginSide, setDeepLinkMarginSide] = useState<'long' | 'short' | null>(null)
  const [hasShownDeepLinkHint, setHasShownDeepLinkHint] = useState(false)
  

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

      const tradeModeParam = urlParams.get('tradeMode');
      if (tradeModeParam === 'PERPETUAL') {
        setTradeMode('PERPETUAL');
      }
      const leverageModeParam = urlParams.get('leverageMode')?.toUpperCase();
      if (leverageModeParam === LeverageMode.PSYCHO) {
        setLeverageMode(LeverageMode.PSYCHO);
      }
      if (leverageModeParam === LeverageMode.SAFE) {
        setLeverageMode(LeverageMode.SAFE);
      }
      const leverageParam = urlParams.get('leverage');
      if (leverageParam != null && leverageParam !== '') {
        const lev = parseInt(leverageParam, 10);
        if (!Number.isNaN(lev) && lev >= 1 && lev <= 100) {
          setLeverage(lev);
          if (lev > 10) setLeverageMode(LeverageMode.PSYCHO);
        }
      }
      const marginSide = urlParams.get('marginSide')?.toLowerCase()
      if (marginSide === 'long' || marginSide === 'short') {
        setDeepLinkMarginSide(marginSide)
        setHasShownDeepLinkHint(false)
        setTradeModeUI('open')
      }
      const marginAmountParam = urlParams.get('amount');
      if (marginAmountParam != null && marginAmountParam !== '' && !amountInput) {
        setAmountInp(marginAmountParam);
      }
    };

    // Call the fetchData function
    fetchData().catch(console.error); // Handle potential errors
  }, [chain?.id, setAmountInp, setAutoAI]);

  const getLeverageBounds = useCallback(
    (mode: LeverageMode): { min: number; max: number } =>
      mode === LeverageMode.SAFE ? { min: 5, max: 10 } : { min: 1, max: 100 },
    [],
  )

  useEffect(() => {
    const { min, max } = getLeverageBounds(leverageMode)
    if (leverage < min) setLeverage(min)
    if (leverage > max) setLeverage(max)
  }, [getLeverageBounds, leverage, leverageMode])

  useEffect(() => {
    handleTypeInput(amountInp)
    if (autoAI) {
      onPresentConfirmModal()
    }
  }, [amountInp, autoAI])

  const getDex = (): Dex => {
    for (const key in dexs) {
      if (dexs[key].chainId === chain?.id) {
        return dexs[key]
      }
    }
    return dex ?? defaultDex
  }
  const [localDex, setLocalDex] = useState<Dex>(() => getDex() ?? defaultDex)

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
  const { toastInfo, toastError, toastSuccess } = useToast()

  const navigate = useNavigate()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  useEffect(() => {
    if (!deepLinkMarginSide || tradeMode !== 'PERPETUAL' || hasShownDeepLinkHint) return
    toastInfo(
      `Perpetual ${deepLinkMarginSide === 'long' ? 'Long' : 'Short'} ready`,
      `Mode: ${leverageMode} • Leverage: ${leverage}x`,
    )
    setHasShownDeepLinkHint(true)
  }, [deepLinkMarginSide, hasShownDeepLinkHint, leverage, leverageMode, toastInfo, tradeMode])

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

  const { openLong: marginOpenLong, openShort: marginOpenShort, closePosition: marginClosePosition, isPending: marginPending, error: marginError, isSupported: marginSupported } = useMarginOpen(localDex.chainId)
  const [positionsRefetchTick, setPositionsRefetchTick] = useState(0)
  const { positions, isLoading: positionsLoading, refetch: refetchPositions } = useUserPositions(localDex.chainId, account ?? undefined, positionsRefetchTick)
  const isNativeInput = !!(currencies[Field.INPUT] && !(currencies[Field.INPUT] instanceof Token))
  const marginCollateralWei = isNativeInput && parsedAmounts[Field.INPUT]?.greaterThan(JSBI.BigInt(0))
    ? BigInt(parsedAmounts[Field.INPUT].raw.toString())
    : 0n
  const marginAmountValid = marginCollateralWei > 0n
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
  

  /** On-chain swap (Trade mode: Public) — used by ConfirmSwapModal after user confirms */
  const handleSwap = useCallback(async () => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })

    if (approval !== ApprovalState.APPROVED) {
      try {
        await approveCallback()
      } catch {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
        return
      }
    }

    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [
    approval,
    approveCallback,
    priceImpactWithoutFee,
    swapCallback,
    tradeToConfirm,
  ])

  /** Private route: external settlement via backend (no AMM route required) */
  const handlePrivateAnonSwap = useCallback(async () => {
    if (!account) {
      toastError(t('Wallet'), t('Connect your wallet'))
      return
    }
    const fromSym = normalizeChangeNowTicker(currencies[Field.INPUT]?.symbol || '')
    const toSym = normalizeChangeNowTicker(currencies[Field.OUTPUT]?.symbol || '')
    const amount = parsedAmounts[Field.INPUT]?.toExact()
    const chainNetwork = CHANGENOW_NETWORK_BY_CHAIN[localDex.chainId]
    if (!fromSym || !toSym || !amount || !parseFloat(amount)) {
      toastError(t('Private swap'), t('Enter amount and select tokens'))
      return
    }

    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    try {
      const response = await fetch(`${API_URL}/api/changenow/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromSym,
          to: toSym,
          ...(chainNetwork ? { fromNetwork: chainNetwork, toNetwork: chainNetwork } : {}),
          amount,
          address: recipient || account,
          refundAddress: account,
        }),
      })
      const data: ChangeNowTransaction | { error?: string } = await response.json()
      if (!response.ok) {
        throw new Error((data as { error?: string })?.error || 'ShadowVault private swap failed')
      }
      const order = data as ChangeNowTransaction
      setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
      onUserInput(Field.INPUT, '')
      toastSuccess(
        t('ShadowVault private swap'),
        `${t('Order')}: ${order.id || '—'} — ${t('Deposit to')}: ${order.payinAddress || '—'}`,
      )
    } catch (e) {
      setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
      toastError(t('Private swap failed'), (e as Error)?.message || t('Try again'))
    }
  }, [
    account,
    currencies,
    onUserInput,
    parsedAmounts,
    recipient,
    localDex.chainId,
    t,
    toastError,
    toastSuccess,
    tradeToConfirm,
  ])

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

  const findTokenBySymbol = useCallback(
    (symbol: string): Token | undefined => {
      const target = symbol.trim().toUpperCase()
      const all = Object.values(defaultTokens || {})
      return all.find((t) => t?.symbol?.toUpperCase() === target)
    },
    [defaultTokens],
  )

  /**
   * Keep perpetual pair dropdown synced with swap currencies.
   * Example selection "BTC" -> INPUT=BTC, OUTPUT=USDT when available on current chain.
   */
  const handlePerpPairChange = useCallback(
    (baseSymbol: string) => {
      const base = baseSymbol.trim().toUpperCase()
      setChartSymbol(base)

      const baseToken = findTokenBySymbol(base)
      const quoteToken = findTokenBySymbol('USDT') || findTokenBySymbol('USDC')

      if (baseToken) {
        onCurrencySelection(Field.INPUT, baseToken, localDex.chainId)
      } else {
        toastInfo('Pair sync', `${base}/USDT selected for chart. Token not found in list on this chain.`)
      }

      if (quoteToken) {
        onCurrencySelection(Field.OUTPUT, quoteToken, localDex.chainId)
      }
    },
    [findTokenBySymbol, localDex.chainId, onCurrencySelection, toastInfo],
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
  const selectedPerpBase = (chartSymbol || inputSymbol || '').toUpperCase()
  const perpPairSupported = !selectedPerpBase || SUPPORTED_PERP_BASES.has(selectedPerpBase)

  /** Deep link: /#/swap?tradeMode=PERPETUAL&… opens Margin tab */
  const bitgetInitialTab = useMemo<'swap' | 'margin' | 'bots'>(() => {
    if (typeof window === 'undefined') return 'swap'
    const h = window.location.hash
    const q = h.includes('?') ? h.split('?')[1] : ''
    return new URLSearchParams(q).get('tradeMode') === 'PERPETUAL' ? 'margin' : 'swap'
  }, [])

  const handleBBO = () => setLimitPrice(midPrice)
  const handleLeverageChange = useCallback(
    (next: number) => {
      const { min, max } = getLeverageBounds(leverageMode)
      if (Number.isNaN(next)) return
      setLeverage(Math.max(min, Math.min(max, next)))
    },
    [getLeverageBounds, leverageMode],
  )

  return (
    <Page maxWidth="100%" px="0" style={{ paddingTop: '8px', paddingBottom: '16px', paddingLeft: '24px', paddingRight: '24px' }}>
      <SwapBody>
        <SwapPageLayout>
        <ChartPane>
          <Flex mb="12px" alignItems="center" gap="12px" flexWrap="wrap">
            <PairSelectorDropdown
              value={chartSymbol || inputSymbol || 'BTC'}
              onChange={handlePerpPairChange}
            />
          </Flex>
          <ChartSection>
            <LiveChartSection tokenAddress={inputTokenAddress} symbol={inputSymbol || chartSymbol || 'BTC'} dex={localDex} height="420px" chartSymbol={chartSymbol || undefined} onChartSymbolChange={setChartSymbol} />
          </ChartSection>
        </ChartPane>

        <OrderBookPane>
          <OrderBook midPrice={midPrice} pairLabel={pairLabel} symbol={selectedPerpBase || undefined} />
        </OrderBookPane>

        <TradePane>
        <BitgetTradePanel
          initialTab={bitgetInitialTab}
          chainSelector={<ChainSelector currentChainId={localDex.chainId} onChainChange={handleChainSelect} />}
          tradeModeSelector={<TradeModeDropdown value={tradeMode} onChange={setTradeMode} />}
          pmTokenSelector={<PMTokenSelector />}
          feeBadge={
            <FeeBadge style={{ padding: '6px 12px', fontSize: '12px', margin: 0 }}>
              Fee: {parseFloat(new BigNumber(FLAT_FEE).shiftedBy(-18).toFixed(5))} {publicClient?.chain?.nativeCurrency?.symbol ?? 'ETH'}
            </FeeBadge>
          }
          preferredSide={tradeMode === 'PERPETUAL' ? deepLinkMarginSide : null}
          onDeposit={onPresentDepositModal}
          onTransfer={() => toastInfo('Transfer', 'Coming soon')}
          onOpenLong={async () => {
            if (tradeMode === 'PERPETUAL' && !perpPairSupported) {
              toastInfo(t('Perpetual'), t('Selected pair is not supported yet'))
              return
            }
            if (marginSupported && isNativeInput && marginAmountValid) {
              try {
                await marginOpenLong(marginCollateralWei, leverage)
                toastInfo(t('Open Long'), t('Position opened successfully'))
                setPositionsRefetchTick((t) => t + 1)
              } catch (e) {
                toastInfo(t('Error'), marginError ?? (e as Error)?.message)
              }
              return
            }
            if (!marginSupported) {
              toastInfo(t('Margin'), t('Margin not available on this chain'))
              return
            }
            if (!isNativeInput) {
              toastInfo(t('Margin'), t('Use native token (BNB/ETH) as collateral for margin'))
              return
            }
            if (!marginAmountValid) {
              toastInfo(t('Margin'), t('Enter an amount'))
              return
            }
            setSwapState({ tradeToConfirm: trade, attemptingTxn: false, swapErrorMessage: undefined, txHash: undefined })
            onPresentConfirmModal()
          }}
          onOpenShort={async () => {
            if (tradeMode === 'PERPETUAL' && !perpPairSupported) {
              toastInfo(t('Perpetual'), t('Selected pair is not supported yet'))
              return
            }
            if (marginSupported && isNativeInput && marginAmountValid) {
              try {
                await marginOpenShort(marginCollateralWei, leverage)
                toastInfo(t('Open Short'), t('Position opened successfully'))
                setPositionsRefetchTick((t) => t + 1)
              } catch (e) {
                toastInfo(t('Error'), marginError ?? (e as Error)?.message)
              }
              return
            }
            if (!marginSupported) {
              toastInfo(t('Margin'), t('Margin not available on this chain'))
              return
            }
            if (!isNativeInput) {
              toastInfo(t('Margin'), t('Use native token (BNB/ETH) as collateral for margin'))
              return
            }
            if (!marginAmountValid) {
              toastInfo(t('Margin'), t('Enter an amount'))
              return
            }
            setSwapState({ tradeToConfirm: trade, attemptingTxn: false, swapErrorMessage: undefined, txHash: undefined })
            onPresentConfirmModal()
          }}
          isLongDisabled={showConnectButton || marginPending || (tradeMode === 'PERPETUAL' && !perpPairSupported) || (marginSupported ? !isNativeInput || !marginAmountValid : (swapIsUnsupported || showWrap || !isValid || priceImpactSeverity > 3 || !!swapCallbackError))}
          isShortDisabled={showConnectButton || marginPending || (tradeMode === 'PERPETUAL' && !perpPairSupported) || (marginSupported ? !isNativeInput || !marginAmountValid : (swapIsUnsupported || showWrap || !isValid || priceImpactSeverity > 3 || !!swapCallbackError))}
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          marginMode={marginMode}
          onMarginModeChange={setMarginMode}
          leverage={leverage}
          onLeverageChange={handleLeverageChange}
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
          leverageModeSelector={
            <div>
              <Text fontSize="12px" color="textSubtle" mb="8px">Leverage: {leverage}x • {marginMode}</Text>
              <LeverageModeSelector selectedMode={leverageMode} onModeChange={setLeverageMode} />
            </div>
          }
          positions={positions}
          positionsLoading={positionsLoading}
          isClosePending={marginPending}
          nativeSymbol={publicClient?.chain?.nativeCurrency?.symbol ?? 'BNB'}
          onClosePosition={marginSupported ? async (positionId) => {
            try {
              await marginClosePosition(positionId)
              toastInfo(t('Close'), t('Position closed'))
              setPositionsRefetchTick((t) => t + 1)
            } catch (e) {
              toastInfo(t('Error'), marginError ?? (e as Error)?.message)
            }
          } : undefined}
        >
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
                    <MdSwapVerticalCircle size={32} color="#E63946" style={{ cursor: 'pointer' }} onClick={() => {
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

            {!showWrap && (
              <Flex flexDirection="column" gap="8px" mt="8px" px="16px">
                {tradeMode === 'PERPETUAL' ? (
                  <Text fontSize="12px" color="textSubtle" textAlign="center">
                    {t('Perpetual trading uses the Margin tab. Switch to Margin and place your order there.')}
                  </Text>
                ) : tradeMode === 'PRIVATE' ? (
                  <>
                    <Text fontSize="12px" color="textSubtle" textAlign="center">
                      {t('ShadowVault private swap — you will get a deposit address to send from your wallet.')}
                    </Text>
                    <SwapPrimaryButton
                      scale="lg"
                      disabled={
                        showConnectButton ||
                        attemptingTxn ||
                        !currencies[Field.INPUT] ||
                        !currencies[Field.OUTPUT] ||
                        !parsedAmounts[Field.INPUT]?.greaterThan(JSBI.BigInt(0))
                      }
                      onClick={handlePrivateAnonSwap}
                    >
                      {attemptingTxn ? t('Creating order…') : t('Private swap (Anon)')}
                    </SwapPrimaryButton>
                  </>
                ) : (
                  <SwapPrimaryButton
                    scale="lg"
                    disabled={
                      showConnectButton ||
                      swapIsUnsupported ||
                      !isValid ||
                      priceImpactSeverity > 3 ||
                      !!swapCallbackError ||
                      attemptingTxn
                    }
                    onClick={() => onPresentConfirmModal()}
                  >
                    {t('Swap')}
                  </SwapPrimaryButton>
                )}
              </Flex>
            )}

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
          </Wrapper>
        </BitgetTradePanel>
        </TradePane>
      </SwapPageLayout>
      </SwapBody>
    </Page>
  )
}
