import { useCallback } from 'react'
import { stakeFarm } from 'utils/calls'
import { FarmConfig, Host, Token } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { StakeFarmFrom, ZapLiquidity } from 'utils/easy'
import tokens from 'config/constants/tokens'
import { getAddress } from 'utils/addressHelpers'
import { useAccount } from 'wagmi'
import { useGasTokenManager, useUserSlippageTolerance } from 'state/user/hooks'

const useStakeFarms = (pid: number, decimals: number, host: Host) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleStake = useCallback(
    async (amount: string, getRequest: boolean = false) => {
      const request = await stakeFarm(pid, decimals, amount, host, payWithPM, getAddress(payToken.address, host.chainId), getRequest)
      if(getRequest){
        return request
      }
    },
    [pid, host, decimals],
  )

  return { onStake: handleStake }
}

export const useStakeFarmsFromHost = (host: Host, pid: number, decimals: number) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleStake = useCallback(
    async (amount: string, getRequest: boolean = false) => {
      const request = await stakeFarm(pid, decimals, amount, host, payWithPM, getAddress(payToken.address, host.chainId), getRequest)
      if(getRequest){
        return request
      }
    },
    [pid, host, decimals],
  )

  return { onStake: handleStake }
}

export const useStakeFromToken = (
  farm: FarmConfig,
  token: Token,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError) => void,
) => {
  const { address: account } = useAccount()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()


  const handleStakeFromToken = useCallback(
    async (amount: string) => {
      await StakeFarmFrom(
        farm,
        amount,
        token,
        getAddress(farm.dex.router, farm.chainId),
        account,
        allowedSlippage,
        payWithPM,
        getAddress(payToken.address, farm.chainId),
        onStageChange,
        onStageError,
      )
    },
    [account, farm, onStageChange, onStageError, token],
  )

  return { onStakeToken: handleStakeFromToken }
}

export const useZapLiquidity = (
  inToken: Token,
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
  chainId: number,
  inRouter: `0x${string}`,
  isBNB: boolean
) => {
  const { address: account } = useAccount()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()


  const handleZap = useCallback(
    async (amount: string, getRequest?: boolean) => {
      const request = await ZapLiquidity(
        amount,
        inToken,
        tokenA,
        tokenB,
        chainId,
        inRouter,
        account,
        isBNB,
        allowedSlippage,
        payWithPM,
        getAddress(payToken.address, chainId),
        getRequest,
      )
      if(getRequest) {
        return request
      }
    },
   
    
    [account, inToken, tokenA, tokenB, chainId, inRouter, isBNB ],
  )
  return { onZap: handleZap }
}


export default useStakeFarms
