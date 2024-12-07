import React, { useEffect, useState } from 'react'
import {
  Flex,
  Button,
  IconButton,
  AddIcon,
  MinusIcon,
  useModal,
  InputProps,
  Text,
  Link,
  Image,
  useMatchBreakpoints,
  Skeleton,
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
import { useDiceCall } from 'views/Games/hooks/CoinFlipCalls'
import { Animation } from '../../Animation'
import ResultDiceCallModal from '../modals/resultDiceCallModal'
import { useAccount, usePublicClient } from 'wagmi'

const getBoxShadow = ({ isWarning = false, theme }) => {
  if (isWarning) {
    return theme.shadows.warning
  }

  return theme.shadows.inset
}

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
  const { maxBetAmount, quickBetAmount, userData, payoutRate, payToken, multipliers } = game
  const client = usePublicClient({chainId: game.chainId})
  const { onDiceCall } = useDiceCall(game)
  const [betAmount, setBetAmount] = useState(BIG_ZERO)
  const [viewValue, setViewValue] = useState('0')
  const [qba, setQBA] = useState(BIG_ZERO)
  const [isBalanceZero, setIsBalanceZero] = useState(true)
  const [multiplier, setMultiplier] = useState(new BigNumber(multipliers.diceCall6M.toString()).toNumber())
  const [playing, setPlaying] = useState<boolean>(false)

  const [onPresentResults] = useModal(<ResultDiceCallModal game={game} />, false, true, 'DiceCall')

  const { t } = useTranslation()

  const [choiceNumber, setChoiceNumber] = useState(1)

  const onClickAdd = () => {
    let newChoiceNumber = choiceNumber + 1

    if (newChoiceNumber > diceChoice) {
      newChoiceNumber = choiceNumber
    }

    setChoiceNumber(newChoiceNumber)
  }

  const onClickMinus = () => {
    let newChoiceNumber = choiceNumber - 1
    if (newChoiceNumber < 1) {
      newChoiceNumber = 1
    }
    setChoiceNumber(newChoiceNumber)
  }

  const diceChoices = [6, 12, 20]
  const [diceChoice, setDiceChoice] = useState(6)

  const { isLg, isXl, isXxl } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl

  const getStyle = (dice: number) => {
    if (isLargerScreen) {
      if (diceChoice === dice) {
        return selectedStyleLarge
      }
      return unselectedStyleLarge
    }
    if (diceChoice === dice) {
      return selectedStyle
    }
    return unselectedStyle
  }

  const onSelectDice = (newChoice: number) => {
    setDiceChoice(newChoice)
    let newM = multipliers.diceCall6M
    if (newChoice === 12) {
      newM = multipliers.diceCall12M
    }
    if (newChoice === 20) {
      newM = multipliers.diceCall20M
    }
    setMultiplier(new BigNumber(newM.toString()).toNumber())
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

  const onClickDiceCall = async () => {
    setPlaying(true)
    onPresentResults()
    await onDiceCall(betAmount.toString(), choiceNumber, diceChoice)
    setPlaying(false)
  }

  const onChangeBet = (value: string) => {
    setBetAmount(new BigNumber(value).shiftedBy(payToken.decimals))
    setViewValue(value)
  }

  const bnbPrice = usePriceBnbBusd(game.dex)
  // const tokenPrice = useBusdPriceFromId(game.farmId).toNumber()
  const usdValueStaked = new BigNumber(betAmount)
    .times(payToken.symbol === client.chain.nativeCurrency.symbol ? bnbPrice.toString() : tokenPrice)
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
    return new BigNumber(payoutAmount).times(payToken.symbol === client.chain.nativeCurrency.symbol ? bnbPrice.toString() : tokenPrice).toFixed(2)
  }

  const displayPayout = () => {
    const finalPayout = betAmount.times(payoutRate.toString()).div(100).times(multiplier).div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
  }

  const renderGameAction = () => {
    if (playing) {
      return <Animation game={game} gameType="dice" />
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
        {/* dice selector */}
        <>
          <Text color="textSubtle">Select Dice Size.</Text>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            {diceChoices.map((dice) => {
              return (
                <Image
                  key={dice}
                  src={`/images/games/${game.folder}/dice/${dice}-${dice}.png`}
                  width={80}
                  height={80}
                  style={getStyle(dice)}
                  onClick={() => {
                    onSelectDice(dice)
                  }}
                />
              )
            })}
          </Flex>
        </>
        {/* bet choice action */}
        <>
          <Text color="textSubtle">Make your Guess!</Text>
          <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
            <IconButton variant="secondary" onClick={onClickMinus}>
              <MinusIcon color="primary" width="24px" height="24px" />
            </IconButton>
            <Text fontSize="24px">{choiceNumber}</Text>
            <IconButton variant="secondary" onClick={onClickAdd}>
              <AddIcon color="primary" width="24px" height="24px" />
            </IconButton>
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
              onClick={onClickDiceCall}
            >
              Make Call
            </Button>
          </>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{renderGameAction()}</Flex>
}

export default GameAction
