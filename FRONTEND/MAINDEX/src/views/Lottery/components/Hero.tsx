import React from 'react'
import styled, { keyframes } from 'styled-components'
import { Box, Flex, Heading, Skeleton } from 'uikit'
import BigNumber from 'bignumber.js'
import { getAddress } from 'utils/addressHelpers'
import hosts from 'config/constants/hosts'
import { TokenImage } from 'components/TokenImage'
import { LotteryStatus, Token } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import { useLottery, useLotteryDecimals } from 'state/lottery/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { TicketPurchaseCard } from '../svgs'
import BuyTicketsButton from './BuyTicketsButton'

const floatingStarsLeft = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(100px, 35px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const floatingStarsRight = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-80px, 80px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const floatingTicketLeft = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-20px, 0px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const floatingTicketRight = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(20px, 0px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const mainTicketAnimation = keyframes`
  from {
    transform: rotate(-9deg);
  }
  50% {
    transform: rotate(12deg);
  }
  to {
    transform: rotate(-9deg);
  }  
`

const TicketContainer = styled(Flex)`
  animation: ${mainTicketAnimation} 6s ease-in-out infinite;
`

const mainTicketAnimation2 = keyframes`
  from {
    transform: translateY(-60px) rotate(-20deg);
  }
  50% {
    transform: translateY(30px) rotate(12deg);
  }
  to {
    transform: translateY(-60px) rotate(-20deg);
  }  
`;

const TicketContainer2 = styled(Flex)`
  animation: ${mainTicketAnimation2} 12s ease-in-out infinite;
  z-index: -1;
`;


const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradients.gold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const StyledBuyTicketButton = styled(BuyTicketsButton)<{ disabled: boolean }>`
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



const StarsDecorations = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;

  & img {
    position: absolute;
  }

  & :nth-child(1) {
    animation: ${floatingStarsLeft} 5s ease-in-out infinite;
    animation-delay: 0.25s;
  }
  & :nth-child(2) {
    animation: ${floatingStarsLeft} 8s ease-in-out infinite;
    animation-delay: 0.5s;
  }
  & :nth-child(3) {
    animation: ${floatingStarsRight} 6s ease-in-out infinite;
    animation-delay: 0.75s;
  }
  & :nth-child(4) {
    animation: ${floatingTicketLeft} 4s ease-in-out infinite;
    animation-delay: 0.2s;
  }
  & :nth-child(5) {
    animation: ${floatingTicketRight} 5s ease-in-out infinite;
  }

  ${({ theme }) => theme.mediaQueries.xs} {
    & :nth-child(1) {
      left: -5%;
      top: 42%;
    }
    & :nth-child(2) {
      left: 0%;
      top: 10%;
    }
    & :nth-child(3) {
      right: -5%;
      top: 28%;
    }
    & :nth-child(4) {
      left: -8%;
      top: 80%;
    }
    & :nth-child(5) {
      right: -8%;
      top: 80%;
    }
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & :nth-child(1) {
      left: 3%;
      top: 42%;
    }
    & :nth-child(2) {
      left: 9%;
      top: 23%;
    }
    & :nth-child(3) {
      right: 2%;
      top: 24%;
    }
    & :nth-child(4) {
      left: 8%;
      top: 67%;
    }
    & :nth-child(5) {
      right: 8%;
      top: 67%;
    }
  }

  ${({ theme }) => theme.mediaQueries.md} {
    & :nth-child(1) {
      left: 10%;
      top: 42%;
    }
    & :nth-child(2) {
      left: 17%;
      top: 23%;
    }
    & :nth-child(3) {
      right: 10%;
      top: 24%;
    }
    & :nth-child(4) {
      left: 17%;
      top: 67%;
    }
    & :nth-child(5) {
      right: 17%;
      top: 67%;
    }
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    & :nth-child(1) {
      left: 19%;
      top: 42%;
    }
    & :nth-child(2) {
      left: 25%;
      top: 23%;
    }
    & :nth-child(3) {
      right: 19%;
      top: 24%;
    }
    & :nth-child(4) {
      left: 24%;
      top: 67%;
    }
    & :nth-child(5) {
      right: 24%;
      top: 67%;
    }
  }
`

const Hero: React.FC<{ lotteryToken: Token; lottoPrice: BigNumber }> = (props) => {
  const { lotteryToken, lottoPrice } = props
  const { t } = useTranslation()
  const {
    currentRound: { amountCollectedInCake, status },
    isTransitioning,
    chainId
  } = useLottery(lotteryToken)

  // const dex = useLotteryDex(lotteryToken)
  // const lottoPrice = useLottoPrice( lotteryToken, dex)

  const prizeInBusd = new BigNumber(amountCollectedInCake.toString()).times(lottoPrice)
  const prizeTotal = getBalanceNumber(prizeInBusd, lotteryToken.decimals)
  const ticketBuyIsDisabled = status !== LotteryStatus.OPEN || isTransitioning
  const { displayBUSDDecimals } = useLotteryDecimals(lotteryToken)

  const getHeroHeading = () => {
    if (status === LotteryStatus.OPEN) {
      return (
        <>
          {prizeInBusd.isNaN() ? (
            <Skeleton my="7px" height={60} width={190} />
          ) : (
            <PrizeTotalBalance
              fontSize="52px"
              bold
              prefix="$"
              value={prizeTotal}
              decimals={prizeTotal > 10 ? 2 : displayBUSDDecimals}
            />
          )}
          <Heading mb="32px" scale="lg" color="#ffffff">
            {t('in prizes!')}
          </Heading>
        </>
      )
    }
    return (
      <Heading mb="24px" scale="xl" color="#ffffff">
        {t('Tickets on sale soon')}
      </Heading>
    )
  }

  const getImageUrlFromToken = () => {
    const address = getAddress(lotteryToken.baseAddress ? lotteryToken.baseAddress : lotteryToken.address, chainId)
    return `/images/tokens/${address.toUpperCase()}.png`
  }

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <StarsDecorations display="block">
        <img src="/images/lottery/star-big.png" width="124px" height="109px" alt="" />
        <img src="/images/lottery/star-small.png" width="70px" height="62px" alt="" />
        <img src="/images/lottery/three-stars.png" width="130px" height="144px" alt="" />
        <img
          src={lotteryToken.symbol === 'MSWAPF' ? '/images/lottery/ticket-l.png' : getImageUrlFromToken()}
          width="123px"
          height="83px"
          alt=""
        />
        <img
          src={lotteryToken.symbol === 'MSWAPF' ? 'images/lottery/ticket-r.png' : getImageUrlFromToken()}
          width="121px"
          height="72px"
          alt=""
        />
      </StarsDecorations>

      <Flex flexDirection="row" justifyContent="center" alignItems="center">
        <Heading scale="xl" color="gold" mb="16px" textAlign="center">
          {lotteryToken.name}
        </Heading>
      </Flex>

      {getHeroHeading()}

      <TicketContainer2
        position="relative"
        width={['240px', '288px']}
        height={['94px', '113px']}
        alignItems="center"
        justifyContent="center"
      >
        <TokenImage token={lotteryToken} host={hosts.marswap} chainId={chainId} width={180} height={180} />
      </TicketContainer2>

      <TicketContainer
        position="relative"
        width={['240px', '288px']}
        height={['94px', '113px']}
        alignItems="center"
        justifyContent="center"
      >
        <ButtonWrapper>
          <StyledBuyTicketButton disabled={ticketBuyIsDisabled} lotteryToken={lotteryToken} lottoPrice={lottoPrice} />
        </ButtonWrapper>
        <TicketSvgWrapper>
          <TicketPurchaseCard width="100%" />
        </TicketSvgWrapper>
      </TicketContainer>
    </Flex>
  )
}

export default Hero
