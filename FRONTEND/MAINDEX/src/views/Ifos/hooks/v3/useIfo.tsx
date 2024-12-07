import { useCallback } from 'react'

import { useTranslation } from 'contexts/Localization'

import { Ifo } from 'config/constants/types'
import useToast from 'hooks/useToast'
import { config } from 'wagmiConfig'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { ifoV3Abi } from 'config/abi/ifoV3'
import { TransactionReceipt } from 'viem'

export const useFinalizeRound = (ifo: Ifo) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: addressRaw } = ifo
  const address = getAddress(addressRaw, ifo.dex.chainId)

  const handleFinalize = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, { abi: ifoV3Abi, address, functionName: 'FinalizeRound', chainId: ifo.dex.chainId })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  

      if (receipt.status === 'success') {
        toastSuccess(t('Round Finalized'))
      } else {
        // user rejected tx or didn't go thru
        toastError(
          t('Error'),
          t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
        )
      }
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
  }, [t, toastError, toastSuccess, address])

  const handleEndEarly = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, { abi: ifoV3Abi, address, functionName: 'endEarly', chainId: ifo.dex.chainId })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  
      if (receipt.status === 'success') {
        toastSuccess(t('Round Ended Early'))
      } else {
        // user rejected tx or didn't go thru
        toastError(
          t('Error'),
          t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
        )
      }
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
  }, [t, toastError, toastSuccess, address])

  const handleWithdrawlLP = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, { abi: ifoV3Abi, address, functionName: 'RecoverLockedLP', chainId: ifo.dex.chainId })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  
      if (receipt.status === 'success') {
        toastSuccess(t('LP Withdrawn'))
      } else {
        // user rejected tx or didn't go thru
        toastError(
          t('Error'),
          t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
        )
      }
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
  }, [t, toastError, toastSuccess, address])

  return {
    onFinalize: handleFinalize,
    onEnd: handleEndEarly,
    onGetLP: handleWithdrawlLP
  }
}
