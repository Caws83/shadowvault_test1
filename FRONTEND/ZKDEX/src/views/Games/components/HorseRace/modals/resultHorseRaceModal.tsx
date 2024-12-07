import { Flex, Modal, Text, Button, Image, useMatchBreakpoints } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useBlock } from 'state/block/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { Token } from 'config/constants/types'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { game2Abi } from 'config/abi/game2'
import { getAddress } from 'utils/addressHelpers'

const showConfetti = () => {
  confetti({
    resize: true,
    particleCount: 200,
    startVelocity: 30,
    gravity: 0.5,
    spread: 350,
    origin: {
      x: 0.5,
      y: 0.3,
    },
  })
}

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

export interface Receipt {
  address: string
  results: number[]
  selection: BigNumber
  isWinner: number
  amount: BigNumber
}

interface ResultModalProps {
  onDismiss?: () => void
  game: Game
}

const ResultHorseRaceModal: React.FC<ResultModalProps> = ({ onDismiss, game }) => {
  const { address: account } = useAccount()
  const currentBlock = useBlock()

  const { theme } = useTheme()

  const [raceResults, setResults] = useState<number[]>()
  const [playerSelection, setSelection] = useState<number>()
  const [didIWin, setDidIWin] = useState<number>()
  const [amountWonOrLost, setAmountWonOrLost] = useState(BIG_ZERO)

  const [loading, setLoading] = useState(true)
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

    const unwatch = useWatchContractEvent({
      abi: game2Abi,
      address: getAddress(game.contractAddress),
      eventName: 'horseRaceResults',
      onLogs(logs) {
        logs.forEach((info) => {
            const { player, results, selection, isWinner, amount } = info.args
            if (player === account) {
              unwatch?.()
              setDidIWin(Number(isWinner))
              setAmountWonOrLost(new BigNumber(amount.toString()))
              setResults(results.map((r) => Number(r)))
              setSelection(Number(selection))
              setLoading(false)
            }
          
        })
      },
    })

  useEffect(() => {
    if (didIWin) delay(showConfetti, 100)
  }, [didIWin])

  const handleDismiss = () => {
    setDidIWin(undefined)
    setAmountWonOrLost(BIG_ZERO)
    setLoading(true)
    onDismiss()
  }

  const results1 = [0, 1, 2]
  const results2 = [3, 4, 5, 6, 7]

  const { isLg, isXl, isXxl } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl

  const getStyles = (horse: number) => {
    if (isLargerScreen) {
      if (playerSelection === horse) {
        return selectedStyleLarge1
      }
      return unselectedStyleLarge1
    }
    if (playerSelection === horse) {
      return selectedStyle1
    }
    return unselectedStyle1
  }

  const getColor = () => {
    let color = 'secondary'
    if (didIWin > 2) {
      color = 'red'
    }
    return color
  }

  const getMsg = () => {
    let msg = 'You Tied'
    if (didIWin < 2) {
      msg = 'You WIN!'
      delay(showConfetti, 100)
    } else if (didIWin > 2) {
      msg = 'You Lost!'
    }
    return msg
  }

  return (
    <Modal
      minWidth="346px"
      title="Results"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
      overflow="none"
    >
      {loading ? (
        <Flex dir="row" justifyContent="space-evenly">
          <img src={`/images/games/${folder}/horses/horserace.gif`} alt="race is on" />
        </Flex>
      ) : (
        <>
          <PageHeader>
            <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
              <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                <Text color="textSubtle">Your Guess</Text>
                <Flex alignItems="center" justifyContent="center">
                  <Image src={`/images/games/${folder}/horses/${playerSelection}.png`} width={80} height={80} />
                </Flex>

                <Text color="textSubtle">Race Results</Text>
                <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  {results1.map((index) => {
                    const horse = raceResults[index]
                    return (
                      <Image
                        key={horse}
                        src={`/images/games//${folder}/horses/${horse}.png`}
                        width={80}
                        height={80}
                        style={getStyles(horse)}
                      />
                    )
                  })}
                </Flex>
                <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  {results2.map((index) => {
                    const horse = raceResults[index]
                    return (
                      <Image
                        key={horse}
                        src={`/images/games/${folder}/horses/${horse}.png`}
                        width={80}
                        height={80}
                        style={getStyles(horse)}
                      />
                    )
                  })}
                </Flex>
              </Flex>
            </Flex>
          </PageHeader>

          <Flex flexDirection="column">
            <Text mb="4px" textAlign={['center', null, 'left']}>
              {getMsg()}
            </Text>
            <Flex
              alignItems={['flex-start', null, 'center']}
              justifyContent={['flex-start', null, 'space-between']}
              flexDirection={['column', null, 'row']}
            >
              <Balance
                textAlign={['center', null, 'left']}
                lineHeight="1.1"
                value={amountWonOrLost.shiftedBy(-payToken.decimals).toNumber()}
                decimals={2}
                fontSize="44px"
                bold
                color={getColor()}
                unit={` ${payToken.symbol}!`}
              />
            </Flex>
          </Flex>
          <Button onClick={handleDismiss}>Close</Button>
        </>
      )}
    </Modal>
  )
}

export default ResultHorseRaceModal
