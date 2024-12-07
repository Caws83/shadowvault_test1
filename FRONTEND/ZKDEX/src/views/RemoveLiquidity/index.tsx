import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency, currencyEquals, getETHER, Percent, getWBONE } from 'sdk'
import { Button, Text, AddIcon, ArrowDownIcon, CardBody, Slider, Box, Flex, useModal, TextHeader } from 'uikit'
import { getAddress } from 'utils/addressHelpers'
import { useTranslation } from 'contexts/Localization'
import { Dex } from 'config/constants/types'
import { AutoColumn, ColumnCenter } from '../../components/Layout/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { MinimalPositionCard } from '../../components/PositionCard'
import { AppBody } from '../../components/App'
import { RowBetween, RowFixed } from '../../components/Layout/Row'
import ConnectWalletButton from '../../components/ConnectWalletButton'
import { LightGreyCard } from '../../components/Card'
import AppHeader from 'views/Swap/components/AppHeader'
import { CurrencyLogo, DoubleCurrencyLogo } from '../../components/Logo'
import { useCurrency } from '../../hooks/Tokens'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { dexs } from 'config/constants/dex'
import StyledInternalLink from '../../components/Links'
import { calculateGasMargin, calculateSlippageAmount } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../hooks/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import Dots from '../../components/Loader/Dots'
import { useBurnActionHandlers, useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'
import { config } from 'wagmiConfig'
import { Field } from '../../state/burn/actions'
import { useUserDex, useUserSlippageTolerance } from '../../state/user/hooks'
import Page from '../Page'
import { useAccount, usePublicClient } from 'wagmi'
import { pancakeRouterAbi } from 'config/abi/pancakeRouter'
import { simulateContract, writeContract } from '@wagmi/core'
import { useParams, useNavigate } from 'react-router-dom'
import { useTokenBalance } from 'state/wallet/hooks'
import { BigNumber } from 'bignumber.js'

const BorderCard = styled.div`
  border: solid 1px ${({ theme }) => theme.colors.cardBorder};
  border-radius: 4px;
  padding: 16px;
`

export default function RemoveLiquidity () {
  const { currencyIdA, currencyIdB } = useParams()
  const { address: account } = useAccount()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const data = useAccount()
  const [currentChain, setCurrentChain] = useState<number>()

  const [dex, setDex] = useUserDex()

  const getDex = () => {
    for (const key in dexs) {
      if (dexs[key].chainId === data.chain?.id) {
        return dexs[key]
      }
    }
    return dex
  }

  useEffect(() => {
    if (data.chain) {
      setCurrentChain(data.chain.id)
      handleDexChange(getDex())
    }
  }, [data])

  const showConnectButton = !account || currentChain !== dex.chainId
  const publicClient = usePublicClient({ chainId: dex.chainId })
  const [currencyA, currencyB] = [
    useCurrency(currencyIdA, dex.chainId) ?? undefined,
    useCurrency(currencyIdB, dex.chainId) ?? undefined,
  ]

  const [tokenA, tokenB] = useMemo(
    () => [wrappedCurrency(currencyA, dex.chainId), wrappedCurrency(currencyB, dex.chainId)],
    [currencyA, currencyB, dex.chainId],
  )

  const ETHER = getETHER(dex.chainId)

  const { chain } = useAccount()
  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(dex, currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const deadline = useTransactionDeadline(dex.chainId)
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    getAddress(dex.router, dex.chainId),
  )

  async function onAttemptToApprove () {
    approveCallback()
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, value: string) => {
      setSignatureData(null)
      return _onUserInput(field, value)
    },
    [_onUserInput],
  )

  const onLiquidityInput = useCallback((value: string): void => onUserInput(Field.LIQUIDITY, value), [onUserInput])
  const onCurrencyAInput = useCallback((value: string): void => onUserInput(Field.CURRENCY_A, value), [onUserInput])
  const onCurrencyBInput = useCallback((value: string): void => onUserInput(Field.CURRENCY_B, value), [onUserInput])

  // tx sending
  // const addTransaction = useTransactionAdder()
  async function onRemove () {
    if (!dex.chainId || !account || !deadline) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: (
      | 'removeLiquidityETH'
      | 'removeLiquidityETHSupportingFeeOnTransferTokens'
      | 'removeLiquidity'
      | 'removeLiquidityETHWithPermit'
      | 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens'
      | 'removeLiquidityWithPermit'
    )[]
    let args
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? (tokenA.address as `0x${string}`) : (tokenB.address as `0x${string}`),
          BigInt(liquidityAmount.raw.toString()),
          BigInt(amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString()),
          BigInt(amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString()),
          account,
          BigInt(deadline.toString()),
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address as `0x${string}`,
          tokenB.address as `0x${string}`,
          BigInt(liquidityAmount.raw.toString()),
          BigInt(amountsMin[Field.CURRENCY_A].toString()),
          BigInt(amountsMin[Field.CURRENCY_B].toString()),
          account,
          BigInt(deadline.toString()),
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? (tokenA.address as `0x${string}`) : (tokenB.address as `0x${string}`),
          BigInt(liquidityAmount.raw.toString()),
          BigInt(amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString()),
          BigInt(amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString()),
          account,
          BigInt(signatureData.deadline),
          true,
          signatureData.v,
          signatureData.r as `0x${string}`,
          signatureData.s as `0x${string}`,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address as `0x${string}`,
          tokenB.address as `0x${string}`,
          BigInt(liquidityAmount.raw.toString()),
          BigInt(amountsMin[Field.CURRENCY_A].toString()),
          BigInt(amountsMin[Field.CURRENCY_B].toString()),
          account,
          BigInt(signatureData.deadline),
          true,
          signatureData.v,
          signatureData.r as `0x${string}`,
          signatureData.s as `0x${string}`,
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }

    const safeGasEstimates: (bigint | undefined)[] = await Promise.all(
      methodNames.map(methodName =>
        publicClient
          .estimateContractGas({
            account,
            abi: pancakeRouterAbi,
            address: getAddress(dex.router, dex.chainId),
            functionName: methodName,
            args,
            chainId: dex.chainId,
          })
          .then(calculateGasMargin)
          .catch(err => {
            console.error(`estimateGas failed`, methodName, args, err)
            return undefined
          }),
      ),
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate => safeGasEstimate !== undefined)

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)
      const { request } = await simulateContract(config, {
        abi: pancakeRouterAbi,
        address: getAddress(dex.router, dex.chainId),
        functionName: methodName,
        args,
        gas: safeGasEstimate,
        chainId: dex.chainId,
      })
      const data = await writeContract(config, request)
      setAttemptingTxn(false)
      /*
      addTransaction(data.hash, dex.chainId, account as `0x${string}`, {
        summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencyA?.symbol} and ${parsedAmounts[
          Field.CURRENCY_B
        ]?.toSignificant(3)} ${currencyB?.symbol}`,
      })
*/
      setTxHash(data)
    }
  }

  function modalHeader () {
    return (
      <AutoColumn>
        <RowBetween align='flex-end'>
          <Text fontSize='12px'>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Text>
          <RowFixed gap='4px'>
            <CurrencyLogo currency={currencyA} chainId={dex.chainId} size='24px' />
            <Text fontSize='12px' ml='12px'>
              {currencyA?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <AddIcon width='16px' />
        </RowFixed>
        <RowBetween align='flex-end'>
          <Text fontSize='12px'>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Text>
          <RowFixed gap='4px'>
            <CurrencyLogo currency={currencyB} chainId={dex.chainId} size='24px' />
            <Text fontSize='12px' ml='12px'>
              {currencyB?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <Text fontSize='12px' textAlign='left' mb='30px' pt='30px'>
          {t('Output is estimated. If the price changes by more than %slippage%% your transaction will revert.', {
            slippage: allowedSlippage / 100,
          })}
        </Text>
      </AutoColumn>
    )
  }

  function modalBottom () {
    return (
      <>
        <RowBetween mb='12px'>
          <Text fontSize='12px'>
            {t('%assetA%/%assetB% Burned', { assetA: currencyA?.symbol ?? '', assetB: currencyB?.symbol ?? '' })}
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin />
            <Text>{parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}</Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
        
              <Text fontSize='12px'>{t('Price:')}</Text>
              <Text fontSize='12px'>
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
              <div />
              <Text fontSize='12px'>
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
 
          </>
        )}
        <Flex alignItems={'center'} justifyContent={'center'} mt='50px' mb='20px'>
          <Button disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)} onClick={onRemove}>
            {t('Confirm')}
          </Button>
        </Flex>
      </>
    )
  }

  const pendingText = t('Removing %amountA% %symbolA% and %amountB% %symbolB%', {
    amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    symbolA: currencyA?.symbol ?? '',
    amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
    symbolB: currencyB?.symbol ?? '',
  })

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput],
  )
  const WBONE = getWBONE()
  const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWETH = Boolean(
    dex.chainId &&
      ((currencyA && currencyEquals(WBONE[dex.chainId], currencyA)) ||
        (currencyB && currencyEquals(WBONE[dex.chainId], currencyB))),
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        navigate(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        navigate(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, navigate],
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        navigate(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        navigate(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, navigate],
  )

  const handleDismissConfirmation = useCallback(() => {
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback,
  )

  const [onPresentRemoveLiquidity] = useModal(
    <TransactionConfirmationModal
      title={t('Remove Liquidity')}
      chainId={dex.chainId}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txHash || ''}
      content={() => <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />}
      pendingText={pendingText}
    />,
    true,
    true,
    'removeLiquidityModal',
  )

  const handleDexChange = (newDex: Dex) => {
    setDex(newDex)
  }

  const userPoolBalance = useTokenBalance(dex.chainId, account ?? undefined, pair?.liquidityToken ?? undefined)
  const toUnPair = new BigNumber(userPoolBalance?.numerator.toString())
    .multipliedBy(innerLiquidityPercentage)
    .dividedBy(100)

  return (
    <Page style={{ padding: '20px' }}>
      <AppBody>
        <AppHeader backTo='/liquidity'>
          <Flex flexDirection='row' alignItems='center' justifyContent='flex-end' mr='8px'>
            <TextHeader>REMOVE LIQUIDITY FEE:</TextHeader>
            <TextHeader color='primary' fontSize='12px'>{` ${parseFloat(new BigNumber(0).shiftedBy(-18).toFixed(5))} ${
              chain?.nativeCurrency.symbol
            }`}</TextHeader>
          </Flex>
        </AppHeader>
        <CardBody>
          <AutoColumn gap='20px'>
            <RowBetween>
              <Flex flexDirection='row'>
                <Text mr='3px' color='secondary'>
                  {t(`Balance:`)}
                </Text>
                <Text mr='3px'>{t(`${userPoolBalance?.toSignificant(6)}`)}</Text>
                <Text color='secondary'>{t(`Lp`)}</Text>
              </Flex>
            </RowBetween>
            {!showDetailed && (
              <BorderCard>
                <Text fontSize='20px' bold mb='16px' style={{ lineHeight: 1 }}>
                  {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                </Text>
                <Slider
                  name='lp-amount'
                  min={0}
                  max={100}
                  value={innerLiquidityPercentage}
                  onValueChanged={value => setInnerLiquidityPercentage(Math.ceil(value))}
                  mb='16px'
                />
                <Flex mb='20px' flexDirection='row'>
                  <Text>{t(`${toUnPair.shiftedBy(-18).toFixed(6)}`)}</Text>
                  <Text color='secondary' ml='3px'>
                    {t(`LP Tokens`)}
                  </Text>
                </Flex>
                <Flex flexWrap='wrap' justifyContent='space-evenly'>
                  <Button variant='tertiary' scale='sm' onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')}>
                    25%
                  </Button>
                  <Button variant='tertiary' scale='sm' onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')}>
                    50%
                  </Button>
                  <Button variant='tertiary' scale='sm' onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')}>
                    75%
                  </Button>
                  <Button variant='tertiary' scale='sm' onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}>
                    Max
                  </Button>
                </Flex>
              </BorderCard>
            )}
          </AutoColumn>
          {!showDetailed && (
            <>
              <Flex mb='20px' mt='20px'></Flex>
              <AutoColumn gap='12px'>
                <Text bold color='secondary' fontSize='12px' textTransform='uppercase'>
                  {t('You will receive')}
                </Text>
                <LightGreyCard>
                  <Flex alignItems='20px' justifyContent='space-between' mb='8px'>
                    <Flex alignItems='center'>
                      <CurrencyLogo currency={currencyA} chainId={dex.chainId} />
                      <Text small color='textSubtle' id='remove-liquidity-tokena-symbol' ml='4px'>
                        {currencyA?.symbol}
                      </Text>
                    </Flex>
                    <Text small>{formattedAmounts[Field.CURRENCY_A] || '-'}</Text>
                  </Flex>
                  <Flex justifyContent='space-between'>
                    <Flex alignItems='center'>
                      <CurrencyLogo currency={currencyB} chainId={dex.chainId} />
                      <Text small color='textSubtle' id='remove-liquidity-tokenb-symbol' ml='4px'>
                        {currencyB?.symbol}
                      </Text>
                    </Flex>
                    <Text small>{formattedAmounts[Field.CURRENCY_B] || '-'}</Text>
                  </Flex>
                  {dex.chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                    <RowBetween style={{ justifyContent: 'flex-end', fontSize: '12px' }}>
                      <Flex mt='20px'>
                        {oneCurrencyIsETH ? (
                          <StyledInternalLink
                            to={`/remove/${currencyA === ETHER ? WBONE[dex.chainId].address : currencyIdA}/${
                              currencyB === ETHER ? WBONE[dex.chainId].address : currencyIdB
                            }`}
                          >
                            {t('Receive WNative')}
                          </StyledInternalLink>
                        ) : oneCurrencyIsWETH ? (
                          <StyledInternalLink
                            to={`/remove/${
                              currencyA && currencyEquals(currencyA, WBONE[dex.chainId]) ? 'zkCRO' : currencyIdA
                            }/${currencyB && currencyEquals(currencyB, WBONE[dex.chainId]) ? 'zkCRO' : currencyIdB}`}
                          >
                            {t('Receive Native')}
                          </StyledInternalLink>
                        ) : null}
                      </Flex>
                    </RowBetween>
                  ) : null}
                </LightGreyCard>
              </AutoColumn>
            </>
          )}

          {showDetailed && (
            <Box my='16px'>
              <CurrencyInputPanel
                chainId={dex.chainId}
                dex={dex}
                value={formattedAmounts[Field.LIQUIDITY]}
                onUserInput={onLiquidityInput}
                onMax={() => {
                  onUserInput(Field.LIQUIDITY_PERCENT, '100')
                }}
                showMaxButton={!atMaxAmount}
                disableCurrencySelect
                currency={pair?.liquidityToken}
                pair={pair}
                id='liquidity-amount'
                onCurrencySelect={() => null}
              />
              <ColumnCenter>
                <ArrowDownIcon width='24px' my='16px' />
              </ColumnCenter>
              <CurrencyInputPanel
                chainId={dex.chainId}
                dex={dex}
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onCurrencyAInput}
                onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                showMaxButton={!atMaxAmount}
                currency={currencyA}
                label={t('Output')}
                onCurrencySelect={handleSelectCurrencyA}
                id='remove-liquidity-tokena'
              />
              <ColumnCenter>
                <AddIcon width='24px' my='16px' />
              </ColumnCenter>
              <CurrencyInputPanel
                chainId={dex.chainId}
                dex={dex}
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onCurrencyBInput}
                onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                showMaxButton={!atMaxAmount}
                currency={currencyB}
                label={t('Output')}
                onCurrencySelect={handleSelectCurrencyB}
                id='remove-liquidity-tokenb'
              />
            </Box>
          )}
          {pair && (
            <AutoColumn gap='12px' style={{ marginTop: '16px' }}>
              <Text bold color='secondary' fontSize='12px' textTransform='uppercase'>
                {t('Prices')}
              </Text>
              <LightGreyCard>
                <Flex justifyContent='space-between'>
                  <Text fontSize='12px' color='textSubtle'>
                    1 {currencyA?.symbol} =
                  </Text>
                  <Text fontSize='12px'>
                    {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                  </Text>
                </Flex>
                <Flex justifyContent='space-between'>
                  <Text fontSize='12px' color='textSubtle'>
                    1 {currencyB?.symbol} =
                  </Text>
                  <Text fontSize='12px'>
                    {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                  </Text>
                </Flex>
              </LightGreyCard>
            </AutoColumn>
          )}
          <Box position='relative' mt='50px'  mb='20px'>
            {showConnectButton ? (
              <ConnectWalletButton chain={dex.chainId} />
            ) : (
              <>
                <RowBetween>
                  <Button
                    variant={approval === ApprovalState.APPROVED || signatureData !== null ? 'success' : 'primary'}
                    onClick={onAttemptToApprove}
                    disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                    width='100%'
                    mr='0.5rem'
                  >
                    {approval === ApprovalState.PENDING ? (
                      <Dots>{t('Enabling')}</Dots>
                    ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                      t('Enabled')
                    ) : (
                      t('Enable')
                    )}
                  </Button>
                  <Button
                    variant={
                      !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                        ? 'danger'
                        : 'primary'
                    }
                    onClick={() => {
                      onPresentRemoveLiquidity()
                    }}
                    width='100%'
                    disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                  >
                    {error || t('Remove')}
                  </Button>
                </RowBetween>
                <RowBetween mt='8px'></RowBetween>
              </>
            )}
          </Box>
        </CardBody>
      </AppBody>

      {pair ? (
        <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '50px' }}>
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} dex={dex} />
        </AutoColumn>
      ) : null}
    </Page>
  )
}
