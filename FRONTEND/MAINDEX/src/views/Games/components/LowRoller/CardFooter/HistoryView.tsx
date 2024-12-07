import React, { useEffect, useState } from 'react'
import { Text, Flex, Box, ButtonMenu, ButtonMenuItem } from 'uikit'
import Loading from 'components/Loading'
import BigNumber from 'bignumber.js'
import { Game } from 'state/types'
import styled from 'styled-components'
import Balance from 'components/Balance'
import { BIG_ZERO } from 'utils/bigNumber'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
import HistoryDetails from './HistoryDetails'
import { useAccount } from 'wagmi'

interface HistoryViewProps {
  game: Game
  eventsWith: any[]
}

const ExpandedWrapper = styled(Flex)`
  svg {
    height: 14px;
    width: 14px;
  }
`

const HistoryView: React.FC<HistoryViewProps> = ({ game, eventsWith }) => {
  const { address: account } = useAccount()

  const { payToken } = game

  const [events, setEvents] = useState([])
  const [wAmount, setWAmount] = useState<BigNumber>(BIG_ZERO)
  const [lAmount, setLAmount] = useState<BigNumber>(BIG_ZERO)
  const [wins, setWins] = useState<number>(0)
  const [losses, setLosses] = useState<number>(0)

  const TokenPriceRaw = useGetTokenPrice(game.dex, game.payToken)

  const [personal, setPersonal] = useState(0)
  const handleClick = (newIndex: number) => {
    setPersonal(newIndex)
  }

  // Get the events
  useEffect(() => {
    const e = []

    if (!account) setPersonal(0)

    async function fetch() {
      if (eventsWith) {
        let w = 0
        let l = 0
        let wA = BIG_ZERO
        let lA = BIG_ZERO

        for (let i = eventsWith.length - 1; i >= 0; i--) {
          if (personal === 1 && account) {
            if (eventsWith[i].args[0] === account) {
              if (eventsWith[i].args[7]) {
                e.push(eventsWith[i].args)
                w += 1
                wA = new BigNumber(eventsWith[i].args[5].toString()).plus(wA)
              } else if (eventsWith[i].args[8]) {
                e.push(eventsWith[i].args)
                l += 1
                lA = new BigNumber(eventsWith[i].args[5].toString()).plus(lA)
              }
            }
          } else if (eventsWith[i].args[7]) {
            e.push(eventsWith[i].args)
            w += 1
            wA = new BigNumber(eventsWith[i].args[5].toString()).plus(wA)
          } else if (eventsWith[i].args[8]) {
            e.push(eventsWith[i].args)
            l += 1
            lA = new BigNumber(eventsWith[i].args[5].toString()).plus(lA)
          }
        }
        setWAmount(wA)
        setLAmount(lA)
        setWins(w)
        setLosses(l)
      }

      setEvents(e)
    }
    fetch()
  }, [account, personal, eventsWith])

  const getKeyProp = (index, num) => {
    return index * num
  }

  const getPNL = () => {
    if (wAmount.gte(lAmount)) return wAmount.minus(lAmount)
    return lAmount.minus(wAmount)
  }

  return (
    <>
      <ExpandedWrapper flexDirection="column">
        <Text textAlign="center" color="textSubtle">
          Game History
        </Text>
        {account && (
          <Flex justifyContent="center" alignItems="center" mb="24px">
            <ButtonMenu activeIndex={personal} scale="sm" variant="subtle" onItemClick={handleClick}>
              <ButtonMenuItem as="button">All</ButtonMenuItem>
              <ButtonMenuItem as="button">Personal</ButtonMenuItem>
            </ButtonMenu>
          </Flex>
        )}

        <Flex flexDirection="row" justifyContent="space-between">
          <Text color={wins > losses ? 'green' : 'red'}>
            {`${((wins / (losses + wins)) * 100).toFixed(0)} % Win Ratio`}{' '}
          </Text>
          <Flex flexDirection="column">
            <Balance
              prefix={wAmount.gte(lAmount) ? '+ ' : '- '}
              value={getPNL().shiftedBy(-payToken.decimals).toNumber()}
              decimals={2}
              color={wAmount.gte(lAmount) ? 'green' : 'red'}
              unit={` ${payToken.symbol}`}
            />
            <Balance
              prefix={wAmount.gte(lAmount) ? '+ $ ' : '- $ '}
              value={getPNL().multipliedBy(TokenPriceRaw.toString()).shiftedBy(-payToken.decimals).toNumber()}
              decimals={2}
              color={wAmount.gte(lAmount) ? 'green' : 'red'}
              unit=" USD"
            />
          </Flex>
        </Flex>

        <Box maxHeight="300px" overflow="scroll">
          {events.length > 0 ? (
            events.map((round, index) => {
              return <HistoryDetails key={getKeyProp(index, game.GameId)} game={game} round={round} />
            })
          ) : (
            <Loading />
          )}
        </Box>
      </ExpandedWrapper>
    </>
  )
}

export default HistoryView
