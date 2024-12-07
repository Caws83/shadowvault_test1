import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, useModal, IconButton, AddIcon, MinusIcon, Skeleton, useTooltip, Flex, Text, HelpIcon } from 'uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useCakeVault } from 'state/pools/hooks'
import { Pool } from 'state/types'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import { formatLocalisedCompactNumber, getBalanceNumber } from 'utils/formatBalance'
import { PoolCategory } from 'config/constants/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { convertSharesToCake } from 'views/Pools/helpers'
import { ActionContainer, ActionTitles, ActionContent } from './styles'
import VaultStakeModal from '../../CakeVaultCard/VaultStakeModal'
import EasyStakeModal from '../../Modals/EasyStakeModal'
import { useAccount } from 'wagmi'

const IconButtonWrapper = styled.div`
  display: flex;
`

interface StackedActionProps {
  pool: Pool
  userDataLoaded: boolean
}

const Staked: React.FunctionComponent<StackedActionProps> = ({ pool, userDataLoaded }) => {
  const { stakingToken, isFinished, poolCategory, userData, stakingTokenPrice, isAutoVault } =
    pool
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chain } = useAccount()
  const showConnectButton = !account || chain.id !== pool.chainId
 
  const isBnbPool = poolCategory === PoolCategory.BINANCE
  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO

  const isNotVaultAndHasStake = !isAutoVault && stakedBalance.gt(0)

  const stakingTokenBalance = userData?.stakingTokenBalance
    ? new BigNumber(userData.stakingTokenBalance.toString())
    : BIG_ZERO

  const stakedTokenBalance = getBalanceNumber(stakedBalance, stakingToken.decimals)
  const stakedTokenDollarBalance = getBalanceNumber(
    stakedBalance.multipliedBy(stakingTokenPrice),
    stakingToken.decimals,
  )

  const formattedBalance = formatLocalisedCompactNumber(stakedTokenBalance)

  const {
    userData: { userShares },
    pricePerFullShare,
  } = useCakeVault()

  const { cakeAsBigNumber, cakeAsNumberBalance } = convertSharesToCake(
    new BigNumber(userShares),
    new BigNumber(pricePerFullShare),
  )
  const hasSharesStaked = userShares && new BigNumber(userShares) > BIG_ZERO
  const isVaultWithShares = isAutoVault && hasSharesStaked
  const stakedAutoDollarValue = getBalanceNumber(cakeAsBigNumber.multipliedBy(stakingTokenPrice), stakingToken.decimals)

  const formattedCake = formatLocalisedCompactNumber(cakeAsNumberBalance)

  const {
    targetRef: stakedBalanceTargetRef,
    tooltip: stakedBalanceTooltip,
    tooltipVisible: stakedBalanceTooltipVisible,
  } = useTooltip(<Text>{isAutoVault ? cakeAsNumberBalance.toString() : stakedTokenBalance.toString()}</Text>, {
    placement: 'bottom',
  })

  const [onPresentStake] = useModal(
    <EasyStakeModal
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenBalance={stakingTokenBalance}
      stakingTokenPrice={stakingTokenPrice}
    />,
  )

  const [onPresentVaultStake] = useModal(<VaultStakeModal stakingMax={stakingTokenBalance} pool={pool} />)

  const [onPresentUnstake] = useModal(
    <EasyStakeModal
      stakingTokenBalance={stakingTokenBalance}
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenPrice={stakingTokenPrice}
      isRemovingStake
    />,
  )

  const [onPresentVaultUnstake] = useModal(<VaultStakeModal stakingMax={cakeAsBigNumber} pool={pool} isRemovingStake />)

  const onStake = () => {
    if (isAutoVault) {
      onPresentVaultStake()
    } else {
      onPresentStake()
    }
  }

  const onUnstake = () => {
    if (isAutoVault) {
      onPresentVaultUnstake()
    } else {
      onPresentUnstake()
    }
  }

  if (showConnectButton) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Start staking')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <ConnectWalletButton chain={pool.chainId} />
        </ActionContent>
      </ActionContainer>
    )
  }

  if (!userDataLoaded) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Start staking')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Skeleton width={180} height="32px" marginTop={14} />
        </ActionContent>
      </ActionContainer>
    )
  }

  // Wallet connected, user data loaded and approved
  if (isNotVaultAndHasStake || isVaultWithShares) {
    return (
      <ActionContainer isAutoVault={isAutoVault}>
        <ActionTitles>
          <Text fontSize="12px" bold color="secondary" as="span" textTransform="uppercase">
            {stakingToken.symbol}{' '}
          </Text>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {isAutoVault ? t('Staked (compounding)') : t('Staked')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Flex flex="1" pt="16px" flexDirection="column" alignSelf="flex-start">
            <Flex>
              <Text lineHeight="1" bold fontSize="20px">
                {isAutoVault ? formattedCake : formattedBalance}
              </Text>
              <span ref={stakedBalanceTargetRef}>
                <HelpIcon color="textSubtle" width="20px" ml="4px" />
              </span>
              {stakedBalanceTooltipVisible && stakedBalanceTooltip}
            </Flex>
            <Balance
              fontSize="12px"
              display="inline"
              color="textSubtle"
              decimals={2}
              value={isAutoVault ? stakedAutoDollarValue : stakedTokenDollarBalance}
              unit=" USD"
              prefix="~"
            />
          </Flex>
          <IconButtonWrapper>
            <IconButton variant="secondary" onClick={onUnstake} mr="6px">
              <MinusIcon color="primary" width="14px" />
            </IconButton>
            
              <IconButton
                variant="secondary"
                onClick={ onStake }
                disabled={isFinished}
              >
                <AddIcon color="primary" width="14px" />
              </IconButton>
            
          </IconButtonWrapper>
        </ActionContent>
      </ActionContainer>
    )
  }

  return (
    <ActionContainer>
      <ActionTitles>
        <Text fontSize="16px" bold color="secondary" as="span" textTransform="uppercase">
          {t('Stake')}{' '}
        </Text>
        <Text fontSize="16spx" bold color="textSubtle" as="span" textTransform="uppercase">
          {stakingToken.symbol}
        </Text>
      </ActionTitles>
      <ActionContent>
        <Button
          width="100%"
          onClick={ onStake }
          variant="secondary"
          disabled={isFinished}
        >
          {t('Stake')}
        </Button>
      </ActionContent>
    </ActionContainer>
  )
}

export default Staked
