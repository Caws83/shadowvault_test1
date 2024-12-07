import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useRefresh from 'hooks/useRefresh'
import { useTranslation } from 'contexts/Localization'
import { NFTPool } from 'state/types'
import useToast from 'hooks/useToast'
import { getAddress } from 'utils/addressHelpers'
import { nftPoolV3Abi } from 'config/abi/nftPoolV3'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract, readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'

export const useSubAdmin = (pool: NFTPool) => {
  const chainId = pool.chainId
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()

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
            abi: nftPoolV3Abi,
            address: poolAddress,
            functionName: 'monthlyFee',
            args: [],
            chainId
          },
          {
            abi: nftPoolV3Abi,
            address: poolAddress,
            functionName: 'rewardPerBlock',
            args: [],
            chainId
          },
          {
            abi: nftPoolV3Abi,
            address: poolAddress,
            functionName: 'isInitialized',
            args: [],
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
        const op = await readContract(config, {
          abi: nftPoolV3Abi,
          address: getAddress(pool.contractAddress, pool.chainId),
          functionName: 'subOperator',
          chainId
        })
        setOperator(op.toString())
      }
      fetchOperator()
    }, [slowRefresh, pool.contractAddress])

    return operator
  }

  const handleStartNew = useCallback(
    async (start, howlong) => {
      try {
        const { request } = await simulateContract(config, {
          abi: nftPoolV3Abi,
          address: getAddress(pool.contractAddress, pool.chainId),
          functionName: 'startNewPoolOrRound',
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
    [t, toastError, toastSuccess, pool.nftCollectionId, pool.contractAddress],
  )

  return {
    onOp: useGetOperator,
    onInfo2: useGetManageInfo,
    onStart: handleStartNew,
  }
}
