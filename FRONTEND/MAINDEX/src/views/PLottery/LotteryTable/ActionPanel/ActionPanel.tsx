import React, { useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Box, Skeleton, Flex, LinkExternal, Text, Heading, useModal, Button } from 'uikit'
import BigNumber from 'bignumber.js'
import { BASE_BSC_SCAN_URLS } from 'config'
import { LotteryStatus } from 'config/constants/types'
import { PLottery } from 'state/types'
import contracts from 'config/constants/contracts'
import { useLottery } from 'state/lottery/hooks'
import { useTranslation } from 'contexts/Localization'
import { getAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { TITLE_BG } from 'views/Lottery/pageSectionStyles'
import { useFetchPlotteryUserData } from 'state/plottery/hooks'
import NextDrawCardTable from 'views/Lottery/components/NextDrawTable'
import CheckPrizesSection from 'views/Lottery/components/CheckPrizesSection'
import HistoryTabMenu from 'views/Lottery/components/HistoryTabMenu'
import YourHistoryCard from 'views/Lottery/components/YourHistoryCard'
import AllHistoryCard from 'views/Lottery/components/AllHistoryCard'
import Countdown from 'views/Lottery/components/Countdown'
import useShowMoreUserHistory from 'views/Lottery/hooks/useShowMoreUserRounds'
import useGetNextLotteryEvent from 'views/Lottery/hooks/useGetNextLotteryEvent'
import LotteryKeeperModal from 'views/PLottery/Modals/LotteryManagerModal'
import Hero from 'views/Lottery/components/Hero'
import PageSection from 'components/PageSection'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import { PoolAllocations } from 'views/Lottery/components/HowToPlay'


const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 4000px;
  }
`

const collapseAnimation = keyframes`
  from {
    max-height: 4000px;
  }
  to {
    max-height: 0px;
  }
`

const StyledActionPanel = styled.div<{ expanded: boolean }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px;

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: column;
    padding: 16px 32px;
  }
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
  }
`

interface PLotteryActionPanelProps {
  account: string
  plottery: PLottery
  expanded: boolean
  lottoPrice: BigNumber
  userDataLoaded: boolean
}

const InfoSection = styled(Box)`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  padding: 8px 8px;
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 0;
    flex-basis: 230px;
  }
`

const PLotteryActionPanel: React.FC<PLotteryActionPanelProps> = ({
  account,
  plottery,
  expanded,
  lottoPrice,
  userDataLoaded,
}) => {
  const { lotteryToken, lotteryAddress } = plottery
  const { t } = useTranslation()

  const [onPresentManage] = useModal(
    <LotteryKeeperModal plottery={plottery} account={account} lottoPrice={lottoPrice} />,
  )

  const {
    currentRound: { status, endTime },
    currentLotteryId,
  } = useLottery(lotteryToken)

  const [historyTabMenuIndex, setHistoryTabMenuIndex] = useState(0)
  const endTimeAsInt = endTime ? parseInt(endTime, 10) : 0
  const { nextEventTime, postCountdownText, preCountdownText } = useGetNextLotteryEvent(endTimeAsInt, status)
  const { numUserRoundsRequested, handleShowMoreUserRounds } = useShowMoreUserHistory()

  const currentId = new BigNumber(currentLotteryId).toNumber()
  useFetchPlotteryUserData(account, currentId)

  const { operator, draws } = plottery
  const showSub = account && operator ? account === getAddress(contracts.lotteryOwner, plottery.chainId) || account === operator  || account ===getAddress(contracts.farmWallet, plottery.chainId) : false

  const lotteryContractAddress = getAddress(lotteryAddress, plottery.chainId)
  const drawsBig = new BigNumber(draws)
  const getDrawsDisplay = () => {
    if (drawsBig.eq(BIG_ZERO)) {
      return 'Lottery Ended: Contact Support to Restart'
    }
    if (drawsBig.eq(BIG_ZERO)) {
      return 'Last Draw, Renew NOW!'
    }
    return `   ${drawsBig.toString()} Draws Left`
  }

  return (
    <StyledActionPanel expanded={expanded}>
      {showSub && (
        <>
          <ActionContainer>
            <Button width="100%" onClick={onPresentManage} variant="secondary">
              Managment
            </Button>

            {!draws ? (
              <Skeleton width="80px" height="16px" />
            ) : (
              <>
                <Flex flexDirection="column" justifyContent="space-between" alignItems="center">
                  <Text>{getDrawsDisplay()}</Text>
                </Flex>
              </>
            )}
          </ActionContainer>
        </>
      )}

      <PageSection background={TITLE_BG} index={1} hasCurvedDivider={false}>
        <Hero lotteryToken={lotteryToken} lottoPrice={lottoPrice} />
      </PageSection>

      <Flex alignItems="center" justifyContent="center" flexDirection="column" pt="24px">
        {status === LotteryStatus.OPEN && (
          <Heading scale="xl" color="#ffffff" mb="16px" textAlign="center">
            {t('Get your tickets now!')}
          </Heading>
        )}
        <Flex alignItems="center" justifyContent="center" mb="24px">
          {nextEventTime && (postCountdownText || preCountdownText) ? (
            <Countdown
              nextEventTime={nextEventTime}
              postCountdownText={postCountdownText}
              preCountdownText={preCountdownText}
              lotteryToken={lotteryToken}
            />
          ) : (
            <Skeleton height="41px" width="250px" />
          )}
        </Flex>
      </Flex>

      <Flex width="100%" flexDirection="column" alignItems="center" justifyContent="center">
        <NextDrawCardTable
          lotteryToken={lotteryToken}
          plottery={plottery}
          userDataLoaded={userDataLoaded}
          lottoPrice={lottoPrice}
        />

        <CheckPrizesSection lotteryToken={lotteryToken} lottoPrice={lottoPrice} />

        <Flex flex="1" justifyContent="center">
          <PoolAllocations lotteryToken={lotteryToken} />
        </Flex>

        <Flex width="100%" flexDirection="column" alignItems="center" justifyContent="center">
          <Heading mb="16px" scale="xl">
            {t('Finished Rounds')}
          </Heading>
          <Box mb="16px">
            <HistoryTabMenu
              activeIndex={historyTabMenuIndex}
              setActiveIndex={(index) => setHistoryTabMenuIndex(index)}
            />
          </Box>
          {historyTabMenuIndex === 0 ? (
            <AllHistoryCard lotteryToken={lotteryToken} lottoPrice={lottoPrice} />
          ) : (
            <YourHistoryCard
              lotteryToken={lotteryToken}
              handleShowMoreClick={handleShowMoreUserRounds}
              numUserRoundsRequested={numUserRoundsRequested}
              lottoPrice={lottoPrice}
            />
          )}
        </Flex>
      </Flex>
      <Flex width="100%" flexDirection="column" alignItems="center" justifyContent="center">
        <InfoSection>
          <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
            <LinkExternal href={`/#/swap?outputCurrency=${getAddress(lotteryToken.address, plottery.chainId)}`} bold={false}>
              {t('Buy Token')}
            </LinkExternal>
          </Flex>
          <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
            <LinkExternal href={lotteryToken.projectLink} bold={false}>
              {t('View Project Site')}
            </LinkExternal>
          </Flex>
          {lotteryContractAddress && (
            <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
              <LinkExternal href={`${BASE_BSC_SCAN_URLS[plottery.chainId]}/address/${lotteryContractAddress}`} bold={false}>
                {t('View Contract')}
              </LinkExternal>
            </Flex>
          )}
          {account && (
            <AddToWalletButton
              tokenAddress={getAddress(lotteryToken.address, plottery.chainId)}
              tokenSymbol={lotteryToken.symbol}
              tokenDecimals={lotteryToken.decimals}
            />
          )}
        </InfoSection>
      </Flex>
    </StyledActionPanel>
  )
}

export default PLotteryActionPanel
