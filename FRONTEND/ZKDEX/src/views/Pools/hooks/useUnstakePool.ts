// import { getMasterChefFromHost } from 'utils/contractHelpers'
import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAppDispatch } from 'state'
import { updateUserStakedBalance, updateUserBalance, updateUserPendingReward } from 'state/actions'
import { unstakeFarm } from 'utils/calls'
// import { useSousChef } from 'hooks/useContract'
import { BIG_TEN } from 'utils/bigNumber'
import { PoolConfig, PoolCategory, Token } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { UnstakePoolTo } from 'utils/easy'
import { getAddress } from 'utils/addressHelpers'
import { dexs } from 'config/constants/dex'
import tokens from 'config/constants/tokens'
import { sousChefAbi } from 'config/abi/sousChef'
import { useAccount } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import sendTransactionPM from 'utils/easy/calls/paymaster'
import { useGasTokenManager, useUserSlippageTolerance } from 'state/user/hooks'

const sousUnstake = async (pool: PoolConfig, amount: string, decimals, payWithPM: boolean, payToken: string) => {
  const { request } = await simulateContract(config, {
    abi: sousChefAbi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'withdraw',
    args: [BigInt(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString())],
    chainId: pool.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
  // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

const sousEmergencyUnstake = async (pool: PoolConfig, payWithPM: boolean, payToken: string) => {
  const { request } = await simulateContract(config, {
    abi: sousChefAbi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'emergencyWithdraw',
    chainId: pool.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
  // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

export const useUnstakePoolToken = (
  pool: PoolConfig,
  token: Token,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users

  const handleUnstakeToken = useCallback(
    async (amount: string) => {
      await UnstakePoolTo(
        pool,
        account,
        token,
        getAddress(pool.dex.router, pool.chainId),
        amount,
        allowedSlippage,
        payWithPM,
        getAddress(payToken.address, pool.chainId),
        onStageChange,
        onStageError,
      )
      dispatch(updateUserStakedBalance(pool.sousId, account))
      dispatch(updateUserBalance(pool.sousId, account))
      dispatch(updateUserPendingReward(pool.sousId, account))
    },
    [account, dispatch, pool, onStageChange, onStageError, token],
  )

  return { onUnstakeToken: handleUnstakeToken }
}



const useUnstakePool = (pool: PoolConfig, enableEmergencyWithdraw = false) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const payTokenString = getAddress(payToken.address, pool.chainId)
  const handleUnstake = useCallback(
    async (amount: string, decimals: number) => {
      if (pool.poolCategory === PoolCategory.SINGLE) {
        await unstakeFarm(pool.pid, decimals, amount, pool.host, payWithPM, payTokenString)
      } else if (enableEmergencyWithdraw) {
        await sousEmergencyUnstake(pool, payWithPM, payTokenString)
      } else {
        await sousUnstake(pool, amount, decimals, payWithPM, payTokenString)
      }
      dispatch(updateUserStakedBalance(pool.sousId, account))
      dispatch(updateUserBalance(pool.sousId, account))
      dispatch(updateUserPendingReward(pool.sousId, account))
    },

    [account, dispatch, enableEmergencyWithdraw, pool],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstakePool
