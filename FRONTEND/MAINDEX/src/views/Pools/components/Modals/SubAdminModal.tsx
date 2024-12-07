import React, { useEffect, useState } from 'react'
import { Modal, Text, Flex, Button, Skeleton, IconButton, AddIcon, MinusIcon, TimerIcon, Link } from 'uikit'
import useTheme from 'hooks/useTheme'
import { Pool } from 'state/types'
import BigNumber from 'bignumber.js'
import Balance from 'components/Balance'
import QuestionHelper from 'components/QuestionHelper'
import { getBscScanLink } from 'utils'
import { getPoolApr } from 'utils/apr'
import { getBalanceNumber } from 'utils/formatBalance'
import { getAddress } from 'utils/addressHelpers'
import { BASE_URL } from 'config'
import contracts from 'config/constants/contracts'
import { ActionContainer, ActionContent } from '../PoolsTable/ActionPanel/styles'
import { useSubAdmin } from './hooks/SubCalls'
import { useAccount, usePublicClient } from 'wagmi'
import { useExtraTokens } from './hooks/ExtraTokenCalls'
import CopyAddress from './CopyAddress'
import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-gap: 16px 8px;

  margin-bottom: 30px;
  grid-template-columns: repeat(2, auto);
`

interface SubAdminModalProps {
  pool: Pool
  currentBlock: number
  onDismiss?: () => void
}

const SubAdminModal: React.FC<SubAdminModalProps> = ({ pool, currentBlock, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }

  // const { currentBlock } = useBlock()
  const { onInfo2, onRenew, onExtend, onIncrease, onStart } = useSubAdmin(pool)
  const { onER } = useExtraTokens(pool)
  const { stakingToken, earningToken, earningTokenPrice, stakingTokenPrice, endBlock, totalStaked, contractAddress } = pool

  const poolAddress = getAddress(contractAddress, pool.chainId)
  const newReward = onER()
  const { rpb1, subFee, subEnd, days } = onInfo2()
  const { address: account } = useAccount()
  const client = usePublicClient({chainId: pool.chainId})
  const nativeSym = client.chain.nativeCurrency.symbol

  const onClickRenew = () => {
    onRenew(new BigNumber(subFee).toString())
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
    const rpb = new BigNumber(rpb1).shiftedBy(-earningToken.decimals)
    return new BigNumber(newReward).shiftedBy(-earningToken.decimals).dividedBy(rpb).dividedBy(86400).toFixed(1)
  }

  const getNewApr = () => {
    const rpb = new BigNumber(rpb1)
    const addedRPB = new BigNumber(newReward).dividedBy(endBlock - currentBlock)
    const newRPB = rpb.plus(addedRPB).shiftedBy(-earningToken.decimals).toString()
    const apr = !isFinished
      ? getPoolApr(
          stakingTokenPrice,
          earningTokenPrice,
          getBalanceNumber(new BigNumber(totalStaked), stakingToken.decimals),
          parseFloat(newRPB),
        )
      : 0
    return apr
  }

  const isFinished = endBlock < currentBlock
  const subFinished = new BigNumber(subEnd).toNumber() < currentBlock
  const rewards = newReward && earningTokenPrice
  const canGetAPR = rpb1 && stakingTokenPrice && earningTokenPrice
  const daysLoaded = days !== undefined

  const directLink = `${BASE_URL}#/pools?search=${earningToken.symbol}`

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
          {stakingToken.symbol} / {earningToken.symbol}{' '}
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
                {new BigNumber(newReward).shiftedBy(-earningToken.decimals).toFixed(4)} {earningToken.symbol}
              </Text>
              <Text fontSize="14x" color="secondary">
                $ {new BigNumber(newReward).times(earningTokenPrice).shiftedBy(-earningToken.decimals).toFixed(3)}{' '}
              </Text>
            </Flex>
          </>
        )}
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="row">
          <Text color="textSubtle">Sub End:</Text>
        </Flex>

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
        <Flex flexDirection="row">
      
          <Text color="textSubtle">Sub Fee:</Text>
        </Flex>

        {!subFee ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Text>{`${new BigNumber(subFee).shiftedBy(-18).toFixed(3)} ${nativeSym}`} </Text>
        )}
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text color="textSubtle">Renew Extension:</Text>
        {!days ? <Skeleton width="80px" height="16px" /> : <Text>{new BigNumber(days).toNumber()} Days</Text>}
      </Flex>
      <Flex mt="20px" mb="20px" flexDirection="row">
    
        <Text color="secondary">Send Reward Tokens To address below:</Text>
      </Flex>
      <CopyAddress account={poolAddress} />
      <Flex mt="20px" mb="20px" flexDirection="row">
      <Text color="secondary">Direct Link:</Text>
      </Flex>
      <CopyAddress account={directLink} mb="24px" />

      {!isFinished && !(new BigNumber(newReward).lt(1)) ? (
     <Grid>
            <Button onClick={onClickExtend} disabled={new BigNumber(newReward).lt(1)}>
              {` Extend ${newReward && rpb1 ? getExtendedDays() : 0} Days`}
            </Button>

            <Button  onClick={onClickIncrease} disabled={new BigNumber(newReward).lt(1)}>
              {`Increase to ${canGetAPR ? new BigNumber(getNewApr()).toFixed(1) : 0}% APR`}
            </Button>
            </Grid>
      ) : (
        <>
         
            <Text fontSize="12px" color="secondary">
              How Many Days Till it Starts:
            </Text>
            <Flex flexDirection="row" justifyContent="space-evenly" mt="20px" mb="20px">
              <IconButton variant="secondary" onClick={onClickMinus}>
                <MinusIcon color="primary" width="12px" height="12px" />
              </IconButton>
              <Flex alignItems="center" justifyContent="center">
              <Text fontSize="12px">{startIn}</Text>
              </Flex>
              <IconButton variant="secondary" onClick={onClickAdd}>
                <AddIcon color="primary" width="12px" height="12px" />
              </IconButton>
            </Flex>
            <Text fontSize="12px" color="secondary" >
              How Many Days to Run for:
            </Text>
            <Flex flexDirection="row" justifyContent="space-evenly" mt="20px" mb="20px">
              <IconButton variant="secondary" onClick={onClickMinus2}>
                <MinusIcon color="primary" width="12px" height="12px" />
              </IconButton>
              <Flex alignItems="center" justifyContent="center">
              <Text fontSize="12px">{howLong}</Text>
              </Flex>
              <IconButton variant="secondary" onClick={onClickAdd2}>
                <AddIcon color="primary" width="12px" height="12px" />
              </IconButton>
            </Flex>
  
            <Flex alignItems="center" justifyContent="center" mb="20px">
      {new BigNumber(newReward).lt(1) ? null : (
        <Button variant="primary" onClick={onClickStart} disabled={new BigNumber(newReward).lt(1)}>
          Start New Pool
        </Button>
      )}
    </Flex>
         
   

        </>
      )}


          <Flex alignItems={"center"} justifyContent={"center"}>
          <Button  variant="primary" onClick={onClickRenew}>
            {`Extend Sub ${daysLoaded ? days : 0} days`}
          </Button>
          </Flex>


    </Modal>
  )
}

export default SubAdminModal
