import React, { useCallback, useEffect, useState } from 'react'
import { Currency, currencyEquals, getETHER, TokenAmount, getWBONE, Token } from 'sdk'
import { Button, Text, Flex, AddIcon, CardBody, Message, useModal, ButtonMenu, ButtonMenuItem, Box } from 'uikit'
import { useParams, useNavigate } from 'react-router-dom'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useTranslation } from 'contexts/Localization'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import { getAddress } from 'utils/addressHelpers'
import { Dex } from 'config/constants/types'
// import { useDefaultsFromURLSearch } from 'state/swap/hooks'
import { LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Layout/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { DoubleCurrencyLogo } from '../../components/Logo'
import { AppBody } from '../../components/App'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { RowBetween } from '../../components/Layout/Row'
import AppHeader from 'views/Swap/components/AppHeader'
import { PairState } from '../../hooks/usePairs'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'
import { useIsExpertMode, useUserDex, useUserSlippageTolerance, useGasTokenManager } from '../../state/user/hooks'
import { calculateSlippageAmount } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import Dots from '../../components/Loader/Dots'
import ConfirmAddModalBottom from './ConfirmAddModalBottom'
import { currencyId } from '../../utils/currencyId'
import PoolPriceBar from './PoolPriceBar'
import Page from '../Page'
import { useAccount } from 'wagmi'
import { getPublicClient, simulateContract } from '@wagmi/core'
import { pancakeRouterAbi } from 'config/abi/pancakeRouter'
import { Abi } from 'viem'
import { config } from 'wagmiConfig'
import { BigNumber } from 'bignumber.js'
import { dexs } from 'config/constants/dex'
import { useDefaultsFromURLSearch } from 'state/swap/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useZapManager } from '../../state/user/hooks'
import CenterBody from 'components/App/CenterBody'
import CreatedZapModalPending from './CreatedZapModalPending'
import sendTransactionPM from 'utils/easy/calls/paymaster'
import PMTokenSelector from 'components/Menu/UserMenu/payMasterSelectButton'
import PayMasterPreview from 'components/Menu/UserMenu/payMasterPreview'
import { usePaymaster } from 'hooks/usePaymaster'


const WBONE = getWBONE()

export default function AddLiquidity () {
  const navigate = useNavigate()
  const { currencyIdA, currencyIdB } = useParams()
  const { address: account } = useAccount()
  const [zap, setChangeZap] = useZapManager()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const { fetchPaymaster } = usePaymaster()
  const { t } = useTranslation()

  const data = useAccount()
  const [currentChain, setCurrentChain] = useState<number>()
  useEffect(() => {
    if (data.chain) {
      setCurrentChain(data.chain.id)
    }
  }, [data])

  const [dex, setDex] = useUserDex()
  const loadedUrlParams = useDefaultsFromURLSearch(dex)

  const getDex = () => {
    for (const key in dexs) {
      if (dexs[key].chainId === data.chain?.id) {
        return dexs[key]
      }
    }
    return dex
  }
  const [localDex, setLocalDex] = useState<Dex>(getDex())

  useEffect(() => {
    handleDexChange(getDex())
  }, [data])

  const handleDexChange = (newDex: Dex) => {
    if (localDex !== newDex) {
      setLocalDex(newDex)
    }
    if (dex !== newDex) {
      setDex(newDex)
    }
  }

  const [aiMode, setAiMode] = useState<boolean>(false)

  useEffect(() => {
    const hashParams = new URL(window.location.href).hash.split('?')[1]
    const hash = new URL(window.location.href).hash
    const urlParams = new URLSearchParams(hashParams)
    const token = urlParams.get('token')
    const amount = urlParams.get('amount')
    const auto = urlParams.get('auto')

    /* if (token) {
     // const token0 = useCurrency(token, localDex.chainId)
      setInToken(token0 as Token);
    }*/

    if (amount) {
      setZapAmount(amount)
    }

    if (auto == 'true') {
      setAiMode(true)
    }
  }, [account])

  const showConnectButton = !account || currentChain !== localDex.chainId
  const ETHER = getETHER(localDex.chainId)

  const currencyA = useCurrency(currencyIdA, localDex.chainId)
  const currencyB = useCurrency(currencyIdB, localDex.chainId)

  const oneCurrencyIsWETH = Boolean(
    localDex.chainId &&
      ((currencyA && currencyEquals(currencyA, WBONE[localDex.chainId])) ||
        (currencyB && currencyEquals(currencyB, WBONE[localDex.chainId]))),
  )

  const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(localDex, currencyA ?? undefined, currencyB ?? undefined)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  const isValid = !error

  // modal and loading
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline(localDex.chainId) // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {},
  )
  const [zapAmount, setZapAmount] = useState('0')
  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    getAddress(localDex.router, localDex.chainId),
    localDex.chainId,
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    getAddress(localDex.router, localDex.chainId),
    localDex.chainId,
  )
  // const addTransaction = useTransactionAdder()
  const isApproved = approvalA == ApprovalState.APPROVED && approvalB == ApprovalState.APPROVED

  async function getRequest () {
    if (!localDex.chainId || !account) return
    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }
    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    }
    const publicCLient = getPublicClient(config, { chainId: localDex.chainId })
    let abi: Abi
    let address: `0x${string}`
    let functionName: string
    let args: any
    let value: bigint

    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      args = [
        (wrappedCurrency(tokenBIsETH ? currencyA : currencyB, localDex.chainId)?.address as `0x${string}`) ??
          ('0x0' as `0x${string}`), // token
        BigInt((tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString()), // token desired
        BigInt(amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString()), // token min
        BigInt(amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString()), // eth min
        account,
        BigInt(deadline.toString()),
      ] as [`0x${string}`, bigint, bigint, bigint, `0x${string}`, bigint]
      abi = pancakeRouterAbi
      address = getAddress(localDex.router, localDex.chainId)
      functionName = 'addLiquidityETH'
      value = BigInt((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      abi = pancakeRouterAbi
      address = getAddress(localDex.router, localDex.chainId)
      functionName = 'addLiquidity'
      args = [
        (wrappedCurrency(currencyA, localDex.chainId)?.address as `0x${string}`) ?? ('' as `0x${string}`),
        (wrappedCurrency(currencyB, localDex.chainId)?.address as `0x${string}`) ?? ('' as `0x${string}`),
        BigInt(parsedAmountA.raw.toString()),
        BigInt(parsedAmountB.raw.toString()),
        BigInt(amountsMin[Field.CURRENCY_A].toString()),
        BigInt(amountsMin[Field.CURRENCY_B].toString()),
        account,
        BigInt(deadline.toString()),
      ]
      value = BigInt(0)
    }

    
      const request = await simulateContract(config, {
        abi,
        address,
        functionName,
        args,
        value,
        chainId: localDex.chainId,
      })
      return request
}

const [paymasterInfo, setPaymasterInfo] = useState<any | null>(null)
const [ entireError, setEntireError ] = useState<string>(null)

if(error) console.log(error)

  useEffect(() => {
    setEntireError(undefined)
    
    const fetchRequest = async () => {
      try {
        if (isApproved && currencyA && currencyB && localDex && account && payWithPM && payToken) {
          const result = await getRequest();
          const info = await fetchPaymaster(result.request)
          setPaymasterInfo(info)
        } else {
          setPaymasterInfo(undefined)
        }

      } catch (e: any) {
        console.error('Error fetching swap request:', e);
        setEntireError(e.message)
        setPaymasterInfo(undefined)
      }
    };

    fetchRequest();
  }, [ currencyA, currencyB, localDex, account, payWithPM, payToken, parsedAmounts]); // Dependencies for the effect



  async function onAdd () {
    if (!localDex.chainId || !account) return
    //    const router = getRouterContract(getAddress(dex.router), chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    }

    const publicCLient = getPublicClient(config, { chainId: localDex.chainId })
    let abi: Abi
    let address: `0x${string}`
    let functionName: string
    let args: any
    let value: bigint

    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      args = [
        (wrappedCurrency(tokenBIsETH ? currencyA : currencyB, localDex.chainId)?.address as `0x${string}`) ??
          ('0x0' as `0x${string}`), // token
        BigInt((tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString()), // token desired
        BigInt(amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString()), // token min
        BigInt(amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString()), // eth min
        account,
        BigInt(deadline.toString()),
      ] as [`0x${string}`, bigint, bigint, bigint, `0x${string}`, bigint]
      abi = pancakeRouterAbi
      address = getAddress(localDex.router, localDex.chainId)
      functionName = 'addLiquidityETH'
      value = BigInt((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      abi = pancakeRouterAbi
      address = getAddress(localDex.router, localDex.chainId)
      functionName = 'addLiquidity'
      args = [
        (wrappedCurrency(currencyA, localDex.chainId)?.address as `0x${string}`) ?? ('' as `0x${string}`),
        (wrappedCurrency(currencyB, localDex.chainId)?.address as `0x${string}`) ?? ('' as `0x${string}`),
        BigInt(parsedAmountA.raw.toString()),
        BigInt(parsedAmountB.raw.toString()),
        BigInt(amountsMin[Field.CURRENCY_A].toString()),
        BigInt(amountsMin[Field.CURRENCY_B].toString()),
        account,
        BigInt(deadline.toString()),
      ]
      value = BigInt(0)
    }

    setAttemptingTxn(true)
    const gasEstimate = await publicCLient.estimateContractGas({ account, abi, address, functionName, args, value })
    try {
      const { request } = await simulateContract(config, {
        abi,
        address,
        functionName,
        args,
        value,
        gas: gasEstimate,
        chainId: localDex.chainId,
      })
      const data = await sendTransactionPM(request, payWithPM, localDex.chainId, getAddress(payToken.address, localDex.chainId ))
      // const data = await writeContract(config, request)

      /*
      addTransaction(data.hash, localDex.chainId, account as `0x${string}`, {
        summary: `Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencies[Field.CURRENCY_A]
          ?.symbol} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencies[Field.CURRENCY_B]?.symbol}`,
      })
      */

      setTxHash(data)
    } catch (err) {
      setAttemptingTxn(false)
      // we only care if the error is something _other_ than the user rejected the tx
      console.error(err)
    }
    setAttemptingTxn(false)
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <Flex alignItems='center'>
        <Text fontSize='12px' mb='20px' marginRight='10px'>
          {`${currencies[Field.CURRENCY_A]?.symbol}/${currencies[Field.CURRENCY_B]?.symbol}`}
        </Text>
      </Flex>
    ) : (
      <AutoColumn>
        <Flex alignItems='center'>
          <Text fontSize='12px' marginRight='10px'>
            {liquidityMinted?.toSignificant(6)}
          </Text>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </Flex>
        <Row>
          <Text fontSize='12px'>
            {`${currencies[Field.CURRENCY_A]?.symbol}/${currencies[Field.CURRENCY_B]?.symbol} Pool Tokens`}
          </Text>
        </Row>
        <Text fontSize='12px' textAlign='left' mb='30px' pt='30px'>
          {t('Output is estimated. If the price changes by more than %slippage%% your transaction will revert.', {
            slippage: allowedSlippage / 100,
          })}
        </Text>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        chainId={localDex.chainId}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
        paymasterInfo={[paymasterInfo, localDex, entireError]}
      />
    )
  }

  const pendingText = t('Supplying %amountA% %symbolA% and %amountB% %symbolB%', {
    amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    symbolA: currencies[Field.CURRENCY_A]?.symbol ?? '',
    amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
    symbolB: currencies[Field.CURRENCY_B]?.symbol ?? '',
  })

  const handleCurrencyASelect = useCallback(
    (currencyA_: Currency) => {
      const newCurrencyIdA = currencyId(currencyA_)
      if (newCurrencyIdA === currencyIdB) {
        navigate(`/add/${currencyIdB}/${currencyIdA}?zap=${zap}`)
      } else {
        navigate(`/add/${newCurrencyIdA}/${currencyIdB}?zap=${zap}`)
      }
    },
    [currencyIdB, history, currencyIdA],
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB_: Currency) => {
      const newCurrencyIdB = currencyId(currencyB_)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          navigate(`/add/${currencyIdB}/${newCurrencyIdB}?zap=${zap}`)
        } else {
          navigate(`/add/${newCurrencyIdB}?zap=${zap}`)
        }
      } else {
        navigate(`/add/${currencyIdA || 'CRO'}/${newCurrencyIdB}?zap=${zap}`)
      }
    },
    [currencyIdA, navigate, currencyIdB],
  )

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
    setAttemptingTxn(false)
  }, [onFieldAInput, txHash])

  const addIsUnsupported = useIsTransactionUnsupported(localDex.chainId, currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const [onPresentAddLiquidityModal] = useModal(
    <TransactionConfirmationModal
      title={noLiquidity ? t('Pool Creation') : t('Adding Liquidity')}
      chainId={localDex.chainId}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={() => <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />}
      pendingText={pendingText}
      currencyToAdd={pair?.liquidityToken}
    />,
    true,
    true,
    'addLiquidityModal',
  )

  console.log(pair?.liquidityToken.address)
  const onHandleDexChange = (newDex: Dex) => {
    setLocalDex(newDex)
    setDex(newDex)
  }

  const [inToken, setInToken] = useState<Token>(ETHER as Token)
  const selectedCurrencyBalance = useCurrencyBalance(
    localDex.chainId,
    (account as `0x${string}`) ?? undefined,
    inToken ?? undefined,
  )

  const handleClick = (newIndex: number) => {
    setChangeZap(newIndex === 0 ? false : true)
  }

  const canZap =
    !noLiquidity &&
    zap &&
    new BigNumber(zapAmount).gt(0) &&
    new BigNumber(zapAmount).lte(selectedCurrencyBalance?.toExact() ?? '0')

  useEffect(() => {
    if (loadedUrlParams !== undefined && loadedUrlParams.zap !== undefined) {
      const { zap } = loadedUrlParams
      setChangeZap(zap)
    }
  }, [loadedUrlParams, currencyIdA, currencyIdB])

  const handleInputSelect = useCallback(
    (inputCurrency, chainId) => {
      setInToken(inputCurrency)
    },
    [setInToken],
  )

  const onChangeOutToken = (token: Token) => {
    if (inToken !== token) {
      setInToken(token as Token)
    }
  }

  const handleTypeInput = useCallback(
    (value: string) => {
      setZapAmount(value)
    },
    [setZapAmount],
  )

  const isBNB = inToken.symbol === data?.chain?.nativeCurrency.symbol

  const tokenAAddress = currencyA
    ? currencyA.symbol === data?.chain?.nativeCurrency.symbol
      ? WBONE[localDex.chainId].address
      : currencyA.address
    : null
  const tokenBAddress = currencyB
    ? currencyB.symbol === data?.chain?.nativeCurrency.symbol
      ? WBONE[localDex.chainId].address
      : currencyB.address
    : null

  
  const [onPresentCreatedZapModalPending] = useModal(<CreatedZapModalPending 
      inToken={isBNB ? WBONE[localDex.chainId] : inToken}
      tokenA={tokenAAddress}
      tokenB={tokenBAddress}
      chainId={localDex.chainId}
      inRouter={getAddress(localDex.router, localDex.chainId)}
      isBNB={isBNB}
      amount={zapAmount}
      canZap={canZap}
      pair={`To: ${currencies[Field.CURRENCY_A]?.symbol}/${currencies[Field.CURRENCY_B]?.symbol}`}
    />)



  return (
    <Page>
      {showConnectButton ? (
        <CardBody>
          <CenterBody>
            <Flex m='10px' alignItems='center' justifyContent='center'>
              <Text color='textSubtle' fontSize='13px' mr='4px'>
                Please connect your wallet.
              </Text>
            </Flex>
          </CenterBody>
        </CardBody>
      ) : (
        <AppBody>
          <AppHeader backTo='/liquidity'>
          <Flex flexDirection='row' alignItems='center' justifyContent='space-between' >
          <PMTokenSelector />
            <Flex justifyContent='center' alignItems='center'>
              <ButtonMenu activeIndex={zap ? 1 : 0} scale='sm' variant='subtle' onItemClick={handleClick}>
                <ButtonMenuItem as='button'>Standard</ButtonMenuItem>
                <ButtonMenuItem as='button'>ZAP</ButtonMenuItem>
              </ButtonMenu>
            </Flex>
            </Flex>
          </AppHeader>

          <CardBody>
            <AutoColumn>
              {noLiquidity && (
                <ColumnCenter>
                  <Message mb='20px' variant='warning'>
                    <div>
                      <Text bold mb='8px'>
                        {t('You are the first liquidity provider.')}
                      </Text>
                      <Text mb='8px'>{t('The ratio of tokens you add will set the price of this pool.')}</Text>
                      <Text>{t('Once you are happy with the rate click supply to review.')}</Text>
                    </div>
                  </Message>
                </ColumnCenter>
              )}

              {zap && (
                <AutoColumn>
                  {currencyA && currencyB && (
                    <>
                      <Text mb='20px' color='secondary'>
                        ZAP TOKEN
                      </Text>
                      <CurrencyInputPanel
                        chainId={localDex.chainId}
                        dex={localDex}
                        value={zapAmount}
                        onUserInput={handleTypeInput}
                        onCurrencySelect={handleInputSelect}
                        showMaxButton={false}
                        currency={inToken}
                        id='add-liquidity-input-tokenc'
                      />
                      <Flex alignItems='right' justifyContent='right' mb='0.8rem' mt='0.8rem'>
                        <Button
                          onClick={() => {
                            handleTypeInput(selectedCurrencyBalance?.toExact() ?? '')
                          }}
                          scale='sm'
                          variant='primary'
                          style={{ textTransform: 'uppercase' }}
                        >
                          {t('Max')}
                        </Button>
                      </Flex>
                    </>
                  )}
                </AutoColumn>
              )}

              {zap && (
                <Text mb='20px' color='secondary'>
                  {currencyA && currencyB ? 'PAIR' : 'SELECT PAIR'}
                </Text>
              )}

              <Flex flexDirection={!zap ? 'column' : 'row'} justifyContent={zap ? 'space-between' : null}>
                <CurrencyInputPanel
                  chainId={localDex.chainId}
                  dex={localDex}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onFieldAInput}
                  onMax={() => {
                    onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                  }}
                  onCurrencySelect={handleCurrencyASelect}
                  showMaxButton={false}
                  currency={currencies[Field.CURRENCY_A]}
                  id='add-liquidity-input-tokena'
                  showCommonBases
                  hideInput={zap}
                  minimal={zap}
                />
                {!zap && (
                  <Flex alignItems='right' justifyContent='right' mt='0.6rem' mb='0.6rem'>
                    <Button
                      onClick={() => {
                        onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                      }}
                      scale='sm'
                      variant='primary'
                      style={{ textTransform: 'uppercase' }}
                    >
                      {t('Max')}
                    </Button>
                  </Flex>
                )}
                <AddIcon mb={"1.6rem"} width='35px' />
             
                
                <CurrencyInputPanel
                  chainId={localDex.chainId}
                  dex={localDex}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onFieldBInput}
                  onCurrencySelect={handleCurrencyBSelect}
                  onMax={() => {
                    onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                  }}
                  showMaxButton={false}
                  currency={currencies[Field.CURRENCY_B]}
                  id='add-liquidity-input-tokenb'
                  showCommonBases
                  hideInput={zap}
                  minimal={zap}
                />
                {!zap && (
                  <Flex alignItems='right' justifyContent='right' mt='0.6rem' mb='0.6rem'>
                    <Button
                      onClick={() => {
                        onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                      }}
                      scale='sm'
                      variant='primary'
                      style={{ textTransform: 'uppercase' }}
                    >
                      {t('Max')}
                    </Button>
                  </Flex>
                )}
              </Flex>

              {zap ? (
                <AutoColumn style={{ marginTop: '12px', marginBottom: '8px' }} gap='md'>
                  <Flex justifyContent='center' mt='20px' mb='20px'>
                    <Button
                      variant={!canZap && !!zapAmount ? 'danger' : 'primary'}
                      onClick={() => onPresentCreatedZapModalPending()}
                      disabled={!canZap}
                    >
                      {!canZap ? 'Enter an amount' : t('Zap %asset%', { asset: inToken?.symbol })}
                    </Button>
                  </Flex>
                </AutoColumn>
              ) : addIsUnsupported ? (
                <Button disabled width='100%' mt='12px' mb='12px'>
                  {t('Unsupported Asset')}
                </Button>
              ) : (
                <AutoColumn style={{ marginTop: '12px', marginBottom: '12px' }} gap='md'>
                  {(approvalA === ApprovalState.NOT_APPROVED ||
                    approvalA === ApprovalState.PENDING ||
                    approvalB === ApprovalState.NOT_APPROVED ||
                    approvalB === ApprovalState.PENDING) &&
                    isValid && (
                      <RowBetween>
                        {approvalA !== ApprovalState.APPROVED && (
                          <Button
                            onClick={approveACallback}
                            disabled={approvalA === ApprovalState.PENDING}
                            width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                          >
                            {approvalA === ApprovalState.PENDING ? (
                              <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Dots>
                            ) : (
                              t('Enable %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })
                            )}
                          </Button>
                        )}
                        {approvalB !== ApprovalState.APPROVED && (
                          <Button
                            onClick={approveBCallback}
                            disabled={approvalB === ApprovalState.PENDING}
                            width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                          >
                            {approvalB === ApprovalState.PENDING ? (
                              <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Dots>
                            ) : (
                              t('Enable %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })
                            )}
                          </Button>
                        )}
                      </RowBetween>
                    )}
                  <Flex justifyContent='center' mt='10px' mb='20px'>
                    <Button
                      variant={
                        !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                          ? 'danger'
                          : 'primary'
                      }
                      onClick={() => {
                        if (expertMode) {
                          onAdd()
                        } else {
                          onPresentAddLiquidityModal()
                        }
                      }}
                      disabled={
                        !isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                      }
                    >
                      {error ?? t('Supply')}
                    </Button>
                  </Flex>
                </AutoColumn>
              )}
              {isApproved && !zap && paymasterInfo &&
                <PayMasterPreview paymasterInfo={paymasterInfo} dex={localDex} error={entireError}/>
              }
              {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && !zap && (
                <>
                  <LightCard mt='20px' padding='0px' borderRadius='20px'>
                    <RowBetween padding='1rem'>
                      <Text fontSize='10px'>
                        {noLiquidity ? t('Initial prices and pool share') : t('Prices and pool share')}
                      </Text>
                    </RowBetween>{' '}
                    <LightCard padding='1rem' borderRadius='20px'>
                      <PoolPriceBar
                        currencies={currencies}
                        poolTokenPercentage={poolTokenPercentage}
                        noLiquidity={noLiquidity}
                        price={price}
                      />
                    </LightCard>
                  </LightCard>
                </>
              )}
            </AutoColumn>
          </CardBody>
        </AppBody>
      )}
      {!addIsUnsupported ? (
        pair && !noLiquidity && pairState !== PairState.INVALID ? (
          <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '3rem' }}>
            <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} dex={localDex} />
          </AutoColumn>
        ) : null
      ) : (
        <UnsupportedCurrencyFooter
          currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
          chainId={localDex.chainId}
        />
      )}
    </Page>
  )
}
