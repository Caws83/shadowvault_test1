import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Heading,
  Text,
  Skeleton,
  Button,
  useModal,
  Box,
  CardFooter,
  ExpandableLabel,
} from 'uikit'
import BigNumber from 'bignumber.js'
import { LotteryStatus, Token } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import { useLottery, useLotteryDecimals } from 'state/lottery/hooks'
import { useFetchPlotteryUserData, useGetPlotteryByToken } from 'state/plottery/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { ActionContainer, ActionTitles } from '../../PLottery/LotteryTable/ActionPanel/styles'
import ViewTicketsModal from './ViewTicketsModal'
import BuyTicketsButton from './BuyTicketsButton'
import ClaimTicketsButton from './claimNFTTickets'
import { dateTimeOptions } from '../helpers'
import RewardBrackets from './RewardBrackets'
import { TicketPurchaseCard } from '../svgs'
import { useAccount } from 'wagmi'

const mainTicketAnimation = keyframes`
  from {
    transform: rotate(-9deg);
  }
  50% {
    transform: rotate(7deg);
  }
  to {
    transform: rotate(-9deg);
  }  
`

const TicketContainer = styled(Flex)`
  animation: ${mainTicketAnimation} 8s ease-in-out infinite;
`

const StyledClaimTicketButton = styled(ClaimTicketsButton)<{ disabled: boolean }>`
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : 'linear-gradient(180deg, #7645d9 0%, #452a7a 100%)'};
  width: 200px;
  ${({ theme }) => theme.mediaQueries.xs} {
    width: 240px;
  }
`

const ButtonWrapper = styled.div`
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-4deg);
`

const TicketSvgWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-4deg);
`

const StyledCard = styled(Card)`
  width: 95%;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 520px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 756px;
  }
`

const NextDrawWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
`

const NextDrawCard: React.FC<{ lotteryToken: Token; lottoPrice: BigNumber }> = ({ lotteryToken, lottoPrice }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { currentLotteryId, isTransitioning, currentRound } = useLottery(lotteryToken)
  const { endTime, amountCollectedInCake, userTickets, status } = currentRound
  useFetchPlotteryUserData(account, currentLotteryId)
  const { plottery, userDataLoaded } = useGetPlotteryByToken(lotteryToken)
  const [onPresentViewTicketsModal] = useModal(
    <ViewTicketsModal
      roundId={currentLotteryId}
      roundStatus={status}
      lotteryToken={lotteryToken}
      lottoPrice={lottoPrice}
    />,
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const ticketBuyIsDisabled = status !== LotteryStatus.OPEN || isTransitioning

  const NFTTicketsClaimed = userDataLoaded ? plottery.userData.nftClaimed : true
  const howManySpots = userDataLoaded ? new BigNumber(plottery.userData.howManySpots.toString()).toNumber() : 0
  const canClaim = userDataLoaded ? NFTTicketsClaimed === false && howManySpots > 0 : false

  // const dex = useLotteryDex(lotteryToken)
  // const lottoPrice = useLottoPrice( lotteryToken, dex)
  const { displayTokenDecimals, displayBUSDDecimals } = useLotteryDecimals(lotteryToken)
  const prizeInBusd = new BigNumber(amountCollectedInCake.toString()).times(lottoPrice)
  const prizeTotal = getBalanceNumber(prizeInBusd, lotteryToken.decimals)
  const endTimeMs = parseInt(endTime, 10) * 1000
  const endDate = new Date(endTimeMs)
  const isLotteryOpen = status === LotteryStatus.OPEN
  const userTicketCount = userTickets?.tickets?.length || 0

  const getPrizeBalances = () => {
    if (status === LotteryStatus.CLOSE || status === LotteryStatus.CLAIMABLE) {
      return (
        <Heading scale="xl" color="secondary" textAlign={['center', null, null, 'left']}>
          {t('Calculating')}...
        </Heading>
      )
    }
    return (
      <>
        {prizeInBusd.isNaN() ? (
          <Skeleton my="7px" height={40} width={160} />
        ) : (
          <Balance
            fontSize="40px"
            color="secondary"
            textAlign={['center', null, null, 'left']}
            lineHeight="1"
            bold
            prefix="~$"
            value={prizeTotal}
            decimals={prizeTotal > 10 ? 2 : displayBUSDDecimals}
          />
        )}
        {new BigNumber(amountCollectedInCake.toString()).isNaN() ? (
          <Skeleton my="2px" height={14} width={90} />
        ) : (
          <Balance
            fontSize="14px"
            color="textSubtle"
            textAlign={['center', null, null, 'left']}
            unit={` ${lotteryToken.symbol}`}
            value={getBalanceNumber(new BigNumber(amountCollectedInCake.toString()), lotteryToken.decimals)}
            decimals={displayTokenDecimals}
          />
        )}
      </>
    )
  }

  const getNextDrawId = () => {
    if (status === LotteryStatus.OPEN) {
      return `${currentLotteryId} |`
    }
    if (status === LotteryStatus.PENDING) {
      return ''
    }
    return parseInt(currentLotteryId, 10) + 1
  }

  const getNextDrawDateTime = () => {
    if (status === LotteryStatus.OPEN) {
      return `${t('Draw')}: ${endDate.toLocaleString(undefined, dateTimeOptions)}`
    }
    return ''
  }

  return (
    <StyledCard>
      <CardHeader p="16px 24px">
        <Flex justifyContent="space-between">
          <Heading mr="12px">{t('Next Draw')}</Heading>
          <Text>
            {currentLotteryId && `#${getNextDrawId()}`} {Boolean(endTime) && getNextDrawDateTime()}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex
          flexDirection={['column', null, null, 'row']}
          justifyContent={['center', null, null, 'space-between']}
          alignItems="center"
        >
          <Flex justifyContent={['center', null, null, 'space']}>
            <Heading>{t('Prize Pot')}</Heading>
          </Flex>
          <Flex flexDirection="column" mb="18px">
            {getPrizeBalances()}
          </Flex>
        </Flex>

        <Flex
          flexDirection={['column', null, null, 'row']}
          justifyContent={['center', null, null, 'space-between']}
          alignItems="center"
        >
          <Box display={['none', null, null, 'flex']}>
            <Heading>{t('Your tickets')}</Heading>
          </Box>

          {isLotteryOpen && (
            <Flex
              flexDirection="column"
              mr={[null, null, null, '24px']}
              alignItems={['center', null, null, 'flex-start']}
            >
              {account && (
                <Flex justifyContent={['center', null, null, 'flex-start']}>
                  <Text display="inline">{t('You have')} </Text>
                  {userTickets !== undefined && !userTickets.isLoading ? (
                    <Balance
                      value={userTicketCount}
                      decimals={0}
                      unit={` ${t('tickets')}`}
                      display="inline"
                      bold
                      mx="4px"
                    />
                  ) : (
                    <Skeleton mx="4px" height={20} width={40} />
                  )}
                  <Text display="inline"> {t('this round')}</Text>
                </Flex>
              )}
              {userTickets !== undefined && !userTickets.isLoading && userTicketCount > 0 && (
                <Button
                  onClick={onPresentViewTicketsModal}
                  height="auto"
                  width="fit-content"
                  p="0"
                  mb={['32px', null, null, '0']}
                  variant="text"
                  scale="sm"
                >
                  {t('View your tickets')}
                </Button>
              )}
            </Flex>
          )}

          <BuyTicketsButton
            disabled={ticketBuyIsDisabled}
            maxWidth="250px"
            lotteryToken={lotteryToken}
            lottoPrice={lottoPrice}
          />
        </Flex>

        <ActionContainer>
          <Flex flexDirection={['column', null, null, 'row']} justifyContent="center" alignItems="center">
            {isLotteryOpen && (
              <Flex
                flexDirection="column"
                mr={[null, null, null, '24px']}
                alignItems={['center', null, null, 'flex-start']}
              >
                {account && userDataLoaded && howManySpots > 0 && (
                  <>
                    <ActionTitles>
                      <Text bold textTransform="uppercase" color="textSubtle" fontSize="16px">
                        Claim Tickets Using NFTs
                      </Text>
                    </ActionTitles>

                    <TicketContainer
                      position="relative"
                      width={['240px', '288px']}
                      height={['94px', '113px']}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ButtonWrapper>
                        <StyledClaimTicketButton
                          disabled={ticketBuyIsDisabled || !canClaim}
                          lotteryToken={lotteryToken}
                          howMany={new BigNumber(howManySpots).toNumber()}
                        />
                      </ButtonWrapper>
                      <TicketSvgWrapper>
                        <TicketPurchaseCard width="100%" />
                      </TicketSvgWrapper>
                    </TicketContainer>

                    <Flex justifyContent={['center', null, null, 'flex-start']}>
                      <Text display="inline">{t('Can Claim')} </Text>
                      {howManySpots !== undefined ? (
                        <Balance
                          value={howManySpots}
                          decimals={0}
                          unit={` ${t('tickets')}`}
                          display="inline"
                          bold
                          mx="4px"
                        />
                      ) : (
                        <Skeleton mx="4px" height={20} width={40} />
                      )}
                      <Text display="inline"> {t('per round')}</Text>
                    </Flex>
                  </>
                )}
              </Flex>
            )}
          </Flex>
        </ActionContainer>
      </CardBody>
      <CardFooter p="0">
        {(status === LotteryStatus.OPEN || status === LotteryStatus.CLOSE) && (
          <Flex p="8px 24px" alignItems="center" justifyContent="center">
            <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? t('Hide') : t('Details')}
            </ExpandableLabel>
          </Flex>
        )}
        {isExpanded && (
          <NextDrawWrapper>
            <RewardBrackets lotteryNodeData={currentRound} lotteryToken={lotteryToken} lottoPrice={lottoPrice} />
          </NextDrawWrapper>
        )}
      </CardFooter>
    </StyledCard>
  )
}

export default NextDrawCard
