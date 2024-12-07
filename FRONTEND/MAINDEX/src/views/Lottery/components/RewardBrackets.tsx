import React, { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { Flex, Text } from 'uikit'
import styled from 'styled-components'
import { BIG_ZERO } from 'utils/bigNumber'
import { useTranslation } from 'contexts/Localization'
import { LotteryRound } from 'state/types'
import { Token } from 'config/constants/types'
import RewardBracketDetail from './RewardBracketDetail'

const Wrapper = styled(Flex)`
  width: 100%;
  flex-direction: column;
`

const RewardsInner = styled.div`
  display: grid;
  grid-template-columns: repeat(1, auto);
  row-gap: 4px;

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: repeat(3, 1fr);
  }
`

interface RewardMatchesProps {
  lotteryNodeData: LotteryRound
  isHistoricRound?: boolean
  lotteryToken: Token
  lottoPrice: BigNumber
}

interface RewardsState {
  isLoading: boolean
  cakeToBurn: BigNumber
  rewardsLessTreasuryFee: BigNumber
  rewardsBreakdown: string[]
  countWinnersPerBracket: string[]
}

const RewardBrackets: React.FC<RewardMatchesProps> = ({
  lotteryNodeData,
  isHistoricRound,
  lotteryToken,
  lottoPrice,
}) => {
  const { t } = useTranslation()
  const [state, setState] = useState<RewardsState>({
    isLoading: true,
    cakeToBurn: BIG_ZERO,
    rewardsLessTreasuryFee: BIG_ZERO,
    rewardsBreakdown: null,
    countWinnersPerBracket: null,
  })

  useEffect(() => {
    if (lotteryNodeData) {
      const {
        treasuryFee,
        amountCollectedInCake: cakeBI,
        rewardsBreakdown: rBI,
        countWinnersPerBracket: cwbBI,
      } = lotteryNodeData
      const amountCollectedInCake = new BigNumber(cakeBI.toString())
      const rewardsBreakdown = rBI.map((i) => i.toString())
      const countWinnersPerBracket = cwbBI.map((i) => i.toString())

      const feeAsPercentage = new BigNumber(treasuryFee).div(100)
      const cakeToBurn = feeAsPercentage.div(100).times(new BigNumber(amountCollectedInCake))
      const amountLessTreasuryFee = new BigNumber(amountCollectedInCake).minus(cakeToBurn)
      setState({
        isLoading: false,
        cakeToBurn,
        rewardsLessTreasuryFee: amountLessTreasuryFee,
        rewardsBreakdown,
        countWinnersPerBracket,
      })
    } else {
      setState({
        isLoading: true,
        cakeToBurn: BIG_ZERO,
        rewardsLessTreasuryFee: BIG_ZERO,
        rewardsBreakdown: null,
        countWinnersPerBracket: null,
      })
    }
  }, [lotteryNodeData])

  const getCakeRewards = (bracket: number) => {
    const shareAsPercentage = new BigNumber(state.rewardsBreakdown[bracket]).div(100)
    return state.rewardsLessTreasuryFee.div(100).times(shareAsPercentage)
  }

  const { isLoading, countWinnersPerBracket, cakeToBurn } = state

  const rewardBrackets = [0, 1, 2, 3, 4, 5]

  return (
    <Wrapper>
      <Text fontSize="14px" mb="24px">
        {t('Match the winning number in the same order to share prizes.')}{' '}
        {!isHistoricRound && t('Current prizes up for grabs:')}
      </Text>
      <RewardsInner>
        {rewardBrackets.map((bracketIndex) => (
          <RewardBracketDetail
            key={bracketIndex}
            rewardBracket={bracketIndex}
            cakeAmount={!isLoading && getCakeRewards(bracketIndex)}
            numberWinners={!isLoading && countWinnersPerBracket[bracketIndex]}
            isHistoricRound={isHistoricRound}
            isLoading={isLoading}
            lotteryToken={lotteryToken}
            lottoPrice={lottoPrice}
          />
        ))}
        {cakeToBurn.gt(BIG_ZERO) && (
          <RewardBracketDetail
            rewardBracket={0}
            cakeAmount={cakeToBurn}
            isBurn
            isLoading={isLoading}
            lotteryToken={lotteryToken}
            lottoPrice={lottoPrice}
          />
        )}
      </RewardsInner>
    </Wrapper>
  )
}

export default RewardBrackets
