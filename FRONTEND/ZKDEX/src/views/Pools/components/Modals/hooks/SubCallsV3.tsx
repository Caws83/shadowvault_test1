import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import useRefresh from 'hooks/useRefresh'
import { Pool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { tokenPoolV3Abi } from 'config/abi/TokenPoolV3'
import { simulateContract, readContract, readContracts, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

export const useSubAdmin = (pool: Pool) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const chainId = pool.chainId

  const useGetManageInfo = () => {
    const { slowRefresh } = useRefresh()
    const poolAddress = getAddress(pool.contractAddress, pool.chainId)

    const [rpb1, setRpb] = useState<BigNumber>()
    const [subFee, setSubFee] = useState<BigNumber>()
    const [isInit, setIsInit] = useState<boolean>()
    
    useEffect(() => {
      async function fetchAll() {
        const calls = [
          {
            abi: tokenPoolV3Abi,
            address: poolAddress,
            functionName: 'monthlyFee',
            chainId
          },
          {
            abi: tokenPoolV3Abi,
            address: poolAddress,
            functionName: 'rewardPerBlock',
            chainId
          },
          {
            abi: tokenPoolV3Abi,
            address: poolAddress,
            functionName: 'isInitialized',
            chainId
          },
        ]
        const [subFeeRaw, rpbRaw, initRaw] = await readContracts(config, { contracts: calls })

        const init = initRaw.result

        setSubFee(new BigNumber(subFeeRaw.result.toString()))
        setRpb(new BigNumber(rpbRaw.result.toString()))
        setIsInit(init as boolean)
      }
      fetchAll()
    }, [slowRefresh, poolAddress])

    return { rpb1, subFee, isInit}
  }

  const useGetOperator = () => {
    const { slowRefresh } = useRefresh()
    const [operator, setOperator] = useState('')

    useEffect(() => {
      async function fetchOperator() {
        const op  = await readContract(config, {
          abi: tokenPoolV3Abi,
          address: getAddress(pool.contractAddress, pool.chainId),
          functionName: 'subOperator',
          chainId
        })
        setOperator(op.toString())
      }
      fetchOperator()
    }, [slowRefresh, pool])

    return operator
  }

  // interactive calls below

  const handleExtendPool = useCallback(
    async (days, fee) => {
    try {
      const { request } = await simulateContract(config, {
        abi: tokenPoolV3Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'ExtendPool',
        value: fee,
        args: [days],
        chainId
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
  }, [t, toastError, toastSuccess, pool])

  const handleIncreaseAPR = useCallback(
    async (tokenAmount) => {
    try {
      const { request } = await simulateContract(config, {
        abi: tokenPoolV3Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'increaseAPR',
        args: [tokenAmount],
        chainId
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
  }, [t, toastError, toastSuccess, pool])

  const handleStartNew = useCallback(
    async (start, howlong, tokenAmount, fee) => {
      try {
        const { request } = await simulateContract(config, {
          abi: tokenPoolV3Abi,
          address: getAddress(pool.contractAddress, pool.chainId),
          functionName: 'startNewPool',
          value: fee,
          args: [start, howlong, tokenAmount],
          chainId
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
    [t, toastError, toastSuccess, pool],
  )

  return {
    onOp: useGetOperator,
    onInfo2: useGetManageInfo,
    onExtend: handleExtendPool,
    onIncrease: handleIncreaseAPR,
    onStart: handleStartNew,
  }
}
