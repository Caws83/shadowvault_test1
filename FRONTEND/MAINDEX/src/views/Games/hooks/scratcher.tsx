import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { Game } from 'state/types'
import useRefresh from 'hooks/useRefresh'
import { BigNumber } from 'bignumber.js'
import { readContract, simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { scratchersAbi } from 'config/abi/scratchers'
import { getAddress } from 'utils/addressHelpers'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

export const useScratcher = (game: Game) => {
  const { address: account } = useAccount()
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const jackCost = game.scratcher.jackPotCost.toString()
  const sMultipliers = game.scratcher.multipliers
  const newChances = game.scratcher.chances

  const handleScratch = useCallback(
    async (token, betAmount) => {
      try {
        const { request } = await simulateContract(config, {
          abi: scratchersAbi,
          address: getAddress(game.contractAddress),
          functionName: 'buyScratcher',
          args: [token],
          value: betAmount,
          chainId: game.chainId
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
        return receipt
      } catch (e) {
        console.error(e)
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
      return 'Fail'
    },
    [t, toastError, toastSuccess, game.contractAddress],
  )

  const handleJackPot = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: scratchersAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'jackpot',
        value: jackCost,
        chainId: game.chainId
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
      return receipt
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
    return 'Fail'
  }, [t, toastError, toastSuccess, game.contractAddress, jackCost])

  const handleChangeJackPotCost = useCallback(
    async (newJackCost) => {
      try {
        const { request } = await simulateContract(config, {
          abi: scratchersAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'setJackCost',
          args: [newJackCost],
          chainId: game.chainId
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
    [t, toastError, toastSuccess, game.contractAddress],
  )

  const handleChangeJackPotChance = useCallback(
    async (newJackChance) => {
      try {
        const { request } = await simulateContract(config, {
          abi: scratchersAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'setJackPotChance',
          args: [newJackChance],
          chainId: game.chainId
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
    [t, toastError, toastSuccess, game.contractAddress],
  )

  const handleChangeSafetyM = useCallback(
    async (newJackChance: number) => {
      try {
        const { request } = await simulateContract(config, {
          abi: scratchersAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'setSafetyMultiplier',
          args: [newJackChance],
          chainId: game.chainId
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
    [t, toastError, toastSuccess, game.contractAddress],
  )

  const handleChangeScratcherChance = useCallback(
    async (newJackChance) => {
      const mString = sMultipliers.map((x) => x.toString())
      const nString = newChances.map((s) => s.toString())
      nString[0] = newJackChance.toString()

      try {
        const { request } = await simulateContract(config, {
          abi: scratchersAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'setupPerThousand',
          args: [mString, nString],
          chainId: game.chainId
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
    [t, toastError, toastSuccess, game.contractAddress, newChances, sMultipliers],
  )

  const useGetFPs = () => {
    const { slowRefresh } = useRefresh()
    const [freePlays, setFPs] = useState<number>(0)
    const [valueOfNext, setVON] = useState<number>(0)

    useEffect(() => {
      async function fetchInfo() {
        const howMany = await readContract(config, {
          abi: scratchersAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'howManyFP',
          args: [account],
          chainId: game.chainId
        }) as bigint
        if (howMany > 0n) {
          const vonRaw  = await readContract(config, {
            abi: scratchersAbi,
            address: getAddress(game.contractAddress, game.chainId),
            functionName: 'freePlay',
            args: [account, howMany - 1n],
            chainId: game.chainId
          })
          const von = new BigNumber(vonRaw.toString()).toNumber()
          setVON(von)
        }
        setFPs(Number(howMany))
      }
      fetchInfo()
    }, [slowRefresh])
    return { freePlays, valueOfNext }
  }

  return {
    onFPs: useGetFPs,
    onScratch: handleScratch,
    onjack: handleJackPot,
    onCJackCost: handleChangeJackPotCost,
    onJackChance: handleChangeJackPotChance,
    onScratchChance: handleChangeScratcherChance,
    onSafetyM: handleChangeSafetyM,
  }
}
