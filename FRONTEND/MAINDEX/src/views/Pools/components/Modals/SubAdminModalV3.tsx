import React, { useEffect, useState } from 'react'
import { Modal, Text, Flex, Button, Skeleton, IconButton, AddIcon, MinusIcon, TimerIcon, Link, ButtonMenu, ButtonMenuItem } from 'uikit'
import useTheme from 'hooks/useTheme'
import { Pool } from 'state/types'
import BigNumber from 'bignumber.js'
import QuestionHelper from 'components/QuestionHelper'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import NumberInput from 'components/NumberInput/NumberInput'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import { getBscScanLink } from 'utils'
import { getPoolApr } from 'utils/apr'
import { getBalanceNumber } from 'utils/formatBalance'
import { getAddress } from 'utils/addressHelpers'
import { BASE_URL } from 'config'
import contracts from 'config/constants/contracts'
import { ActionContainer, ActionContent } from '../PoolsTable/ActionPanel/styles'
import { useSubAdmin } from './hooks/SubCallsV3'
import { useAccount, usePublicClient, useReadContract } from 'wagmi'
import { useExtraTokens } from './hooks/ExtraTokenCalls'
import CopyAddress from './CopyAddress'
import { tokenPoolV3Abi } from 'config/abi/TokenPoolV3'
import { config } from 'wagmiConfig'
import useRefresh from 'hooks/useRefresh'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { TransactionReceipt } from 'viem'

interface SubAdminModalProps {
  pool: Pool
  currentBlock: number
  onDismiss?: () => void
}

const SubAdminModalV3: React.FC<SubAdminModalProps> = ({ pool, currentBlock, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }

  // const { currentBlock } = useBlock()
  const { onInfo2, onStart } = useSubAdmin(pool)
  const { onER } = useExtraTokens(pool)
  const { stakingToken, earningToken, earningTokenPrice, stakingTokenPrice, endBlock, totalStaked, contractAddress } = pool

  const poolAddress = getAddress(contractAddress, pool.chainId)
  const newReward = onER()
  const { rpb1, subFee, isInit } = onInfo2()
  const { address: account } = useAccount()
  const client = usePublicClient({chainId: pool.chainId})
  const { toastSuccess } = useToast()
  const nativeSym = client.chain.nativeCurrency.symbol

  const [tokenAmount, setTokenAmount] = useState(new BigNumber(0))
  const [startIn, setStartIn] = useState(1)
  const [howLong, setHowLong] = useState(0)
  const [tBalance, setCBalance] = useState(new BigNumber(0))
  const isOwner = account === getAddress(contracts.farmWallet, pool.chainId)
  const { slowRefresh } = useRefresh()

  const {data: data1, refetch: refetch1, isLoading: isLoading1} = useReadContract({
        abi: ERC20_ABI,
        address: getAddress(earningToken.address, pool.chainId),
        functionName: 'balanceOf',
        args: [account],
        chainId: pool.chainId
  })
  useEffect(() => {
    if(data1 && !isLoading1)setCBalance(new BigNumber(data1.toString()))
  }, [data1])
 

  const onClickAdd = () => {
    const newStartIn = startIn + 1
    setStartIn(newStartIn)

  }
  const onClickMinus = () => {
    let newStartIn = startIn - 1
    if (newStartIn < 0) {
      newStartIn = 0
    }
    setStartIn(newStartIn)
  }

  const onClickAdd2 = () => {
    const newHowLong = howLong + 1
    setHowLong(newHowLong)
    if(!isFinished) setTokenAmount(rpb1.multipliedBy(newHowLong * 86400).minus(newReward))
  }
  const onClickMinus2 = () => {
    let newHowLong = howLong - 1
    if (newHowLong < 1) {
      newHowLong = 1
    }
    setHowLong(newHowLong)
    if(!isFinished) setTokenAmount(rpb1.multipliedBy(newHowLong * 86400).minus(newReward))
  }

  const handleChangeTokenAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = new BigNumber(event.target.value).shiftedBy(earningToken.decimals)
    setTokenAmount(amount)
  }

  const getNewApr = () => {
    const rpb = new BigNumber(rpb1)
    const addedRPB = new BigNumber(tokenAmount.plus(newReward)).dividedBy(endBlock - currentBlock)
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
  const rewards = newReward !== undefined && earningTokenPrice !== undefined
  const canGetAPR = rpb1 && stakingTokenPrice && earningTokenPrice
 
  const directLink = `${BASE_URL}#/pools?search=${earningToken.symbol}`
  const [changeWhat, setChangeWhat] = useState(0)
  const handleClick = (newIndex: number) => {
    setHowLong(0)
    setTokenAmount(new BigNumber(0))
    setChangeWhat(newIndex)
  }

  const currentFee = isOwner || !isInit ? new BigNumber(0) : new BigNumber(subFee)

  const [ isApproved, setIsApproved] = useState(false)
 
  const { data, refetch, isLoading } = useReadContract({
    abi: ERC20_ABI,
    address: getAddress(earningToken.address, pool.chainId),
    functionName: 'allowance',
    args: [account, getAddress(contractAddress, pool.chainId)],
    chainId: pool.chainId
  })
  useEffect(() => {
    if(data && !isLoading){
      const currentAllowance = new BigNumber(data.toString())
      setIsApproved(currentAllowance.gte(tokenAmount))
    }
  },[data, tokenAmount])

  useEffect(() => {
    refetch1()
    refetch()
   },[slowRefresh])


  const { isApproving, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      onApprove: async () => {
        const approveAmount = tokenAmount.toString()
        const { request } = await simulateContract(config, {
          abi: ERC20_ABI,
          address: getAddress(earningToken.address, pool.chainId),
          functionName: 'approve',
          args: [getAddress(contractAddress, pool.chainId), approveAmount],
          chainId : pool.chainId

        })
        const hash = await writeContract(config, request)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
      },
      onApproveSuccess: async ({ receipt }) => {
        refetch()
        toastSuccess(
          'Tokens Approved for Transaction.',
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      },
      onConfirm: async () => {
        let requestToSend
        
        // STARTING NEW
        if(isFinished){
          if(tokenAmount.gt(0)){
          const { request } = await simulateContract(config, {
            abi: tokenPoolV3Abi,
            address: getAddress(contractAddress, pool.chainId),
            functionName: 'startNewPoolV2',
            value: BigInt(new BigNumber(currentFee).dividedBy(30).multipliedBy(howLong).toString()),
            args: [startIn, howLong, tokenAmount.toString()],
            chainId: pool.chainId
          })
         requestToSend = request
        } else {
          const { request } = await simulateContract(config, {
            abi: tokenPoolV3Abi,
            address: getAddress(contractAddress, pool.chainId),
            functionName: 'startNewPool',
            value: BigInt(new BigNumber(currentFee).dividedBy(30).multipliedBy(howLong).toString()),
            args: [startIn, howLong],
            chainId: pool.chainId
          })
         requestToSend = request
        }
        } else if(changeWhat === 1){
          if(tokenAmount.gt(0)){
          const { request } = await simulateContract(config, {
            abi: tokenPoolV3Abi,
            address: getAddress(contractAddress, pool.chainId),
            functionName: 'increaseAPRV2',
            args: [tokenAmount.toString()],
            chainId: pool.chainId
          })
          requestToSend = request
        } else {
          const { request } = await simulateContract(config, {
            abi: tokenPoolV3Abi,
            address: getAddress(contractAddress, pool.chainId),
            functionName: 'increaseAPR',
            chainId: pool.chainId
          })
          requestToSend = request
        }
        } else if(changeWhat === 0) {
          const { request } = await simulateContract(config, {
            abi: tokenPoolV3Abi,
            address: getAddress(contractAddress, pool.chainId),
            functionName: 'extendPoolV2',
            value: BigInt(new BigNumber(currentFee).dividedBy(30).multipliedBy(howLong).toFixed(0)),
            args: [howLong],
            chainId: pool.chainId
          })
          requestToSend = request
        }

        const hash = await writeContract(config, requestToSend)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
      },
      onSuccess: async ({ receipt }) => {
        toastSuccess('Pool Initiated', <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
        onDismiss()
      },
    })

    
  const disableBuying =
  !isApproved ||
  isConfirmed ||
  tBalance.lt(tokenAmount.toString()) ||
  (tokenAmount.eq(0) && new BigNumber(newReward).eq(0))||
  tokenAmount === undefined


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
          <QuestionHelper
            text={
              <>
                <Text>Cost to keep pool going.</Text>
                <Text>This will add renew extension</Text>
                <Text>to your subscription.</Text>
              </>
            }
            ml="4px"
          />
          <Text color="textSubtle">Daily Fee:</Text>
        </Flex>

        {!currentFee ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Text>{`${parseFloat(new BigNumber(subFee).dividedBy(30).shiftedBy(-18).toFixed(8))} ${nativeSym}`} </Text>
        )}
      </Flex>
      
      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold">
        Pool Address
      </Text>
      <CopyAddress account={poolAddress} mb="8px" />

      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold">
        Direct Link
      </Text>
      <CopyAddress account={directLink} mb="8px" />

      {!isFinished ? (
        <>
        <Flex justifyContent="center" alignItems="center" mb="24px">
            <ButtonMenu activeIndex={changeWhat} scale="sm" variant="subtle" onItemClick={handleClick}>
                <ButtonMenuItem as="button">Extend Pool</ButtonMenuItem>
                <ButtonMenuItem as="button">Increase APR</ButtonMenuItem>
            </ButtonMenu>
        </Flex>

        {changeWhat === 0 ? (
        <ActionContainer>
          
          <Flex justifyContent="center" alignItems="center" mb="24px">
          <ApproveConfirmButtons
              isApproveDisabled={isApproved}
              isApproving={isApproving}
              isConfirmDisabled={disableBuying}
              isConfirming={isConfirming}
              onApprove={handleApprove}
              onConfirm={handleConfirm}
              buttonArrangement={ButtonArrangement.SEQUENTIAL}
              confirmLabel={` Extend ${howLong} Days`}
              confirmId="extendPool"
            />
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
        </ActionContainer>
            ):(
        <ActionContainer>
           <NumberInput 
                onChange={handleChangeTokenAmount} 
                placeholder={`How Many Tokens`}
                startingNumber={''}
            />
            <Flex justifyContent="space-between">
          <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
           Balance:
          </Text>
        <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
            {`${tBalance.shiftedBy(-earningToken.decimals).toFixed(3)} ${earningToken.symbol}`}
        </Text>
        </Flex>
          
          <Text fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
           This will take your selected amount as well as any AVL TOKENS and increase the apr.
          </Text>

          <Flex justifyContent="center" alignItems="center" mt="24px">
          <ApproveConfirmButtons
              isApproveDisabled={isApproved}
              isApproving={isApproving}
              isConfirmDisabled={disableBuying}
              isConfirming={isConfirming}
              onApprove={handleApprove}
              onConfirm={handleConfirm}
              buttonArrangement={ButtonArrangement.SEQUENTIAL}
              confirmLabel={`Increase to ${canGetAPR ? new BigNumber(getNewApr()).toFixed(1) : 0}% APR`}
              confirmId="increasePool"
            />
            </Flex>
           
        </ActionContainer>
        )}
        
        </>

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

            <Flex mt="6px">
            <NumberInput 
              onChange={handleChangeTokenAmount} 
              placeholder={`How Many Tokens`}
              startingNumber={''}
            />
            </Flex>

            <Flex justifyContent="space-between">
              <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
                Balance:
              </Text>
              <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
                {`${tBalance.shiftedBy(-earningToken.decimals).toFixed(3)} ${earningToken.symbol}`}
              </Text>
            </Flex>

            <Flex justifyContent="center" alignItems="center" mt="14px">
            <ApproveConfirmButtons
              isApproveDisabled={isApproved}
              isApproving={isApproving}
              isConfirmDisabled={disableBuying}
              isConfirming={isConfirming}
              onApprove={handleApprove}
              onConfirm={handleConfirm}
              buttonArrangement={ButtonArrangement.SEQUENTIAL}
              confirmLabel={'Start New Pool'}
              confirmId="StartPool"
            />
            </Flex>
        
     
          </ActionContainer>
        </>
      )}
     
      <ActionContainer>
      { changeWhat !== 1 &&
        <Flex justifyContent="space-between">
          <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
            Fee due on approval:
          </Text>
        <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
            {`${new BigNumber(currentFee).dividedBy(30).multipliedBy(howLong).shiftedBy(-18).toFixed(3)} ${nativeSym}`}
        </Text>
        </Flex>
      }
       <Flex justifyContent="space-between">
          <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
            Tokens To Send:
          </Text>
        <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
            {`${new BigNumber(tokenAmount).shiftedBy(-18).toFixed(3)} ${pool.earningToken.symbol}`}
        </Text>
        </Flex>
      </ActionContainer>
      
    
    </Modal>
  )
}

export default SubAdminModalV3
