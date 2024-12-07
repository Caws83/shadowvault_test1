import React, { useEffect, useState } from 'react'
import { Flex, Button, useModal, InputProps, Text, Link, Skeleton, Heading, BalanceInput } from 'uikit'
import styled from 'styled-components'
import { BIG_ZERO } from 'utils/bigNumber'
import { getAddress } from 'utils/addressHelpers'
import PageHeader from 'components/PageHeader'
import DeckCard from 'components/DeckCard'
import { Game } from 'state/types'
import { usePriceBnbBusd } from 'state/farms/hooks'
import PercentageButton from 'components/PercentageButton'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { useHighCard } from 'views/Games/hooks/CoinFlipCalls'
import { Animation } from '../../Animation'
import ResultHighCardModal from '../modals/resultHighCardModal'

const getBoxShadow = ({ isWarning = false, theme }) => {
  if (isWarning) {
    return theme.shadows.warning
  }

  return theme.shadows.inset
}

const StyledTokenInput = styled.div<InputProps>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 4px;
  box-shadow: ${getBoxShadow};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px 8px 0;
  width: 100%;
`
const StyledErrorMessage = styled(Text)`
  position: absolute;
  bottom: -22px;
  a {
    display: inline;
  }
`

// eslint-disable-next-line
const GameAction: React.FC<{
  game: Game
  expanded: boolean
  tokenPrice: number
}> = ({ game, tokenPrice }) => {
  const { maxBetAmount, quickBetAmount, userData, payToken, payoutRate, highCard, multipliers } = game

  const { onLowCardBet, onHighCardBet, onHighCardStart, onHighCardEnd } = useHighCard(game)
  const [betAmount, setBetAmount] = useState(BIG_ZERO)
  const [viewValue, setViewValue] = useState('0')
  const [qba, setQBA] = useState(BIG_ZERO)
  const [isBalanceZero, setIsBalanceZero] = useState(true)

  const [playing, setPlaying] = useState<boolean>(false)

  const [onPresentHighCardResults] = useModal(<ResultHighCardModal game={game} />, false, true, 'HighCardGuess')

  const { t } = useTranslation()

  useEffect(() => {
    if (betAmount.eq(BIG_ZERO) || new BigNumber(quickBetAmount.toString()) !== qba) {
      setBetAmount(new BigNumber(quickBetAmount.toString()))
      setViewValue(new BigNumber(quickBetAmount.toString()).shiftedBy(-payToken.decimals).toString())
      setQBA(new BigNumber(quickBetAmount.toString()))
    }

    // eslint-disable-next-line
  }, [quickBetAmount])

  useEffect(() => {
    setIsBalanceZero(!userData.balance || new BigNumber(userData.balance.toString()).eq(BIG_ZERO))
  }, [userData.balance])

  const onClickHigh = async () => {
    setPlaying(true)
    onPresentHighCardResults()
    await onHighCardBet()
    setPlaying(false)
  }

  const onClickLow = async () => {
    setPlaying(true)
    onPresentHighCardResults()
    await onLowCardBet()
    setPlaying(false)
  }

  const onClickStartGame = async () => {
    setPlaying(true)
    await onHighCardStart(betAmount)
    setPlaying(false)
  }

  const onClickClaim = () => {
    onHighCardEnd()
  }

  const onChangeBet = (value: string) => {
    setBetAmount(new BigNumber(value).shiftedBy(payToken.decimals))
    setViewValue(value)
  }

  const bnbPrice = usePriceBnbBusd()
  // const tokenPrice = useBusdPriceFromId(game.farmId).toNumber()
  const usdValueStaked = new BigNumber(betAmount)
    .times(payToken.symbol === 'BONE' ? bnbPrice.toString() : tokenPrice)
    .shiftedBy(-payToken.decimals)
    .toFixed(2)

  const handleBetChange = (value: number) => {
    const quantity = new BigNumber(value).dividedBy(tokenPrice).toFixed(2).toString()
    onChangeBet(quantity)
  }
  const handleMaxBetChange = () => {
    const maxRaw = maxBetAmount > userData.balance ? maxBetAmount : userData.balance
    const maxAvailable = new BigNumber(maxRaw.toString()).shiftedBy(-payToken.decimals).toNumber().toString()
    onChangeBet(maxAvailable)
  }

  const dollarPayOut = () => {
    const payoutAmount = displayPayout()
    return new BigNumber(payoutAmount).times(payToken.symbol === 'BONE' ? bnbPrice.toString() : tokenPrice).toFixed(2)
  }

  const displayPayout = () => {
    const multiplierBig = new BigNumber(highCard.multiplier.toString())
    const currentBetBig = new BigNumber(highCard.currentBet.toString())
    const startMBig = new BigNumber(multipliers.highCardStart.toString())
    if (highCard.isGameStarted) {
      const finalPayout = currentBetBig
        .times(payoutRate.toString())
        .div(100)
        .times(multiplierBig.plus(startMBig))
        .div(100)
      return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
    }
    const finalPayout = betAmount.times(payoutRate.toString()).div(100).times(startMBig.plus(startMBig)).div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
  }

  const displayCurrentPayout = () => {
    const startMBig = new BigNumber(multipliers.highCardStart.toString())
    const finalPayout = betAmount.times(payoutRate.toString()).div(100).times(startMBig.plus(startMBig)).div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
  }

  const renderGameAction = () => {
    if (playing) {
      return <Animation game={game} gameType="card" />
    }
    return (
      <>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          {highCard.isGameStarted ? (
            <>
              <PageHeader>
                <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
                  <Flex flex="1" justifyContent="center" flexDirection="row">
                    <Flex flex="1" justifyContent="center" flexDirection="column" mr={['8px', 0]}>
                      <Heading as="h1" scale="xl" color="secondary" mb="75px" textAlign="center">
                        Current
                      </Heading>
                      <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
                        <DeckCard
                          suit={new BigNumber(highCard.currentSuit.toString()).toNumber()}
                          card={new BigNumber(highCard.currentNumber.toString()).toNumber()}
                          height={50}
                          width={75}
                          folder={game.folder}
                        />
                      </Heading>
                    </Flex>
                  </Flex>
                </Flex>
              </PageHeader>
            </>
          ) : (
            <>
              <StyledTokenInput isWarning={isBalanceZero}>
                <BalanceInput
                  placeholder="0.00"
                  value={viewValue}
                  unit={payToken.symbol}
                  onUserInput={onChangeBet}
                  currencyValue={tokenPrice !== 0 && `~${usdValueStaked || 0} USD`}
                  decimals={payToken.decimals}
                  isWarning={
                    new BigNumber(betAmount).gt(maxBetAmount.toString()) ||
                    new BigNumber(betAmount).lt(quickBetAmount.toString())
                  }
                />
              </StyledTokenInput>
              <Flex alignItems="center" justifyContent="space-between" mt="8px">
                <PercentageButton
                  onClick={() =>
                    onChangeBet(
                      new BigNumber(quickBetAmount.toString()).shiftedBy(-payToken.decimals).toNumber().toString(),
                    )
                  }
                >
                  min
                </PercentageButton>
                <PercentageButton onClick={() => handleBetChange(5)}>5$</PercentageButton>
                <PercentageButton onClick={() => handleBetChange(10)}>10$</PercentageButton>
                <PercentageButton onClick={() => handleMaxBetChange()}>{t('Max')}</PercentageButton>
              </Flex>
            </>
          )}
          {isBalanceZero && (
            <>
              <Flex
                mb="8px"
                color={isBalanceZero ? 'failure' : 'secondary'}
                justifyContent={['flex-end', 'flex-end', 'flex-start']}
              >
                <Link fontSize="18px" href="/#/cashier" bold={false}>
                  {`Swap for ${payToken.name} Chips`}
                </Link>
              </Flex>

              <StyledErrorMessage fontSize="14px" color="failure">
                {t('No tokens to bet')}:{' '}
                <Link
                  fontSize="14px"
                  bold={false}
                  href={`/#/swap?outputCurrency=${getAddress(payToken.address)}`}
                  external
                  color="failure"
                >
                  {t(`Get ${payToken.symbol}`)}
                </Link>
              </StyledErrorMessage>
            </>
          )}
        </div>
        <Flex flexDirection="column" justifyContent="space-between" alignItems="center">
          <Text>Next PayOut:</Text>
          {payoutRate === undefined ? (
            <Skeleton width="80px" height="16px" />
          ) : (
            <>
              <Text fontSize="18px" color="secondary">
                {displayPayout()} {payToken.symbol} +bet
              </Text>
              <Text fontSize="12px" color="primary">
                ${dollarPayOut()} +bet
              </Text>
            </>
          )}
        </Flex>

        {!highCard.isGameStarted ? (
          <>
            <Button
              style={{ marginTop: '15px' }}
              disabled={
                betAmount === undefined ||
                betAmount.lt(quickBetAmount.toString()) ||
                betAmount.gt(maxBetAmount.toString()) ||
                betAmount.gt(userData.balance.toString())
              }
              onClick={onClickStartGame}
            >
              Start Game
            </Button>
          </>
        ) : (
          <>
            <Button style={{ marginTop: '15px' }} onClick={onClickHigh}>
              Guess High
            </Button>
            <Button style={{ marginTop: '15px' }} onClick={onClickLow}>
              Guess Low
            </Button>

            <Button style={{ marginTop: '15px' }} onClick={onClickClaim}>
              {`Claim ${displayCurrentPayout()} ${payToken.symbol}`}
            </Button>
          </>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{renderGameAction()}</Flex>
}

export default GameAction
