import { useCallback, useEffect, useState } from 'react'
import useRefresh from 'hooks/useRefresh'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { Game } from 'state/types'
import { getTokenPrice } from 'state/pools'
import { useAccount } from 'wagmi'
import { coinflipAbi } from 'config/abi/coinFlip'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

export const useGetInfo = (game: Game) => {
  const { address: account } = useAccount()
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()

  const useGetNFTInfo = () => {
    const { slowRefresh } = useRefresh()
    const [sendAt, setSendAt] = useState<BigNumber>()

    useEffect(() => {
      async function fetchInfo() {
        const info = await readContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'amountToSendAt',
          chainId: game.chainId
        })
        const amountToSendraw = new BigNumber(info.toString())

        setSendAt(amountToSendraw)
      }
      fetchInfo()
    }, [slowRefresh, game.contractAddress])
    return { sendAt }
  }

  const useGetTokenPrice = () => {
    const { slowRefresh } = useRefresh()
    const [price, setPrice] = useState<number>()

    useEffect(() => {
      async function fetchInfo() {
        const priceRaw = await getTokenPrice(game.dex, game.payToken)

        setPrice(priceRaw)
      }
      fetchInfo()
    }, [slowRefresh])

    return price
  }

  const handleChangeQuickBet = useCallback(
    async (newAmount) => {
      try {
        const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'setQuickBetAmount',
          args: [newAmount],
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

  const handleChangeSendAt = useCallback(
    async (newAmount) => {
      try {
        const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'setAmountToSendAt',
          args: [newAmount],
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

  const handleChangeBNBFee = useCallback(
    async (newAmount) => {
      try {
        const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'setCostBNB',
          args: [newAmount],
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

  const handleEmergencyWithdrawl = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'withdrawlAllGameToken',
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
  }, [t, toastError, toastSuccess, game.contractAddress])

  const handlePause = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'pauseGames',
        args: [true],
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
  }, [t, toastError, toastSuccess, game.contractAddress])

  const handleUnpause = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'pauseGames',
        args: [false],
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
  }, [t, toastError, toastSuccess, game.contractAddress])

  return {
    onPause: handlePause,
    onUnpause: handleUnpause,
    onTicket: handleChangeQuickBet,
    onBNBFee: handleChangeBNBFee,
    onSendAt: handleChangeSendAt,
    onPrice: useGetTokenPrice,
    onInfo: useGetNFTInfo,
    onEW: handleEmergencyWithdrawl,
  }
}
