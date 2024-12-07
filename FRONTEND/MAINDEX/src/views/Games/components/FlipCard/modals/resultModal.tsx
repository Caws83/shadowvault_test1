import { Flex, Heading, Modal, Text, Button } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { Token } from 'config/constants/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
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
  isHeads: boolean
  game: Game
}

const ResultModal: React.FC<ResultModalProps> = ({ onDismiss, isHeads, game }) => {
  const { address: account } = useAccount()
  const currentBlock = useBlock()

  const { theme } = useTheme()
  const [amountWonOrLost, setAmountWonOrLost] = useState(BIG_ZERO)
  const [didIWin, setDidIWin] = useState<boolean>()
  const [results, setResults] = useState<boolean>()
  const [loading, setLoading] = useState(true)
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

    const unwatch = useWatchContractEvent({
      abi: coinflipAbi,
      address: getAddress(game.contractAddress, game.chainId),
      eventName: 'results',
      onLogs(logs) {
        console.log(logs)
        logs.forEach((info) => {
          console.log(info)
            const { player, win, amount, isHeads } = info.args
            if (player === account) {
              setDidIWin(win)
              setAmountWonOrLost(new BigNumber(amount.toString()))
              setResults(isHeads)
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
    setResults(false)
    setLoading(true)
    onDismiss()
  }

  const getMsg = () => {
    const msg = didIWin ? 'You WON!' : 'You Lost!'
    if (didIWin) delay(showConfetti, 100)
    return msg
  }

  const getCoinImage = (heads: boolean) => {
    return heads ? (
      <img src={`/images/games/${folder}/coinflip/heads.png`} alt="HEADS" height="100px" width="100px" />
    ) : (
      <img src={`/images/games/${folder}/coinflip/tails.png`} alt="TAILS" height="100px" width="100px" />
    )
  }

  const getResult = () => {
    return getCoinImage(results)
  }

  const getMyBet = () => {
    return getCoinImage(isHeads)
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
          <img src={`/images/games/${folder}/coinflip/flipping.gif`} alt="flipping coin" />
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
                <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                  <Heading as="h1" scale="xl" color="secondary" mb="24px" textAlign="center">
                    Bet
                  </Heading>
                  <Heading as="h1" scale="xl" color="secondary" mb="24px" textAlign="center">
                    {getMyBet()}
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
                color="secondary"
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

export default ResultModal
