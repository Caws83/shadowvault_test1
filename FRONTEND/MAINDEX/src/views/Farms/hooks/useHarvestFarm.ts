import { useCallback } from 'react'
import { harvestFarm } from 'utils/calls'
import { FarmConfig, Host, Token } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { HarvestFarmTo } from 'utils/easy'
import { getAddress } from 'utils/addressHelpers'
import { useAccount } from 'wagmi'
import { useGasTokenManager, useUserSlippageTolerance } from 'state/user/hooks'

const useHarvestFarm = (farmPid: number, host: Host) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const handleHarvest = useCallback(async () => {
    await harvestFarm(farmPid, host, payWithPM, getAddress(payToken.address, host.chainId))
  }, [farmPid, host])

  return { onReward: handleHarvest }
}

export const useHarvestFarmFromHost = (host: Host, farmPid: number) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleHarvest = useCallback(async () => {
    await harvestFarm(farmPid, host, payWithPM, getAddress(payToken.address, host.chainId))
  }, [farmPid, host])

  return { onReward: handleHarvest }
}

export const useHarvestToToken = (
  farm: FarmConfig,
  outToken: Token,
  onStageChange: (step: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  const { address: account } = useAccount()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleHarvestToken = useCallback(async () => {
    await HarvestFarmTo(farm, outToken, getAddress(farm.dex.router, farm.chainId), account, allowedSlippage, payWithPM, getAddress(payToken.address, farm.chainId), onStageChange, onStageError)
  }, [farm, account, onStageChange, onStageError, outToken])

  return { onRewardToken: handleHarvestToken }
}



export default useHarvestFarm
