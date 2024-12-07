import React, { useEffect, useState } from 'react'
import { Text, Flex, Box, ButtonMenu, ButtonMenuItem } from 'uikit'
import Loading from 'components/Loading'
import BigNumber from 'bignumber.js'
import { Game } from 'state/types'
import { getTokenPrice } from 'state/pools'
import styled from 'styled-components'
import Balance from 'components/Balance'
import { BIG_ZERO } from 'utils/bigNumber'
import contracts from 'config/constants/contracts'
import { getAddress } from 'utils/addressHelpers'
import { usePriceBnbBusd } from 'state/farms/hooks'
import HistoryDetails, { History } from './HistoryDetails'
import { useAccount } from 'wagmi'

interface HistoryViewProps {
  game: Game
  eventsWith: History[]
}

const ExpandedWrapper = styled(Flex)`
  svg {
    height: 14px;
    width: 14px;
  }
`

const HistoryView: React.FC<HistoryViewProps> = ({ game, eventsWith }) => {
  const { address: account } = useAccount()
  const { payToken, dex } = game

  const [events, setEvents] = useState([])

  const showSub = account === getAddress(contracts.farmWallet, game.chainId)

  const [wAmount, setWAmount] = useState<BigNumber>(BIG_ZERO)
  const [lAmount, setLAmount] = useState<BigNumber>(BIG_ZERO)
  const [wTAmount, setWTAmount] = useState<BigNumber>(BIG_ZERO)
  const [fpAmount, setFPAmount] = useState<BigNumber>(BIG_ZERO)
  const [nftAmount, setNFTAmount] = useState<BigNumber>(BIG_ZERO)
  const [tokenPrice, setPrice] = useState(0)

  const [wins, setWins] = useState<number>(0)
  const [losses, setLosses] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const [personal, setPersonal] = useState(0)
  const handleClick = (newIndex: number) => {
    setPersonal(newIndex)
    setIsLoading(true)
  }

  const bnbPrice = usePriceBnbBusd(game.dex)

  // Get the events
  useEffect(() => {
    const e = []

    if (!account) setPersonal(0)

    async function fetch() {
      const tp = await getTokenPrice(dex, payToken)
      setPrice(tp)

      if (eventsWith) {
        let w = 0
        let l = 0
        let wA = BIG_ZERO
        let lA = BIG_ZERO
        let wTA = BIG_ZERO
        let fpa = BIG_ZERO
        let nfta = BIG_ZERO

        for (let i = eventsWith.length - 1; i >= 0; i--) {
          if (personal === 1 && account) {
            if (eventsWith[i].player === account) {
              e.push(eventsWith[i])
              const amountBig = new BigNumber(eventsWith[i].amount.toString())
              const addToPot = new BigNumber(eventsWith[i].addToPot.toString())
              const ticketValue = new BigNumber(eventsWith[i].ticketValue.toString())
              if (ticketValue.eq(3)) fpa = fpa.plus(1)
              if (ticketValue.eq(5)) nfta = nfta.plus(1)

              if (ticketValue.gt(0)) {
                w += 1
                if (eventsWith[i].token === '0x0000000000000000000000000000000000000000') {
                  wA = amountBig.plus(wA)
                  lA = addToPot.plus(lA)
                } else {
                  wTA = amountBig.plus(wTA)
                  lA = addToPot.plus(lA)
                }
              } else {
                l += 1
                lA = addToPot.plus(lA)
              }
            }
          } else {
            e.push(eventsWith[i])
            const amountBig = new BigNumber(eventsWith[i].amount.toString())
            const addToPot = new BigNumber(eventsWith[i].addToPot.toString())
            const ticketValue = new BigNumber(eventsWith[i].ticketValue.toString())
            if (ticketValue.eq(3)) fpa = fpa.plus(1)
            if (ticketValue.eq(5)) nfta = nfta.plus(1)
            if (ticketValue.gt(0)) {
              w += 1
              if (eventsWith[i].token === '0x0000000000000000000000000000000000000000') {
                wA = amountBig.plus(wA)
                lA = addToPot.plus(lA)
              } else {
                wTA = amountBig.plus(wTA)
                lA = addToPot.plus(lA)
              }
            } else {
              l += 1
              lA = addToPot.plus(lA)
            }
          }
        }
        setWAmount(wA)
        setLAmount(lA)
        setWTAmount(wTA)
        setWins(w)
        setLosses(l)
        setFPAmount(fpa)
        setNFTAmount(nfta)
      }
      setIsLoading(false)
      setEvents(e)
    }
    fetch()
  }, [eventsWith, dex, payToken, personal, account])

  const getKeyProp = (index) => {
    return index
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
        {isLoading && <Loading />}
        <Text color="green">{`${((wins / (losses + wins)) * 100).toFixed(0)} % Win Ratio`} </Text>

        <Flex flexDirection="row" justifyContent="space-between">
          <Text color="green">{`${fpAmount.toString()} FreePlays`} </Text>
          <Text color="green">{`${nftAmount.toString()} NFTs Won`} </Text>
        </Flex>

        {showSub && (
          <Flex flexDirection="row" justifyContent="space-between">
            <Flex flexDirection="column">
              <Balance
                prefix={wAmount.gte(lAmount) ? '+ ' : '- '}
                value={getPNL().shiftedBy(-18).toNumber()}
                decimals={2}
                color={wAmount.gte(lAmount) ? 'green' : 'red'}
                unit={` BONE`}
              />
              <Balance
                prefix={wAmount.gte(lAmount) ? '+ $ ' : '- $ '}
                value={getPNL().multipliedBy(bnbPrice.toString()).shiftedBy(-18).toNumber()}
                decimals={2}
                color={wAmount.gte(lAmount) ? 'green' : 'red'}
                unit=" USD"
              />
            </Flex>
            <Flex flexDirection="column">
              <Balance
                prefix="+"
                value={wTAmount.shiftedBy(-payToken.decimals).toNumber()}
                decimals={2}
                color="green"
                unit={` ${payToken.symbol}`}
              />
              <Balance
                prefix="+ $ "
                value={wTAmount.multipliedBy(tokenPrice).shiftedBy(-payToken.decimals).toNumber()}
                decimals={2}
                color="green"
                unit=" USD"
              />
            </Flex>
          </Flex>
        )}

        <Box maxHeight="300px" overflow="scroll">
          {events.length > 0 ? (
            events.map((round, index) => {
              return <HistoryDetails key={getKeyProp(index)} game={game} round={round} />
            })
          ) : (
            <>
              <Text>No History</Text>
              <Loading />
            </>
          )}
        </Box>
      </ExpandedWrapper>
    </>
  )
}

export default HistoryView
