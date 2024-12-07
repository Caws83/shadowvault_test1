import React, { useMemo } from 'react'
import { Flex, Text, Skeleton, WaitIcon, useModal, TicketFillIcon, Box } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import styled, { keyframes } from 'styled-components'
import BigNumber from 'bignumber.js'
import { getBalanceAmount } from 'utils/formatBalance'
import { useFetchLottery, useLottery, useLotteryDex } from 'state/lottery/hooks'
import { useLottoPrice } from 'views/Lottery/helpers'
import Balance from 'components/Balance'
import { Token } from 'config/constants/types'
import { LotteryStatus } from 'config/constants/types'
import BuyTicketsModal from 'views/Lottery/components/BuyTicketsModal/BuyTicketsModal'
import { useFetchPLotteryPublicData } from 'state/plottery/hooks'
import useStatusTransitions from 'views/Lottery/hooks/useStatusTransitions'
import { TokenImage } from 'components/TokenImage'
import hosts from 'config/constants/hosts'


const StyledBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradients.gold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const LotteryCardContent: React.FC<{ lotteryToken: Token }> = (props) => {
  const { lotteryToken } = props
  const dex = useLotteryDex(lotteryToken)
  useFetchLottery(lotteryToken, dex.chainId)
  const l = useLottery(lotteryToken)

  const { t } = useTranslation()
 

  const lottoPrice = useLottoPrice(lotteryToken, dex)
  const cakePriceBusdAsString = lottoPrice.toString()
  const cakePrizesText = t('%cakePrizeInUsd% in %symbol% prizes this round', {
    cakePrizeInUsd: cakePriceBusdAsString,
    symbol: lotteryToken.symbol,
  })
  const [onPresentBuyTicketsModal] = useModal(<BuyTicketsModal lotteryToken={lotteryToken} lottoPrice={new BigNumber(lottoPrice)} />)
  const [pretext, prizesThisRound] = cakePrizesText.split(cakePriceBusdAsString)
  
  const {currentRound, isTransitioning} = l

  const ticketBuyIsDisabled = currentRound.status !== LotteryStatus.OPEN || isTransitioning

  const getBuyButtonText = () => {
    if (currentRound.status === LotteryStatus.OPEN) {
      return t('Buy Tickets')
    }
    return (
      <>
        <WaitIcon mr="8px" color="text" /> {t('soon!')}
      </>
    )
  }

  const cakePriceBusd = useMemo(() => {
    return new BigNumber(cakePriceBusdAsString)
  }, [cakePriceBusdAsString])


  const currentLotteryPrize = cakePriceBusd.times(l.currentRound.amountCollectedInCake.toString())
 

  const mainTicketAnimation = keyframes`
  from {
    transform: rotate(-9deg);
  }
  50% {
    transform: rotate(23deg);
  }
  to {
    transform: rotate(-20deg);
  }  
`

const TicketContainer = styled(Flex)`
  animation: ${mainTicketAnimation} 3s ease-in-out infinite;
`

  return (


      <Flex flexDirection="column" justifyContent="space-between"  onClick={!ticketBuyIsDisabled ? onPresentBuyTicketsModal : null}>
        
        <Flex flexDirection="row">
        <TokenImage token={lotteryToken} host={hosts.farmageddon} chainId={l.chainId} width={50} height={50} />
        <Text color="white" bold fontSize="14px">
          {t(`${lotteryToken.symbol}`)}
        </Text>
        </Flex>
        
        {pretext && (
          <Text color="white"bold fontSize="14px">
            {pretext}
          </Text>
        )}
        
        <Flex flexDirection="column">
        {currentLotteryPrize && currentLotteryPrize.gt(0) ? (
          <StyledBalance
            fontSize="32px"
            bold
            prefix="$"
            decimals={0}
            value={getBalanceAmount(currentLotteryPrize, lotteryToken.decimals).toNumber()}
          />
          
        ) : (
          <>
            <Skeleton width={80} height={45}/>
          </>
        )}
       
        <Text color="white" bold fontSize="14px">
          {prizesThisRound}
        </Text>
        </Flex>
        
        <Flex alignItems="flex-end" justifyContent="flex-end" flexDirection="row">
        
        <TicketContainer>
          <TicketFillIcon color="secondary" width="36px" mr="24px" />
        </TicketContainer>
        <Text color="secondary" bold fontSize="18px">{getBuyButtonText()}</Text>
        
        </Flex>
      </Flex>
   
  )
}

export default LotteryCardContent
