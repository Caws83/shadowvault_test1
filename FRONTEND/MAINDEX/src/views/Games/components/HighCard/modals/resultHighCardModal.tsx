import { Flex, Heading, Modal, Text, Button } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { useQuickHighCardUserDataAsync } from 'state/games/hooks'
import { Token } from 'config/constants/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import DeckCard from 'components/DeckCard'
import useTheme from 'hooks/useTheme'
import { useHighCard } from 'views/Games/hooks/CoinFlipCalls'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
import { ethers } from 'ethers'
import { useBlock } from 'state/block/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { ActionContainer, ActionTitles, ActionContent } from './styles'
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

const ResultHighCardModal: React.FC<ResultModalProps> = ({ onDismiss, game }) => {
  const { address: account } = useAccount()
  const currentBlock = useBlock()
  const { theme } = useTheme()
  const { t } = useTranslation()

  const [newWinnings, setnewWinnings] = useState(BIG_ZERO)
  const [oldBet, setOldBet] = useState<BigNumber>()
  const [didIWin, setDidIWin] = useState(false)
  const [jackpot, setJackpot] = useState(false)
  const [newSuitInfo, setNewSuit] = useState<BigNumber>()
  const [newCardInfo, setNewCard] = useState<BigNumber>()
  const [lastSuitInfo, setLastSuit] = useState<BigNumber>()
  const [lastCardInfo, setLastCard] = useState<BigNumber>()

  useQuickHighCardUserDataAsync(account)

  const [loading, setLoading] = useState(true)
  const { payoutRate } = game
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

  const { onLowCardBet, onHighCardBet, onHighCardEnd } = useHighCard(game)

  const onQuickHigh = async () => {
    setLoading(true)
    setDidIWin(undefined)
    setnewWinnings(BIG_ZERO)
    await onHighCardBet()
  }

  const onQuickLow = async () => {
    setLoading(true)
    setDidIWin(undefined)
    setnewWinnings(BIG_ZERO)
    await onLowCardBet()
  }

  const onQuickClaim = () => {
    onHighCardEnd()
    handleDismiss()
  }

    const unwatch = useWatchContractEvent({
      abi: coinflipAbi,
      address: getAddress(game.contractAddress),
      eventName: 'HighCardGuess',
      onLogs(logs) {
        logs.forEach((info) => {
            const {
              player,
              winnings,
              currentBet,
              isWinner,
              isJackpot,
              newCardNumber,
              LastCardNumber,
              LastCardSuit,
              newCardSuit,
            } = info.args
            if (player === account) {
              unwatch?.()
              setDidIWin(isWinner)
              setJackpot(isJackpot)
              setnewWinnings(new BigNumber(winnings.toString()))
              setOldBet(new BigNumber(currentBet.toString()))
              setNewCard(new BigNumber(newCardNumber.toString()))
              setLastCard(new BigNumber(LastCardNumber.toString()))
              setLastSuit(new BigNumber(LastCardSuit.toString()))
              setNewSuit(new BigNumber(newCardSuit.toString()))
              setLoading(false)
            }
          
        })
      },
    })

  useEffect(() => {
    if (didIWin) delay(showConfetti, 100)
  }, [didIWin])

  const handleDismiss = () => {
    setLoading(true)
    setDidIWin(undefined)
    setnewWinnings(BIG_ZERO)
    onDismiss()
  }

  const getColor = () => {
    let color = 'secondary'
    if (!didIWin) {
      color = 'red'
    }
    return color
  }

  const getWinnings = () => {
    const currentWinnings = new BigNumber(newWinnings)
    const oldBetBig = new BigNumber(oldBet)
    if (didIWin) {
      const finalPayout = currentWinnings.times(payoutRate.toString()).div(100)
      return finalPayout.shiftedBy(-payToken.decimals).toNumber()
    }
    return oldBetBig.shiftedBy(-payToken.decimals).toNumber()
  }

  const getMsg = () => {
    let msg = 'unknown'
    if (didIWin) {
      msg = 'You WIN! Pot is now:'
      delay(showConfetti, 100)
    } else if (!didIWin) {
      msg = 'You Lost your Bet of:'
    }
    return msg
  }

  return (
    <Modal
      minWidth="346px"
      title="Results:"
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
                  <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                    Last
                  </Heading>
                  <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                    <DeckCard
                      suit={lastSuitInfo.toNumber()}
                      card={lastCardInfo.toNumber()}
                      height={50}
                      width={75}
                      folder={folder}
                    />
                  </Heading>
                </Flex>
                <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                  <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                    New
                  </Heading>
                  <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                    <DeckCard
                      suit={newSuitInfo.toNumber()}
                      card={newCardInfo.toNumber()}
                      height={50}
                      width={75}
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
                value={getWinnings()}
                decimals={2}
                fontSize="44px"
                bold
                color={getColor()}
                unit={` ${payToken.symbol}!`}
              />
            </Flex>
          </Flex>
          {didIWin && (
            <>
              {!jackpot ? (
                <>
                  <ActionContainer>
                    <ActionTitles>
                      <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
                        {t('Make Next Guess')}
                      </Text>
                    </ActionTitles>
                    <ActionContent>
                      <Button
                        width="100%"
                        variant="secondary"
                        disabled={jackpot}
                        onClick={onQuickLow}
                        style={{ marginRight: '15px' }}
                      >
                        {t('Guess Low')}
                      </Button>
                      <Button width="100%" variant="secondary" disabled={jackpot} onClick={onQuickHigh}>
                        {t('Guess High')}
                      </Button>
                    </ActionContent>
                  </ActionContainer>
                </>
              ) : (
                <Flex flex="1" justifyContent="center" flexDirection="column" mr={['8px', 0]}>
                  <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                    <br />
                    !* JACKPOT *!
                  </Heading>
                </Flex>
              )}
            </>
          )}
          <ActionContainer>
            <ActionContent>
              {didIWin && (
                <Button width="50%" variant="primary" disabled={jackpot} onClick={onQuickClaim}>
                  {`Claim ${getWinnings()} ${payToken.symbol}`}
                </Button>
              )}
              <Button width="100%" variant="secondary" onClick={handleDismiss}>
                Close
              </Button>
            </ActionContent>
          </ActionContainer>
        </>
      )}
    </Modal>
  )
}

export default ResultHighCardModal
