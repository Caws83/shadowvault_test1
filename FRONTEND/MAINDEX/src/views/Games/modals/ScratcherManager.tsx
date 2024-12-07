import React, { useState } from 'react'
import {
  Modal,
  Text,
  Flex,
  Button,
  BalanceInput,
  ButtonMenu,
  ButtonMenuItem,
  IconButton,
  AddIcon,
  MinusIcon,
} from 'uikit'
import BigNumber from 'bignumber.js'
import useTheme from 'hooks/useTheme'
import Loading from 'components/Loading'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { Game } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { ActionContainer } from 'views/Pools/components/PoolsTable/ActionPanel/styles'
import { useScratcher } from '../hooks/scratcher'

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

  const { avlFunds, jackPotChance, jackPotCost, chances, multipliers, totalChance, safetyM } = game.scratcher
  const { onCJackCost, onJackChance, onScratchChance, onSafetyM } = useScratcher(game)

  const bnbPrice = usePriceBnbBusd(game.dex)

  const overAllChance = new BigNumber(totalChance.toString())
    .minus(chances[0].toString())
    .dividedBy(totalChance.toString())
    .multipliedBy(100)

  const getNewChance = () => {
    const winnersTotal = new BigNumber(totalChance.toString()).minus(chances[0].toString())
    const newTotal = winnersTotal.plus(JackChance)
    const NewOverallChance = winnersTotal.dividedBy(newTotal).multipliedBy(100)
    return NewOverallChance
  }

  const [JackChance, setJackChance] = useState(new BigNumber(jackPotChance.toString()).toNumber())

  const onClickAdd = () => {
    const modifier = changeWhat === 3 ? 1 : 10
    let newJackChance = JackChance + modifier
    if (newJackChance > 2000) newJackChance = 2000
    setJackChance(newJackChance)
  }

  const onClickMinus = () => {
    const modifier = changeWhat === 3 ? 1 : 10
    let newJackChance = JackChance - modifier
    if (newJackChance < 1) {
      newJackChance = modifier
    }
    setJackChance(newJackChance)
  }

  const loaded =
    jackPotChance !== undefined && jackPotCost !== undefined && avlFunds !== undefined && bnbPrice !== undefined

  const getBNBUSD = (amount: BigNumber) => {
    return amount.times(bnbPrice.toString()).shiftedBy(-18).toFixed(2)
  }

  const onClickJackCost = () => {
    onCJackCost(new BigNumber(newValue).shiftedBy(18).toString())
  }
  const onClickJackChance = () => {
    onJackChance(JackChance)
  }
  const onClickScratchChance = () => {
    onScratchChance(JackChance)
  }
  const onClickSafetyM = () => {
    onSafetyM(JackChance)
  }

  const onChangeNewValue = (value: string) => {
    setValue(value)
  }

  const [changeWhat, setChangeWhat] = useState(0)
  const handleClick = (newIndex: number) => {
    setChangeWhat(newIndex)
    if (newIndex === 1) setJackChance(new BigNumber(jackPotChance.toString()).toNumber())
    if (newIndex === 2) setJackChance(new BigNumber(chances[0].toString()).toNumber())
    if (newIndex === 3) setJackChance(new BigNumber(safetyM.toString()).toNumber())
  }

  const handleSubmit = () => {
    if (changeWhat === 0) onClickJackCost()
    if (changeWhat === 1) onClickJackChance()
    if (changeWhat === 2) onClickScratchChance()
    if (changeWhat === 3) onClickSafetyM()
  }
  const getMsg = () => {
    if (changeWhat === 0) return 'Set Jack Pot Cost'
    if (changeWhat === 1) return 'Set Jack Pot Chance'
    if (changeWhat === 2) return 'Set Scratcher Chance'
    return 'Set Safety Multiplier'
  }

  const getKey = (index) => {
    return index.toString()
  }

  const getReturn = (m: number) => {
    const msg = `${m.toString()}X________`
    if (m === 3) return 'FreePlay'
    if (m === 5) return 'Free NFT'

    return msg.substring(0, 7)
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
            <Text color="textSubtle">AVL Scratcher Funds:</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text>{new BigNumber(avlFunds.toString()).shiftedBy(-18).toFixed(4)}</Text>
              <Text fontSize="10px" color="textSubtle">
                {getBNBUSD(new BigNumber(avlFunds.toString()))} USD
              </Text>
            </Flex>
          </Flex>

          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Chance of Winning:</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text color="textSubtle">{overAllChance.toFixed(2)} </Text>
            </Flex>
          </Flex>

          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Safety Multiplier:</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text color="textSubtle">{safetyM.toString()} </Text>
            </Flex>
          </Flex>

          <Text color="textSubtle">Chances:</Text>
          <Flex flexDirection="column" justifyContent="flex-end">
            {chances.map((c, index) => {
              return (
                <Flex key={getKey(index)} flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text>{`${getReturn(new BigNumber(multipliers[index].toString()).toNumber())}:`}</Text>
                  <Text>{`${new BigNumber(c.toString()).toNumber()}`}</Text>
                  <Text>{`${new BigNumber(c.toString())
                    .dividedBy(totalChance.toString())
                    .multipliedBy(100)
                    .toFixed(2)} %`}</Text>
                </Flex>
              )
            })}
          </Flex>

          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">JackPot Cost:</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text>{new BigNumber(jackPotCost.toString()).shiftedBy(-18).toFixed(4)}</Text>
              <Text fontSize="10px" color="textSubtle">
                {getBNBUSD(new BigNumber(jackPotCost.toString()))} USD
              </Text>
            </Flex>
          </Flex>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">JackPot Chance:</Text>
            <Flex flexDirection="column" justifyContent="flex-end">
              <Text>{`${new BigNumber(jackPotChance.toString()).toNumber()} | ${new BigNumber(1)
                .dividedBy(jackPotChance.toString())
                .multipliedBy(100)
                .toFixed(2)} %`}</Text>
            </Flex>
          </Flex>

          <Flex justifyContent="center" alignItems="center" mb="24px">
            <ButtonMenu activeIndex={changeWhat} scale="sm" variant="subtle" onItemClick={handleClick}>
              <ButtonMenuItem as="button">{t('JP Cost')}</ButtonMenuItem>
              <ButtonMenuItem as="button">{t('JP Chance')}</ButtonMenuItem>
              <ButtonMenuItem as="button">{t('Scratch Chance')}</ButtonMenuItem>
              <ButtonMenuItem as="button">{t('Safety')}</ButtonMenuItem>
            </ButtonMenu>
          </Flex>
          {changeWhat === 0 ? (
            <Flex alignItems="flex-end" justifyContent="space-around">
              <BalanceInput
                placeholder="0"
                value={newValue}
                onUserInput={onChangeNewValue}
                currencyValue={getBNBUSD(new BigNumber(newValue).shiftedBy(18))}
              />
              <Text fontSize="16px">BONE</Text>
            </Flex>
          ) : (
            <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
              <IconButton variant="secondary" onClick={onClickMinus}>
                <MinusIcon color="primary" width="24px" height="24px" />
              </IconButton>
              <Text fontSize="24px">{JackChance}</Text>
              <IconButton variant="secondary" onClick={onClickAdd}>
                <AddIcon color="primary" width="24px" height="24px" />
              </IconButton>
            </Flex>
          )}
          <ActionContainer>
            <Button width="100%" variant="secondary" onClick={handleSubmit}>
              {getMsg()}
            </Button>
            {changeWhat === 2 && <Text>{`NewChance: ${getNewChance().toFixed(2)}`}</Text>}
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
