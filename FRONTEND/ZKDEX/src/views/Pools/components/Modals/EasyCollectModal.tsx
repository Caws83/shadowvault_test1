import React, { useState } from 'react'
import {
  Modal,
  Text,
  Button,
  Heading,
  Flex,
  AutoRenewIcon,
  ButtonMenu,
  ButtonMenuItem,
  HelpIcon,
  useTooltip,
  Box,
} from 'uikit'
import { getETHER } from 'sdk'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import { PoolConfig, Token } from 'config/constants/types'
import { formatNumber } from 'utils/formatBalance'
import useHarvestPool, { useHarvestPoolToken } from 'views/Pools/hooks/useHarvestPool'
import useStakePool from 'views/Pools/hooks/useStakePool'
import EasyProgress from 'views/Farms/components/Modals/EasyProgess'
import { EasyTransactionError, EasyTransactionSteps, TransactionSteps } from 'utils/types'
import tokens from 'config/constants/tokens'
import EasySelect from 'components/Select/EasySelect'
import hosts from 'config/constants/hosts'

interface EasyCollectModalProps {
  pool: PoolConfig
  formattedBalance: string
  fullBalance: string
  earningToken: Token
  earningsDollarValue: number
  sousId: number
  isBnbPool: boolean
  isCompoundPool?: boolean
  onDismiss?: () => void
}

const EasyCollectModal: React.FC<EasyCollectModalProps> = ({
  pool,
  formattedBalance,
  fullBalance,
  earningToken,
  earningsDollarValue,
  isBnbPool,
  isCompoundPool = false,
  onDismiss,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const ETHER = getETHER(pool.chainId) as Token
  const { toastSuccess, toastError } = useToast()
  const [outToken, setOutToken] = useState<Token>(ETHER)
  const { onReward } = useHarvestPool(pool, isBnbPool)
  const { onStake } = useStakePool(pool, isBnbPool)
  const [pendingTx, setPendingTx] = useState(false)
  const [shouldCompound, setShouldCompound] = useState(isCompoundPool)
  const [useFG, setUseFG] = useState(false)
  const [step, setStep] = useState<EasyTransactionSteps>(EasyTransactionSteps.Start)
  const [txError, setTxError] = useState<EasyTransactionError>(EasyTransactionError.None)
  const [txMsg, setTxMsg] = useState('')
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <>
      <Text mb="12px">{t('Compound: collect and restake %symbol% into pool.', { symbol: earningToken.symbol })}</Text>
      <Text>{t('Harvest: collect %symbol% and send to wallet', { symbol: earningToken.symbol })}</Text>
    </>,
    { placement: 'bottom-end', tooltipOffset: [20, 10] },
  )

  const steps: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: true,
    [EasyTransactionSteps.CreateLP]: false,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.Unstaking]: false,
    [EasyTransactionSteps.RemoveLiquidity]: false,
    [EasyTransactionSteps.Swap1]: true,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: false,
    [EasyTransactionSteps.Complete]: true,
  }

  const easyOptions = [ETHER, tokens.weth]
  /*
  if (pool.earningToken.symbol !== tokens.mswap.symbol) {
    easyOptions.push(tokens.mswap)
  }
*/

  const onStage = (stage: EasyTransactionSteps) => {
    setStep(stage)
  }

  const onError = (error: EasyTransactionError, msg?: string) => {
    setTxError(error)
    setTxMsg(msg)
  }
  const { onRewardToken } = useHarvestPoolToken(pool, outToken, onStage, onError)

  const handleHarvest = async () => {
    if (useFG) {
      return handleHarvestConfirmToken()
    }
    return handleHarvestConfirm()
  }
  const onChangeOutToken = (token: Token) => {
    if (outToken !== token) {
      setOutToken(token)
    }
  }

  const handleHarvestConfirmToken = async () => {
    setPendingTx(true)
    // harvesting
    try {
      await onRewardToken()
      setPendingTx(false)
    } catch (e) {
      console.error(e)
      setPendingTx(false)
    }
  }

  const handleHarvestConfirm = async () => {
    setPendingTx(true)
    // compounding
    if (shouldCompound) {
      try {
        await onStake(fullBalance, earningToken.decimals)
        toastSuccess(
          `${t('Compounded')}!`,
          t('Your %symbol% earnings have been re-invested into the pool!', { symbol: earningToken.symbol }),
        )
        setPendingTx(false)
        onDismiss()
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        console.error(e)
        setPendingTx(false)
      }
    } else {
      // harvesting
      try {
        await onReward()
        toastSuccess(
          `${t('Harvested')}!`,
          t('Your %symbol% earnings have been sent to your wallet!', { symbol: earningToken.symbol }),
        )
        setPendingTx(false)
        onDismiss()
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        console.error(e)
        setPendingTx(false)
      }
    }
  }
  const showFG = !isCompoundPool || (isCompoundPool && !shouldCompound)
  return (
    <Modal
      title={`${earningToken.symbol} ${isCompoundPool ? t('Collect') : t('Harvest')}`}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {isCompoundPool && (
        <Flex justifyContent="center" alignItems="center" mb="24px">
          <ButtonMenu
            activeIndex={shouldCompound ? 0 : 1}
            scale="sm"
            variant="subtle"
            onItemClick={(index) => setShouldCompound(!index)}
          >
            <ButtonMenuItem as="button">{t('Compound')}</ButtonMenuItem>
            <ButtonMenuItem as="button">{t('Harvest')}</ButtonMenuItem>
          </ButtonMenu>
          <Flex ml="10px" ref={targetRef}>
            <HelpIcon color="textSubtle" />
          </Flex>
          {tooltipVisible && tooltip}
        </Flex>
      )}
      {showFG && pool.host !== hosts.community && (
        <Flex justifyContent="center" alignItems="center" mb="24px">
          <ButtonMenu
            activeIndex={useFG ? 0 : 1}
            scale="sm"
            variant="subtle"
            onItemClick={(index) => {
              setUseFG(!index)
            }}
          >
            <ButtonMenuItem as="button">{t('Harvest to ...')}</ButtonMenuItem>
            <ButtonMenuItem as="button">{t('Standard')}</ButtonMenuItem>
          </ButtonMenu>
        </Flex>
      )}
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Text>{shouldCompound ? t('Compounding') : t('Harvesting')}:</Text>
        <Flex flexDirection="column">
          <Heading>
            {formattedBalance} {earningToken.symbol}
          </Heading>
          {earningsDollarValue > 0 && (
            <Text fontSize="12px" color="textSubtle">{`~${formatNumber(earningsDollarValue)} USD`}</Text>
          )}
        </Flex>
      </Flex>
      {useFG && (
        <>
          <Box>
            <Text>Output Currency</Text>
            <EasySelect options={easyOptions} onChange={onChangeOutToken} />
          </Box>
          <br />
        </>
      )}
      {useFG && (step === EasyTransactionSteps.Complete || txError !== EasyTransactionError.None) ? (
        <Button onClick={onDismiss}>{t('Close')}</Button>
      ) : (
        <Flex flexDirection="column">
          <Button
            mt="8px"
            onClick={handleHarvest}
            isLoading={pendingTx}
            endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
          >
            {pendingTx ? t('Confirming') : t('Confirm')}
          </Button>
        </Flex>
      )}
      {!useFG && (
        <Button variant="text" onClick={onDismiss} pb="0px">
          {t('Close Window')}
        </Button>
      )}
      {useFG && <EasyProgress stage={step} steps={steps} txError={txError} txMsg={txMsg} />}
    </Modal>
  )
}

export default EasyCollectModal
