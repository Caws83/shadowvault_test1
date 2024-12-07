import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { Flex, Heading, Text, Skeleton, Button, useModal, CardFooter, ExpandableLabel } from 'uikit'
import BigNumber from 'bignumber.js'
import { LotteryStatus, Token } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import { useLottery, useLotteryDecimals } from 'state/lottery/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { PLottery } from 'state/types'
import { ActionTitles } from '../../PLottery/LotteryTable/ActionPanel/styles'
import ViewTicketsModal from './ViewTicketsModal'
import ClaimTicketsButton from './claimNFTTickets'
import RewardBrackets from './RewardBrackets'
import { TicketPurchaseCard } from '../svgs'
import { useAccount } from 'wagmi'

const mainTicketAnimation = keyframes`
  from {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(20deg);
  }
  to {
    transform: rotate(-10deg);
  }  
`

const TicketContainer = styled(Flex)`
  animation: ${mainTicketAnimation} 3s ease-in-out infinite;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-column-gap: 32px;
    grid-template-columns: auto 1fr;
  }
`

const NextDrawWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
`

const NextDrawCardTable: React.FC<{
  lotteryToken: Token
  plottery: PLottery
  lottoPrice: BigNumber
  userDataLoaded: boolean
}> = ({ lotteryToken, plottery, lottoPrice, userDataLoaded }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { currentLotteryId, isTransitioning, currentRound } = useLottery(lotteryToken)
  const { amountCollectedInCake: cakeBI, userTickets, status, priceTicketInCake } = currentRound
  const amountCollectedInCake = new BigNumber(cakeBI)
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

  const NFTTicketsClaimed = !userDataLoaded ? true : plottery.userData.nftClaimed
  const howManySpots = !userDataLoaded ? 0 : new BigNumber(plottery.userData.howManySpots).toNumber()
  const canClaim = NFTTicketsClaimed === false && howManySpots > 0
  const { displayTokenDecimals, displayBUSDDecimals } = useLotteryDecimals(lotteryToken)
  const prizeInBusd = amountCollectedInCake.times(lottoPrice)
  const prizeTotal = getBalanceNumber(prizeInBusd, lotteryToken.decimals)

  const isLotteryOpen = status === LotteryStatus.OPEN
  const userTicketCount = userTickets?.tickets?.length || 0

  const ticketPriceBG = new BigNumber(priceTicketInCake)
  const tprice = getBalanceNumber(ticketPriceBG, lotteryToken.decimals)

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
        <Flex flexDirection="column" justifyContent="center" alignItems="center">
          {amountCollectedInCake.isNaN() ? (
            <Skeleton my="2px" height={14} width={90} />
          ) : (
            <Balance
              fontSize="18px"
              color="textSubtle"
              textAlign={['center', null, null, 'left']}
              unit={` ${lotteryToken.symbol}`}
              value={getBalanceNumber(amountCollectedInCake, lotteryToken.decimals)}
              decimals={displayTokenDecimals}
            />
          )}
          {prizeInBusd.isNaN() ? (
            <Skeleton my="7px" height={40} width={160} />
          ) : (
            <Balance
              fontSize="60px"
              color="secondary"
              textAlign={['center', null, null, 'left']}
              lineHeight="1"
              bold
              prefix="~$"
              value={prizeTotal}
              decimals={prizeTotal > 10 ? 2 : displayBUSDDecimals}
            />
          )}
        </Flex>
      </>
    )
  }

  return (
    <>
      <Grid>
        {getPrizeBalances()}

        <Flex flexDirection={['column', null, null, 'row']} justifyContent="center" alignItems="center">
          {isLotteryOpen && (
            <Flex
              flexDirection="column"
              mr={[null, null, null, '24px']}
              alignItems={['center', null, null, 'flex-start']}
            >
              <Flex justifyContent={['center', null, null, 'flex-start']}>
                <Text display="inline">{t('Cost :')} </Text>
                {tprice ? (
                  <Balance
                    color="primary"
                    fontSize="16px"
                    value={tprice}
                    decimals={tprice > 99999999 ? 0 : 2}
                    unit={` ${lotteryToken.symbol}`}
                  />
                ) : (
                  <Skeleton my="7px" height={60} width={50} />
                )}
              </Flex>
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
          <Flex flexDirection="column" mb="18px">
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
              </>
            )}
          </Flex>
        </Flex>
      </Grid>

      <CardFooter p="0">
        {(status === LotteryStatus.OPEN || status === LotteryStatus.CLOSE) && (
          <Flex p="8px 24px" alignItems="center" justifyContent="center">
            <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? t('Hide') : t('Reward BreakDown')}
            </ExpandableLabel>
          </Flex>
        )}
        {isExpanded && (
          <NextDrawWrapper>
            <RewardBrackets lotteryNodeData={currentRound} lotteryToken={lotteryToken} lottoPrice={lottoPrice} />
          </NextDrawWrapper>
        )}
      </CardFooter>
    </>
  )
}

export default NextDrawCardTable
