import React, { useEffect, useState } from 'react'
import { Flex, Button, useModal, InputProps, BalanceInput, Heading, Text, Skeleton } from 'uikit'
import { getAddress } from 'utils/addressHelpers'
import { Game } from 'state/types'
import { useScratcher } from 'views/Games/hooks/scratcher'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { usePriceBnbBusd } from 'state/farms/hooks'
import styled from 'styled-components'
import PercentageButton from 'components/PercentageButton'
import Balance from 'components/Balance'
import ResultModal from '../modals/resultModal'

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

const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradients.gold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

// eslint-disable-next-line
const FlipAction: React.FC<{
  game: Game
}> = ({ game }) => {
  const { scratcher, displayDecimals } = game
  const tokenAddress = getAddress(game.payToken.address, game.chainId)

  const { onScratch, onFPs } = useScratcher(game)
  const { minBet, maxBet, avlFunds, safetyM, multipliers } = scratcher
  const [playing, setPlaying] = useState<boolean>(false)

  const [betAmount, setBetAmount] = useState(BIG_ZERO)
  const [viewValue, setViewValue] = useState('0')
  const [isBalanceZero, setIsBalanceZero] = useState(true)
  const [isSetup, setIsSetup] = useState(false)
  const { freePlays, valueOfNext } = onFPs()

  const { balance: bnbBalance } = useGetBnbBalance(game.chainId)

  const bnbPrice = usePriceBnbBusd(game.dex)
  const notEnoughFunds = betAmount.multipliedBy(safetyM.toString()).gt(avlFunds.toString())

  const usdValueStaked = new BigNumber(betAmount).times(bnbPrice.toString()).shiftedBy(-18).toFixed(2)
  const prizeTotal = scratcher
    ? betAmount
        .multipliedBy(multipliers[multipliers.length - 1].toString())
        .multipliedBy(bnbPrice.toString())
        .shiftedBy(-18)
        .toNumber()
    : 0

  useEffect(() => {
    if (!isSetup && betAmount.eq(BIG_ZERO) && new BigNumber(bnbPrice.toString()).gt(0)) {
      handleBetChange(2)
      setIsSetup(true)
    }

    // eslint-disable-next-line
  }, [bnbPrice])

  useEffect(() => {
    setIsBalanceZero(!bnbBalance || new BigNumber(bnbBalance.toString()).eq(BIG_ZERO))
  }, [bnbBalance])

  const [onPresentModal] = useModal(<ResultModal game={game} />, false, true, 'Scratcher')

  const onClickScratch = async () => {
    setPlaying(true)
    onPresentModal()
    await onScratch(tokenAddress, betAmount.toString())
    setPlaying(false)
  }

  const onClickFreePlay = async () => {
    setPlaying(true)
    onPresentModal()
    await onScratch(tokenAddress, '0')
    setPlaying(false)
  }

  const onChangeBet = (value: string) => {
    setBetAmount(new BigNumber(value).shiftedBy(18))
    setViewValue(value)
  }

  const handleBetChange = (value: number) => {
    const quantity = new BigNumber(value).dividedBy(bnbPrice.toString()).toFixed(5).toString()
    const actualMinBet = new BigNumber(minBet.toString()).shiftedBy(-18).toFixed(5).toString()
    if (new BigNumber(quantity).lt(actualMinBet)) onChangeBet(actualMinBet)
    else onChangeBet(quantity)
  }

  const renderFlipAction = () => {
    if (playing) {
      return (
        <Flex dir="row" justifyContent="space-evenly">
          <img src={`/images/games/${game.folder}/scratchers/scratching.gif`} alt="Scratching" />
        </Flex>
      )
    }
    return (
      <>
        <>
          <Heading textAlign="center" color="body" scale="lg">
            WIN UP TO
            <br />
          </Heading>
          <PrizeTotalBalance
            fontSize="64px"
            bold
            prefix="$"
            value={prizeTotal}
            mb="8px"
            decimals={2}
            textAlign="center"
          />
          <Heading textAlign="center" color="body" scale="lg">
            {`BONE or ${game.payToken.symbol}`}
          </Heading>

          <StyledTokenInput isWarning={isBalanceZero}>
            <BalanceInput
              placeholder="0.00"
              value={viewValue}
              unit="BONE"
              onUserInput={onChangeBet}
              currencyValue={new BigNumber(bnbPrice.toString()).gt(0) && `~${usdValueStaked || 0} USD`}
              decimals={18}
              isWarning={
                new BigNumber(betAmount).gt(maxBet.toString()) || new BigNumber(betAmount).lt(minBet.toString())
              }
            />
          </StyledTokenInput>

          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Your BONE Balance:</Text>
            {bnbBalance === undefined ? (
              <Skeleton width="80px" height="16px" />
            ) : (
              <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
                <Text fontSize="14px">
                  {new BigNumber(bnbBalance.toString()).shiftedBy(-18).toFixed(displayDecimals)} BONE{' '}
                </Text>
                <Text fontSize="10px" color="textSubtle">
                  {new BigNumber(bnbBalance.toString())
                    .multipliedBy(bnbPrice.toString())
                    .shiftedBy(-18)
                    .toFixed(displayDecimals)}{' '}
                  USD
                </Text>
              </Flex>
            )}
          </Flex>

          <Flex alignItems="center" justifyContent="space-between" mt="8px">
            <PercentageButton onClick={() => handleBetChange(2)}>2$</PercentageButton>
            <PercentageButton onClick={() => handleBetChange(5)}>5$</PercentageButton>
            <PercentageButton onClick={() => handleBetChange(10)}>10$</PercentageButton>
            <PercentageButton onClick={() => handleBetChange(20)}>20$</PercentageButton>
          </Flex>
        </>
        <Button
          style={{ marginTop: '15px' }}
          disabled={
            betAmount === undefined ||
            new BigNumber(betAmount).lt(minBet.toString()) ||
            new BigNumber(betAmount).gt(maxBet.toString()) ||
            new BigNumber(betAmount).gt(bnbBalance.toString()) ||
            notEnoughFunds
          }
          onClick={onClickScratch}
        >
          {notEnoughFunds ? 'Out of Stock' : 'Buy Scratcher'}
        </Button>
        {freePlays > 0 && (
          <Button style={{ marginTop: '15px' }} onClick={onClickFreePlay}>
            {`$${new BigNumber(valueOfNext)
              .multipliedBy(bnbPrice.toString())
              .shiftedBy(-18)
              .toFixed(0)} Free Play (${freePlays.toString()})`}
          </Button>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{renderFlipAction()}</Flex>
}

export default FlipAction
