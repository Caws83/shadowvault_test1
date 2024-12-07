import React, { useCallback, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import { NFTLaunch } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { TransactionReceipt, maxUint64 } from 'viem'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'

export const useNftLaunchApprove = (launch: NFTLaunch, payToken) => {
  const [requestedNftLaunchApproval, setRequestedNftLaunchApproval] = useState(false)
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()

  const handleNftApprove = useCallback(async () => {
    try {
      setRequestedNftLaunchApproval(true)
      const { request } = await simulateContract(config, {
        abi: ERC20_ABI,
        address: getAddress(payToken.address, launch.chainId),
        functionName: 'approve',
        args: [getAddress(launch.contractAddress, launch.chainId), maxUint64],
        chainId: launch.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(
          t('Contract Enabled'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You can now mint the NFTs')}
          </ToastDescriptionWithTx>,
        )
        setRequestedNftLaunchApproval(false)
      } else {
        // user rejected tx or didn't go thru
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        setRequestedNftLaunchApproval(false)
      }
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
  }, [launch, payToken, t, toastError, toastSuccess])

  return { handleNftApprove, requestedNftLaunchApproval }
}
