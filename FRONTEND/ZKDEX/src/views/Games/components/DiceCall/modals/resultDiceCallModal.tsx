import { Flex, Heading, Modal, Text, Button } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { Token } from 'config/constants/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import DiceImage from 'components/DiceImage'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { useBlock } from 'state/block/hooks'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { coinflipAbi } from 'config/abi/coinFlip'
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

interface ResultModalProps {
  onDismiss?: () => void
  game: Game
}

const ResultDiceCallModal: React.FC<ResultModalProps> = ({ onDismiss, game }) => {
  const { theme } = useTheme()
  const { address: account } = useAccount()
  const currentBlock = useBlock()

  const [amountWonOrLost, setAmountWonOrLost] = useState(BIG_ZERO)
  const [didIWin, setDidIWin] = useState<boolean>()
  const [HouseRoll, setHouseRoll] = useState<BigNumber>()
  const [PlayerChoice, setPlayerChoice] = useState<BigNumber>()
  const [DiceSize, setDiceSize] = useState<BigNumber>()

  const [loading, setLoading] = useState(true)
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

    const unwatch = useWatchContractEvent({
      abi: coinflipAbi,
      address: getAddress(game.contractAddress, game.chainId),
      eventName: 'diceCallResults',
      onLogs(logs) {
        logs.forEach((info) => {
            const { player, isWinner, amount, playerChoice, houseRoll, diceSize } = info.args
            if (player === account) {
              unwatch?.()
              setDidIWin(isWinner)
              setAmountWonOrLost(new BigNumber(amount.toString()))
              setPlayerChoice(new BigNumber(playerChoice.toString()))
              setHouseRoll(new BigNumber(houseRoll.toString()))
              setDiceSize(new BigNumber(diceSize.toString()))
              setLoading(false)
            }
          
        })
      },
    })

  useEffect(() => {
    if (didIWin) delay(showConfetti, 100)
  }, [didIWin])

  const handleDismiss = () => {
    setDidIWin(false)
    setAmountWonOrLost(BIG_ZERO)
    setLoading(true)
    onDismiss()
  }

  const getColor = () => {
    let color = 'secondary'
    if (didIWin) {
      color = 'red'
    } else if (!didIWin) {
      color = 'warning'
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
          <img src={`/images/games/${folder}/dice/diceroll.gif`} alt="flipping card" />
        </Flex>
      ) : (
        <>
          <PageHeader>
            <Flex flex="1" justifyContent="center" flexDirection="column" mr={['8px', 0]}>
              <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                Dice Size
              </Heading>
              <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                <DiceImage
                  size={DiceSize.toNumber()}
                  number={DiceSize.toNumber()}
                  height={50}
                  width={50}
                  folder={folder}
                />
              </Heading>
            </Flex>
            <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
              <Flex flex="1" justifyContent="center" flexDirection="row">
                <Flex flex="1" justifyContent="center" flexDirection="column" mr={['8px', 0]}>
                  <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                    House
                  </Heading>
                  <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                    <DiceImage
                      size={DiceSize.toNumber()}
                      number={HouseRoll.toNumber()}
                      height={50}
                      width={50}
                      folder={folder}
                    />
                  </Heading>
                </Flex>
                <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                  <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                    Player
                  </Heading>
                  <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                    <DiceImage
                      size={DiceSize.toNumber()}
                      number={PlayerChoice.toNumber()}
                      height={50}
                      width={50}
                      folder={folder}
                    />
                  </Heading>
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

export default ResultDiceCallModal
