import { useCallback } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { NFTLaunch } from 'state/types'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { getAddress } from 'utils/addressHelpers'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

export const useGetInfo = (launch: NFTLaunch) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()

  const handleWithdrawlBNB = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(launch.contractAddress, launch.chainId),
        functionName: 'withdrawBNB',
        chainId: launch.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success'))
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
  }, [t, toastError, toastSuccess, launch.nftCollectionId, launch])

  const handleWithdrawlToken = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(launch.contractAddress, launch.chainId),
        functionName: 'withdrawlToken',
        args: [getAddress(launch.payToken.address)],
        chainId:launch.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success'))
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
  }, [launch.nftCollectionId, launch.payToken.address, launch, toastSuccess, t, toastError])

  const handleChangeBNBCost = useCallback(
    async (newFee) => {
      try {
        const { request } = await simulateContract(config, {
          abi: nftCollectionAbi,
          address: getAddress(launch.contractAddress, launch.chainId),
          functionName: 'setCostBNB',
          args: [newFee],
          chainId: launch.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
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
    },
    [t, toastError, toastSuccess, launch.nftCollectionId, launch],
  )

  const handleChangeTokenCost = useCallback(
    async (newFee) => {
      try {
        const { request } = await simulateContract(config, {
          abi: nftCollectionAbi,
          address: getAddress(launch.contractAddress, launch.chainId),
          functionName: 'setCostToken',
          args: [newFee],
          chainId: launch.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
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
    },
    [t, toastError, toastSuccess, launch.nftCollectionId, launch],
  )

  const handleGoPublic = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(launch.contractAddress, launch.chainId),
        functionName: 'setGoPublic',
        chainId: launch.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success'))
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
  }, [t, toastError, toastSuccess, launch.nftCollectionId, launch])

  return {
    onWithdrawl: handleWithdrawlBNB,
    onChangeBNB: handleChangeBNBCost,
    onChangeToken: handleChangeTokenCost,
    onGoPub: handleGoPublic,
    onWT: handleWithdrawlToken,
  }
}
