import { useCallback } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { Game } from 'state/types'
import { useAccount, usePublicClient } from 'wagmi'
import { game2Abi } from 'config/abi/game2'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

// HighRoller
export const useHighRoller = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const fee = game.bnbFee
  const { address: account } = useAccount()
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleHRStart = useCallback(
    async (betAmount, diceSize) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'startHR',
          args: [betAmount, diceSize],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'startHR',
          args: [betAmount, diceSize],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, House has Rolled the Dice!'))
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
      return ''
    },
    [t, toastError, toastSuccess, game.contractAddress, publicClient, fee],
  )

  const handleHRRoll = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRoll',
        args: [false],
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRoll',
        args: [false],
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, You have Rolled the Dice!'))
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
    return ''
  }, [t, toastError, toastSuccess, game.contractAddress, publicClient])
  const handleHRRollDouble = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRoll',
        args: [true],
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRoll',
        args: [true],
       gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt


      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, You have Rolled the Dice!'))
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
    return ''
  }, [t, toastError, toastSuccess, game.contractAddress, publicClient])
  return { onStartHR: handleHRStart, onRollHR: handleHRRoll, onRollHRD: handleHRRollDouble }
}

export const useLowRoller = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const fee = game.bnbFee
  const { address: account } = useAccount()
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleLRStart = useCallback(
    async (betAmount, diceSize) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'startLR',
          args: [betAmount, diceSize],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'PlayerRoll',
          args: [betAmount, diceSize],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, House has Rolled the Dice!'))
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
      return ''
    },
    [t, toastError, toastSuccess, game.contractAddress, publicClient, fee],
  )

  const handleLRRoll = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRollLR',
        args: [false],
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRollLR',
        args: [false],
       gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, You have Rolled the Dice!'))
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
    return ''
  }, [t, toastError, toastSuccess, game.contractAddress, publicClient])
  const handleLRRollDouble = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRollLR',
        args: [true],
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: game2Abi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'PlayerRollLR',
        args: [true],
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, You have Rolled the Dice!'))
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
    return ''
  }, [t, toastError, toastSuccess, game.contractAddress, publicClient])

  return { onStartLR: handleLRStart, onRollLR: handleLRRoll, onRollLRD: handleLRRollDouble }
}

// suit call

export const useSuitCall = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleSuitCall = useCallback(
    async (betAmount, suitNumber) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'suitCallGame',
          args: [betAmount, suitNumber],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'suitCallGame',
          args: [betAmount, suitNumber],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, Drawing Card!'))
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
      return ''
    },
    [t, toastError, toastSuccess, game.contractAddress, publicClient, fee],
  )

  return { onSuitCall: handleSuitCall }
}

// Black or Red

export const useBRCalls = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleBlackCall = useCallback(
    async (betAmount) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'blackRed',
          args: [betAmount, true],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'blackRed',
          args: [betAmount, true],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, Drawing Card!'))
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
      return ''
    },
    [t, toastError, toastSuccess, game.contractAddress, publicClient, fee],
  )

  const handleRedCall = useCallback(
    async (betAmount) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'blackRed',
          args: [betAmount, false],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'blackRed',
          args: [betAmount, false],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, Drawing Card!'))
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
      return ''
    },
    [t, toastError, toastSuccess, game.contractAddress, publicClient, fee],
  )

  return { onBRBlack: handleBlackCall, onBRRed: handleRedCall }
}

// Black or Red

export const useHorseRace = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleHorseRace = useCallback(
    async (betAmount, horseNumber) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'horseRace',
          args: [betAmount, horseNumber],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: game2Abi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'horseRace',
          args: [betAmount, horseNumber],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, Race is on!'))
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
      return ''
    },
    [t, toastError, toastSuccess, game.contractAddress, publicClient, fee],
  )

  return { onHorseRace: handleHorseRace }
}
