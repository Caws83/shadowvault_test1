import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Game } from 'state/types'
import { Flex, Text, Heading, PrizeIcon, BlockIcon, IconButton, ChevronUpIcon, ChevronDownIcon } from 'uikit'
import Balance from 'components/Balance'
import BigNumber from 'bignumber.js'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
import { CardHand } from 'components/DeckCard'
import { ActionContainer } from '../../BlackJack/modals/styles'

interface BetDetailsProps {
  game: Game
  round: any
}

const StyledBetDetails = styled.div`
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 8px;
`

const StyledBet = styled(Flex).attrs({ justifyContent: 'space-between', alignItems: 'center' })`
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`

const BetDetails: React.FC<BetDetailsProps> = ({ game, round }) => {
  const { folder, payToken } = game

  const [isWinner] = useState<number>(new BigNumber(round.result.toString()).toNumber())
  const [amount] = useState<BigNumber>(new BigNumber(round.isWinner.toString()))
  const [houseSuitInfo] = useState<number>(new BigNumber(round.houseSuit.toString()).toNumber())
  const [houseCardInfo] = useState<number>(new BigNumber(round.houseCard.toString()).toNumber())
  const [playerSuitInfo] = useState<number>(new BigNumber(round.playerSuit.toString()).toNumber())
  const [playerCardInfo] = useState<number>(new BigNumber(round.playerCard.toString()).toNumber())

  const TokenPriceRaw = useGetTokenPrice(game.dex, game.payToken)
  const [isOpen, setIsOpen] = useState(false)

  const headerColor = useMemo(() => {
    if (isWinner === 0) return 'green'
    if (isWinner === 2) return 'primary'
    return 'red'
  }, [isWinner])

  const getCoinImage = (suit: number, card: number) => {
    return (
      <Flex flex="1" flexDirection="row" mr={['8px', 0]}>
        <CardHand suit={suit} card={card} height={45} width={45} folder={folder} />
      </Flex>
    )
  }

  const headerIcon = useMemo(() => {
    if (isWinner) return <PrizeIcon color="gold" height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
    return <BlockIcon color={headerColor} height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
  }, [isWinner, headerColor])

  const headerText = useMemo(() => {
    if (isWinner === 0) return 'Win!'
    if (isWinner === 2) return 'Tie!'
    return 'Lose'
  }, [isWinner])

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <>
      <StyledBet onClick={toggleOpen} role="button" justifyContent="space-between">
        <Heading as="h3" color={headerColor} textTransform="uppercase" bold mr="4px">
          {headerText}
        </Heading>
        {headerIcon}
        <Balance
          value={amount.shiftedBy(-payToken.decimals).toNumber()}
          decimals={2}
          color={headerColor}
          unit={` ${payToken.symbol}`}
        />

        <IconButton variant="text" scale="sm">
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </IconButton>
      </StyledBet>
      {isOpen && (
        <StyledBetDetails>
          <Flex alignItems="center" justifyContent="space-between" mb="8px">
            <Heading color="primary">Round History</Heading>
            <Flex alignItems="center">
              <Heading as="h3" color={headerColor} textTransform="uppercase" bold mr="8px">
                {headerText}
              </Heading>
              {headerIcon}
            </Flex>
          </Flex>

          <Flex alignItems="center" justifyContent="space-between" mb="16px">
            <Text color="secondary">Player:</Text>
            {getCoinImage(playerSuitInfo, playerCardInfo)}
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" mb="16px">
            <Text color="secondary">House:</Text>
            {getCoinImage(houseSuitInfo, houseCardInfo)}
          </Flex>

          <ActionContainer>
            <Flex alignItems="center" justifyContent="space-between" mb="16px">
              <Text color="secondary">Winnings: :</Text>
              <Flex flexDirection="column">
                <Balance
                  value={amount.shiftedBy(-payToken.decimals).toNumber()}
                  decimals={2}
                  color={headerColor}
                  unit={` ${payToken.symbol}`}
                />
                <Balance
                  prefix={isWinner ? '+ $ ' : '- $ '}
                  value={amount.multipliedBy(TokenPriceRaw.toString()).shiftedBy(-payToken.decimals).toNumber()}
                  decimals={2}
                  color={headerColor}
                  unit=" USD"
                />
              </Flex>
            </Flex>
          </ActionContainer>
        </StyledBetDetails>
      )}
    </>
  )
}

export default BetDetails
