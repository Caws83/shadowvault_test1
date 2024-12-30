import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Modal,
  Text,
  Flex,
  Button,
  Slider,
  BalanceInput,
  AutoRenewIcon,
  Link,
  CalculateIcon,
  IconButton,
  ButtonMenu,
  ButtonMenuItem,
  Box,
} from 'uikit'
import { getETHER } from 'sdk'
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
import useStakePool, { useStakePoolToken } from 'views/Pools/hooks/useStakePool'
import useUnstakePool, { useUnstakePoolToken } from 'views/Pools/hooks/useUnstakePool'
import tokens from 'config/constants/tokens'
import { fetchTokenBalances, useHostPricesBusd, usePriceBnbBusd } from 'state/farms/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import { Token } from 'config/constants/types'
import EasySelect from 'components/Select/EasySelect'
import { TokenImage } from 'components/TokenImage'
import hosts from 'config/constants/hosts'
import PercentageButton from '../../../../components/PercentageButton'
import { useAccount } from 'wagmi'
import { useApprovePool } from 'views/Pools/hooks/useApprove'
import useRefresh from 'hooks/useRefresh'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { readContract } from '@wagmi/core'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'


interface EasyStakeModalProps {
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

const EasyStakeModal: React.FC<EasyStakeModalProps> = ({
  isBnbPool,
  pool,
  stakingTokenBalance,
  stakingTokenPrice,
  isRemovingStake = false,
  onDismiss,
}) => {
  const { stakingToken, earningTokenPrice, apr, userData, stakingLimit, earningToken } = pool
  const { t } = useTranslation()
  const { theme } = useTheme()
  const ETHER = getETHER(pool.chainId) as Token
  const { onStake } = useStakePool(pool, isBnbPool)
  const { onUnstake } = useUnstakePool(pool, pool.enableEmergencyWithdraw)
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('0')
  const [hasReachedStakeLimit, setHasReachedStakedLimit] = useState(false)
  const [percent, setPercent] = useState(0)
  const [step, setStep] = useState<EasyTransactionSteps>(EasyTransactionSteps.Start)
  const [isFG, setIsFG] = useState(false)
  const [txError, setTxError] = useState<EasyTransactionError>(EasyTransactionError.None)
  const [txMsg, setTxMsg] = useState('')
  const [showRoiCalculator, setShowRoiCalculator] = useState(false)
  const [fgBalance, setFgBalance] = useState(BIG_ZERO)
  const { address: account } = useAccount()
  const [theToken, setTheToken] = useState<Token>(ETHER)
  // const publicClient = usePublicClient({chainId: pool.chainId})

  const { balance } = useGetBnbBalance(pool.chainId)

  const [maxPercent, setMaxPercent] = useState(100)

  useEffect(() => {
    const getBalance = async () => {
      let balanceBN = new BigNumber(0)
      if(theToken.symbol === ETHER.symbol){
        // const walletBalance = await publicClient.getBalance({ address: account })
        // balanceBN = new BigNumber(walletBalance.toString())
        balanceBN = new BigNumber(balance.toString())
      } else {
        const balanceStr = await fetchTokenBalances(account, theToken, pool.chainId)
        balanceBN = new BigNumber(balanceStr)
      }
      setFgBalance(balanceBN)
    }

    getBalance()
  }, [account, stakingToken, theToken, balance])

  const getCalculatedStakingLimit = () => {
    if (isRemovingStake) {
      return new BigNumber(userData.stakedBalance)
    }
    if (isFG) {
      return fgBalance
    }
    return new BigNumber(stakingLimit).gt(0) && stakingTokenBalance.gt(stakingLimit)
      ? new BigNumber(stakingLimit)
      : stakingTokenBalance
  }
  const prices = useHostPricesBusd()
  const bnbPrice = usePriceBnbBusd(pool.dex)

  const onStage = (stage: EasyTransactionSteps) => {
    setStep(stage)
  }

  const onError = (error: EasyTransactionError, msg?: string) => {
    setTxError(error)
    setTxMsg(msg)
  }
  const onChangeToken = (token: Token) => {
    if (theToken !== token) {
      setTheToken(token)
    }
  }


  const stepsOut: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: false,
    [EasyTransactionSteps.CreateLP]: false,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.Unstaking]: true,
    [EasyTransactionSteps.RemoveLiquidity]: false,
    [EasyTransactionSteps.Swap1]: true,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: false,
    [EasyTransactionSteps.Complete]: true,
  }

  const stepsIn: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: false,
    [EasyTransactionSteps.CreateLP]: false,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.Unstaking]: false,
    [EasyTransactionSteps.RemoveLiquidity]: false,
    [EasyTransactionSteps.Swap1]: true,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: true,
    [EasyTransactionSteps.Complete]: true,
  }

  const { onUnstakeToken } = useUnstakePoolToken(pool, theToken, onStage, onError)
  const { onStakeToken } = useStakePoolToken(pool, theToken.symbol === ETHER.symbol ? tokens.wNative : theToken, onStage, onError)

  const easyOptions = [ETHER, tokens.weth]
  /*
  if (stakingToken.symbol !== tokens.mswap.symbol) {
    easyOptions.push(tokens.mswap)
  }
*/
  const usdValueStaked = new BigNumber(stakeAmount).times(
    isFG && !isRemovingStake ? (theToken.symbol === ETHER.symbol ? bnbPrice : prices[theToken.symbol]) : stakingTokenPrice,
  )
  const formattedUsdValueStaked = !usdValueStaked.isNaN() && formatNumber(usdValueStaked.toNumber())

  const tokenBalanceRaw = getCalculatedStakingLimit()
  const tokenBalance = new BigNumber(tokenBalanceRaw.toString())
  const tokenDecimals = isFG ? theToken.decimals : stakingToken.decimals
  const displayDecimals =
    tokenDecimals === undefined ? 4 : tokenBalance.gt(new BigNumber(100).shiftedBy(tokenDecimals)) ? 2 : 4

  const interestBreakdown = getInterestBreakdown({
    principalInUSD: !usdValueStaked.isNaN() ? usdValueStaked.toNumber() : 0,
    apr,
    earningTokenPrice,
  })
  const annualRoi = interestBreakdown[3] * pool.earningTokenPrice
  const formattedAnnualRoi = formatNumber(annualRoi, annualRoi > 10000 ? 0 : 2, annualRoi > 10000 ? 0 : 2)

  const getTokenLink = stakingToken.baseAddress
    ? '/#/cashier'
    : stakingToken.address
    ? `/#/swap?outputCurrency=${getAddress(stakingToken.address, pool.chainId)}`
    : '/#/swap'

  useEffect(() => {
    if (new BigNumber(stakingLimit.toString()).gt(0) && !isRemovingStake) {
      const fullDecimalStakeAmount = getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals)
      setHasReachedStakedLimit(
        fullDecimalStakeAmount.plus(userData.stakedBalance.toString()).gt(stakingLimit.toString()),
      )
    }
  }, [stakeAmount, stakingLimit, userData, stakingToken, isRemovingStake, setHasReachedStakedLimit])

  const handleStakeInputChange = (input: string) => {
    if (input) {
      const convertedInput = getDecimalAmount(new BigNumber(input), stakingToken.decimals)
      const percentage = Math.floor(convertedInput.dividedBy(getCalculatedStakingLimit()).multipliedBy(100).toNumber())
      setPercent(Math.min(percentage, maxPercent))
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

  const handleConfirm = async () => {
    if (isFG) {
      return handleConfirmFG()
    }
    return handleConfirmClick()
  }

  const handleDismiss = async () => {
    setPendingTx(false)
    setStep(EasyTransactionSteps.Start)
    onDismiss()
  }

  const handleConfirmFG = async () => {
    setPendingTx(true)
    setTxError(EasyTransactionError.None)
    if (isRemovingStake) {
      try {
        await onUnstakeToken(stakeAmount)
        setPendingTx(false)
      } catch (e) {
        setPendingTx(false)
      }
    } else {
      try {
        // stakingonStakeToken
        await onStakeToken(stakeAmount)
      } catch (e) {
        setPendingTx(false)
      }
    }
  }

  const handleConfirmClick = async () => {
    setPendingTx(true)
    setTxError(EasyTransactionError.None)
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

  
  const {fastRefresh} = useRefresh()
  const { handleApprove, requestedApproval } = useApprovePool(
    getAddress(stakingToken.address, pool.chainId),
    pool,
    earningToken.symbol,
  )
  const [allowance, setAllowance] = useState(userData?.allowance ? new BigNumber(userData.allowance) : BIG_ZERO)
  const [needsApproval, setApproved] = useState<boolean>((allowance.eq(0) || allowance.lt(getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals))) && !isBnbPool && !isRemovingStake)
  useEffect(() => {
    async function go(){
    const allow = await readContract(config, {
      address: getAddress(pool.stakingToken.address, pool.chainId),
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [account, getAddress(pool.contractAddress, pool.chainId)],
      chainId: pool.chainId,
    })
    setAllowance(new BigNumber(allow.toString()))
    setApproved((allowance.eq(0) || allowance.lt(getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals))) && !isBnbPool && !isRemovingStake)
  }
  go()

  },[requestedApproval,fastRefresh, stakeAmount])
  const hasBalance = isFG ? fgBalance.gte(getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals)) : stakingTokenBalance.gte(getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals))

  const getToken = () => {
    if (isFG && !isRemovingStake) {
      return theToken.symbol
    }
    return stakingToken.symbol
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
      onDismiss={handleDismiss}
      headerClassName="headerTop"
    >
      {!stakingToken.baseAddress && (
        <Flex justifyContent="center" alignItems="center">
          <ButtonMenu
            activeIndex={isFG ? 0 : 1}
            scale="sm"
            variant="subtle"
            onItemClick={(index) => {
              setIsFG(!index)
              setStakeAmount('0')
              setPercent(0)
            } } children={[]}          >
          </ButtonMenu>
        </Flex>
      )}
      {isFG === false && new BigNumber(stakingLimit.toString()).gt(0) && !isRemovingStake && (
        <Text color="secondary" bold mb="24px" style={{ textAlign: 'center' }} fontSize="16px">
          {t('Max stake for this pool: %amount% %token%', {
            amount: getFullDisplayBalance(new BigNumber(stakingLimit.toString()), stakingToken.decimals, 0),
            token: stakingToken.symbol,
          })}
        </Text>
      )}

      {isFG && (
        <>
          <Box>
            <Text>{isRemovingStake ? 'Output' : 'Input'} Currency</Text>
            <EasySelect options={easyOptions} onChange={onChangeToken} />
          </Box>
          <br />
        </>
      )}
      <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <Text bold>{isRemovingStake ? t('Unstake') : t('Stake')}:</Text>
        <Flex alignItems="center" minWidth="70px">
          <TokenImage
            token={isFG && !isRemovingStake ? theToken : stakingToken}
            host={pool.host}
            chainId={pool.chainId}
            width={24}
            height={24}
          />

          <Text ml="4px" bold>
            {getToken()}
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
          balance: getFullDisplayBalance(tokenBalance, tokenDecimals, displayDecimals),
        })}
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
        <PercentageButton onClick={() => handleChangePercent(25)}>25%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(50)}>50%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(75)}>75%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(maxPercent)}>{t('Max')}</PercentageButton>
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
      {step === EasyTransactionSteps.Complete || txError !== EasyTransactionError.None ? (
        <Button onClick={handleDismiss}>{t('Close')}</Button>
      ) : !needsApproval ? (
        <Flex justifyContent={"center"} alignItems="center" mt="20px" mb="20px">
           <Button
          isLoading={pendingTx}
          endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
          onClick={() => {
            handleConfirm()
          }}
          disabled={ isRemovingStake ? false : (parseFloat(stakeAmount) === 0 || hasReachedStakeLimit || !hasBalance) }
          mt="24px"
          width="100%"
        >
          {pendingTx ? t('Confirming') : isRemovingStake ? t('Unstake') : t('Stake')}
        </Button>
        </Flex>
      ) : (
        <Flex justifyContent={"center"} alignItems="center"  mt="20px"  mb="20px">    
                  <Button 
                
                    disabled={requestedApproval || new BigNumber(stakeAmount).eq(0) || !hasBalance} 
                    onClick={handleApprove} 
                    variant="primary"
                    className="stake-btn"
                  >
                    {t('Enable')}
                  </Button>
                  </Flex>
         
      )}

      {isFG && (
        <EasyProgress stage={step} steps={isRemovingStake ? stepsOut : stepsIn} txError={txError} txMsg={txMsg} />
      )}
    </Modal>
  )
}

export default EasyStakeModal
