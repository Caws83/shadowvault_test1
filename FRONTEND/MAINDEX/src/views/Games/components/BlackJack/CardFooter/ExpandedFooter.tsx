import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { Game } from 'state/types'
import { Flex, Text, LinkExternal, Skeleton } from 'uikit'
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

  const MBig = new BigNumber(multipliers.blackJackM.toString())

  const ContractAddress = getAddress(contractAddress)

  return (
    <>
     

      <ExpandedWrapper flexDirection="column">
        <Text color="textSubtle">Goal of the Game:</Text>
        <Text>
          Get 21, or Higher than Dealer
          <br />
          <br />
        </Text>
        <Text color="textSubtle">How to Play:</Text>
        <Text>
          1: Select and Place Bet.
          <br />
          2: Hit to draw another card.
          <br />
          3: Hold when your happy.
          <br />
          4: If you beat house you win.
          <br />
          <br />
        </Text>
        <Text>Next PayOut:</Text>
        {multipliers === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Text color="textSubtle">Winning PayOuts:</Text>
            <Text>
              WIN: Winnings + your bet.
              <br />
              Beat house: {MBig.times(2).div(100).toString()} x bet
              <br />
              <br />
              Winnings are Approx based on Payout Rate.
              <br />
            </Text>
          </>
        )}

        <Text color="failure">
          Lose bet if you bust / lower than dealer.
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
