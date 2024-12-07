import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { updateUserBalance, updateUserPendingReward } from 'state/actions'
import { harvestFarm } from 'utils/calls'
import { BIG_ZERO } from 'utils/bigNumber'
import { PoolConfig, PoolCategory, Token } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'

import { HarvestPoolTo } from 'utils/easy'
import { getAddress } from 'utils/addressHelpers'
import { dexs } from 'config/constants/dex'
import tokens from 'config/constants/tokens'
import { useAccount} from 'wagmi'
import { sousChefAbi } from 'config/abi/sousChef'
import { sousChefBnbAbi } from 'config/abi/sousChefBnb'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import { useGasTokenManager, useUserSlippageTolerance } from 'state/user/hooks'
import sendTransactionPM from 'utils/easy/calls/paymaster'

const harvestPool = async (pool: PoolConfig, payWithPM:boolean, feeTokenAddress: string) => {
  const { request } = await simulateContract(config, {
    abi: sousChefAbi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'deposit',
    args: [0n],
    chainId: pool.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, pool.chainId, feeTokenAddress)
  // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

const harvestPoolBnb = async (pool: PoolConfig, payWithPM:boolean, feeTokenAddress: string ) => {
  const { request } = await simulateContract(config, {
    abi: sousChefBnbAbi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'deposit',
    value: 0n,
    chainId: pool.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, pool.chainId, feeTokenAddress)
  // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

export const useHarvestPoolToken = (
  pool: PoolConfig,
  token: Token,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users

  const handleHarvestToken = useCallback(async () => {
    await HarvestPoolTo(pool, account, token, getAddress(pool.dex.router, pool.chainId), allowedSlippage, payWithPM, getAddress(payToken.address, pool.chainId), onStageChange, onStageError)
    dispatch(updateUserPendingReward(pool.sousId, account))
    dispatch(updateUserBalance(pool.sousId, account))
  }, [account, dispatch, pool, onStageChange, onStageError, token])

  return { onRewardToken: handleHarvestToken }
}


const useHarvestPool = (pool: PoolConfig, isUsingBnb = false) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()


  const handleHarvest = useCallback(async () => {
    
    if (pool.poolCategory === PoolCategory.SINGLE) {
      await harvestFarm(pool.pid, pool.host, payWithPM, getAddress(payToken.address, pool.chainId))
    } else if (isUsingBnb) {
      await harvestPoolBnb(pool, payWithPM, getAddress(payToken.address, pool.chainId))
    } else {
      await harvestPool(pool, payWithPM, getAddress(payToken.address, pool.chainId))
    }
    dispatch(updateUserPendingReward(pool.sousId, account))
    dispatch(updateUserBalance(pool.sousId, account))
  }, [account, dispatch, isUsingBnb, pool])

  return { onReward: handleHarvest }
}

export default useHarvestPool
