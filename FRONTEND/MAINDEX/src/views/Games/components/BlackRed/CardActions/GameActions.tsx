import React, { useEffect, useState } from 'react'
import {
  Flex,
  Button,
  useModal,
  InputProps,
  Text,
  Image,
  Link,
  Skeleton,
  useMatchBreakpoints,
  BalanceInput,
} from 'uikit'
import styled from 'styled-components'
import { BIG_ZERO } from 'utils/bigNumber'
import { getAddress } from 'utils/addressHelpers'
import { Game } from 'state/types'
import PercentageButton from 'components/PercentageButton'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { useBRCalls } from 'views/Games/hooks/Games2Calls'
import ResultBlackRedModal from '../modals/resultBlackRedModal'
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

const selectedStyle = {
  cursor: 'pointer',
  border: '3px solid green',
  gridColumn: 'span 2',
}

const unselectedStyle = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 2',
}

const selectedStyleLarge = {
  cursor: 'pointer',
  border: '3px solid green',
  gridColumn: 'span 3',
}

const unselectedStyleLarge = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 3',
}

// eslint-disable-next-line
const GameAction: React.FC<{
  game: Game
  expanded: boolean
  tokenPrice: number
}> = ({ game, tokenPrice }) => {
  const { maxBetAmount, quickBetAmount, userData, payoutRate, payToken, multipliers2 } = game

  const { onBRBlack, onBRRed } = useBRCalls(game)
  const [betAmount, setBetAmount] = useState(BIG_ZERO)
  const [viewValue, setViewValue] = useState('0')
  const [qba, setQBA] = useState(BIG_ZERO)
  const [isBalanceZero, setIsBalanceZero] = useState(true)
  const [playing, setPlaying] = useState<boolean>(false)

  const [onPresentResults] = useModal(<ResultBlackRedModal game={game} />, false, true, 'Black or Red')

  const bnbPrice = usePriceBnbBusd()
  // const tokenPrice = useBusdPriceFromId(game.farmId).toNumber()
  const usdValueStaked = new BigNumber(betAmount)
    .times(payToken.symbol === 'BONE' ? bnbPrice.toString() : tokenPrice)
    .shiftedBy(-payToken.decimals)
    .toFixed(2)

  const { t } = useTranslation()

  const colorChoices = ['heart', 'spade']
  const [colorChoice, setColorChoice] = useState('heart')
  const [colorNumber, setColorNumber] = useState(0)

  const { isLg, isXl, isXxl } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl

  const getStyle = (suit: string) => {
    if (isLargerScreen) {
      if (colorChoice === suit) {
        return selectedStyleLarge
      }
      return unselectedStyleLarge
    }
    if (colorChoice === suit) {
      return selectedStyle
    }
    return unselectedStyle
  }

  const onSelectColor = (newChoice: string) => {
    setColorChoice(newChoice)
    let newS = 1
    if (newChoice === 'heart') {
      newS = 0
    }
    setColorNumber(newS)
  }

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

  const onClickBlack = async () => {
    setPlaying(true)
    onPresentResults()
    await onBRBlack(betAmount.toString())
    setPlaying(false)
  }

  const onClickRed = async () => {
    setPlaying(true)
    onPresentResults()
    await onBRRed(betAmount.toString())
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
    const maxAvailable = new BigNumber(maxRaw.toString()).shiftedBy(-payToken.decimals).toNumber().toString()
    onChangeBet(maxAvailable)
  }

  const dollarPayOut = () => {
    const payoutAmount = displayPayout()
    return new BigNumber(payoutAmount).times(payToken.symbol === 'BONE' ? bnbPrice.toString() : tokenPrice).toFixed(2)
  }

  const displayPayout = () => {
    const finalPayout = betAmount
      .times(payoutRate.toString())
      .div(100)
      .times(multipliers2.blackRedM.toString())
      .div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
  }

  const renderGameAction = () => {
    if (playing) {
      return <Animation game={game} gameType="card" />
    }
    return (
      <>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
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
        {/* suit selector */}
        <>
          <Text color="textSubtle">Select card color.</Text>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            {colorChoices.map((suit) => {
              return (
                <Image
                  key={suit}
                  src={`/images/games/${game.folder}/deckcut/${suit}.png`}
                  width={80}
                  height={80}
                  style={getStyle(suit)}
                  onClick={() => {
                    onSelectColor(suit)
                  }}
                />
              )
            })}
          </Flex>
        </>

        <Flex flexDirection="column" justifyContent="space-between" alignItems="center">
          <Text>Winning PayOut:</Text>
          {payoutRate === undefined ? (
            <Skeleton width="80px" height="16px" />
          ) : (
            <>
              <Text fontSize="18px" color="secondary">
                {displayPayout()} {payToken.symbol}
              </Text>
              <Text fontSize="12px" color="primary">
                ${dollarPayOut()}
              </Text>
            </>
          )}
        </Flex>
        {isBalanceZero === false && (
          <>
            <Button
              style={{ marginTop: '15px' }}
              disabled={
                betAmount === undefined ||
                betAmount.lt(quickBetAmount.toString()) ||
                betAmount.gt(maxBetAmount.toString()) ||
                betAmount.gt(userData.balance.toString())
              }
              onClick={colorNumber === 0 ? onClickRed : onClickBlack}
            >
              Cut the Deck
            </Button>
          </>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{renderGameAction()}</Flex>
}

export default GameAction
