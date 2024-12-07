import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Modal,
  Text,
  Flex,
  Image,
  Button,
  Slider,
  BalanceInput,
  AutoRenewIcon,
  Link,
  CalculateIcon,
  IconButton,
} from 'uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import BigNumber from 'bignumber.js'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import { getFullDisplayBalance, formatNumber, getDecimalAmount } from 'utils/formatBalance'
import { Pool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { getInterestBreakdown } from 'utils/compoundApyHelpers'
import { EasyTransactionError, EasyTransactionSteps, TransactionSteps } from 'utils/types'
import EasyProgress from 'views/Farms/components/Modals/EasyProgess'
import PercentageButton from '../../../../../components/PercentageButton'
import useStakePool from '../../../hooks/useStakePool'
import useUnstakePool, { useUnstakePoolFG } from '../../../hooks/useUnstakePool'

interface StakeModalProps {
  isBnbPool: boolean
  pool: Pool
  stakingTokenBalance: BigNumber
  stakingTokenPrice: number
  isRemovingStake?: boolean
  onDismiss?: () => void
}

const StyledLink = styled(Link)`
  width: 100%;
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

const StakeModal: React.FC<StakeModalProps> = ({
  isBnbPool,
  pool,
  stakingTokenBalance,
  stakingTokenPrice,
  isRemovingStake = false,
  onDismiss,
}) => {
  const { sousId, stakingToken, earningTokenPrice, apr, userData, stakingLimit, earningToken } = pool
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { onStake } = useStakePool(pool, isBnbPool)
  const { onUnstake } = useUnstakePool(pool, pool.enableEmergencyWithdraw)
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')
  const [hasReachedStakeLimit, setHasReachedStakedLimit] = useState(false)
  const [percent, setPercent] = useState(0)
  const [step, setStep] = useState<EasyTransactionSteps>(EasyTransactionSteps.Start)
  const [isFG, setIsFG] = useState(false)
  const [txError, setTxError] = useState<EasyTransactionError>(EasyTransactionError.None)
  const [txMsg, setTxMsg] = useState('')
  const [showRoiCalculator, setShowRoiCalculator] = useState(false)
  const getCalculatedStakingLimit = () => {
    if (isRemovingStake) {
      return new BigNumber(userData.stakedBalance.toString())
    }
    return stakingLimit > 0n && stakingTokenBalance.gt(stakingLimit.toString())
      ? new BigNumber(stakingLimit.toString())
      : stakingTokenBalance
  }

  const onStage = (stage: EasyTransactionSteps) => {
    setStep(stage)
  }

  const onError = (error: EasyTransactionError, msg?: string) => {
    setTxError(error)
    setTxMsg(msg)
  }

  const steps: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: false,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.CreateLP]: false,
    [EasyTransactionSteps.Unstaking]: true,
    [EasyTransactionSteps.RemoveLiquidity]: false,
    [EasyTransactionSteps.Swap1]: true,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: false,
    [EasyTransactionSteps.Complete]: true,
  }

  const { onUnstakeFG } = useUnstakePoolFG(pool, onStage, onError)

  const usdValueStaked = new BigNumber(stakeAmount).times(stakingTokenPrice)
  const formattedUsdValueStaked = !usdValueStaked.isNaN() && formatNumber(usdValueStaked.toNumber())

  const interestBreakdown = getInterestBreakdown({
    principalInUSD: !usdValueStaked.isNaN() ? usdValueStaked.toNumber() : 0,
    apr,
    earningTokenPrice,
  })
  const annualRoi = interestBreakdown[3] * pool.earningTokenPrice
  const formattedAnnualRoi = formatNumber(annualRoi, annualRoi > 10000 ? 0 : 2, annualRoi > 10000 ? 0 : 2)

  const getTokenLink = stakingToken.address ? `/swap?outputCurrency=${getAddress(stakingToken.address)}` : '/swap'

  useEffect(() => {
    if (stakingLimit > 0n && !isRemovingStake) {
      const fullDecimalStakeAmount = getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals)
      setHasReachedStakedLimit(
        fullDecimalStakeAmount.plus(userData.stakedBalance.toString()).gt(stakingLimit.toString()),
      )
    }
  }, [stakeAmount, stakingLimit, userData, stakingToken, isRemovingStake, setHasReachedStakedLimit])

  const handleStakeInputChange = (input: string) => {
    if (input) {
      const convertedInput = getDecimalAmount(new BigNumber(input), stakingToken.decimals)
      const percentage = Math.floor(
        convertedInput.dividedBy(getCalculatedStakingLimit().toString()).multipliedBy(100).toNumber(),
      )
      setPercent(Math.min(percentage, 100))
    } else {
      setPercent(0)
    }
    setStakeAmount(input)
  }

  const handleChangePercent = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = getCalculatedStakingLimit().dividedBy(100).multipliedBy(sliderPercent)
      const amountToStake = getFullDisplayBalance(percentageOfStakingMax, stakingToken.decimals, stakingToken.decimals)
      setStakeAmount(amountToStake)
    } else {
      setStakeAmount('')
    }
    setPercent(sliderPercent)
  }

  const handleConfigmFG = async () => {
    setPendingTx(true)
    setIsFG(true)
    try {
      await onUnstakeFG(stakeAmount)
      toastSuccess(
        `${t('Unstaked')}!`,
        t('Your %symbol% earnings have also been harvested to your wallet!', {
          symbol: earningToken.symbol,
        }),
      )
      setPendingTx(false)
    } catch (e) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx(false)
      setStep(EasyTransactionSteps.Complete)
    }
  }

  const handleConfirmClick = async () => {
    setPendingTx(true)

    if (isRemovingStake) {
      // unstaking
      try {
        await onUnstake(stakeAmount, stakingToken.decimals)
        toastSuccess(
          `${t('Unstaked')}!`,
          t('Your %symbol% earnings have also been harvested to your wallet!', {
            symbol: earningToken.symbol,
          }),
        )
        setPendingTx(false)
        onDismiss()
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        setPendingTx(false)
        onDismiss()
      }
    } else {
      try {
        // staking
        await onStake(stakeAmount, stakingToken.decimals)
        toastSuccess(
          `${t('Staked')}!`,
          t('Your %symbol% funds have been staked in the pool!', {
            symbol: stakingToken.symbol,
          }),
        )
        setPendingTx(false)
        onDismiss()
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        setPendingTx(false)
        onDismiss()
      }
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
        stakingTokenBalance={new BigNumber(userData.stakedBalance.toString()).plus(stakingTokenBalance)}
        stakingTokenSymbol={stakingToken.symbol}
        earningTokenSymbol={earningToken.symbol}
        onBack={() => setShowRoiCalculator(false)}
        initialValue={stakeAmount}
      />
    )
  }

  return (
    <Modal
      minWidth="346px"
      title={isRemovingStake ? t('Unstake') : t('Stake in Pool')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {stakingLimit > 0n && !isRemovingStake && (
        <Text color="secondary" bold mb="24px" style={{ textAlign: 'center' }} fontSize="16px">
          {t('Max stake for this pool: %amount% %token%', {
            amount: getFullDisplayBalance(new BigNumber(stakingLimit.toString()), stakingToken.decimals, 0),
            token: stakingToken.symbol,
          })}
        </Text>
      )}
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
        currencyValue={stakingTokenPrice !== 0 && `~${formattedUsdValueStaked || 0} USD`}
        isWarning={hasReachedStakeLimit}
        decimals={stakingToken.decimals}
      />
      {hasReachedStakeLimit && (
        <Text color="failure" fontSize="12px" style={{ textAlign: 'right' }} mt="4px">
          {t('Maximum total stake: %amount% %token%', {
            amount: getFullDisplayBalance(new BigNumber(stakingLimit.toString()), stakingToken.decimals, 0),
            token: stakingToken.symbol,
          })}
        </Text>
      )}
      <Text ml="auto" color="textSubtle" fontSize="12px" mb="8px">
        {t('Balance: %balance%', {
          balance: getFullDisplayBalance(getCalculatedStakingLimit(), stakingToken.decimals),
        })}
      </Text>
      <Slider
        min={0}
        max={100}
        value={percent}
        onValueChanged={handleChangePercent}
        name="stake"
        valueLabel={`${percent}%`}
        step={1}
      />
      <Flex alignItems="center" justifyContent="space-between" mt="8px">
        <PercentageButton onClick={() => handleChangePercent(25)}>25%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(50)}>50%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(75)}>75%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(100)}>{t('Max')}</PercentageButton>
      </Flex>
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
      {step === EasyTransactionSteps.Complete ? (
        <>
          <Button onClick={onDismiss}>{t('Close')}</Button>
        </>
      ) : (
        <>
          {isRemovingStake ? (
            <Flex justifyContent={"center"} alignItems="center" mb="20px">
              <Button
                isLoading={pendingTx}
                endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
                onClick={handleConfirmClick}
                disabled={!stakeAmount || parseFloat(stakeAmount) === 0 || hasReachedStakeLimit}
                mt="24px"
              >
                {pendingTx ? t('Confirming') : isRemovingStake ? t('Unstake') : t('Confirm')}
              </Button>
              
              {isRemovingStake && (
                 <Flex justifyContent={"center"} alignItems="center" mb="20px">
                <Button
                  onClick={handleConfigmFG}
                  disabled={!stakeAmount || parseFloat(stakeAmount) === 0 || hasReachedStakeLimit}
                  mt="24px"
                >
                  {t('Unstake to FG')}
                </Button>
                </Flex>
              )}
            </Flex>
          ) : (
            <Flex justifyContent={"center"} alignItems="center" mb="20px">
            <Button
              isLoading={pendingTx}
              endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
              onClick={handleConfirmClick}
              disabled={!stakeAmount || parseFloat(stakeAmount) === 0 || hasReachedStakeLimit}
              mt="24px"
            >
              {pendingTx ? t('Confirming') : isRemovingStake ? t('Unstake') : t('Confirm')}
            </Button>
            </Flex>
          )}
        </>
      )}
      {!isRemovingStake && (
         <Flex justifyContent={"center"} alignItems="center" mb="20px">
        <StyledLink external href={getTokenLink}>
          <Button width="100%" mt="8px" variant="secondary">
            {t('Get %symbol%', { symbol: stakingToken.symbol })}
          </Button>
       
        </StyledLink>
        </Flex>
      )}
      {isFG && <EasyProgress stage={step} steps={steps} txError={txError} txMsg={txMsg} />}
    </Modal>
  )
}

export default StakeModal
