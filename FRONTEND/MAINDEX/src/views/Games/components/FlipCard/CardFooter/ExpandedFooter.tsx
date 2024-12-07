import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { Game } from 'state/types'
import { Flex, Text, LinkExternal, Heading, Skeleton } from 'uikit'
import { BASE_BSC_SCAN_URLS } from 'config'
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

  const ContractAddress = getAddress(contractAddress, game.chainId)

  return (
    <>
      

      <ExpandedWrapper flexDirection="column">
        <Text color="textSubtle">Goal of the Game:</Text>
        <Text>
          Guess Heads or Tails!!
          <br />
          <br />
        </Text>
        <Text color="textSubtle">How to Play:</Text>
        <Text>
          1: chooses Heads or Tails.
          <br />
          2: Select and Place Bet.
          <br />
          3: Flip the coin!
          <br />
          <br />
        </Text>
        <Text color="textSubtle">Winning PayOuts:</Text>
        {multipliers === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Text>
              Guess Correctly you win {new BigNumber(multipliers.coinFlipM.toString()).times(2).div(100).toString()} X.
              <br />
              <br />
              Winnings are Approx based on Payout Rate.
              <br />
            </Text>
          </>
        )}
        <Text color="failure">Guess Wrong You lose.</Text>
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
