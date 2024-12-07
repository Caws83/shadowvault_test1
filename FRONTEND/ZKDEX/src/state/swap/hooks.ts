import { Currency, CurrencyAmount, getETHER, JSBI, Token, TokenAmount, Trade } from 'sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useENS from 'hooks/ENS/useENS'
import { useCurrency } from 'hooks/Tokens'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useTranslation } from 'contexts/Localization'
import { isAddress } from 'utils'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { dexs } from 'config/constants/dex'
import { Dex } from 'config/constants/types'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'
import { useUserSlippageTolerance } from '../user/hooks'
import { useAccount, useChainId } from 'wagmi'
import BigNumber from 'bignumber.js'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency, chainId: number) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  
  const dispatch = useDispatch<AppDispatch>()
  
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency, chainId: number) => {
      const ETHER = getETHER(chainId)
      const isETH = currency === ETHER
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : isETH ? ETHER.symbol : '',
        }),
      )
    },
    [dispatch],
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch],
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch],
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(chainId: number, value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = new BigNumber(value).shiftedBy(currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed), chainId)
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(
  dexList: Dex[],
  currentDex,
): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  inputError?: string
  allTrades: Trade[]
} {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId, currentDex.chainId)
  const outputCurrency = useCurrency(outputCurrencyId, currentDex.chainId)
  // const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipient) ?? null

  const relevantTokenBalances = useCurrencyBalances(currentDex.chainId, account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])
  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(currentDex.chainId, typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)
  const [bestTradeExactIn, allBestTradesEI] = useTradeExactIn(
    dexList,
    currentDex,
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
  )
  const [bestTradeExactOut, allBestTradesEO] = useTradeExactOut(
    dexList,
    currentDex,
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
  )
  
  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut
  const allTrades = isExactIn ? allBestTradesEI : allBestTradesEO
  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }
  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined
  if (!account) {
    inputError = t('Connect Wallet')
  }

  if (!parsedAmount) {
    inputError = inputError ?? t('Enter an amount')
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? t('Select a token')
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? t('Enter a recipient')
  } else if (
    BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
    (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
    (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
  ) {
    inputError = inputError ?? t('Invalid recipient')
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage, currentDex.chainId)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  if (balanceIn && (amountIn || parsedAmount) && balanceIn.lessThan(amountIn ?? parsedAmount) ) {
    inputError = t('Insufficient %symbol% balance', { symbol: inputCurrency?.symbol })
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
    allTrades,
  }
}

function parseCurrencyFromURLParameter(urlParam: any, chainId): string {
  const ETHER = getETHER(chainId)
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === ETHER.symbol) return ETHER.symbol
    if (valid === false) return ETHER.symbol
  }
  return ETHER.symbol ?? ''
}

function parseDexFromURLParameter(urlParam: any): Dex {
  if (typeof urlParam === 'string') {
    return dexs[urlParam]
  }
  return undefined
}

function parseTokenAmountURLParameter(urlParam: any): string {
  // eslint-disable-next-line no-restricted-globals
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs, localDex: Dex): SwapState {
  const dex = parseDexFromURLParameter(parsedQs.dex) ?? localDex
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency, dex.chainId)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency, dex.chainId)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
    dex,
  }
}

function parseColorFromURLParameter(urlParam2: any): string {
  if (typeof urlParam2 === 'string') {
    return urlParam2
  }
  return undefined
}

function parseZapFromURLParameter(urlParam2: any): boolean {
  if (typeof urlParam2 === 'string') {
    if(urlParam2 === "true") return true
  }
  return false
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(localDex: Dex):
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined; dex: Dex; color: string | undefined; zap: boolean | undefined }
  | undefined {
  const parsedQs = useParsedQueryString()
  const dispatch = useDispatch<AppDispatch>()
  
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined; dex: Dex; color: string | undefined; zap: boolean | undefined } | undefined
  >()

  useEffect(() => {
    const parsed = queryParametersToSwapState(parsedQs, localDex)
    const parsedColor = parseColorFromURLParameter(parsedQs.color)
    const parsedZap = parseZapFromURLParameter(parsedQs.zap)
    
    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: null,
        dex: parsed.dex,
      }),
    )

    setResult({
      inputCurrencyId: parsed[Field.INPUT].currencyId,
      outputCurrencyId: parsed[Field.OUTPUT].currencyId,
      dex: parsed.dex,
      color: parsedColor,
      zap: parsedZap
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, parsedQs])

  return result
}
