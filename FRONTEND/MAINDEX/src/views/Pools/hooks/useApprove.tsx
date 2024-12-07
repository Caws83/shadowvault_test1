import React, { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useAppDispatch } from 'state'
import { updateUserAllowance } from 'state/actions'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import useLastUpdated from 'hooks/useLastUpdated'
import { ToastDescriptionWithTx } from 'components/Toast'
import {
  useAccount,
  useReadContract,
} from 'wagmi'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { TransactionReceipt, maxUint256 } from 'viem'
import { Pool } from 'state/types'
import { getMSWAPAddress, getCakeVaultAddress, getAddress } from 'utils/addressHelpers'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { config } from 'wagmiConfig'
import useRefresh from 'hooks/useRefresh'
import { useGasTokenManager } from 'state/user/hooks'
import sendTransactionPM from 'utils/easy/calls/paymaster'

export const useApprovePool = (lpAddress: `0x${string}`, pool: Pool, earningTokenSymbol) => {
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()


  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      const { request } = await simulateContract(config, {
        abi: ERC20_ABI,
        address: lpAddress,
        functionName: 'approve',
        args: [getAddress(pool.contractAddress, pool.chainId), maxUint256],
        chainId: pool.chainId
      })
      const hash = await sendTransactionPM(request, payWithPM, pool.chainId, getAddress(payToken.address, pool.chainId))
      // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      dispatch(updateUserAllowance(pool.sousId, account))
      if (receipt.status) {
        toastSuccess(
          t('Contract Enabled'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You can now stake in the %symbol% pool!', { symbol: earningTokenSymbol })}
          </ToastDescriptionWithTx>,
        )
        setRequestedApproval(false)
      } else {
        // user rejected tx or didn't go thru
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        setRequestedApproval(false)
      }
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
  }, [account, dispatch, lpAddress, pool, earningTokenSymbol, t, toastError, toastSuccess])

  return { handleApprove, requestedApproval }
}

// Approve CAKE auto pool
export const useVaultApprove = (setLastUpdated: () => void) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const [requestedApproval, setRequestedApproval] = useState(false)
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const handleApprove = async (earningTokenSymbol) => {

    const { request } = await simulateContract(config, {
       abi: ERC20_ABI,
        address: getMSWAPAddress(),
        functionName: 'approve',
        args: [getCakeVaultAddress(),maxUint256],
        chainId: 109
       });
       const hash = await sendTransactionPM(request, payWithPM, 388, getAddress(payToken.address, 388))
       // const hash = await writeContract(config, request)
       const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      setRequestedApproval(true)
    if (receipt.status === 'success') {
      toastSuccess(
        t('Contract Enabled'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You can now stake in the %symbol% vault!', { symbol: earningTokenSymbol })}
        </ToastDescriptionWithTx>,
      )
      setLastUpdated()
      setRequestedApproval(false)
    } else {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setRequestedApproval(false)
    }
  }

  return { handleApprove, requestedApproval }
}

export const useCheckVaultApprovalStatus = (amount: string) => {
  const [isVaultApproved, setIsVaultApproved] = useState(false)
  const { address: account } = useAccount()
  const { lastUpdated, setLastUpdated } = useLastUpdated()
  const { slowRefresh } = useRefresh()
        const response = useReadContract({
          abi: ERC20_ABI,
          address: getMSWAPAddress(),
          functionName: 'allowance',
          args: [account, getCakeVaultAddress()],
          chainId: 388,
        })

        useEffect(() => {
          response.refetch()
        },[slowRefresh])

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const currentAllowance = new BigNumber(response.data.toString())
        setIsVaultApproved(currentAllowance.gte(amount))
      } catch (error) {
        setIsVaultApproved(false)
      }
    }

    checkApprovalStatus()
  }, [account, lastUpdated, amount, response])

  return { isVaultApproved, setLastUpdated }
}
