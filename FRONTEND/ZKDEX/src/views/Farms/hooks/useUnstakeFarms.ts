import { useCallback } from 'react'
import { unstakeFarm } from 'utils/calls'
import { FarmConfig, Host, Token } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { UnstakeFarmTo } from 'utils/easy'
import { getAddress } from 'utils/addressHelpers'
import { useAccount } from 'wagmi'
import { useGasTokenManager, useUserSlippageTolerance } from 'state/user/hooks'

const useUnstakeFarms = (pid: number, decimals: number, host: Host) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleUnstake = useCallback(
    async (amount: string) => {
      await unstakeFarm(pid, decimals, amount, host, payWithPM, getAddress(payToken.address, host.chainId))
    },
    [pid, host, decimals],
  )

  return { onUnstake: handleUnstake }
}

export const useUnstakeFarmsFromHost = (host: Host, pid: number, decimals: number) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleUnstake = useCallback(
    async (amount: string) => {
      await unstakeFarm(pid, decimals, amount, host, payWithPM, getAddress(payToken.address, host.chainId))
    },
    [pid, host, decimals],
  )

  return { onUnstake: handleUnstake }
}

export const useUnstakeFarmsToken = (
  farm: FarmConfig,
  token: Token,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  const { address: account } = useAccount()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()


  const handleUnstakeToken = useCallback(
    async (amount: string) => {
      await UnstakeFarmTo(
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
    [farm, onStageChange, onStageError, account, token],
  )

  return { onUnstakeToken: handleUnstakeToken }
}


export default useUnstakeFarms
