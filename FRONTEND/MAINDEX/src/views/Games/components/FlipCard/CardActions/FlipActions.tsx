import React, { useEffect, useState } from 'react'
import { Flex, Button, useModal, InputProps, Text, Link, Skeleton, BalanceInput } from 'uikit'
import styled from 'styled-components'
import { BIG_ZERO } from 'utils/bigNumber'
import { getAddress } from 'utils/addressHelpers'
import { Game } from 'state/types'
import { usePriceBnbBusd } from 'state/farms/hooks'
import PercentageButton from 'components/PercentageButton'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { useCoinFlipQuick, useCoinFlip } from 'views/Games/hooks/CoinFlipCalls'
import { Animation } from '../../Animation'
import ResultModal from '../modals/resultModal'
import { usePublicClient } from 'wagmi'

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
const FlipAction: React.FC<{
  game: Game
  expanded: boolean
  tokenPrice: number
}> = ({ game, tokenPrice }) => {
  const { maxBetAmount, quickBetAmount, userData, payToken, payoutRate, multipliers, folder } = game

  const { onQuickHeads, onQuickTails } = useCoinFlipQuick(game)
  const { onHeads, onTails } = useCoinFlip(game)
  const [betAmount, setBetAmount] = useState(BIG_ZERO)
  const [viewValue, setViewValue] = useState('0')
  const [qba, setQBA] = useState(BIG_ZERO)
  const [isBalanceZero, setIsBalanceZero] = useState(true)
  const [isHeads, setIsHeads] = useState(undefined)
  const [playing, setPlaying] = useState<boolean>(false)
  const client = usePublicClient({chainId: game.chainId})

  const [onPresentModal] = useModal(<ResultModal isHeads={isHeads} game={game} />, false, true, 'CardFlip')

  const { t } = useTranslation()

  useEffect(() => {
    if (betAmount.eq(BIG_ZERO) || new BigNumber(quickBetAmount) !== qba) {
      setBetAmount(new BigNumber(quickBetAmount))
      setViewValue(new BigNumber(quickBetAmount).shiftedBy(-payToken.decimals).toString())
      setQBA(new BigNumber(quickBetAmount))
    }

    // eslint-disable-next-line
  }, [quickBetAmount])

  useEffect(() => {
    setIsBalanceZero(!userData.balance || new BigNumber(userData.balance).eq(BIG_ZERO))
  }, [userData.balance])

  const onClickQuickHeads = async () => {
    setIsHeads(true)
    setPlaying(true)
    onPresentModal()
    await onQuickHeads()
    setPlaying(false)
  }

  const onClickQuickTails = async () => {
    setIsHeads(false)
    setPlaying(true)
    onPresentModal()
    await onQuickTails()
    setPlaying(false)
  }

  const onClickHeadsManual = async () => {
    setIsHeads(true)
    setPlaying(true)
    onPresentModal()
    await onHeads(betAmount)
    setPlaying(false)
  }

  const onClickTailsManual = async () => {
    setIsHeads(false)
    setPlaying(true)
    onPresentModal()
    await onTails(betAmount)
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
    const maxAvailable = new BigNumber(maxRaw).shiftedBy(-payToken.decimals).toNumber().toString()
    onChangeBet(maxAvailable)
  }

  const dollarPayOut = () => {
    const payoutAmount = displayPayout()
    return new BigNumber(payoutAmount).times(payToken.symbol === client.chain.nativeCurrency.symbol ? bnbPrice.toString() : tokenPrice).toFixed(2)
  }

  const displayPayout = () => {
    const finalPayout = betAmount.times(payoutRate).div(100).times(multipliers.coinFlipM).div(100)
    return finalPayout.shiftedBy(-payToken.decimals).toFixed(2).toString()
  }

  const renderFlipAction = () => {
    if (playing) {
      return <Animation game={game} gameType="coin" />
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
                new BigNumber(betAmount).gt(maxBetAmount) ||
                new BigNumber(betAmount).lt(quickBetAmount)
              }
            />
          </StyledTokenInput>

          <Flex alignItems="center" justifyContent="space-between" mt="8px">
            <PercentageButton
              onClick={() =>
                onChangeBet(
                  new BigNumber(quickBetAmount).shiftedBy(-payToken.decimals).toNumber().toString(),
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
                betAmount.lt(quickBetAmount) ||
                betAmount.gt(maxBetAmount) ||
                betAmount.gt(userData.balance)
              }
              onClick={betAmount.eq(quickBetAmount) ? onClickQuickHeads : onClickHeadsManual}
            >
              <img src={`/images/games/${folder}/coinflip/heads.png`} alt="heads" height="40px" width="40px" /> Call
              Heads <img src={`/images/games/${folder}/coinflip/heads.png`} alt="heads" height="40px" width="40px" />
            </Button>
            <>
              <Button
                style={{ marginTop: '15px' }}
                disabled={
                  betAmount === undefined ||
                  betAmount.lt(quickBetAmount) ||
                  betAmount.gt(maxBetAmount) ||
                  betAmount.gt(userData.balance)
                }
                onClick={betAmount.eq(quickBetAmount) ? onClickQuickTails : onClickTailsManual}
              >
                <img src={`/images/games/${folder}/coinflip/tails.png`} alt="tails" height="40px" width="40px" /> Call
                Tails <img src={`/images/games/${folder}/coinflip/tails.png`} alt="tails" height="40px" width="40px" />
              </Button>
            </>
          </>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{renderFlipAction()}</Flex>
}

export default FlipAction
