import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { Game } from 'state/types'
import { Flex, Text, LinkExternal, Skeleton } from 'uikit'
import { getAddress } from 'utils/addressHelpers'
import { useAccount } from 'wagmi'

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
  const { chain } = useAccount()

  const ContractAddress = getAddress(contractAddress)

  return (
    <>
     

      <ExpandedWrapper flexDirection="column">
        <Text color="textSubtle">Goal of the Game:</Text>
        <Text>
          Guess the Suit Drawn
          <br />
          <br />
        </Text>
        <Text color="textSubtle">How to Play:</Text>
        <Text>
          1: Select and Place Bet.
          <br />
          2: Cut the deck!
          <br />
          <br />
        </Text>
        <Text color="textSubtle">Winning PayOuts:</Text>
        {multipliers2 === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Text>
              Same Suit: Win! {new BigNumber(multipliers2.suitCallM.toString()).div(100).toString()} Times your Bet.
              <br />
              <br />
              <br />
              Winnings are Approx based on Payout Rate.
              <br />
            </Text>
          </>
        )}
        <Text color="failure">Different: You lose your bet.</Text>
        <br />

        {ContractAddress && (
          <Flex mb="2px" justifyContent="flex-end">
            <LinkExternal href={`${chain?.blockExplorers.default}/address/${ContractAddress}`} bold={false} small>
              {t('View Contract')}
            </LinkExternal>
          </Flex>
        )}
      </ExpandedWrapper>
    </>
  )
}

export default React.memo(ExpandedFooter)
