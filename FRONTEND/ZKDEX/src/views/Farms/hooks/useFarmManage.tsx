import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useRefresh from 'hooks/useRefresh'
import useToast from 'hooks/useToast'
import { Farm } from 'state/types'
import { simulateContract, readContracts, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import { config } from 'wagmiConfig'
import { Abi } from 'viem'

export const useGetInfo = (farm: Farm) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  // const farmContract = getMasterChefFromHost(farm.host, library.getSigner())

  const useGetFarmInfo = () => {
    const { slowRefresh } = useRefresh()
    const [alloc, setAlloc] = useState<BigNumber>()
    const [outPut, setOutPut] = useState<BigNumber>()

    useEffect(() => {
      async function fetchInfo() {
        const data = await readContracts(config, {
          contracts: [
            {
              abi: farm.host.chefAbi,
              address: getAddress(farm.host.masterChef, farm.chainId),
              functionName: 'poolInfo',
              args: [farm.pid],
              chainId: farm.chainId
            },
            {
              abi: farm.host.chefAbi,
              address: getAddress(farm.host.masterChef, farm.chainId),
              functionName: 'totalAllocPoint',
              args: [],
              chainId: farm.chainId
            },
            {
              abi: farm.host.chefAbi,
              address: getAddress(farm.host.masterChef, farm.chainId),
              functionName: 'cakePerBlock',
              args: [],
              chainId: farm.chainId
            }
          ]
        })
       

        const allocRaw = new BigNumber(data[0].result[1].toString())
        
        const info2 = data[1].result
        const totalAllocRaw = new BigNumber(info2.toString())
        
        const info3 = data[2].result
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
        const {request} = await simulateContract(config, {
          abi: farm.host.chefAbi,
          address: getAddress(farm.host.masterChef, farm.chainId),
          functionName: 'set',
          args: [farm.pid, newAlloc, true],
          chainId: farm.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = await waitForTransactionReceipt(config, { hash })

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
    [t, toastError, toastSuccess, farm.pid],
  )

  const handleUpdatePool = useCallback(async () => {
    try {
      const {request} = await simulateContract(config, {
        abi: farm.host.chefAbi,
        address: getAddress(farm.host.masterChef, farm.chainId),
        functionName: 'updatePool',
        args: [farm.pid],
        chainId: farm.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, { hash })

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
  }, [t, toastError, toastSuccess, farm.pid])

  const handleExtendLock = useCallback(
    async (addEpochToLock) => {
      try {
        const {request} = await simulateContract(config, {
          abi: farm.host.chefAbi,
          address: getAddress(farm.host.masterChef, farm.chainId),
          functionName: 'extendLockTime',
          args: [farm.pid, addEpochToLock],
          chainId: farm.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, { hash })

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
    [t, toastError, toastSuccess, farm.pid],
  )

  return {
    onInfo: useGetFarmInfo,
    onCAlloc: handleSetAllocPoint,
    onUpdate: handleUpdatePool,
    onExtend: handleExtendLock,
  }
}
