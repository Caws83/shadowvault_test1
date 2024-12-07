import React from 'react'
import { Button, Text, Flex, Skeleton, Heading, useModal } from 'uikit'
import BigNumber from 'bignumber.js'
import { NFTPool } from 'state/types'
import { formatNumber, getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import { BIG_ZERO } from 'utils/bigNumber'

import { ActionContainer, ActionTitles, ActionContent } from './styles'
import NftEasyCollectModal from '../../NftModals/NftEasyCollectModal'
import PreviousRewardsModal from '../../NftModals/PreviousRewardsModal'
import { useAccount } from 'wagmi'

interface NftHarvestActionProps extends NFTPool {
  nftpool: NFTPool
  userDataLoaded: boolean
  earningTokenPrice: BigNumber
}

const NftHarvestAction: React.FunctionComponent<NftHarvestActionProps> = ({
  nftpool,
  earningToken,
  userData,
  userDataLoaded,
  earningTokenPrice,
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { currentRound } = nftpool
  const round = new BigNumber(currentRound).toNumber()
  const currentRToken = earningToken[round]

  const [onPresentOld] = useModal(<PreviousRewardsModal pool={nftpool} />)

  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO
  const earningTokenBalance = getBalanceNumber(earnings, currentRToken.decimals)
  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), currentRToken.decimals)

  const fullBalance = getFullDisplayBalance(earnings, currentRToken.decimals)
  const formattedBalance = formatNumber(earningTokenBalance, 3, 3)

  const hasOld = userData ? userData.hasOld : false
  const actionTitle = (
    <Flex flexDirection="column">
      <Text fontSize="12px" bold color="secondary" as="span" textTransform="uppercase">
        {currentRToken.symbol}{' '}
      </Text>
      <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
        {t('Earned')}
      </Text>
    </Flex>
  )

  const [onPresentCollect] = useModal(
    <NftEasyCollectModal
      pool={nftpool}
      formattedBalance={formattedBalance}
      fullBalance={fullBalance}
      earningToken={currentRToken}
      earningsDollarValue={earningTokenDollarBalance}
      hasEarnings={hasOld}
      nftCollectionId={nftpool.nftCollectionId}
    />,
  )

  if (!account) {
    return (
      <ActionContainer>
        <ActionTitles>{actionTitle}</ActionTitles>
        <ActionContent>
          <Heading>0</Heading>
          <Button disabled>{t('Harvest')}</Button>
        </ActionContent>
      </ActionContainer>
    )
  }

  if (!userDataLoaded) {
    return (
      <ActionContainer>
        <ActionTitles>{actionTitle}</ActionTitles>
        <ActionContent>
          <Skeleton width={180} height="32px" marginTop={14} />
        </ActionContent>
      </ActionContainer>
    )
  }

  return (
    <ActionContainer>
      <>
        <ActionContent>
          <ActionTitles>{actionTitle}</ActionTitles>

          {hasOld ? (
            <>
              <Flex flexDirection="column">
                <Balance lineHeight="1" bold fontSize="20px" decimals={5} value={earningTokenBalance} />
                {earningTokenPrice.toNumber() > 0 && (
                  <Balance
                    display="inline"
                    fontSize="12px"
                    color="textSubtle"
                    decimals={2}
                    prefix="~"
                    value={earningTokenDollarBalance}
                    unit=" USD"
                  />
                )}
              </Flex>
            </>
          ) : (
            <>
              <Flex flexDirection="column">
                <Heading color="textDisabled">0</Heading>
                <Text fontSize="12px" color="textDisabled">
                  0 USD
                </Text>
              </Flex>
            </>
          )}
        </ActionContent>

        <Flex flexDirection="row">
          <Button width="100%" variant="secondary" onClick={onPresentOld}>
            {t('View')}
          </Button>

          <Button width="100%" disabled={!hasOld} onClick={onPresentCollect}>
            {t('Harvest All')}
          </Button>
        </Flex>
      </>
    </ActionContainer>
  )
}

export default NftHarvestAction
