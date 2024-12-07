import { useCallback } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { Game } from 'state/types'
import { useAccount, usePublicClient } from 'wagmi'
import { coinflipAbi } from 'config/abi/coinFlip'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

// DiceCall
export const useDiceCall = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleDiceCall = useCallback(
    async (betAmount, choice, diceSize) => {
      try {
        const gasPrice = await publicClient.estimateContractGas({
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'diceCall',
          args: [betAmount, choice, diceSize],
          value: fee,
          account
        })
        const gas = (gasPrice * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'diceCall',
          args: [betAmount, choice, diceSize],
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

  return { onDiceCall: handleDiceCall }
}

// deck cut game
export const useDeckCut = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleQuickCut = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'cutTheDeckQuick',
        value: fee,
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'cutTheDeckQuick',
        value: fee,
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, Deck Has Been Cut!'))
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
  }, [t, toastError, toastSuccess, game.contractAddress, publicClient, fee])

  const handleCut = useCallback(
    async (betAmount) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'cutTheDeck',
          args: [betAmount],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'cutTheDeck',
          args: [betAmount],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, Deck Has Been Cut!'))
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

  return { onQuickCut: handleQuickCut, onCut: handleCut }
}
// coinflip game

export const useCoinFlipQuick = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleQuickBetHeads = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'quickBetHeads',
        value: fee,
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'quickBetHeads',
        value: fee,
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, You Bet Heads!'))
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
  }, [t, toastError, toastSuccess, game.contractAddress, publicClient, fee])

  const handleQuickBetTails = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'quickBetTails',
        value: fee,
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'quickBetTails',
        value: fee,
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, You Bet Heads!'))
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
  }, [t, toastError, toastSuccess, game.contractAddress, publicClient, fee])

  return { onQuickHeads: handleQuickBetHeads, onQuickTails: handleQuickBetTails }
}

export const useCoinFlip = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleBetHeads = useCallback(
    async (betAmount) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'BetHeads',
          args: [betAmount],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'BetHeads',
          args: [betAmount],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, You Bet Heads!'))
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

  const handleBetTails = useCallback(
    async (betAmount) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'BetTails',
          args: [betAmount],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'BetTails',
          args: [betAmount],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, You Bet Heads!'))
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

  return { onHeads: handleBetHeads, onTails: handleBetTails }
}

// highcard
export const useHighCard = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()

  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleHighCardStart = useCallback(
    async (betAmount) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'startHighCard',
          args: [betAmount],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'startHighCard',
          args: [betAmount],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, Game has Started'))
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

  const handleHighCardBet = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'highCardGuess',
        args: [true],
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'highCardGuess',
        args: [true],
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, Guess Higher Submited'))
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

  const handleLowCardBet = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'highCardGuess',
        args: [false],
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'highCardGuess',
        args: [false],
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, Guess Lower Submited'))
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

  const handleHighCardEnd = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'highCardTakeMoney',
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'highCardTakeMoney',
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, Clamed your Winnings!'))
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

  return {
    onHighCardBet: handleHighCardBet,
    onLowCardBet: handleLowCardBet,
    onHighCardStart: handleHighCardStart,
    onHighCardEnd: handleHighCardEnd,
  }
}

export const useBlackJack = (game: Game) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const fee = game.bnbFee
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleBlackJackStart = useCallback(
    async (betAmount) => {
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'startBlackJack',
          args: [betAmount],
          value: fee,
          account
        })
        const gas = (gasEstimate * 150n) / 100n
       const { request } = await simulateContract(config, {
          abi: coinflipAbi,
          address: getAddress(game.contractAddress, game.chainId),
          functionName: 'startBlackJack',
          args: [betAmount],
          value: fee,
          gas: gas,
          chainId: game.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success, Game has Started'))
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

  const handleBlackJackHitMe = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'blackJackHitMe',
        account
      })
      const gas = (gasEstimate * 150n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'blackJackHitMe',
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, Hit with Another Card'))
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

  const handleBlackJackHold = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'blackJackHold',
        account
      })
      const gas = (gasEstimate * 170n) / 100n
     const { request } = await simulateContract(config, {
        abi: coinflipAbi,
        address: getAddress(game.contractAddress, game.chainId),
        functionName: 'blackJackHold',
        gas: gas,
        chainId: game.chainId
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('Transaction Success, Card Held, Dealer Drawn'))
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

  return { onBJStart: handleBlackJackStart, onBJHit: handleBlackJackHitMe, onBJHold: handleBlackJackHold }
}
