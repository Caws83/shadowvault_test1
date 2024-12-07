// import { getMasterChefFromHost } from 'utils/contractHelpers'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { updateUserStakedBalance, updateUserBalance } from 'state/actions'
import { stakeFarm } from 'utils/calls'
import BigNumber from 'bignumber.js'
import { BIG_TEN } from 'utils/bigNumber'
import { PoolConfig, PoolCategory, Token } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { StakePoolFrom } from 'utils/easy'
import { getAddress } from 'utils/addressHelpers'
import tokens from 'config/constants/tokens'
import { useAccount } from 'wagmi'
import { sousChefAbi } from 'config/abi/sousChef'
import { sousChefBnbAbi } from 'config/abi/sousChefBnb'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import sendTransactionPM from 'utils/easy/calls/paymaster'
import { useGasTokenManager, useUserSlippageTolerance } from 'state/user/hooks'

const sousStake = async (pool: PoolConfig, amount: string, decimals, payWithPM:boolean, feeTokenAddress: string) => {
  const { request } = await simulateContract(config, {
    abi: sousChefAbi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'deposit',
    args: [BigInt(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString())],
    chainId: pool.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, pool.chainId, feeTokenAddress)
  // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

const sousStakeBnb = async (pool: PoolConfig, amount: string, decimals, payWithPM:boolean, feeTokenAddress: string) => {
  const { request } = await simulateContract(config, {
    abi: sousChefBnbAbi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'deposit',
    args: [BigInt(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString())],
    chainId: pool.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, pool.chainId, feeTokenAddress)
  // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

export const useStakePoolToken = (
  pool: PoolConfig,
  token: Token,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  
  const handleStakeToken = useCallback(
    async (amount: string) => {
      await StakePoolFrom(
        pool,
        BigInt(amount),
        token,
        getAddress(pool.dex.router, pool.chainId),
        account,
        allowedSlippage,
        payWithPM,
        getAddress(payToken.address, pool.chainId),
        onStageChange,
        onStageError,
      )
      dispatch(updateUserStakedBalance(pool.sousId, account))
      dispatch(updateUserBalance(pool.sousId, account))
    },
    [account, dispatch, pool, onStageChange, onStageError, token],
  )

  return { onStakeToken: handleStakeToken }
}

const useStakePool = (pool: PoolConfig, isUsingBnb = false) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleStake = useCallback(
    async (amount: string, decimals: number) => {
      if (pool.poolCategory === PoolCategory.SINGLE) {
        await stakeFarm(pool.pid, decimals, amount, pool.host, payWithPM, getAddress(payToken.address, pool.chainId))
      } else if (isUsingBnb) {
        await sousStakeBnb(pool, amount, decimals, payWithPM, getAddress(payToken.address, pool.chainId))
      } else {
        await sousStake(pool, amount, decimals, payWithPM, getAddress(payToken.address, pool.chainId))
      }
      dispatch(updateUserStakedBalance(pool.sousId, account))
      dispatch(updateUserBalance(pool.sousId, account))
    },
    [account, dispatch, isUsingBnb, pool],
  )

  return { onStake: handleStake }
}

export default useStakePool
