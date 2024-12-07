import React, { useCallback, useState } from 'react'
import { useAppDispatch } from 'state'
import { updateNftUserApproval } from 'state/actions'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import { NFTPool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import hosts from 'config/constants/hosts'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

export const useNftApprovePool = (nftpool: NFTPool, earningTokenSymbol) => {
  const [requestedNftApproval, setRequestedNftApproval] = useState(false)
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()

  const handleNftApprove = useCallback(async () => {
    try {
      setRequestedNftApproval(true)

      const { request } = await simulateContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(nftpool.stakingToken.address, nftpool.chainId),
        functionName: 'setApprovalForAll',
        args: [getAddress(nftpool.contractAddress, nftpool.chainId), true],
        chainId: nftpool.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      dispatch(updateNftUserApproval(nftpool.nftCollectionId, account, hosts.locker))
      if (receipt.status) {
        toastSuccess(
          t('Contract Enabled'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You can now stake in the %symbol% pool!', { symbol: earningTokenSymbol })}
          </ToastDescriptionWithTx>,
        )
        setRequestedNftApproval(false)
      } else {
        setRequestedNftApproval(false)
        // user rejected tx or didn't go thru
        toastError(t('Error rejection'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        
      }
    } catch (e) {
      console.error(e)
      setRequestedNftApproval(false)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
  }, [account, nftpool, dispatch, earningTokenSymbol, t, toastError, toastSuccess])

  

  return { handleNftApprove, requestedNftApproval }
}
