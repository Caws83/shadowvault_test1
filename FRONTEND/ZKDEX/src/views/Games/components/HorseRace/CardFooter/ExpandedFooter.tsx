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
  const { contractAddress, multipliers2 } = game

  const ContractAddress = getAddress(contractAddress)

  return (
    <>
     

      <ExpandedWrapper flexDirection="column">
        <Text color="textSubtle">Goal of the Game:</Text>
        <Text>
          Pick horse to Win
          <br />
          <br />
        </Text>
        <Text color="textSubtle">How to Play:</Text>
        <Text>
          1: Select Horse and Place Bet.
          <br />
          2: Start the Race
          <br />
          <br />
        </Text>
        <Text color="textSubtle">Winning PayOuts:</Text>
        {multipliers2 === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Text>
              First: Win! {new BigNumber(multipliers2.horseRace1M.toString()).div(100).toString()} Times your Bet.
              <br />
              Second: Win! {new BigNumber(multipliers2.horseRace2M.toString()).div(100).toString()} Times your Bet.
              <br />
              Third Place: Tie!
              <br />
              <br />
              Winnings are Approx based on Payout Rate.
              <br />
            </Text>
          </>
        )}
        <Text color="failure">4th or Higher. lose your Bet</Text>
        <br />

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
