import { Flex, Heading, Modal, Text, Button } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { useQuickLowRollerUserDataAsync } from 'state/games/hooks'
import { Token } from 'config/constants/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import DiceImage from 'components/DiceImage'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
import { ethers } from 'ethers'
import { useBlock } from 'state/block/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { useLowRoller } from 'views/Games/hooks/Games2Calls'
import { ActionContainer, ActionTitles, ActionContent } from './styles'
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
  player: string
  houseDice1: BigNumber
  houseDice2: BigNumber
  playerDice1: BigNumber
  playerDice2: BigNumber
  amount: BigNumber
  diceChoice: BigNumber
  isWinner: boolean
  isLoser: boolean
}

interface ResultModalProps {
  onDismiss?: () => void
  game: Game
}

const ResultLowRollerModal: React.FC<ResultModalProps> = ({ onDismiss, game }) => {
  const { address: account } = useAccount()
  const currentBlock = useBlock()
  const { theme } = useTheme()
  const { t } = useTranslation()

  const { onRollLR, onRollLRD } = useLowRoller(game)

  const [HouseDice1, setHouseDice1] = useState<BigNumber>()
  const [HouseDice2, setHouseDice2] = useState<BigNumber>()
  const [PlayerDice1, setPlayerDice1] = useState<BigNumber>()
  const [PlayerDice2, setPlayerDice2] = useState<BigNumber>()
  const [amountWonOrLost, setAmountWonOrLost] = useState(BIG_ZERO)
  const [DiceChoice, setDiceChoice] = useState<BigNumber>()
  const [didIWin, setDidIWin] = useState<boolean>()
  const [didILose, setDidIlose] = useState<boolean>()
  const [midGame, setMidGame] = useState<boolean>()

  useQuickLowRollerUserDataAsync(account)

  const [loading, setLoading] = useState(true)
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

    const unwatch = useWatchContractEvent({
      abi: game2Abi,
      address: getAddress(game.contractAddress),
      eventName: 'lowRollerGame',
      onLogs(logs) {
        logs.forEach((info) => {
            const { player, houseDice1, houseDice2, playerDice1, playerDice2, amount, diceChoice, isWinner, isLoser } =
              info.args
            if (player === account) {
              unwatch?.()
              setHouseDice1(new BigNumber(houseDice1.toString()))
              setHouseDice2(new BigNumber(houseDice2.toString()))
              setPlayerDice1(new BigNumber(playerDice1.toString()))
              setPlayerDice2(new BigNumber(playerDice2.toString()))
              setAmountWonOrLost(new BigNumber(amount.toString()))
              setDiceChoice(new BigNumber(diceChoice.toString()))
              setDidIWin(isWinner)
              setDidIlose(isLoser)

              setMidGame(isWinner === isLoser)

              setLoading(false)
            }
          
        })
      },
    })

  useEffect(() => {
    if (didIWin) delay(showConfetti, 100)
  }, [didIWin])

  const houseTotal = new BigNumber(HouseDice1).plus(HouseDice2)
  const playerTotal = new BigNumber(PlayerDice1).plus(PlayerDice2)

  const handleDismiss = () => {
    setDidIWin(false)
    setDidIlose(false)
    setAmountWonOrLost(BIG_ZERO)
    setLoading(true)
    onDismiss()
  }

  const onClickRoll = async () => {
    setLoading(true)
    setDidIWin(false)
    setDidIlose(false)
    setAmountWonOrLost(BIG_ZERO)
    await onRollLR()
  }

  const onClickRollD = async () => {
    setLoading(true)
    setDidIWin(false)
    setDidIlose(false)
    setAmountWonOrLost(BIG_ZERO)
    await onRollLRD()
  }

  const getColor = () => {
    let color = 'secondary'
    if (didIWin) {
      color = 'red'
    } else if (didILose) {
      color = 'warning'
    }
    return color
  }

  const getMsg = () => {
    let msg = 'Current Bet.'
    if (didIWin) {
      msg = 'You WON!'
      delay(showConfetti, 100)
    } else if (didILose) {
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
                  size={DiceChoice.toNumber()}
                  number={DiceChoice.toNumber()}
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
                      size={DiceChoice.toNumber()}
                      number={HouseDice1.toNumber()}
                      height={50}
                      width={50}
                      folder={folder}
                    />
                  </Heading>
                  <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                    <DiceImage
                      size={DiceChoice.toNumber()}
                      number={HouseDice2.toNumber()}
                      height={50}
                      width={50}
                      folder={folder}
                    />
                  </Heading>
                  <Text fontSize="16px">House Total: {houseTotal.toString()} </Text>
                </Flex>
                {PlayerDice1.toNumber() > 0 && (
                  <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                    <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                      Player
                    </Heading>

                    <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                      <DiceImage
                        size={DiceChoice.toNumber()}
                        number={PlayerDice1.toNumber()}
                        height={50}
                        width={50}
                        folder={folder}
                      />
                    </Heading>
                    <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                      <DiceImage
                        size={DiceChoice.toNumber()}
                        number={PlayerDice2.toNumber()}
                        height={50}
                        width={50}
                        folder={folder}
                      />
                    </Heading>
                    <Text fontSize="16px">player Total: {playerTotal.toString()} </Text>
                  </Flex>
                )}
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

            {midGame && (
              <ActionContainer>
                <ActionTitles>
                  <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
                    {t('Make Next Guess')}
                  </Text>
                </ActionTitles>
                <ActionContent>
                  <Button width="100%" variant="secondary" onClick={onClickRoll} style={{ marginRight: '15px' }}>
                    {t('! Roll !')}
                  </Button>
                  <Button width="100%" variant="secondary" onClick={onClickRollD}>
                    {t('! Double Down !')}
                  </Button>
                </ActionContent>
              </ActionContainer>
            )}
          </Flex>
          <Flex alignItems="flex-end" justifyContent="space-around">
            <Button onClick={handleDismiss}>Close</Button>
          </Flex>
        </>
      )}
    </Modal>
  )
}

export default ResultLowRollerModal
