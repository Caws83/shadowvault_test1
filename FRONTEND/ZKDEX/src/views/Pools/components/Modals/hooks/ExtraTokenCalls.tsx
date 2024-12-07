import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import useRefresh from 'hooks/useRefresh'
import tokens from 'config/constants/tokens'
import { Pool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { useReadContract } from 'wagmi'
import { sousChefV4Abi } from 'config/abi/sousChefV4'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'

// HighRoller
export const useExtraTokens = (pool: Pool) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { totalStaked, stakingToken, earningToken } = pool
  const poolAddress = getAddress(pool.contractAddress, pool.chainId)
  const busdAddress = getAddress(tokens.vusd.address, pool.chainId)

  const useGetExtraStaking = () => {
    const { fastRefresh } = useRefresh()
    const [eS, setES] = useState<BigNumber>()

    useEffect(() => {
      async function fetchES() {
        try {
          const extra  = await readContract(config, {
            abi: sousChefV4Abi,
            functionName: 'checkExtraStakedTokens',
            address: getAddress(pool.contractAddress, pool.chainId),
            chainId: pool.chainId
          })
          const extraS = new BigNumber(extra.toString())
          setES(extraS)
        } catch (e) {
          console.error(e)
          try {
            const total = await readContract(config, {
              abi: ERC20_ABI,
              address: getAddress(stakingToken.address, pool.chainId),
              functionName: 'balanceOf',
              args: [poolAddress],
              chainId: pool.chainId
            })
            let extraS2 = new BigNumber(total.toString()).minus(new BigNumber(totalStaked.toString()))
            if (stakingToken === earningToken) {
              const { data: prev } = useReadContract({
                abi: sousChefV4Abi,
                functionName: 'prevAndCurrentRewardsBalance',
                address: getAddress(pool.contractAddress, pool.chainId),
                chainId: pool.chainId
              })
              extraS2 = extraS2.minus(new BigNumber(prev.toString()))
            }
            setES(extraS2)
          } catch (ee) {
            console.error(ee)
          }
        }
      }
      fetchES()
    }, [fastRefresh])

    return eS
  }

  const useGetExtraRewards = () => {
    const { fastRefresh } = useRefresh()
    const [eR, setER] = useState<BigNumber>()

    useEffect(() => {
      async function fetchER() {
        try {
          const extra2  = await readContract(config, {
            abi: sousChefV4Abi,
            functionName: 'checkTotalNewRewards',
            address: getAddress(pool.contractAddress, pool.chainId),
            chainId: pool.chainId
          })
          const extraR2 = new BigNumber(extra2.toString())
          setER(extraR2)
        } catch {
          try {
            const  total  = await readContract(config, {
              abi: ERC20_ABI,
              address: getAddress(pool.earningToken.address, pool.chainId),
              functionName: 'balanceOf',
              args: [poolAddress],
              chainId: pool.chainId
            })
            const prev  = await readContract(config, {
              abi: sousChefV4Abi,
              functionName: 'prevAndCurrentRewardsBalance',
              address: getAddress(pool.contractAddress, pool.chainId),
              chainId: pool.chainId
            })
            let extraR3 = new BigNumber(total.toString()).minus(new BigNumber(prev.toString()))
            if (stakingToken === earningToken) {
              extraR3 = extraR3.minus(totalStaked.toString())
            }
            setER(extraR3)
          } catch (e) {
            console.error(e)
          }
        }
      }
      fetchER()
    }, [fastRefresh])

    return eR
  }

  const handleWithdrawStakingTokens = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: sousChefV4Abi,
        address: getAddress(pool.contractAddress, pool.chainId),
        functionName: 'RemoveExtraStakingTokens',
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
      toastError(t('Error'), t('First call failed, trying second.'))
      try {
        const { request } = await simulateContract(config, {
          abi: sousChefV4Abi,
          address: getAddress(pool.contractAddress, pool.chainId),
          functionName: 'RemoveExtraTokens',
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
      } catch (ee) {
        console.error(ee)
        toastError(t('Error'), t('Second call failed, trying Third.'))
        try {
          const { request } = await simulateContract(config, {
            abi: sousChefV4Abi,
            address: getAddress(pool.contractAddress, pool.chainId),
            functionName: 'RemoveStakedReflections',
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
        } catch (eee) {
          console.error(eee)
          toastError(
            t('Error'),
            t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
          )
        }
      }
    }
  }, [t, toastError, toastSuccess])

  const handleWithdrawRewardTokens = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: sousChefV4Abi,
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
  }, [t, toastError, toastSuccess])

  const handleWithdrawRewardBNB = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: sousChefV4Abi,
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
  }, [t, toastError, toastSuccess])

  const handleWithdrawRewardBUSD = useCallback(async () => {
    try {
      const res = await readContract(config, {
        abi: ERC20_ABI,
        address: busdAddress,
        functionName: 'balanceOf',
        args: [poolAddress],
        chainId: pool.chainId
      })
      const { request } = await simulateContract(config, {
        abi: sousChefV4Abi,
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
  }, [t, toastError, toastSuccess, busdAddress, poolAddress])

  return {
    onES: useGetExtraStaking,
    onER: useGetExtraRewards,
    onWES: handleWithdrawStakingTokens,
    onWER: handleWithdrawRewardTokens,
    onBNB: handleWithdrawRewardBNB,
    onBUSD: handleWithdrawRewardBUSD,
  }
}
