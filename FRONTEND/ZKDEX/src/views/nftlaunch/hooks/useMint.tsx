import { NFTLaunchConfig } from 'config/constants/types'
import { useCallback } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { useAppDispatch } from 'state'
import { updateNftLaunchMintData } from 'state/nftlaunch'
import { useAccount } from 'wagmi'
import { getPublicClient, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { getAddress } from 'utils/addressHelpers'
import { config } from 'wagmiConfig'

const handleMint = async (launch, account, amount, bnbCost) => {
  const publicClient = getPublicClient(config, {chainId: launch.chainId})
  const gasEstimate = await publicClient.estimateContractGas({
    abi: nftCollectionAbi,
    address: getAddress(launch.contractAddress, launch.chainId),
    functionName: 'mint',
    args: [account, amount],
    value: bnbCost,
    account
  })
  const gas = (gasEstimate * 115n) / 100n
  const { request } = await simulateContract(config, {
    abi: nftCollectionAbi,
    address: getAddress(launch.contractAddress, launch.chainId),
    functionName: 'mint',
    args: [account, amount],
    value: bnbCost,
    gas: gas,
    chainId: launch.chainId
  })
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash})
  return receipt
}

const handleWhitelistMint = async (launch, account) => {
  const publicClient = getPublicClient(config, {chainId: launch.chainId})
  const gasEstimate = await publicClient.estimateContractGas({
    abi: nftCollectionAbi,
    address: getAddress(launch.contractAddress, launch.chainId),
    functionName: 'whiteMint',
    account
  })
  const gas = (gasEstimate * 115n) / 100n
  const { request } = await simulateContract(config, {
    abi: nftCollectionAbi,
    address: getAddress(launch.contractAddress, launch.chainId),
    functionName: 'whiteMint',
    gas: gas,
    chainId: launch.chainId
  })
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash})
  return receipt
}

const useNftMint = (launch: NFTLaunchConfig) => {
  const { address: account } = useAccount()
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleNftMint = useCallback(
    async (amount, bnbCost) => {
      let receipt = await handleMint(launch, account, amount, bnbCost)
      if (receipt.status) {
        dispatch(updateNftLaunchMintData(amount))
        toastSuccess(t('Transaction Success, Minted!'))
      } else {
        // user rejected tx or didn't go thru
        toastError(
          t('Error'),
          t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
        )
        receipt = ['fail']
      }
      return receipt
    },
    [t, toastError, toastSuccess, dispatch, account, launch],
  )

  const handleWNfthitelistMint = useCallback(async () => {
    let receipt = await handleWhitelistMint(launch, account)
    if (receipt.status) {
      dispatch(updateNftLaunchMintData(1))
      toastSuccess(t('Transaction Success, Minted!'))
    } else {
      // user rejected tx or didn't go thru
      toastError(t('Error'), t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'))
      receipt = ['fail']
    }
    return receipt
  }, [t, toastError, toastSuccess, dispatch, account, launch])

  return { onNftMint: handleNftMint, onNftWhitelistMint: handleWNfthitelistMint }
}
export default useNftMint
