import { useState, useCallback } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { getAddress, getNftContractAdress } from 'utils/addressHelpers'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import {
  useAccount,
  useReadContract,
  usePublicClient,
} from 'wagmi'
import { simulateContract, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { getLotteryAddress } from 'state/lottery/helpers'
import { lotteryV3Abi } from 'config/abi/lotteryV3'
import { TransactionReceipt } from 'viem'
import { BigNumber } from 'bignumber.js'
import { config } from 'wagmiConfig'

export const useIsPublic = (id, chainId: number) => {
  
  // const [isPublic, setIsPublic] = useState(false)

      const launchAddress = getNftContractAdress(id)
      const isPublic = useReadContract({
        address: launchAddress,
        abi: nftCollectionAbi,
        functionName: 'goPublic',
        chainId,
      })
 

  return isPublic
}

export const useClaimNFTTickets = (symbol, howMany, chainId: number) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const publicClient = usePublicClient({chainId})
  const lotteryAddress = getLotteryAddress(symbol)
  const { address: account} = useAccount()


  const handleClaimNFTTickets = useCallback(async () => {
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        address: getAddress(lotteryAddress, chainId),
        abi: lotteryV3Abi,
        functionName: 'NFTTickets',
        args: [howMany],
        account
      })
      const gas = (gasEstimate * 115n) / 110n
      const { request } = await simulateContract(config, {
        address: getAddress(lotteryAddress, chainId),
        abi: lotteryV3Abi,
        functionName: 'NFTTickets',
        gas: gas,
        args: [howMany],
        chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status) {
        toastSuccess(t('Transaction Success, Your Lottery Tickets have been Claimed for this Draw'))
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
  }, [symbol, howMany, t, toastError, toastSuccess])

  const handleClaimNFTTicketsV3 = useCallback(async () => {
    try {
      const feePerResponse = await readContract(config, {
        address: getAddress(lotteryAddress, chainId),
        abi: lotteryV3Abi,
        functionName: 'BNBfee',
        chainId
      })
      const totalFee = new BigNumber(feePerResponse.toString()).times(howMany)
      const gasEstimate = await publicClient.estimateContractGas({
        address: getAddress(lotteryAddress, chainId),
        abi: lotteryV3Abi,
        functionName: 'NFTTickets',
        args: [howMany],
        account,
        value: totalFee,
      })
      const gas = (gasEstimate * 115n) / 110n

      const { request } = await simulateContract(config, {
        address: getAddress(lotteryAddress, chainId),
        abi: lotteryV3Abi,
        functionName: 'NFTTickets',
        gas: gas,
        args: [howMany],
        value: totalFee,
        chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status) {
        toastSuccess(t('Transaction Success, Your Lottery Tickets have been Claimed for this Draw'))
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
  }, [symbol, howMany, t, toastError, toastSuccess])

  return { handleClaimNFTTickets, handleClaimNFTTicketsV3 }
}
