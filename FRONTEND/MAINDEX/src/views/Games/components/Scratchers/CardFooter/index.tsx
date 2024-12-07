import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Game } from 'state/types'
import useRefresh from 'hooks/useRefresh'
import { useTranslation } from 'contexts/Localization'
import { Flex, CardFooter, ExpandableLabel, ButtonMenuItem, ButtonMenu } from 'uikit'
import Loading from 'components/Loading'
import { getAddress } from 'utils/addressHelpers'
import ExpandedFooter from './ExpandedFooter'
import HistoryView from './HistoryView'
import { readContract } from '@wagmi/core'
import { scratchersAbi } from 'config/abi/scratchers'
import { config } from 'wagmiConfig'

const ExpandableButtonWrapper = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  button {
    padding: 0;
  }
`
interface History {
  time: bigint
  ticket: bigint
  player: `0x${string}`
  addToPot: bigint
  token: `0x${string}`
  amount: bigint
  ticketValue: bigint
}

interface CardActionsProps {
  game: Game
}

const Footer: React.FC<CardActionsProps> = ({ game }) => {
  const { GameId, payToken } = game
  const tokenAddress = getAddress(payToken.address, game.chainId)
  const { fastRefresh } = useRefresh()
  const totalToGrab = 1339200

  // block to get events up to.
  const [timeLine, setChangeTimeLine] = useState(604800) // 7 days
  const [eventsWith, setEventsWith] = useState([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [grabbedTime, setTime] = useState<number>(0)

  const [tIndex, setTIndex] = useState(1)
  const handleTimeLine = (newIndex: number) => {
    if (newIndex === 0) setChangeTimeLine(86400)
    if (newIndex === 1) setChangeTimeLine(604800)
    if (newIndex === 2) setChangeTimeLine(1339200)

    setTIndex(newIndex)
  }

  useEffect(() => {
    //const casinoContract = getScratcherContract(GameId, simpleRpcProvider)

    async function getEvents() {
      const NOW = Date.now() / 1000
      if (isLoading || NOW > grabbedTime + 30) {
        const getToo = Date.now() / 1000 - totalToGrab
        const data = await readContract(config, {
          abi: scratchersAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'viewScratcherHistory',
          args: [BigInt(getToo.toFixed(0))],
          chainId: game.chainId
        })
        const history = data as History[]
        const eventsWithRaw = history.filter(
          (i) =>
            i !== null &&
            (i.token === '0x0000000000000000000000000000000000000000' ||
              i.token.toLowerCase() === tokenAddress.toLowerCase()),
        )

        if (eventsWithRaw.length > 0) {
          setEventsWith(eventsWithRaw)
          setIsLoading(false)
          setTime(NOW)
        }
      }
    }
    getEvents()
  }, [GameId, eventsWith, isLoading, tokenAddress, fastRefresh, grabbedTime])

  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHistory, setIsHistory] = useState(false)

  return (
    <CardFooter>
      <ExpandableButtonWrapper>
        {!isHistory && (
          <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? t('Minimize Menu') : t('Details')}
          </ExpandableLabel>
        )}

        {!isExpanded && (
          <ExpandableLabel expanded={isHistory} onClick={() => setIsHistory(!isHistory)}>
            {isHistory ? t('Minimize Menu') : t('History')}
          </ExpandableLabel>
        )}
      </ExpandableButtonWrapper>
      {isExpanded && <ExpandedFooter game={game} />}
      {isHistory && (
        <>
          {isLoading && <Loading />}
          <HistoryView
            game={game}
            eventsWith={eventsWith.filter((event) => event.time > Date.now() / 1000 - timeLine)}
          />
          <Flex justifyContent="center" alignItems="center" mb="24px">
            <ButtonMenu activeIndex={tIndex} scale="sm" variant="subtle" onItemClick={handleTimeLine}>
              <ButtonMenuItem as="button">24 hr</ButtonMenuItem>
              <ButtonMenuItem as="button">1W</ButtonMenuItem>
              <ButtonMenuItem as="button">2W</ButtonMenuItem>
            </ButtonMenu>
          </Flex>
        </>
      )}
    </CardFooter>
  )
}

export default Footer
