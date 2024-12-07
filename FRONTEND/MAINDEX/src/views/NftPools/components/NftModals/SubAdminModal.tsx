import React, { useEffect, useState } from 'react'
import { Modal, Text, Flex, Button, Skeleton, IconButton, AddIcon, MinusIcon, TimerIcon, Link } from 'uikit'
import useTheme from 'hooks/useTheme'
import { NFTPool } from 'state/types'
import BigNumber from 'bignumber.js'
import Balance from 'components/Balance'
import { getBscScanLink } from 'utils'
import { ActionContainer, ActionContent } from '../NftPoolsTable/ActionPanel/styles'
import { useSubAdmin } from './hooks/SubCalls'

import { useExtraTokens } from './hooks/ExtraTokenCalls'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { useAccount, usePublicClient } from 'wagmi'
import QuestionHelper from 'components/QuestionHelper'
import CopyAddress from 'components/Menu/UserMenu/CopyAddress'
import { BASE_URL } from 'config'

interface SubAdminModalProps {
  pool: NFTPool
  earningTokenPrice: BigNumber
  currentBlock: number
  onDismiss?: () => void
}

const SubAdminModal: React.FC<SubAdminModalProps> = ({ pool, earningTokenPrice, currentBlock, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }

  const { onInfo2, onRenew, onExtend, onIncrease, onStart } = useSubAdmin(pool)
  const { onER } = useExtraTokens(pool)
  const { stakingToken, earningToken, endBlock, totalStaked, currentRound, contractAddress } = pool
  const round = new BigNumber(currentRound).toNumber()
  const currentRToken = earningToken[round]
  const poolAddress = getAddress(contractAddress, pool.chainId)
  const newReward = onER()
  const { rpb1, subFee, subEnd, days } = onInfo2()
  const { address: account } = useAccount()
  const client = usePublicClient({chainId: pool.chainId})
  const nativeSym = client.chain.nativeCurrency.symbol

  const onClickRenew = () => {
    onRenew(new BigNumber(subFee))
  }
  const onClickExtend = () => {
    onExtend()
  }
  const onClickIncrease = () => {
    onIncrease()
  }
  const onClickStart = () => {
    onStart(startIn, howLong)
  }

  const [startIn, setStartIn] = useState(1)
  const [howLong, setHowLong] = useState(0)
  useEffect(() => {
    if(howLong === 0 && days) setHowLong(days.toNumber() - 1) 
  }, [days, howLong])

  const onClickAdd = () => {
    const newStartIn = startIn + 1
    setStartIn(newStartIn)
    if(account !== getAddress(contracts.farmWallet, pool.chainId)) setHowLong(days.toNumber() - newStartIn)

  }
  const onClickMinus = () => {
    let newStartIn = startIn - 1
    if (newStartIn < 0) {
      newStartIn = 0
    }
    setStartIn(newStartIn)
    if(account !== getAddress(contracts.farmWallet, pool.chainId)) setHowLong(days.toNumber() - newStartIn)

  }

  const onClickAdd2 = () => {
    const newHowLong = howLong + 1
    if(newHowLong + startIn > days.toNumber() && account !== getAddress(contracts.farmWallet, pool.chainId)) return
    setHowLong(newHowLong)
  }
  const onClickMinus2 = () => {
    let newHowLong = howLong - 1
    if (newHowLong < 1) {
      newHowLong = 1
    }
    setHowLong(newHowLong)
  }

  const getExtendedDays = () => {
    const rpb = new BigNumber(rpb1).shiftedBy(-currentRToken.decimals)
    return new BigNumber(newReward).shiftedBy(-currentRToken.decimals).dividedBy(rpb).dividedBy(86400).toFixed(1)
  }

  const getNewApr = () => {
    const rpb = new BigNumber(rpb1)
    const addedRPB = new BigNumber(newReward).dividedBy(endBlock - currentBlock)
    const newRPB = rpb.plus(addedRPB).shiftedBy(-currentRToken.decimals).toString()
    const apr = !isFinished ? new BigNumber(newRPB).multipliedBy(86400).dividedBy(totalStaked).toNumber() : 0
    return apr
  }

  const isFinished = endBlock < currentBlock
  const subFinished = new BigNumber(subEnd).toNumber() < currentBlock
  const rewards = newReward && earningTokenPrice
  const canGetAPR = rpb1 && earningTokenPrice
  const daysLoaded = days !== undefined

  const directLink = `${BASE_URL}#/nftpools?search=${stakingToken.symbol}`


  return (
    <Modal
      minWidth="346px"
      title="Pool Management Page"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Pool Tokens:</Text>
        <Text color="primary">
          {stakingToken.symbol} / {currentRToken.symbol}{' '}
        </Text>
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Pool Ends in:</Text>
        {isFinished ? (
          <Text>is Finished</Text>
        ) : (
          <Flex alignItems="center">
            <Flex flex="1">
              <Link external href={getBscScanLink(endBlock, 'countdown', pool.chainId)} onClick={(e) => e.stopPropagation()}>
                <Flex flex="1.3">
                  <Text>
                    {new BigNumber(
                      new BigNumber(endBlock).minus(new BigNumber(currentBlock)).dividedBy(86400).toFixed(2),
                    ).toNumber()}{' '}
                  </Text>
                  <Text ml="4px" textTransform="lowercase">
                    Days
                  </Text>
                </Flex>

                <TimerIcon ml="4px" />
              </Link>
            </Flex>
          </Flex>
        )}
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text color="textSubtle">Tokens Avl:</Text>
        {!rewards ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
              <Text>
                {new BigNumber(newReward).shiftedBy(-currentRToken.decimals).toFixed(4)} {currentRToken.symbol}
              </Text>
              <Text fontSize="14x" color="secondary">
                $ {new BigNumber(newReward).times(earningTokenPrice).shiftedBy(-currentRToken.decimals).toFixed(3)}{' '}
              </Text>
            </Flex>
          </>
        )}
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text color="textSubtle">Sub End:</Text>
        {subFinished ? (
          <Text>Subscription Ended</Text>
        ) : (
          <Flex alignItems="flex-end">
            <Flex flex="1">
              <Flex flex="1.3">
                <Balance
                  fontSize="16px"
                  value={new BigNumber(
                    new BigNumber(subEnd).minus(new BigNumber(currentBlock)).dividedBy(86400).toFixed(2),
                  ).toNumber()}
                  decimals={0}
                />
                <Text ml="4px" textTransform="lowercase">
                  Days
                </Text>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text color="textSubtle">Sub Fee:</Text>
        {!subFee ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Text>{`${new BigNumber(subFee).shiftedBy(-18).toFixed(3)} ${nativeSym}`}</Text>
        )}
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text color="textSubtle">Renew Extension:</Text>
        {!days ? <Skeleton width="80px" height="16px" /> : <Text>{new BigNumber(days).toNumber()} Days</Text>}
      </Flex>
      <Flex flexDirection="row">
        <QuestionHelper
          text={
            <>
              <Text>Before starting, extending or</Text>
              <Text>increasing APR. Send tokens to</Text>
              <Text>the address below in your wallet.</Text>
              <Text>Tokens Avl: displays amount that</Text>
              <Text>will be used.</Text>
            </>
          }
          ml="4px"
        />
        <Text>Send Reward Tokens To address below.</Text>
      </Flex>

      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
        Pool Address
      </Text>
      <CopyAddress account={poolAddress} mb="24px" />

      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
        Direct Link
      </Text>
      <CopyAddress account={directLink} mb="24px" />

      {!isFinished ? (
        <ActionContainer>
          <ActionContent>
            <Button width="100%" variant="tertiary" onClick={onClickExtend} disabled={new BigNumber(newReward).lt(1)}>
              {` Extend ${newReward && rpb1 ? getExtendedDays() : 0} Days`}
            </Button>

            <Button width="100%" variant="tertiary" onClick={onClickIncrease} disabled={new BigNumber(newReward).lt(1)}>
              {`Increase to ${canGetAPR ? new BigNumber(getNewApr()).toFixed(1) : 0} ${currentRToken.symbol} PDPT`}
            </Button>
          </ActionContent>
        </ActionContainer>
      ) : (
        <>
          <ActionContainer>
            <Text fontSize="18px" color="secondary" textAlign="center">
              How Many Days Till it Starts!
            </Text>
            <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
              <IconButton variant="secondary" onClick={onClickMinus}>
                <MinusIcon color="primary" width="24px" height="24px" />
              </IconButton>
              <Text fontSize="24px">{startIn}</Text>
              <IconButton variant="secondary" onClick={onClickAdd}>
                <AddIcon color="primary" width="24px" height="24px" />
              </IconButton>
            </Flex>
            <Text fontSize="18px" color="secondary" textAlign="center">
              How Many Days to Run for!
            </Text>
            <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
              <IconButton variant="secondary" onClick={onClickMinus2}>
                <MinusIcon color="primary" width="24px" height="24px" />
              </IconButton>
              <Text fontSize="24px">{howLong}</Text>
              <IconButton variant="secondary" onClick={onClickAdd2}>
                <AddIcon color="primary" width="24px" height="24px" />
              </IconButton>
            </Flex>
            <ActionContent>
            <Button width="100%" variant="primary" onClick={onClickStart} disabled={new BigNumber(newReward).lt(1)}>
                Start New Pool
              </Button>
            </ActionContent>
          </ActionContainer>
        </>
      )}

      <ActionContainer>
        <ActionContent>
          <Button width="100%" variant="primary" onClick={onClickRenew}>
            {`Extend Sub ${daysLoaded ? days : 0} days`}
          </Button>
        </ActionContent>
      </ActionContainer>
      <Button width="100%" variant="secondary" onClick={handleDismiss}>
        Close
      </Button>
    </Modal>
  )
}

export default SubAdminModal
