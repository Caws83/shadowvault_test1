import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { Game } from 'state/types'
import { Flex, Text, LinkExternal, Heading, Skeleton } from 'uikit'
import { BASE_BSC_SCAN_URLS } from 'config'
import PageHeader from 'components/PageHeader'
import { getAddress } from 'utils/addressHelpers'

interface ExpandedFooterProps {
  game: Game
}

const ExpandedWrapper = styled(Flex)`
  svg {
    height: 14px;
    width: 14px;
  }
`

const ExpandedFooter: React.FC<ExpandedFooterProps> = ({ game }) => {
  const { t } = useTranslation()
  const { contractAddress, multipliers } = game

  const startMBig = new BigNumber(multipliers.highCardStart.toString())

  const ContractAddress = getAddress(contractAddress)

  return (
    <>
     

      <ExpandedWrapper flexDirection="column">
        <Text color="textSubtle">Goal of the Game:</Text>
        <Text>
          Will next card be Higher or Lower?
          <br />
          <br />
        </Text>
        <Text color="textSubtle">How to Play:</Text>
        <Text>
          1: Select and Place Bet.
          <br />
          2: Guess higher or Lower
          <br />
          3: if you win Guess Again.
          <br />
          4: claim if your happy.
          <br />
          <br />
        </Text>
        <Text color="textSubtle">Winning PayOuts:</Text>
        {multipliers === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Text>
              WIN: Winnings + your bet.
              <br />1 Guess: {startMBig.times(1).div(100).toString()} x bet
              <br />2 Guess: {startMBig.times(2).div(100).toString()} x bet
              <br />3 Guess: {startMBig.times(3).div(100).toString()} x bet
              <br />4 Guess: {startMBig.times(4).div(100).toString()} x bet
              <br />5 Guess: {startMBig.times(5).div(100).toString()} x bet
              <br />6 Guess: {startMBig.times(6).div(100).toString()} x bet
              <br />
              <br />
              Winnings are Approx based on Payout Rate.
              <br />
            </Text>
          </>
        )}
        <Text color="failure">
          Guess Wrong You lose.
          <br />
        </Text>

        {ContractAddress && (
          <Flex mb="2px" justifyContent="flex-end">
            <LinkExternal href={`${BASE_BSC_SCAN_URLS[game.chainId]}/address/${ContractAddress}`} bold={false} small>
              {t('View Contract')}
            </LinkExternal>
          </Flex>
        )}
      </ExpandedWrapper>
    </>
  )
}

export default React.memo(ExpandedFooter)
