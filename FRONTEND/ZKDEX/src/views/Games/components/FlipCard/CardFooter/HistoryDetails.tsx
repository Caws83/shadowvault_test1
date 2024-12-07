import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Game } from 'state/types'
import { Flex, Text, Heading, PrizeIcon, BlockIcon, IconButton, ChevronUpIcon, ChevronDownIcon } from 'uikit'
import Balance from 'components/Balance'
import BigNumber from 'bignumber.js'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
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

  const [playerCall, setPlayerCall] = useState<boolean>(undefined)
  const [isWinner] = useState<boolean>(round.isWinner)
  const [amount] = useState<BigNumber>(new BigNumber(round.amount.toString()))
  const [result] = useState<boolean>(round.isHeads)

  useEffect(() => {
    if (playerCall === undefined) {
      if (round.isWinner) setPlayerCall(round.isHeads)
      else setPlayerCall(!round.isHeads)
    }
  }, [round, playerCall])

  const TokenPriceRaw = useGetTokenPrice(game.dex, game.payToken)
  const [isOpen, setIsOpen] = useState(false)

  const headerColor = useMemo(() => {
    if (isWinner) return 'green'
    return 'red'
  }, [isWinner])

  const getCoinImage = (heads: boolean) => {
    return heads ? (
      <img src={`/images/games/${folder}/coinflip/heads.png`} alt="HEADS" height="50px" width="50px" />
    ) : (
      <img src={`/images/games/${folder}/coinflip/tails.png`} alt="TAILS" height="50px" width="50px" />
    )
  }

  const headerIcon = useMemo(() => {
    if (isWinner) return <PrizeIcon color="gold" height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
    return <BlockIcon color={headerColor} height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
  }, [isWinner, headerColor])

  const headerText = useMemo(() => {
    if (isWinner) return 'Win!'
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
            <Text color="secondary">Player Bet:</Text>
            {getCoinImage(playerCall)}
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" mb="16px">
            <Text color="secondary">House Result :</Text>
            {getCoinImage(result)}
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
