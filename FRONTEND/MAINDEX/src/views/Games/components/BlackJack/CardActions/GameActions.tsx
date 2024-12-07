import React, { useEffect, useState } from 'react'
import { Flex, Button, useModal, InputProps, Text, Link, Skeleton, BalanceInput } from 'uikit'
import styled from 'styled-components'
import { BIG_ZERO } from 'utils/bigNumber'
import { getAddress } from 'utils/addressHelpers'
import { CardHand } from 'components/DeckCard'
import { Game } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { useBlackJack } from 'views/Games/hooks/CoinFlipCalls'
import { usePriceBnbBusd } from 'state/farms/hooks'
import PercentageButton from 'components/PercentageButton'
import ResultBlackJackModal from '../modals/resultBlackJackModal'
import { Animation } from '../../Animation'

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
  const { maxBetAmount, quickBetAmount, userData, payToken, payoutRate, blackJack, multipliers, folder } = game

  const { onBJHit, onBJHold, onBJStart } = useBlackJack(game)
  const [betAmount, setBetAmount] = useState(BIG_ZERO)
  const [viewValue, setViewValue] = useState('0')
  const [qba, setQBA] = useState(BIG_ZERO)
  const [isBalanceZero, setIsBalanceZero] = useState(true)
  const [playing, setPlaying] = useState<boolean>(false)

  const [onPresentBlackJackResults] = useModal(<ResultBlackJackModal game={game} />, false, true, 'BlackJackGame')

  const bnbPrice = usePriceBnbBusd()
  // const tokenPrice = useBusdPriceFromId(game.farmId).toNumber()
  const usdValueStaked = new BigNumber(betAmount)
    .times(payToken.symbol === 'BONE' ? bnbPrice : tokenPrice)
    .shiftedBy(-payToken.decimals)
    .toFixed(2)

  const { t } = useTranslation()

  useEffect(() => {
    if (betAmount.eq(BIG_ZERO) || quickBetAmount !== qba) {
      setBetAmount(new BigNumber(quickBetAmount))
      setViewValue(new BigNumber(quickBetAmount).shiftedBy(-payToken.decimals).toString())
      setQBA(new BigNumber(quickBetAmount))
    }

    // eslint-disable-next-line
  }, [quickBetAmount])

  useEffect(() => {
    setIsBalanceZero(!userData.balance || new BigNumber(userData.balance).eq(BIG_ZERO))
  }, [userData.balance])

  const onClickHit = async () => {
    setPlaying(true)
    onPresentBlackJackResults()
    await onBJHit()
    setPlaying(false)
  }

  const onClickHold = async () => {
    setPlaying(true)
    onPresentBlackJackResults()
    await onBJHold()
    setPlaying(false)
  }

  const onClickStart = async () => {
    setPlaying(true)
    onPresentBlackJackResults()
    await onBJStart(betAmount)
    setPlaying(false)
  }

  const onChangeBet = (value: string) => {
    setBetAmount(new BigNumber(value).shiftedBy(payToken.decimals))
    setViewValue(value)
  }

  const handleBetChange = (value: number) => {
    const quantity = new BigNumber(value).dividedBy(tokenPrice).toFixed(2).toString()
    onChangeBet(quantity)
  }
  const handleMaxBetChange = () => {
    const maxRaw = maxBetAmount > userData.balance ? maxBetAmount : userData.balance
    const maxAvailable = new BigNumber(maxRaw).shiftedBy(-payToken.decimals).toNumber().toString()
    onChangeBet(maxAvailable)
  }

  const displayPayout = () => {
    const currentBetBig = new BigNumber(blackJack.currentBet)
    const MBig = new BigNumber(multipliers.blackJackM)
    if (blackJack.isGameStarted) {
      const finalPayout = currentBetBig.times(payoutRate).div(100).times(MBig).div(100)
      return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
    }
    const finalPayout = new BigNumber(betAmount).times(payoutRate).div(100).times(MBig).div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
  }

  const dollarPayOut = () => {
    const payoutAmount = displayPayout()
    return new BigNumber(payoutAmount).times(payToken.symbol === 'BONE' ? bnbPrice : tokenPrice).toFixed(2)
  }

  const renderGameAction = () => {
    if (playing) {
      return <Animation game={game} gameType="card" />
    }
    return (
      <>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          {blackJack.isGameStarted ? (
            <>
              <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
                <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                  <Text fontSize="16px">Player Total: {new BigNumber(blackJack.playerTotal).toString()} </Text>

                  <Flex flex="1" flexDirection="row" mr={['8px', 0]}>
                    {blackJack.playerSuits.map((suit, index) => {
                      return (
                        <CardHand
                          suit={blackJack.playerSuits[index].toNumber()}
                          card={blackJack.playerCards[index].toNumber()}
                          height={30}
                          width={40}
                          folder={folder}
                        />
                      )
                    })}
                  </Flex>
                </Flex>
              </Flex>

              <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
                <Text fontSize="16px">Dealer Total: {new BigNumber(blackJack.houseTotal).toString()}</Text>

                <Flex flex="1" flexDirection="row" mr={['8px', 0]}>
                  {blackJack.houseSuits.map((suit, index) => {
                    return (
                      <CardHand
                        suit={blackJack.houseSuits[index].toNumber()}
                        card={blackJack.houseCards[index].toNumber()}
                        height={30}
                        width={40}
                        folder={folder}
                      />
                    )
                  })}
                </Flex>
              </Flex>
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
                  isWarning={new BigNumber(betAmount).gt(maxBetAmount) || new BigNumber(betAmount).lt(quickBetAmount)}
                />
              </StyledTokenInput>

              <Flex alignItems="center" justifyContent="space-between" mt="8px">
                <PercentageButton
                  onClick={() =>
                    onChangeBet(new BigNumber(quickBetAmount).shiftedBy(-payToken.decimals).toNumber().toString())
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
                <Link fontSize="14px" href="/#/cashier" bold={false}>
                  {`Swap for ${payToken.name} Chips`}
                </Link>
              </Flex>

              <StyledErrorMessage fontSize="14px" color="failure">
                {t('No tokens to bet')}:{' '}
                <Link
                  fontSize="14px"
                  bold={false}
                  href={`/#/swap?outputCurrency=${getAddress(payToken.address, game.chainId)}`}
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
          <Text>Winning PayOut:</Text>
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

        {!blackJack.isGameStarted ? (
          <>
            <Button
              style={{ marginTop: '15px' }}
              disabled={
                betAmount === undefined ||
                new BigNumber(betAmount).lt(quickBetAmount) ||
                new BigNumber(betAmount).gt(maxBetAmount) ||
                new BigNumber(betAmount).gt(userData.balance)
              }
              onClick={onClickStart}
            >
              ! Deal !
            </Button>
          </>
        ) : (
          <>
            <Button style={{ marginTop: '15px' }} onClick={onClickHit}>
              ! Hit Me !
            </Button>
            <Button style={{ marginTop: '15px' }} onClick={onClickHold}>
              ! Hold !
            </Button>
          </>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{renderGameAction()}</Flex>
}

export default GameAction
