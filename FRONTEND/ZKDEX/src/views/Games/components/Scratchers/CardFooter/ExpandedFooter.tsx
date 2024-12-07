import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { Game } from 'state/types'
import { Flex, Text, LinkExternal } from 'uikit'
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
  const { contractAddress } = game
  const { chain } = useAccount()
  // const { chances, totalChance } = game.scratcher

  const ContractAddress = getAddress(contractAddress, game.chainId)

  // const overAllChance = new BigNumber(totalChance).minus(chances[0]).dividedBy(totalChance).multipliedBy(100)

  return (
    <>
     

      <ExpandedWrapper flexDirection="column">
        {/* <Text color="textSubtle">{`Chance of Winning: ${overAllChance} % `} </Text> */}

        <Text color="textSubtle">Goal of the Game:</Text>
        <Text>
          Scratch and Wins
          <br />
          <br />
        </Text>
        <Text color="textSubtle">How to Play:</Text>
        <Text>
          1: Buy Ticket
          <br />
          2: Scratch Ticket.
          <br />
          3: WIN!
          <br />
          <br />
        </Text>

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
