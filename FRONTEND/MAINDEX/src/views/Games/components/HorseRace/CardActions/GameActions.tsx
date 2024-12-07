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
import { usePriceBnbBusd } from 'state/farms/hooks'
import PercentageButton from 'components/PercentageButton'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { useHorseRace } from 'views/Games/hooks/Games2Calls'
import { Animation } from '../../Animation'
import ResultHorseRaceModal from '../modals/resultHorseRaceModal'

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
  gridColumn: 'span 2',
}

const unselectedStyleLarge = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 2',
}

// eslint-disable-next-line
const GameAction: React.FC<{
  game: Game
  expanded: boolean
  tokenPrice: number
}> = ({ game, tokenPrice }) => {
  const { maxBetAmount, quickBetAmount, userData, payoutRate, payToken, multipliers2 } = game

  const { onHorseRace } = useHorseRace(game)
  const [betAmount, setBetAmount] = useState(BIG_ZERO)
  const [viewValue, setViewValue] = useState('0')
  const [qba, setQBA] = useState(BIG_ZERO)
  const [isBalanceZero, setIsBalanceZero] = useState(true)

  const [playing, setPlaying] = useState<boolean>(false)

  const [onPresentResults] = useModal(<ResultHorseRaceModal game={game} />, false, true, 'HorseRace')

  const { t } = useTranslation()

  const horses1 = [0, 1, 2, 3]
  const horses2 = [4, 5, 6, 7]
  const [horseNumber, setHorseNumber] = useState(0)

  const { isLg, isXl, isXxl } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl

  const getStyle = (horse: number) => {
    if (isLargerScreen) {
      if (horseNumber === horse) {
        return selectedStyleLarge
      }
      return unselectedStyleLarge
    }
    if (horseNumber === horse) {
      return selectedStyle
    }
    return unselectedStyle
  }

  const onSelectHorse = (newChoice: number) => {
    setHorseNumber(newChoice)
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

  const onClickHorseRace = async () => {
    setPlaying(true)
    onPresentResults()
    await onHorseRace(betAmount.toString(), horseNumber)
    setPlaying(false)
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
    const finalPayout = betAmount
      .times(payoutRate.toString())
      .div(100)
      .times(multipliers2.horseRace1M.toString())
      .div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
  }

  const renderGameAction = () => {
    if (playing) {
      return <Animation game={game} gameType="horse" />
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
        {/* Horse Selector */}

        <Text color="textSubtle">Select Your Horse.</Text>
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          {horses1.map((horse) => {
            return (
              <Image
                key={horse}
                src={`/images/games/${game.folder}/horses/${horse}.png`}
                width={80}
                height={80}
                style={getStyle(horse)}
                onClick={() => {
                  onSelectHorse(horse)
                }}
              />
            )
          })}
        </Flex>
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          {horses2.map((horse) => {
            return (
              <Image
                key={horse}
                src={`/images/games/${game.folder}/horses/${horse}.png`}
                width={80}
                height={80}
                style={getStyle(horse)}
                onClick={() => {
                  onSelectHorse(horse)
                }}
              />
            )
          })}
        </Flex>

        <Flex flexDirection="column" justifyContent="space-between" alignItems="center">
          <Text>Win up to:</Text>
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
              onClick={onClickHorseRace}
            >
              ! Start the Race !
            </Button>
          </>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{renderGameAction()}</Flex>
}

export default GameAction
