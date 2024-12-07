import { Flex, Heading, Modal, Text, Button } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { useBlock } from 'state/block/hooks'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { scratchersAbi } from 'config/abi/scratchers'
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

interface ResultjackPotModalProps {
  onDismiss?: () => void
  game: Game
}

const ResultjackPotModal: React.FC<ResultjackPotModalProps> = ({ onDismiss, game }) => {
  const { address: account } = useAccount()
  const { theme } = useTheme()

  const [amountWonOrLost, setAmountWonOrLost] = useState(BIG_ZERO)
  const [didIWin, setDidIWin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [folder] = useState<string>(game.folder)
  const currentBlock = useBlock()


    const unwatch = useWatchContractEvent({
      abi: scratchersAbi,
      address: getAddress(game.contractAddress, game.chainId),
      eventName: 'JackPotPurchase',
      onLogs(logs) {
        logs.forEach((info) => {
          
            const { ticketNumber, player, addToPot, isWinner, _amount } = info.args
            if (player === account) {
              unwatch?.()
              setDidIWin(isWinner)
              setAmountWonOrLost(new BigNumber(_amount.toString()))
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

  const getMsg = () => {
    const msg = didIWin ? 'You WON!' : 'You Lost!'
    if (didIWin) delay(showConfetti, 100)
    return msg
  }

  const getCoinImage = (value: boolean) => {
    if (!value) {
      const randomNum = Math.floor(Math.random() * 3 + 1)
      return (
        <img
          src={`/images/games/${folder}/scratchers/0j-${randomNum.toString()}.gif`}
          alt="Try Again"
          height="250px"
          width="250px"
        />
      )
    }
    return <img src={`/images/games/${folder}/scratchers/jackpot.gif`} alt="WIN" height="250px" width="250px" />
  }

  const getResult = () => {
    return getCoinImage(didIWin)
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
          <img src={`/images/games/${folder}/scratchers/scratchJackpot.gif`} alt="scratching" />
        </Flex>
      ) : (
        <>
          <PageHeader>
            <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
              <Flex flex="1" justifyContent="center" flexDirection="row">
                <Flex flex="1" justifyContent="center" flexDirection="column" mr={['8px', 0]}>
                  <Heading as="h1" scale="xl" color="secondary" mb="24px" textAlign="center">
                    Result
                  </Heading>
                  <Heading as="h1" scale="xl" color="secondary" mb="24px" textAlign="center">
                    {getResult()}
                  </Heading>
                </Flex>
              </Flex>
            </Flex>
          </PageHeader>

          <Flex flexDirection="column">
            <Text mb="4px" textAlign={['center', null, 'left']}>
              {getMsg()}
            </Text>
            {didIWin && (
              <Flex
                alignItems={['flex-start', null, 'center']}
                justifyContent={['flex-start', null, 'space-between']}
                flexDirection={['column', null, 'row']}
              >
                <Balance
                  textAlign={['center', null, 'left']}
                  lineHeight="1.1"
                  value={amountWonOrLost.shiftedBy(-18).toNumber()}
                  decimals={2}
                  fontSize="44px"
                  bold
                  color="secondary"
                  unit=" BONE"
                />
              </Flex>
            )}
          </Flex>
          <Button onClick={handleDismiss}>Close</Button>
        </>
      )}
    </Modal>
  )
}

export default ResultjackPotModal
