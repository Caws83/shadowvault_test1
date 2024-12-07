import { Flex, Heading, Modal, Text, Button, useModal } from 'uikit'
import Balance from 'components/Balance'
import { Game } from 'state/types'
import { useQuickHighCardUserDataAsync } from 'state/games/hooks'
import { Token } from 'config/constants/types'
import PageHeader from 'components/PageHeader'
import DeckCard from 'components/DeckCard'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { useHighCard } from 'views/Games/hooks/CoinFlipCalls'
import { useTranslation } from 'contexts/Localization'
import { ethers } from 'ethers'
import { useBlock } from 'state/block/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { ActionContainer, ActionTitles, ActionContent } from './styles'
import ResultHighCardModal from './resultHighCardModal'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { coinflipAbi } from 'config/abi/coinFlip'
import { getAddress } from 'utils/addressHelpers'

interface ResultModalProps {
  onDismiss?: () => void
  game: Game
}

const HighCardStartModal: React.FC<ResultModalProps> = ({ onDismiss, game }) => {
  const { address: account } = useAccount()
  const currentBlock = useBlock()

  const { theme } = useTheme()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const { multipliers, payoutRate } = game
  const [payToken] = useState<Token>(game.payToken)
  const [folder] = useState<string>(game.folder)

  useQuickHighCardUserDataAsync(account)

  const [amountBet, setAmountBet] = useState(BIG_ZERO)
  const [houseSuitInfo, setHouseSuit] = useState<BigNumber>()
  const [houseCardInfo, setHouseCard] = useState<BigNumber>()
  const [playing, setPlaying] = useState<boolean>(false)

  const [onPresentHighCardResults] = useModal(<ResultHighCardModal game={game} />, false, true, 'HighCardGuess')

    const unwatch = useWatchContractEvent({
      abi: coinflipAbi,
      address: getAddress(game.contractAddress),
      eventName: 'HighCardFirst',
      onLogs(logs) {
        logs.forEach((info) => {
            const { player, number, bet, suit } = info.args
            if (player === account) {
              unwatch?.()
              setAmountBet(new BigNumber(bet.toString()))
              setHouseCard(new BigNumber(number.toString()))
              setHouseSuit(new BigNumber(suit.toString()))
              setLoading(false)
            }
          
        })
      },
    })

  const { onLowCardBet, onHighCardBet } = useHighCard(game)

  const onQuickHigh = async () => {
    setPlaying(true)
    onPresentHighCardResults()
    await onHighCardBet()
  }

  const onQuickLow = async () => {
    setPlaying(true)
    onPresentHighCardResults()
    await onLowCardBet()
  }

  const handleDismiss = () => {
    setAmountBet(BIG_ZERO)
    setLoading(true)
    onDismiss()
  }

  const getColor = () => {
    return 'secondary'
  }

  const nextPayout = amountBet
    .times(payoutRate.toString())
    .div(100)
    .times(multipliers.highCardStart.toString())
    .div(100)
    .times(2)

  return (
    <Modal
      minWidth="346px"
      title="First Card Drawn!"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
      overflow="none"
    >
      {loading || playing ? (
        <Flex dir="row" justifyContent="space-evenly">
          <img src={`/images/games/${folder}/deckcut/cardflip.gif`} alt="flipping card" />
        </Flex>
      ) : (
        <>
          <PageHeader>
            <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
              <Flex flex="1" justifyContent="center" flexDirection="column" mr={['8px', 0]}>
                <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                  House
                </Heading>
                <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                  <DeckCard
                    suit={houseSuitInfo.toNumber()}
                    card={houseCardInfo.toNumber()}
                    height={50}
                    width={75}
                    folder={folder}
                  />
                </Heading>
              </Flex>
            </Flex>
          </PageHeader>

          <Flex flexDirection="column">
            <Text mb="4px" textAlign={['center', null, 'left']}>
              Your Bet:
            </Text>
            <Flex
              alignItems={['flex-start', null, 'center']}
              justifyContent={['flex-start', null, 'space-between']}
              flexDirection={['column', null, 'row']}
            >
              <Balance
                textAlign={['center', null, 'left']}
                lineHeight="1.1"
                value={amountBet.shiftedBy(-payToken.decimals).toNumber()}
                decimals={2}
                fontSize="44px"
                bold
                color={getColor()}
                unit={` ${payToken.symbol}!`}
              />
            </Flex>
          </Flex>

          <Flex flexDirection="column">
            <Text mb="4px" textAlign={['center', null, 'left']}>
              Play to Win:
            </Text>
            <Flex
              alignItems={['flex-start', null, 'center']}
              justifyContent={['flex-start', null, 'space-between']}
              flexDirection={['column', null, 'row']}
            >
              <Balance
                textAlign={['center', null, 'left']}
                lineHeight="1.1"
                value={nextPayout.shiftedBy(-payToken.decimals).toNumber()}
                decimals={2}
                fontSize="44px"
                bold
                color={getColor()}
                unit={` ${payToken.symbol}!`}
              />
            </Flex>
          </Flex>

          <ActionContainer>
            <ActionTitles>
              <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
                {t('Make Next Guess')}
              </Text>
            </ActionTitles>
            <ActionContent>
              <Button width="100%" variant="secondary" onClick={onQuickLow} style={{ marginRight: '15px' }}>
                {t('Guess Low')}
              </Button>
              <Button width="100%" variant="secondary" onClick={onQuickHigh}>
                {t('Guess High')}
              </Button>
            </ActionContent>
          </ActionContainer>
          <ActionContainer>
            <ActionContent>
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

export default HighCardStartModal
