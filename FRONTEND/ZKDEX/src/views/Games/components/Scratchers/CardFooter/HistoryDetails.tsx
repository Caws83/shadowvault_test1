import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Game } from 'state/types'
import { Flex, Text, Heading, PrizeIcon, BlockIcon, IconButton, ChevronUpIcon, ChevronDownIcon } from 'uikit'
import Balance from 'components/Balance'
import BigNumber from 'bignumber.js'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
import { getAddress } from 'utils/addressHelpers'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { ActionContainer } from '../../BlackJack/modals/styles'

export interface History {
  time: bigint
  ticket: bigint
  player: string
  addToPot: bigint
  token: string
  amount: bigint
  ticketValue: bigint
}

interface BetDetailsProps {
  game: Game
  round: History
}

const StyledBetDetails = styled.div`
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 8px;
`

const StyledBet = styled(Flex)`
  justifyContent: space-between;
  alignItems: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`

const BetDetails: React.FC<BetDetailsProps> = ({ game, round }) => {
  const { folder, payToken } = game

  const [isWinner] = useState<boolean>(new BigNumber(round.ticketValue.toString()).gt(0))

  const cost = new BigNumber(round.addToPot.toString()).multipliedBy(110).dividedBy(100)

  const [amount] = useState<BigNumber>(isWinner ? new BigNumber(round.amount.toString()) : cost)
  const [result] = useState<BigNumber>(new BigNumber(round.ticketValue.toString()))
  const [isToken] = useState<boolean>(round.token.toLowerCase() === getAddress(payToken.address, game.chainId).toLowerCase())
  const [loserNumber] = useState<number>(Math.floor(Math.random() * 3 + 1))

  const cicPrice = usePriceBnbBusd(game.dex)

  const TokenPriceRaw = useGetTokenPrice(game.dex, game.payToken)
  const [isOpen, setIsOpen] = useState(false)

  const headerColor = useMemo(() => {
    if (result.eq(3) || result.eq(5)) return 'blue'
    if (isWinner) return 'green'
    return 'red'
  }, [isWinner, result])

  const getCoinImage = (value: BigNumber) => {
    if (value.eq(0)) {
      return (
        <img
          src={`/images/games/${folder}/scratchers/0-${loserNumber.toString()}.gif`}
          alt="Try Again"
          height="250px"
          width="250px"
        />
      )
    }
    return (
      <img
        src={`/images/games/${folder}/scratchers/${value.toNumber().toString()}x.gif`}
        alt="Result"
        height="250px"
        width="250px"
      />
    )
  }

  const headerIcon = useMemo(() => {
    if (isWinner) return <PrizeIcon color="gold" height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
    return <BlockIcon color={headerColor} height="20px" width="20px" style={{ height: '20px', width: '20px' }} />
  }, [isWinner, headerColor])

  const headerText = useMemo(() => {
    const msg = isWinner ? 'WIN!!' : 'LOSE'
    return msg
  }, [isWinner])

  const winningsText = useMemo(() => {
    if (result.eq(3)) return 'Free Play'
    if (result.eq(5)) return 'Free Play'
    // if (result.eq(5)) return 'Free NFT'

    const msg = (
      <Balance
        value={amount.shiftedBy(isToken ? -payToken.decimals : -18).toNumber()}
        decimals={4}
        color={headerColor}
        unit={` ${isToken ? payToken.symbol : 'BONE'}`}
      />
    )

    return msg
  }, [result, amount, payToken, headerColor, isToken])

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <>
      <StyledBet onClick={toggleOpen} role="button" justifyContent="space-between">
        <Heading as="h3" color={headerColor} textTransform="uppercase" bold mr="4px">
          {headerText}
        </Heading>
        {headerIcon}
        <Heading as="h3" color={headerColor} bold mr="4px">
          {winningsText}
        </Heading>

        <IconButton variant="text" scale="sm">
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </IconButton>
      </StyledBet>
      {isOpen && (
        <StyledBetDetails>
          <Flex alignItems="center" justifyContent="space-between" mb="8px">
            <Heading color="primary">{`Ticket: ${round.ticket.toString()}`}</Heading>
            <Flex alignItems="center">
              <Heading as="h3" color={headerColor} textTransform="uppercase" bold mr="8px">
                {headerText}
              </Heading>
              {headerIcon}
            </Flex>
          </Flex>

          <Flex alignItems="center" justifyContent="space-between" mb="16px">
            {getCoinImage(result)}
          </Flex>

          <ActionContainer>
            <Flex alignItems="center" justifyContent="space-between" mb="16px">
              <Text color="secondary">Winnings: :</Text>
              <Flex flexDirection="column">
                {result.eq(3) || result.eq(5) ? (
                  <Heading as="h3" color={headerColor} textTransform="uppercase" bold mr="4px">
                    {winningsText}
                  </Heading>
                ) : (
                  <>
                    <Balance
                      value={amount.shiftedBy(isToken ? -payToken.decimals : -18).toNumber()}
                      decimals={4}
                      color={headerColor}
                      unit={` ${isToken ? payToken.symbol : 'BONE'}`}
                    />
                    <Balance
                      prefix={isWinner ? '+ $ ' : '- $ '}
                      value={amount
                        .multipliedBy(isToken ? TokenPriceRaw.toString() : cicPrice.toString())
                        .shiftedBy(isToken ? -payToken.decimals : -18)
                        .toNumber()}
                      decimals={2}
                      color={headerColor}
                      unit=" USD"
                    />
                  </>
                )}
              </Flex>
            </Flex>
          </ActionContainer>
        </StyledBetDetails>
      )}
    </>
  )
}

export default BetDetails
