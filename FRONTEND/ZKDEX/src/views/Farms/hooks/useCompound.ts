import { useCallback } from 'react'
import { FarmConfig } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { Compound } from 'utils/easy'
import { useAccount } from 'wagmi'
import { useGasTokenManager, useUserSlippageTolerance } from 'state/user/hooks'
import { getAddress } from 'utils/addressHelpers'

export const useCompoundContract = (
  farm: FarmConfig,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const handleCompound = useCallback(async () => {
    await Compound(farm, account, allowedSlippage, payWithPM, getAddress(payToken.address, farm.chainId), onStageChange, onStageError)
  }, [farm, account, onStageChange, onStageError])

  return { onCompoundContract: handleCompound }
}

export default useCompoundContract
