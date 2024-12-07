import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Game } from 'state/types'
import { useBlock } from 'state/block/hooks'
import { useTranslation } from 'contexts/Localization'
import { Flex, CardFooter, ExpandableLabel, ButtonMenuItem, ButtonMenu } from 'uikit'
import { BigNumber } from 'bignumber.js'
import useRefresh from 'hooks/useRefresh'
import ExpandedFooter from './ExpandedFooter'
import HistoryView from './HistoryView'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { coinflipAbi } from 'config/abi/coinFlip'
import { getAddress } from 'utils/addressHelpers'
import { BLOCK_TIMES } from 'config'

const ExpandableButtonWrapper = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  button {
    padding: 0;
  }
`
interface CardActionsProps {
  game: Game
}

const Footer: React.FC<CardActionsProps> = ({ game }) => {
  const chainId = game.chainId

  const publicClient = usePublicClient({chainId})
  const { address: account } = useAccount()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  // block to get events up to.
  const [eventsWith, setEventsWith] = useState([])
  const { slowRefresh } = useRefresh()

  const [NOW, setNOW] = useState(undefined)
  useEffect(() => {
    async function getTime() {
      const NOWraw = await Date.now()
      setNOW(NOWraw)
    }
    getTime()
  }, [slowRefresh])

  const [timeToGrab] = useState([86400, 604800, 2678400])
  const [BlocksToGrab, setBlocksToGrab] = useState([0, 0, 0])
  const { currentBlock } = useBlock()

  const [grabbedBlock, setTime] = useState<number>(0)

  useEffect(() => {
    async function getBlocks() {
      const data = BlocksToGrab
      if (NOW > grabbedBlock + 3600000) {
        timeToGrab.forEach(async (timeInSeconds, index) => {
          const goBackToBlock = Number(currentBlock) - (timeInSeconds / BLOCK_TIMES[chainId])
          data[index] = goBackToBlock
        })
      }
      setBlocksToGrab(data)
    }
    getBlocks()
  }, [NOW, timeToGrab, grabbedBlock, BlocksToGrab])

  const [tIndex, setTIndex] = useState(1)
  const handleTimeLine = (newIndex: number) => {
    setTIndex(newIndex)
  }

  useEffect(() => {
    async function getEvents() {
      if (BlocksToGrab[BlocksToGrab.length - 1] > 0) {
        const allBlockGroups = []

        if (NOW > grabbedBlock + 3600000 || isLoading) {
          const startBlock = BlocksToGrab[BlocksToGrab.length - 1]
          const endBlock = Number(currentBlock)

          for (let i = startBlock; i < endBlock; i += 1000000) {
            const _startBlock = i
            const _endBlock = Math.min(endBlock, i + 999999)
            const blockGroup = [_startBlock, _endBlock]

            allBlockGroups.push(blockGroup)
          }

          const data1 = await Promise.all(
            allBlockGroups.map(async (g) => {
              const t = await publicClient.getContractEvents({
                abi: coinflipAbi,
                address: getAddress(game.contractAddress, game.chainId),
                eventName: 'diceCallResults',
                fromBlock: BigInt(g[0].toFixed(0)),
                toBlock: BigInt(g[1].toFixed(0)),
              })
              return t
            }),
          )
          const da1 = []
          data1.forEach((info) => {
            info.forEach((e) => {
              if (e.args !== null) {
                da1.push(e.args)
              }
            })
          })
          const da = da1.flat().filter((i) => i !== null)
          setEventsWith(da)

          if (da.length > 3) {
            setTime(NOW)
            setIsLoading(false)
          }
        }
      }
    }
    getEvents()
  }, [account, publicClient, currentBlock, grabbedBlock, isLoading, NOW, BlocksToGrab])
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
          <HistoryView
            game={game}
            eventsWith={eventsWith}
          />
          <Flex justifyContent="center" alignItems="center" mb="24px">
            <ButtonMenu activeIndex={tIndex} scale="sm" variant="subtle" onItemClick={handleTimeLine}>
              <ButtonMenuItem as="button">24 hr</ButtonMenuItem>
              <ButtonMenuItem as="button">1W</ButtonMenuItem>
              <ButtonMenuItem as="button">1M</ButtonMenuItem>
            </ButtonMenu>
          </Flex>
        </>
      )}
    </CardFooter>
  )
}

export default Footer
