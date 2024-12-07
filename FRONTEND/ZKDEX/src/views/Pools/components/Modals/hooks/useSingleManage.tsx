import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useRefresh from 'hooks/useRefresh'
import useToast from 'hooks/useToast'
import { Pool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

export const useGetInfo = (pool: Pool) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()

  const useGetFarmInfo = () => {
    const { slowRefresh } = useRefresh()
    const [alloc, setAlloc] = useState<BigNumber>()
    const [outPut, setOutPut] = useState<BigNumber>()

    useEffect(() => {
      async function fetchInfo() {
        const data  =await readContract(config, {
          abi: pool.host.chefAbi,
          address: getAddress(pool.host.masterChef, pool.chainId),
          functionName: 'poolInfo',
          args: [BigInt(pool.pid)],
          chainId: pool.chainId
        })
       
        const allocRaw = new BigNumber(data[1].toString())

        const info2  = await readContract(config, {
          abi: pool.host.chefAbi,
          address: getAddress(pool.host.masterChef, pool.chainId),
          functionName: 'totalAllocPoint',
          args: [],
          chainId: pool.chainId
        })
        const totalAllocRaw = new BigNumber(info2.toString())

        const info3  = await readContract(config, {
          abi: pool.host.chefAbi,
          address: getAddress(pool.host.masterChef, pool.chainId),
          functionName: 'cakePerBlock',
          args: [],
          chainId: pool.chainId
        })
        const CPBRaw = new BigNumber(info3.toString())
        const outPutRaw = CPBRaw.dividedBy(totalAllocRaw.dividedBy(allocRaw))

        setAlloc(allocRaw)
        setOutPut(outPutRaw)
      }
      fetchInfo()
    }, [slowRefresh])

    return { alloc, outPut }
  }

  const handleSetAllocPoint = useCallback(
    async (newAlloc) => {
      try {
        const { request } = await simulateContract(config, {
          abi: pool.host.chefAbi,
          address: getAddress(pool.host.masterChef, pool.chainId),
          functionName: 'updatePool',
          args: [BigInt(pool.pid)],
          chainId: pool.chainId
        })
        await writeContract(config, request)

        const { request: request2 } = await simulateContract(config, {
          abi: pool.host.chefAbi,
          address: getAddress(pool.host.masterChef, pool.chainId),
          functionName: 'set',
          args: [BigInt(pool.pid), newAlloc, false],
          chainId: pool.chainId
        })
        const hash = await writeContract(config, request2)
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

  const handleUpdatePool = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: pool.host.chefAbi,
        address: getAddress(pool.host.masterChef, pool.chainId),
        functionName: 'updatePool',
        args: [BigInt(pool.pid)],
        chainId: pool.chainId
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

  return { onInfo: useGetFarmInfo, onCAlloc: handleSetAllocPoint, onUpdate: handleUpdatePool }
}
