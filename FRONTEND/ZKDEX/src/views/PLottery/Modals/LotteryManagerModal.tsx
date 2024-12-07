import React, { useState } from 'react'
import {
  Modal,
  Text,
  Flex,
  Button,
  Skeleton,
  IconButton,
  MinusIcon,
  AddIcon,
  BalanceInput,
  ButtonMenu,
  ButtonMenuItem,
} from 'uikit'
import useTheme from 'hooks/useTheme'
import contracts from 'config/constants/contracts'
import { PLottery } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { ActionContainer, ActionContent } from 'views/Pools/components/PoolsTable/ActionPanel/styles'
import { useManagerCalls } from '../hooks/ManagerCalls'
import { usePublicClient } from 'wagmi'

interface LotteryKeeperModalProps {
  account: string
  plottery: PLottery
  lottoPrice: BigNumber
  onDismiss?: () => void
}

const LotteryKeeperModal: React.FC<LotteryKeeperModalProps> = ({ account, plottery, lottoPrice, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }
  const { t } = useTranslation()
  const { onInfo, onExtend, onADA, onTCost, onDF, onTicketFee, onDraw } = useManagerCalls(plottery)
  const [addDraws, setAddDraws] = useState(4)
  const { draws: drawsRaw, price: priceRaw, bnbFee: bnbFeeRaw, step: stepRaw, chainId } = plottery
  const draws = new BigNumber(drawsRaw)
  const price = new BigNumber(priceRaw)
  const bnbFee = new BigNumber(bnbFeeRaw)
  const step = new BigNumber(stepRaw)
  const { ticketFee } = onInfo()
  const client = usePublicClient({chainId})
  const nativeSym = client.chain.nativeCurrency.symbol

  const { lotteryToken } = plottery
  const isFarm = account === getAddress(contracts.farmWallet, plottery.chainId)
  const isKeeperOwner = account === getAddress(contracts.lotteryOwner, plottery.chainId)
  const isAdmin = isFarm || isKeeperOwner

  const [ticketCost, setTicketCost] = useState('0')
  const [drawFee, setDrawFee] = useState('0')
  const [ticketFeebnb, setTicketFeeBNB] = useState('0')
  const [changeWhat, setChangeWhat] = useState(isFarm ? 2 : 0)

  const ticketPrice = new BigNumber(price).times(lottoPrice)

  const bnbPriceRaw = usePriceBnbBusd(plottery.dex)
  const bnbPrice = new BigNumber(bnbPriceRaw.toString())

  const getStepsMessage = () => {
    if (new BigNumber(step).eq(0)) return 'Lottery Is Paused'
    if (new BigNumber(step).eq(1)) return 'Close Lottery'
    if (new BigNumber(step).eq(2)) return 'Draw Final #'
    if (new BigNumber(step).eq(3)) return 'Start Next Draw'
    return 'error'
  }

  const newTicketCostUsd = new BigNumber(ticketCost)
    .shiftedBy(lotteryToken.decimals)
    .times(lotteryToken.symbol === client.chain.nativeCurrency.symbol ? bnbPrice : lottoPrice)
    .shiftedBy(-lotteryToken.decimals)
    .toFixed(2)
  const newDrawCostUsd = new BigNumber(changeWhat === 1 ? drawFee : ticketFeebnb).times(bnbPrice).toFixed(2)

  const ticketFeeUSD = new BigNumber(ticketFee).shiftedBy(-18).times(bnbPrice).toFixed(2)

  
  
  const isTime = Date.now() / 1000 > new BigNumber(plottery.upKeepTime.toString()).toNumber()
  const timeLeft = (new BigNumber(plottery.upKeepTime.toString()).toNumber() - Date.now() / 1000) / 60

  const onClickTicketCost = () => {
    onTCost(new BigNumber(ticketCost).shiftedBy(lotteryToken.decimals).toString())
  }
  const onClickDrawFee = () => {
    onDF(new BigNumber(drawFee).shiftedBy(18).toString())
  }
  const onClickTicketFee = () => {
    onTicketFee(new BigNumber(ticketFeebnb).shiftedBy(18).toString())
  }

  const onAddDraws = () => {
    onExtend(addDraws, new BigNumber(bnbFee).multipliedBy(addDraws).toString())
  }

  const onDoDraw = () => {
    onDraw()
  }

  const onAddDrawsAdmin = () => {
    onADA(addDraws)
  }

  const onClickAdd = () => {
    const newAdd = addDraws + 1
    setAddDraws(newAdd)
  }
  const onClickMinus = () => {
    let newAdd = addDraws - 1
    if (newAdd < 1) {
      newAdd = 1
    }
    setAddDraws(newAdd)
  }

  const onChangeCost = (value: string) => {
    setTicketCost(value)
  }
  const onChangeDrawFee = (value: string) => {
    setDrawFee(value)
  }
  const onChangeTicketFee = (value: string) => {
    setTicketFeeBNB(value)
  }

  const handleClick = (newIndex: number) => {
    setChangeWhat(newIndex)
  }

  return (
    <Modal
      minWidth="346px"
      title="Lottery Manager"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Lottery:</Text>
        <Text color="primary">{lotteryToken.name}</Text>
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text>Draw Left:</Text>
        {!draws ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex flexDirection="column" justifyContent="space-between" alignItems="center">
              <Text>{new BigNumber(draws).toNumber()} Draws</Text>
            </Flex>
          </>
        )}
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text>Ticket Price</Text>
        {!ticketPrice ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
              <Text>
                {new BigNumber(price).shiftedBy(-lotteryToken.decimals).toNumber()} {lotteryToken.symbol}{' '}
              </Text>
              <Text fontSize="14x" color="secondary">
                $ {ticketPrice.shiftedBy(-lotteryToken.decimals).toFixed(2)}{' '}
              </Text>
            </Flex>
          </>
        )}
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text>{`${nativeSym} Fee Per Draw:`}</Text>
        {!bnbPrice ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
              <Text>{`${new BigNumber(bnbFee).shiftedBy(-18).toFixed(3)} ${nativeSym}`} </Text>
              <Text fontSize="14x" color="secondary">
                ~$ {new BigNumber(bnbFee).multipliedBy(bnbPrice).shiftedBy(-18).toFixed(2)}
              </Text>
            </Flex>
          </>
        )}
      </Flex>

      {isAdmin && (
        <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
          <Text>{`Ticket Fee ${nativeSym}`}</Text>
          {!ticketFeeUSD ? (
            <Skeleton width="80px" height="16px" />
          ) : (
            <>
              <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
                <Text>{`${new BigNumber(ticketFee).shiftedBy(-18).toNumber()} ${nativeSym}`} </Text>
                <Text fontSize="14x" color="secondary">
                  $ {ticketFeeUSD}{' '}
                </Text>
              </Flex>
            </>
          )}
        </Flex>
      )}

      <ActionContainer>
        <Text fontSize="18px" color="secondary" textAlign="center">
          Number of Draws to Add.
        </Text>
        <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
          <IconButton variant="secondary" onClick={onClickMinus}>
            <MinusIcon color="primary" width="24px" height="24px" />
          </IconButton>

          <Flex flexDirection="column" justifyContent="space-between" alignItems="center">
            <Text fontSize="20px">{addDraws}</Text>
            {isKeeperOwner ? (
              <Text fontSize="12px">ADMIN</Text>
            ) : !bnbPrice ? (
              <Skeleton width="80px" height="16px" />
            ) : (
              <>
                <Text fontSize="12px">
                  {`${new BigNumber(bnbFee).shiftedBy(-18).multipliedBy(addDraws).toFixed(3)} ${nativeSym}`}
                </Text>
                <Text fontSize="12px" color="secondary">
                  ~$ {new BigNumber(bnbFee).multipliedBy(bnbPrice).shiftedBy(-18).multipliedBy(addDraws).toFixed(2)}
                </Text>
              </>
            )}
          </Flex>
          <IconButton variant="secondary" onClick={onClickAdd}>
            <AddIcon color="primary" width="24px" height="24px" />
          </IconButton>
        </Flex>
        <ActionContent>
          <Button width="100%" variant="secondary" onClick={!isKeeperOwner ? onAddDraws : onAddDrawsAdmin}>
            Extend Lottery {addDraws} Draws
          </Button>
        </ActionContent>
      </ActionContainer>

      {isAdmin && (
        <>
        {isKeeperOwner ? (
          <Flex justifyContent="center" alignItems="center" mb="24px">
            <ButtonMenu activeIndex={changeWhat} scale="sm" variant="subtle" onItemClick={handleClick}>
              <ButtonMenuItem as="button">{t('Ticket Price..')}</ButtonMenuItem>
              <ButtonMenuItem as="button">{t('Draw Fee')}</ButtonMenuItem>
            </ButtonMenu>
          </Flex>
        ) : isFarm && (
          <Text>Change Ticket Fee:</Text>
        )}

          <ActionContainer>
            <Flex alignItems="flex-end" justifyContent="space-around">
              <BalanceInput
                placeholder="0.00"
                value={changeWhat === 0 ? ticketCost : changeWhat === 1 ? drawFee : ticketFeebnb}
                onUserInput={changeWhat === 0 ? onChangeCost : changeWhat === 1 ? onChangeDrawFee : onChangeTicketFee}
                currencyValue={
                  lottoPrice.toNumber() !== 0 && `~${changeWhat === 0 ? newTicketCostUsd : newDrawCostUsd || 0} USD`
                }
                decimals={changeWhat === 0 ? lotteryToken.decimals : 18}
              />
              <Text fontSize="16px">{changeWhat === 0 ? lotteryToken.symbol : nativeSym}</Text>
            </Flex>

            <>
              <ActionContent>
                <Button
                  width="100%"
                  variant="primary"
                  disabled={ticketCost === undefined}
                  onClick={changeWhat === 0 ? onClickTicketCost : changeWhat === 1 ? onClickDrawFee : onClickTicketFee}
                >
                  {changeWhat === 0 ? 'Change Ticket Cost' : changeWhat === 1 ? 'Change Draw Fee' : 'Change Ticket Fee'}
                </Button>
              </ActionContent>
            </>
          </ActionContainer>
        </>
      )}
      
      {isKeeperOwner && (
        <ActionContent>
          <Button width="100%" variant="secondary" onClick={onDoDraw} disabled={!isTime}>
            {isTime ? getStepsMessage() : `${timeLeft.toFixed(2)} mins`}
          </Button>
        </ActionContent>
      )}

      <ActionContent>
        <Button width="100%" variant="secondary" onClick={handleDismiss}>
          Close
        </Button>
      </ActionContent>
    </Modal>
  )
}

export default LotteryKeeperModal
