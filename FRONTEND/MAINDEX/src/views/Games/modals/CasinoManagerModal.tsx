import React, { useState } from 'react'
import { Modal, Text, Flex, Button, BalanceInput, ButtonMenu, ButtonMenuItem, Skeleton } from 'uikit'
import BigNumber from 'bignumber.js'
import useTheme from 'hooks/useTheme'
import Loading from 'components/Loading'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { Game } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { ActionContainer } from 'views/Pools/components/PoolsTable/ActionPanel/styles'
import { useGetInfo } from '../hooks/CasinoMange'

interface ManageModalProps {
  game: Game
  account: string
  onDismiss?: () => void
}

const ManagerModal: React.FC<ManageModalProps> = ({ game, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }
  const { t } = useTranslation()
  const [newValue, setValue] = useState('0')

  const { quickBetAmount, bnbFee, payToken, potAmount, displayDecimals } = game
  const { onBNBFee, onSendAt, onTicket, onInfo, onPrice, onEW, onPause, onUnpause } = useGetInfo(game)
  const { sendAt } = onInfo()

  const bnbPrice = usePriceBnbBusd(game.dex)

  // const tokenPrice = useBusdPriceFromId(game.farmId).toNumber()
  const tokenPrice = onPrice()

  const loaded =
    quickBetAmount !== undefined &&
    bnbFee !== undefined &&
    sendAt !== undefined &&
    bnbPrice !== undefined &&
    tokenPrice !== undefined

  const getTokenUSD = (amount: BigNumber) => {
    return amount.times(tokenPrice).shiftedBy(-payToken.decimals).toFixed(2)
  }
  const getBNBUSD = (amount: BigNumber) => {
    return amount.times(bnbPrice.toString()).shiftedBy(-18).toFixed(2)
  }

  const onClickEW = () => {
    onEW()
  }
  const onClickP = () => {
    onPause()
  }
  const onClickUP = () => {
    onUnpause()
  }

  const onClickBNB = () => {
    onBNBFee(new BigNumber(newValue).shiftedBy(18).toString())
  }
  const onClickSendAt = () => {
    onSendAt(new BigNumber(newValue).shiftedBy(payToken.decimals).toString())
  }
  const onClickTicket = () => {
    onTicket(new BigNumber(newValue).shiftedBy(payToken.decimals).toString())
  }

  const onChangeNewValue = (value: string) => {
    setValue(value)
  }

  const [changeWhat, setChangeWhat] = useState(0)
  const handleClick = (newIndex: number) => {
    setChangeWhat(newIndex)
  }

  return (
    <Modal
      minWidth="346px"
      title="Casio Manager"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Farm</Text>
        <Text color="primary">{game.CasinoName}</Text>
      </Flex>

      {loaded ? (
        <>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">QuickBet Amount</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text>{new BigNumber(quickBetAmount.toString()).shiftedBy(-payToken.decimals).toFixed(4)}</Text>
              <Text fontSize="10px" color="textSubtle">
                {getTokenUSD(new BigNumber(quickBetAmount.toString()))} USD
              </Text>
            </Flex>
          </Flex>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Pot:</Text>
            {potAmount === undefined ? (
              <Skeleton width="80px" height="16px" />
            ) : (
              <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
                <Text fontSize="14px">
                  {new BigNumber(potAmount.toString()).shiftedBy(-payToken.decimals).toFixed(displayDecimals)}{' '}
                  {payToken.symbol}
                </Text>
                <Text fontSize="10px" color="textSubtle">
                  {new BigNumber(potAmount.toString())
                    .multipliedBy(tokenPrice)
                    .shiftedBy(-payToken.decimals)
                    .toFixed(displayDecimals)}{' '}
                  USD
                </Text>
              </Flex>
            )}
          </Flex>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">BONE Fee:</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text>{new BigNumber(bnbFee.toString()).shiftedBy(-18).toFixed(4)}</Text>
              <Text fontSize="10px" color="textSubtle">
                {getBNBUSD(new BigNumber(bnbFee.toString()))} USD
              </Text>
            </Flex>
          </Flex>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Send Tokens At:</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text>{new BigNumber(sendAt).shiftedBy(-payToken.decimals).toFixed(4)}</Text>
              <Text fontSize="10px" color="textSubtle">
                {getTokenUSD(new BigNumber(sendAt))} USD
              </Text>
            </Flex>
          </Flex>

          <Flex justifyContent="center" alignItems="center" mb="24px">
            <ButtonMenu activeIndex={changeWhat} scale="sm" variant="subtle" onItemClick={handleClick}>
              <ButtonMenuItem as="button">{t('Quick Bet')}</ButtonMenuItem>
              <ButtonMenuItem as="button">{t('BONE Fee')}</ButtonMenuItem>
              <ButtonMenuItem as="button">{t('Send At')}</ButtonMenuItem>
            </ButtonMenu>
          </Flex>

          <Flex alignItems="flex-end" justifyContent="space-around">
            <BalanceInput
              placeholder="0"
              value={newValue}
              onUserInput={onChangeNewValue}
              currencyValue={
                changeWhat !== 1
                  ? getTokenUSD(new BigNumber(newValue).shiftedBy(payToken.decimals))
                  : getBNBUSD(new BigNumber(newValue).shiftedBy(18))
              }
            />
            <Text fontSize="16px">{changeWhat !== 1 ? payToken.symbol : 'BONE'}</Text>
          </Flex>

          <ActionContainer>
            <Button
              width="100%"
              variant="secondary"
              onClick={changeWhat === 0 ? onClickTicket : changeWhat === 1 ? onClickBNB : onClickSendAt}
            >
              {changeWhat === 0 ? 'Set QuickBet' : changeWhat === 1 ? 'Set BONE Fee' : 'Set Send At'}
            </Button>
          </ActionContainer>
          <ActionContainer>
            <Button width="100%" variant="secondary" onClick={onClickEW}>
              Emergency Withdrawl
            </Button>
            <Button width="50%" variant="secondary" onClick={onClickUP}>
              unPause
            </Button>
            <Button width="50%" variant="secondary" onClick={onClickP}>
              Pause
            </Button>
          </ActionContainer>
        </>
      ) : (
        <Loading />
      )}
      <Button width="100%" variant="secondary" onClick={handleDismiss}>
        Close
      </Button>
    </Modal>
  )
}

export default ManagerModal
