import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Game } from 'state/types'
import {
  Flex,
  Image,
  Text,
  useMatchBreakpoints,
  Heading,
  PrizeIcon,
  BlockIcon,
  IconButton,
  ChevronUpIcon,
  ChevronDownIcon,
} from 'uikit'
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

const selectedStyle1 = {
  cursor: 'pointer',
  border: '3px solid green',
  gridColumn: 'span 2',
}

const unselectedStyle1 = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 2',
}

const selectedStyleLarge1 = {
  cursor: 'pointer',
  border: '3px solid green',
  gridColumn: 'span 2',
}

const unselectedStyleLarge1 = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 2',
}

const BetDetails: React.FC<BetDetailsProps> = ({ game, round }) => {
  const { folder, payToken } = game

  const [playerCall] = useState<number>(new BigNumber(round[2].toString()).toNumber())
  const [isWinner] = useState<number>(new BigNumber(round[3].toString()).toNumber())
  const [amount] = useState<BigNumber>(new BigNumber(round[4].toString()))
  const [results] = useState<BigNumber[]>(round[1])

  const results1 = [0, 1, 2]
  const results2 = [3, 4, 5, 6, 7]

  const { isLg, isXl, isXxl } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl

  const TokenPriceRaw = useGetTokenPrice(game.dex, game.payToken)
  const [isOpen, setIsOpen] = useState(false)

  const headerColor = useMemo(() => {
    if (isWinner < 2) return 'green'
    if (isWinner > 2) return 'red'
    return 'primary'
  }, [isWinner])

  const getCoinImage = (horseNumber: number) => {
    return <Image src={`/images/games/${folder}/horses/${horseNumber}.png`} width={50} height={50} />
  }

  const headerIcon = useMemo(() => {
    if (isWinner) return <PrizeIcon color="gold" height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
    return <BlockIcon color={headerColor} height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
  }, [isWinner, headerColor])

  const headerText = useMemo(() => {
    if (isWinner < 2) return 'Win!'
    return 'Lose'
  }, [isWinner])

  const toggleOpen = () => setIsOpen(!isOpen)

  const getStyles = (horse: number) => {
    if (isLargerScreen) {
      if (playerCall === horse) {
        return selectedStyleLarge1
      }
      return unselectedStyleLarge1
    }
    if (playerCall === horse) {
      return selectedStyle1
    }
    return unselectedStyle1
  }

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
            {getCoinImage(playerCall)}
          </Flex>

          <Flex flexDirection="column">
            <Text color="secondary">{`Race Results: ${isWinner + 1}`}</Text>

            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              {results1.map((index) => {
                const horse = new BigNumber(results[index].toString()).toNumber()
                return <Image key={horse} src={`/images/games/${folder}/horses/${horse}.png`} width={30} height={30} />
              })}
            </Flex>

            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              {results2.map((index) => {
                const horse = new BigNumber(results[index].toString()).toNumber()
                return (
                  <Image
                    key={horse}
                    src={`/images/games/${folder}/horses/${horse}.png`}
                    width={30}
                    height={30}
                    style={getStyles(horse)}
                  />
                )
              })}
            </Flex>
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
