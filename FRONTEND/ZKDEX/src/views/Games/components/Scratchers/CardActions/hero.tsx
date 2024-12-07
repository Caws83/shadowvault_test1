import React from 'react'
import styled, { keyframes } from 'styled-components'
import { Box, Flex, Heading } from 'uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { Game } from 'state/types'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { TicketPurchaseCard } from './svgs'
import BuyTicketsButton from './BuyTicketsButton'

const floatingStarsLeft = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(10px, 10px);
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
    transform: translate(-10px, 10px);
  }
  to {
    transform: translate(0, -0px);
  }  
`

const mainTicketAnimation = keyframes`
  from {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(5deg);
  }
  to {
    transform: rotate(-3deg);
  }  
`

const TicketContainer = styled(Flex)`
  animation: ${mainTicketAnimation} 3s ease-in-out infinite;
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
  width: 150%;
  height: 95%;

  & img {
    position: absolute;
  }

  & :nth-child(1) {
    animation: ${floatingStarsLeft} 3s ease-in-out infinite;
    animation-delay: 0.25s;
  }
  & :nth-child(2) {
    animation: ${floatingStarsLeft} 3.5s ease-in-out infinite;
    animation-delay: 0.5s;
  }
  & :nth-child(3) {
    animation: ${floatingStarsRight} 4s ease-in-out infinite;
    animation-delay: 0.75s;
  }

  ${({ theme }) => theme.mediaQueries.xs} {
    & :nth-child(1) {
      left: 10%;
      top: 60%;
    }
    & :nth-child(2) {
      left: 25%;
      top: -5%;
    }
    & :nth-child(3) {
      right: 15%;
      top: -12%;
    }
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & :nth-child(1) {
      left: 10%;
      top: 60%;
    }
    & :nth-child(2) {
      left: 25%;
      top: -5%;
    }
    & :nth-child(3) {
      right: 15%;
      top: -12%;
    }
  }

  ${({ theme }) => theme.mediaQueries.md} {
    & :nth-child(1) {
      left: 10%;
      top: 60%;
    }
    & :nth-child(2) {
      left: 25%;
      top: -0%;
    }
    & :nth-child(3) {
      right: 15%;
      top: -12%;
    }
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    & :nth-child(1) {
      left: 10%;
      top: 60%;
    }
    & :nth-child(2) {
      left: 25%;
      top: -0%;
    }
    & :nth-child(3) {
      right: 15%;
      top: -12%;
    }
  }
`

const Hero: React.FC<{ game: Game }> = ({ game }) => {
  const { scratcher } = game
  const { jackPot } = scratcher
  const { t } = useTranslation()
  const bnbPrice = usePriceBnbBusd()

  const prizeInBusd = new BigNumber(jackPot.toString()).multipliedBy(bnbPrice.toString()).shiftedBy(-18)
  const ticketBuyIsDisabled = prizeInBusd.lt(500)

  const getHeroHeading = () => {
    if (!ticketBuyIsDisabled) {
      return (
        <Heading mb="32px" scale="lg" color="#ffffff">
          {t('To be WON!')}
        </Heading>
      )
    }
    return (
      <Heading mb="22px" scale="lg" color="#ffffff">
        {t('JackPot is Growing!')}
      </Heading>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <StarsDecorations display="block">
        <img src="/images/lottery/star-big.png" width="124px" height="109px" alt="" />
        <img src="/images/lottery/star-small.png" width="70px" height="62px" alt="" />
        <img src="/images/lottery/three-stars.png" width="130px" height="144px" alt="" />
      </StarsDecorations>

      {getHeroHeading()}

      <TicketContainer
        position="relative"
        width={['240px', '288px']}
        height={['94px', '113px']}
        alignItems="center"
        justifyContent="center"
      >
        <ButtonWrapper>
          <StyledBuyTicketButton disabled={ticketBuyIsDisabled} game={game} />
        </ButtonWrapper>
        <TicketSvgWrapper>
          <TicketPurchaseCard width="100%" />
        </TicketSvgWrapper>
      </TicketContainer>
    </Flex>
  )
}

export default Hero
