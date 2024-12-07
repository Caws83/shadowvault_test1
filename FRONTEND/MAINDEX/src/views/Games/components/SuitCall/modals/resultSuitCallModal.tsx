import { Flex, Heading, Modal, Text, Button } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { Token } from 'config/constants/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import DeckCard from 'components/DeckCard'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useBlock } from 'state/block/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
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

export interface Receipt {
  address: string
  houseCard: BigNumber
  houseSuit: BigNumber
  suitChoice: BigNumber
  isWinner: boolean
  amount: BigNumber
}

interface ResultModalProps {
  onDismiss?: () => void
  game: Game
}

const ResultSuitCallModal: React.FC<ResultModalProps> = ({ onDismiss, game }) => {
  const { address: account } = useAccount()
  const currentBlock = useBlock()

  const { theme } = useTheme()

  const [amountWonOrLost, setAmountWonOrLost] = useState(BIG_ZERO)
  const [didIWin, setDidIWin] = useState<boolean>(false)
  const [houseSuitInfo, setHouseSuit] = useState<BigNumber>()
  const [houseCardInfo, setHouseCard] = useState<BigNumber>()
  const [choiceSuitInfo, setChoiceSuit] = useState<BigNumber>()

  const [loading, setLoading] = useState(true)
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

    const unwatch = useWatchContractEvent({
      abi: game2Abi,
      address: getAddress(game.contractAddress),
      eventName: 'suitCallResults',
      onLogs(logs) {
        logs.forEach((info) => {
            const { player, houseCard, houseSuit, suitChoice, isWinner, amount } = info.args
            if (player === account) {
              unwatch?.()
              setDidIWin(isWinner)
              setAmountWonOrLost(new BigNumber(amount.toString()))
              setHouseCard(new BigNumber(houseCard.toString()))
              setHouseSuit(new BigNumber(houseSuit.toString()))
              setChoiceSuit(new BigNumber(suitChoice.toString()))
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

  const getColor = () => {
    let color = 'secondary'
    if (!didIWin) {
      color = 'red'
    }
    return color
  }

  const getMsg = () => {
    let msg = 'unknown'
    if (didIWin) {
      msg = 'You WIN!'
      delay(showConfetti, 100)
    } else if (!didIWin) {
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
          <img src={`/images/games/${folder}/deckcut/cardflip.gif`} alt="flipping card" />
        </Flex>
      ) : (
        <>
          <PageHeader>
            <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
              <Flex flex="1" justifyContent="center" flexDirection="row">
                <Flex flex="1" justifyContent="center" flexDirection="column" mr={['8px', 0]}>
                  <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                    <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                      Guess
                    </Heading>
                    <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                      <DeckCard suit={choiceSuitInfo.toNumber()} card={0} height={50} width={75} folder={game.folder} />
                    </Heading>
                    <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                      Drawn Card
                    </Heading>
                    <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                      <DeckCard
                        suit={houseSuitInfo.toNumber()}
                        card={houseCardInfo.toNumber()}
                        height={50}
                        width={75}
                        folder={game.folder}
                      />
                    </Heading>
                  </Flex>
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

export default ResultSuitCallModal
