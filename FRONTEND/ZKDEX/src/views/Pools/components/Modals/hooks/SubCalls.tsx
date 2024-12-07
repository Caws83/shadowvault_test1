import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import useRefresh from 'hooks/useRefresh'
import { Pool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { sousChefV4Abi } from 'config/abi/sousChefV4'
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
    const [subEnd, setSubEndBlock] = useState<BigNumber>()
    const [days, setSubLength] = useState<BigNumber>()

    useEffect(() => {
      async function fetchAll() {
        const calls = [
          {
            abi: sousChefV4Abi,
            address: poolAddress,
            functionName: 'subLengthDays',
            chainId
          },
          {
            abi: sousChefV4Abi,
            address: poolAddress,
            functionName: 'subEndBlock',
            chainId
          },
          {
            abi: sousChefV4Abi,
            address: poolAddress,
            functionName: 'subFee',
            chainId
          },
          {
            abi: sousChefV4Abi,
            address: poolAddress,
            functionName: 'rewardPerBlock',
            chainId
          },
        ]
        const [daysRaw, subEndRaw, subFeeRaw, rpbRaw] = await readContracts(config, { contracts: calls })

        setSubLength(new BigNumber(daysRaw.result.toString()))
        setSubEndBlock(new BigNumber(subEndRaw.result.toString()))
        setSubFee(new BigNumber(subFeeRaw.result.toString()))
        setRpb(new BigNumber(rpbRaw.result.toString()))
      }
      fetchAll()
    }, [slowRefresh, poolAddress])

    return { rpb1, subFee, subEnd, days }
  }

  const useGetOperator = () => {
    const { slowRefresh } = useRefresh()
    const [operator, setOperator] = useState('')

    useEffect(() => {
      async function fetchOperator() {
        const op  = await readContract(config, {
          abi: sousChefV4Abi,
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

  const handleRenewSub = useCallback(
    async (fee) => {
      try {
        const { request } = await simulateContract(config, {
          abi: sousChefV4Abi,
          address: getAddress(pool.contractAddress, pool.chainId),
          value: fee,
          functionName: 'RenewOrExtendSubscriptionSixWeeks',
          chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, renewed'))
        } else {
          // user rejected tx or didn't go thru
          toastError(
            t('Error'),
            t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
          )
        }
      } catch {
        try {
          const { request } = await simulateContract(config, {
            abi: sousChefV4Abi,
            address: getAddress(pool.contractAddress, pool.chainId),
            value: fee,
            functionName: 'RenewOrExtendSubscription',
            chainId
          })
          const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

          if (receipt.status === 'success') {
            toastSuccess(t('Transaction Success, renewed'))
          } else {
            // user rejected tx or didn't go thru
            toastError(
              t('Error'),
              t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
            )
          }
        } catch (e) {
          console.error(e)
          toastError(
            t('Error'),
            t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
          )
        }
      }
    },
    [t, toastError, toastSuccess, pool],
  )

  const handleExtendPool = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: sousChefV4Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'ExtendPool',
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

  const handleIncreaseAPR = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: sousChefV4Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'increaseAPR',
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
    async (start, howlong) => {
      try {
        const { request } = await simulateContract(config, {
          abi: sousChefV4Abi,
          address: getAddress(pool.contractAddress, pool.chainId),
          functionName: 'startNewPool',
          args: [start, howlong],
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
    onRenew: handleRenewSub,
    onExtend: handleExtendPool,
    onIncrease: handleIncreaseAPR,
    onStart: handleStartNew,
  }
}
