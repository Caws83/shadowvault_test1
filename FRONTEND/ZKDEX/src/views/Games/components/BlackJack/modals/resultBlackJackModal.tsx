import { Flex, Modal, Text, Button } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { useQuickBlackJackUserDataAsync } from 'state/games/hooks'
import { Token } from 'config/constants/types'
import { delay } from 'lodash'
import confetti from 'canvas-confetti'
import PageHeader from 'components/PageHeader'
import { CardHand } from 'components/DeckCard'
import useTheme from 'hooks/useTheme'
import { useBlackJack } from 'views/Games/hooks/CoinFlipCalls'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
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

export interface Receipt {
  player: string
  playersSuits: BigNumber[]
  playersNumbers: BigNumber[]
  Dsuit: BigNumber[]
  Dnumber: BigNumber[]
  betAmount: bigint
  total: bigint
  Dtotal: bigint
  bust: boolean
  isWinner: boolean
}

interface ResultModalProps {
  onDismiss?: () => void
  game: Game
}

const ResultBlackJackModal: React.FC<ResultModalProps> = ({ onDismiss, game }) => {
  const { address: account } = useAccount()
  const { theme } = useTheme()
  const { t } = useTranslation()

  const [playerSuits, setPlayerSuits] = useState<BigNumber[]>()
  const [playerCards, setPlayerCards] = useState<BigNumber[]>()
  const [houseSuits, setHouseSuits] = useState<BigNumber[]>()
  const [houseCards, setHouseCards] = useState<BigNumber[]>()
  const [currentBet, setCurrentBet] = useState<BigNumber>()
  const [playerTotal, setPlayerTotal] = useState<BigNumber>()
  const [houseTotal, setHouseTotal] = useState<BigNumber>()
  const [isBust, setIsBust] = useState(false)
  const [didIWin, setDidIWin] = useState(false)

  const [loading, setLoading] = useState(true)
  const { payoutRate, multipliers } = game
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

  useQuickBlackJackUserDataAsync(account)

  const { onBJHold, onBJHit } = useBlackJack(game)

  const onQuickHit = async () => {
    setLoading(true)
    setDidIWin(undefined)
    setIsBust(undefined)
    await onBJHit()
  }

  const onQuickHold = async () => {
    setLoading(true)
    setDidIWin(undefined)
    setIsBust(undefined)
    await onBJHold()
  }


    const unwatch = useWatchContractEvent({
      abi: coinflipAbi,
      address: getAddress(game.contractAddress),
      eventName: 'BlackJackGame',
      chainId: game.chainId,
      onLogs(logs) {
        logs.forEach((info) => {

            const { player, playersSuits, playersNumbers, Dsuit, Dnumber, betAmount, total, Dtotal, bust, isWinner } =
              info.args
            if (player === account) {
              unwatch?.()
              setPlayerSuits(playersSuits.map((suit) => new BigNumber(suit.toString())))
              setPlayerCards(playersNumbers.map((number) => new BigNumber(number.toString())))
              setHouseSuits(Dsuit.map((suit) => new BigNumber(suit.toString())))
              setHouseCards(Dnumber.map((number) => new BigNumber(number.toString())))
              setCurrentBet(new BigNumber(betAmount.toString()))
              setPlayerTotal(new BigNumber(total.toString()))
              setHouseTotal(new BigNumber(Dtotal.toString()))
              setIsBust(bust)
              setDidIWin(isWinner)
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
    setIsBust(undefined)
    setLoading(true)
    onDismiss()
  }

  const getColor = () => {
    let color = 'secondary'
    if (!didIWin) {
      color = 'failure'
    }
    return color
  }

  const getWinnings = () => {
    const CurrentBetBig = new BigNumber(currentBet)
    if (didIWin) {
      return CurrentBetBig.shiftedBy(-payToken.decimals).toNumber()
    }
    const finalPayout = CurrentBetBig.times(payoutRate.toString())
      .div(100)
      .times(multipliers.blackJackM.toString())
      .div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toNumber()
  }

  const getMsg = () => {
    let msg = 'Play to Win:'
    if (didIWin) {
      msg = 'You WON!'
      delay(showConfetti, 100)
    } else if (isBust || !game.blackJack.isGameStarted) {
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
              <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                <Text fontSize="16px">Player Total: {new BigNumber(playerTotal).toString()}</Text>

                <Flex flex="1" flexDirection="row" mr={['8px', 0]}>
                  {playerSuits.map((suit, index) => {
                    return (
                      <CardHand
                        suit={playerSuits[index].toNumber()}
                        card={playerCards[index].toNumber()}
                        height={20}
                        width={30}
                        folder={folder}
                      />
                    )
                  })}
                </Flex>
              </Flex>
            </Flex>

            <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
              <Text fontSize="16px">Dealer Total: {new BigNumber(houseTotal).toString()}</Text>

              <Flex flex="1" flexDirection="row" mr={['8px', 0]}>
                {houseCards.map((suit, index) => {
                  return (
                    <CardHand
                      suit={houseSuits[index].toNumber()}
                      card={houseCards[index].toNumber()}
                      height={20}
                      width={30}
                      folder={folder}
                    />
                  )
                })}
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

          {game.blackJack.isGameStarted && (
            <>
              {!isBust && (
                <>
                  <ActionContainer>
                    <ActionTitles>
                      <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
                        {t('Your Turn')}
                      </Text>
                    </ActionTitles>
                    <ActionContent>
                      <Button width="100%" variant="secondary" onClick={onQuickHit} style={{ marginRight: '15px' }}>
                        {t('Hit Me')}
                      </Button>
                      <Button width="100%" variant="secondary" onClick={onQuickHold}>
                        {t('Hold')}
                      </Button>
                    </ActionContent>
                  </ActionContainer>
                </>
              )}
            </>
          )}

          <Button onClick={handleDismiss}>Close</Button>
        </>
      )}
    </Modal>
  )
}

export default ResultBlackJackModal
