import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, IconButton, AddIcon, MinusIcon, Skeleton, useTooltip, Flex, Text, HelpIcon, useModal } from 'uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
// import NotEnoughTokensModal from 'components/NotEnoughTokensModal'
import { NFTPool } from 'state/types'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import { formatLocalisedCompactNumber, getBalanceNumber } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { useNftApprovePool } from 'views/NftPools/hooks/useApprove'
import { ActionContainer, ActionTitles, ActionContent } from './styles'
import NftEasyStakeModal from '../../NftModals/NftEasyStakeModal'
import { useAccount } from 'wagmi'

const IconButtonWrapper = styled.div`
  display: flex;
`

interface StackedActionProps {
  nftpool: NFTPool
  userDataLoaded: boolean
}

const NftStaked: React.FunctionComponent<StackedActionProps> = ({ nftpool, userDataLoaded }) => {
  const { stakingToken, stakingLimit, tokenFee, isFinished, userData, currentRound } = nftpool
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chain } = useAccount()
  const showConnectButton = !account || chain.id !== nftpool.chainId
  const round = new BigNumber(currentRound).toNumber()
  const currentRToken = nftpool.earningToken[round]

  const approved = userData?.approved ? userData.approved : false
  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const hasStake = stakedBalance.gt(0)
  const stakingTokenBalance = userData?.stakingTokenBalance
    ? new BigNumber(userData.stakingTokenBalance)
    : BIG_ZERO

  const stakedTokenBalance = getBalanceNumber(stakedBalance, stakingToken.decimals)
  const stakedTokenDollarBalance = getBalanceNumber(
    stakedBalance.multipliedBy(stakingToken.busdPrice),
    stakingToken.decimals,
  )

  const formattedBalance = formatLocalisedCompactNumber(stakedTokenBalance)

  const {
    targetRef: stakedBalanceTargetRef,
    tooltip: stakedBalanceTooltip,
    tooltipVisible: stakedBalanceTooltipVisible,
  } = useTooltip(<Text>{stakedTokenBalance}</Text>, {
    placement: 'bottom',
  })

  const needsApproval = !approved

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t("You've already staked the maximum amount you can stake in this pool!"),
    { placement: 'bottom' },
  )

  const reachStakingLimit =
    new BigNumber(stakingLimit).gt(0) && new BigNumber(userData.stakedBalance).gte(stakingLimit)

  const { handleNftApprove, requestedNftApproval } = useNftApprovePool(
    nftpool,
    currentRToken.symbol,
  )

  const [onPresentUnstake] = useModal(
    <NftEasyStakeModal
      stakingTokenBalance={stakingTokenBalance}
      nftpool={nftpool}
      earningToken={currentRToken}
      stakingToken={nftpool.stakingToken}
      isRemovingStake
    />,
  )

  const [onPresentStake] = useModal(
    <NftEasyStakeModal
      stakingTokenBalance={stakingTokenBalance}
      nftpool={nftpool}
      earningToken={currentRToken}
      stakingToken={nftpool.stakingToken}
    />,
  )

  // const [onPresentTokenRequired] = useModal(<NotEnoughTokensModal tokenSymbol={stakingToken.name} />)
  if (showConnectButton) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Start staking')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <ConnectWalletButton chain={nftpool.chainId} />
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

  if (needsApproval) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Enable pool')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Button
            width="100%"
            variant="secondary"
            disabled={requestedNftApproval || !needsApproval}
            onClick={handleNftApprove}
            style={{ marginRight: '15px' }}
          >
            {t('Enable NFTs')}
          </Button>
        </ActionContent>
      </ActionContainer>
    )
  }

  // Wallet connected, user data loaded and approved
  if (hasStake) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="secondary" as="span" textTransform="uppercase">
            {stakingToken.symbol}{' '}
          </Text>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Staked')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Flex flex="1" pt="16px" flexDirection="column" alignSelf="flex-start">
            <Flex>
              <Text lineHeight="1" bold fontSize="20px">
                {formattedBalance}
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
              value={stakedTokenDollarBalance}
              unit=" USD"
              prefix="~"
            />
          </Flex>
          <IconButtonWrapper>
            <IconButton variant="secondary" mr="6px" onClick={onPresentUnstake}>
              <MinusIcon color="primary" width="14px" />
            </IconButton>
            {reachStakingLimit ? (
              <span ref={targetRef}>
                <IconButton variant="secondary" disabled>
                  <AddIcon color="textDisabled" width="24px" height="24px" />
                </IconButton>
              </span>
            ) : (
              <IconButton
                variant="secondary"
                disabled={isFinished}
                onClick={ onPresentStake}
              >
                <AddIcon color="primary" width="14px" />
              </IconButton>
            )}
          </IconButtonWrapper>
          {tooltipVisible && tooltip}
        </ActionContent>
      </ActionContainer>
    )
  }

  return (
    <ActionContainer>
      <ActionTitles>
        <Text fontSize="12px" bold color="secondary" as="span" textTransform="uppercase">
          {t('Stake')}{' '}
        </Text>
        <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
          {stakingToken.symbol}
        </Text>
      </ActionTitles>
      <ActionContent>
        <Button
          width="100%"
          variant="secondary"
          disabled={isFinished}
          onClick={ onPresentStake}
        >
          {t('Stake')}
        </Button>
      </ActionContent>
    </ActionContainer>
  )
}

export default NftStaked
