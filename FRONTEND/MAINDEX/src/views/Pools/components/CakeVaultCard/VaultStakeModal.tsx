import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Modal, Text, Flex, Image, Button, Slider, BalanceInput, AutoRenewIcon, CalculateIcon, IconButton } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state'
import { BIG_TEN } from 'utils/bigNumber'
import { useHostPrice } from 'state/farms/hooks'
import { useCakeVault } from 'state/pools/hooks'
import useTheme from 'hooks/useTheme'
import useWithdrawalFeeTimer from 'views/Pools/hooks/useWithdrawalFeeTimer'
import BigNumber from 'bignumber.js'
import { getFullDisplayBalance, formatNumber, getDecimalAmount } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
import { fetchCakeVaultUserData } from 'state/pools'
import { Pool } from 'state/types'
import { getAddress, getCakeVaultAddress } from 'utils/addressHelpers'
import { getInterestBreakdown } from 'utils/compoundApyHelpers'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import { ToastDescriptionWithTx } from 'components/Toast'
import { convertCakeToShares, convertSharesToCake } from '../../helpers'
import FeeSummary from './FeeSummary'
import { useAccount } from 'wagmi'
import { cakeVaultAbi } from 'config/abi/cakeVault'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { useCheckVaultApprovalStatus, useVaultApprove } from 'views/Pools/hooks/useApprove'
import { config } from 'wagmiConfig'

interface VaultStakeModalProps {
  pool: Pool
  stakingMax: BigNumber
  performanceFee?: number
  isRemovingStake?: boolean
  onDismiss?: () => void
}

const StyledButton = styled(Button)`
  flex-grow: 1;
`

const AnnualRoiContainer = styled(Flex)`
  cursor: pointer;
`

const AnnualRoiDisplay = styled(Text)`
  width: 72px;
  max-width: 72px;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
`

const VaultStakeModal: React.FC<VaultStakeModalProps> = ({
  pool,
  stakingMax,
  performanceFee,
  isRemovingStake = false,
  onDismiss,
}) => {
  const dispatch = useAppDispatch()
  const { stakingToken, earningToken, apr, stakingTokenPrice, earningTokenPrice } = pool
  const { address: account } = useAccount()
  const {
    userData: { lastDepositedTime, userShares },
    pricePerFullShare,
  } = useCakeVault()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')
  const [percent, setPercent] = useState(0)
  const [showRoiCalculator, setShowRoiCalculator] = useState(false)
  const { hasUnstakingFee } = useWithdrawalFeeTimer(
    parseInt(lastDepositedTime.toString(), 10),
    new BigNumber(userShares.toString()),
  )
  const getHostPrice = useHostPrice()
  const hostPrice = getHostPrice(pool.host)
  const usdValueStaked = new BigNumber(stakeAmount).times(hostPrice)
  const formattedUsdValueStaked = hostPrice.gt(0) && stakeAmount ? formatNumber(usdValueStaked.toNumber()) : ''

  const { cakeAsBigNumber } = convertSharesToCake(new BigNumber(userShares), new BigNumber(pricePerFullShare))
  const [maxPercent, setMaxPercent] = useState(100)
  useEffect(() => {
    if (isRemovingStake === false) {
      setMaxPercent(99.9)
    }
  }, [isRemovingStake])

  const interestBreakdown = getInterestBreakdown({
    principalInUSD: !usdValueStaked.isNaN() ? usdValueStaked.toNumber() : 0,
    apr,
    earningTokenPrice,
    performanceFee,
  })
  const annualRoi = interestBreakdown[3] * pool.earningTokenPrice
  const formattedAnnualRoi = formatNumber(annualRoi, annualRoi > 10000 ? 0 : 2, annualRoi > 10000 ? 0 : 2)

  const getTokenLink = stakingToken.address ? `/swap?outputCurrency=${getAddress(stakingToken.address)}` : '/swap'

  const handleStakeInputChange = (input: string) => {
    if (input) {
      const convertedInput = new BigNumber(input).multipliedBy(BIG_TEN.pow(stakingToken.decimals))
      const percentage = Math.floor(convertedInput.dividedBy(stakingMax).multipliedBy(100).toNumber())
      setPercent(percentage > maxPercent ? maxPercent : percentage)
    } else {
      setPercent(0)
    }
    setStakeAmount(input)
  }

  const handleChangePercent = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = stakingMax.dividedBy(100).multipliedBy(sliderPercent)
      const amountToStake = getFullDisplayBalance(percentageOfStakingMax, stakingToken.decimals, stakingToken.decimals)
      setStakeAmount(amountToStake)
    } else {
      setStakeAmount('')
    }
    setPercent(sliderPercent)
  }  

  const handleWithdrawal = async (convertedStakeAmount: BigNumber) => {
    setPendingTx(true)
    const shareStakeToWithdraw = convertCakeToShares(convertedStakeAmount, new BigNumber(pricePerFullShare))
    // trigger withdrawAll function if the withdrawal will leave 0.000001 CAKE or less
    const triggerWithdrawAllThreshold = new BigNumber(1000000000000)
    const sharesRemaining = new BigNumber(userShares.toString()).minus(shareStakeToWithdraw.sharesAsBigNumber)
    const isWithdrawingAll = sharesRemaining.lte(triggerWithdrawAllThreshold)

    if (isWithdrawingAll) {
      try {
        const { request } = await simulateContract(config, {
          abi: cakeVaultAbi,
          address: getCakeVaultAddress(),
          functionName: 'withdrawAll',
          chainId: pool.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
        if (receipt.status === 'success') {
          toastSuccess(
            t('Unstaked!'),
            <ToastDescriptionWithTx txHash={receipt.transactionHash}>
              {t('Your earnings have also been harvested to your wallet')}
            </ToastDescriptionWithTx>,
          )
          setPendingTx(false)
          onDismiss()
          dispatch(fetchCakeVaultUserData({ account }))
        }
      } catch (error) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        setPendingTx(false)
      }
    } else {
      // .toString() being called to fix a BigNumber error in prod
      // as suggested here https://github.com/ChainSafe/web3.js/issues/2077
      try {
        const { request } = await simulateContract(config, {
          abi: cakeVaultAbi,
          address: getCakeVaultAddress(),
          functionName: 'withdraw',
          args: [BigInt(shareStakeToWithdraw.sharesAsBigNumber.toString())],
          gas: 380000n,
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
        if (receipt.status === 'success') {
          toastSuccess(
            t('Unstaked!'),
            <ToastDescriptionWithTx txHash={receipt.transactionHash}>
              {t('Your earnings have also been harvested to your wallet')}
            </ToastDescriptionWithTx>,
          )
          setPendingTx(false)
          onDismiss()
          dispatch(fetchCakeVaultUserData({ account }))
        }
      } catch (error) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        setPendingTx(false)
      }
    }
  }

  const handleDeposit = async (convertedStakeAmount: BigNumber) => {
    setPendingTx(true)
    try {
      // .toString() being called to fix a BigNumber error in prod
      // as suggested here https://github.com/ChainSafe/web3.js/issues/2077
      const { request } = await simulateContract(config, {
        abi: cakeVaultAbi,
        address: getCakeVaultAddress(),
        functionName: 'deposit',
        args: [BigInt(convertedStakeAmount.toString())],
        chainId: pool.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      if (receipt.status === 'success') {
        toastSuccess(
          t('Staked!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Your funds have been staked in the pool')}
          </ToastDescriptionWithTx>,
        )
        setPendingTx(false)
        onDismiss()
        dispatch(fetchCakeVaultUserData({ account }))
      }
    } catch (error) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx(false)
    }
  }

  const handleConfirmClick = async () => {
    const convertedStakeAmount = getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals)
    if (isRemovingStake) {
      // unstaking
      handleWithdrawal(convertedStakeAmount)
    } else {
      // staking
      handleDeposit(convertedStakeAmount)
    }
  }

  if (showRoiCalculator) {
    return (
      <RoiCalculatorModal
        earningTokenPrice={earningTokenPrice}
        stakingTokenPrice={stakingTokenPrice}
        apr={apr}
        linkLabel={t('Get %symbol%', { symbol: stakingToken.symbol })}
        linkHref={getTokenLink}
        stakingTokenBalance={cakeAsBigNumber.plus(stakingMax)}
        stakingTokenSymbol={stakingToken.symbol}
        earningTokenSymbol={earningToken.symbol}
        onBack={() => setShowRoiCalculator(false)}
        initialValue={stakeAmount}
        performanceFee={performanceFee}
      />
    )
  }

  const { isVaultApproved, setLastUpdated } = useCheckVaultApprovalStatus(new BigNumber(stakeAmount).shiftedBy(stakingToken.decimals).toString())
  const { handleApprove, requestedApproval } =
  useVaultApprove(setLastUpdated)

  return (
    <Modal
      title={isRemovingStake ? t('Unstake') : t('Stake in Pool')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <Text bold>{isRemovingStake ? t('Unstake') : t('Stake')}:</Text>
        <Flex alignItems="center" minWidth="70px">
          <Image
            src={`/images/tokens/${getAddress(stakingToken.address).toUpperCase()}.png`}
            width={24}
            height={24}
            alt={stakingToken.symbol}
          />
          <Text ml="4px" bold>
            {stakingToken.symbol}
          </Text>
        </Flex>
      </Flex>
      <BalanceInput
        value={stakeAmount}
        onUserInput={handleStakeInputChange}
        currencyValue={hostPrice && hostPrice.gt(0) && `~${formattedUsdValueStaked || 0} USD`}
        decimals={stakingToken.decimals}
      />
      <Text mt="8px" ml="auto" color="textSubtle" fontSize="12px" mb="8px">
        {t('Balance: %balance%', { balance: getFullDisplayBalance(stakingMax, stakingToken.decimals) })}
      </Text>
      <Slider
        min={0}
        max={maxPercent}
        value={percent}
        onValueChanged={handleChangePercent}
        name="stake"
        valueLabel={`${percent}%`}
        step={1}
      />
      <Flex alignItems="center" justifyContent="space-between" mt="8px">
        <StyledButton scale="xs" mx="2px" p="4px 16px" variant="tertiary" onClick={() => handleChangePercent(25)}>
          25%
        </StyledButton>
        <StyledButton scale="xs" mx="2px" p="4px 16px" variant="tertiary" onClick={() => handleChangePercent(50)}>
          50%
        </StyledButton>
        <StyledButton scale="xs" mx="2px" p="4px 16px" variant="tertiary" onClick={() => handleChangePercent(75)}>
          75%
        </StyledButton>
        <StyledButton
          scale="xs"
          mx="2px"
          p="4px 16px"
          variant="tertiary"
          onClick={() => handleChangePercent(maxPercent)}
        >
          {t('Max')}
        </StyledButton>
      </Flex>
      {isRemovingStake && hasUnstakingFee && (
        <FeeSummary stakingTokenSymbol={stakingToken.symbol} stakeAmount={stakeAmount} />
      )}
      {!isRemovingStake && (
        <Flex mt="24px" alignItems="center" justifyContent="space-between">
          <Text mr="8px" color="textSubtle">
            {t('Annual ROI at current rates')}:
          </Text>
          <AnnualRoiContainer alignItems="center" onClick={() => setShowRoiCalculator(true)}>
            <AnnualRoiDisplay>${formattedAnnualRoi}</AnnualRoiDisplay>
            <IconButton variant="text" scale="sm">
              <CalculateIcon color="textSubtle" width="18px" />
            </IconButton>
          </AnnualRoiContainer>
        </Flex>
      )}
      {!isVaultApproved ? (
        <Button width="100%" disabled={requestedApproval || !stakeAmount} onClick={handleApprove} variant="secondary">
        {t('Enable')}
      </Button>
      ) : (
      <Button
        isLoading={pendingTx}
        endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
        onClick={handleConfirmClick}
        disabled={!stakeAmount || parseFloat(stakeAmount) === 0}
        mt="24px"
      >
        {pendingTx ? t('Confirming') : t('Confirm')}
      </Button>
      )}
      {!isRemovingStake && (
        <Button mt="8px" as="a" external href={getTokenLink} variant="secondary">
          {t('Get %symbol%', { symbol: stakingToken.symbol })}
        </Button>
      )}
    </Modal>
  )
}

export default VaultStakeModal
