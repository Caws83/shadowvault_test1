import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import useRefresh from 'hooks/useRefresh'
import tokens from 'config/constants/tokens'
import { NFTPool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { useReadContract } from 'wagmi'
import { nftPoolV2Abi } from 'config/abi/nftPoolV2'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'

// HighRoller
export const useExtraTokens = (pool: NFTPool) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const poolAddress = getAddress(pool.contractAddress, pool.chainId)
  const busdAddress = getAddress(tokens.vusd.address, pool.chainId)

  const useGetExtraRewards = () => {
    const { fastRefresh } = useRefresh()
    const [eR, setER] = useState<BigNumber>()

    useEffect(() => {
      async function fetchER() {
        try {
          const extra = await readContract(config, {
            abi: nftPoolV2Abi,
            address: getAddress(pool.contractAddress, pool.chainId),
            functionName: 'checkTotalNewRewards',
            chainId: pool.chainId
          })
          const extraR = new BigNumber(extra.toString())
          setER(extraR)
         
        } catch (e) {
          console.error(e)
        }
      }
      fetchER()
    }, [fastRefresh])

    return eR
  }

  const handleWithdrawRewardTokens = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: nftPoolV2Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'NEWRewardWithdraw',
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
  }, [t, toastError, toastSuccess, pool.contractAddress])

  const handleWithdrawRewardBNB = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: nftPoolV2Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'withdawlBNB',
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
  }, [t, toastError, toastSuccess, pool.contractAddress])

  const handleWithdrawRewardBUSD = useCallback(async () => {
    try {
      const res = useReadContract({
        abi: ERC20_ABI,
        address: busdAddress,
        functionName: 'balanceOf',
        args: [poolAddress],
        chainId: pool.chainId
      })
      const { request } = await simulateContract(config, {
        abi: nftPoolV2Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'recoverWrongTokens',
        args: [busdAddress, res],
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
  }, [t, toastError, toastSuccess, pool.contractAddress, busdAddress, poolAddress])

  return {
    onER: useGetExtraRewards,
    onWER: handleWithdrawRewardTokens,
    onBNB: handleWithdrawRewardBNB,
    onBUSD: handleWithdrawRewardBUSD,
  }
}
