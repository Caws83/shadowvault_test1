import { useCallback } from 'react'
import hosts from 'config/constants/hosts'
import { NFTPoolConfig } from 'config/constants/types'
import { useAppDispatch } from 'state'
import { updateNftUserBalance, updateNftUserStakedBalance } from 'state/actions'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { nftPoolAbi } from 'config/abi/nftpool'
import { getAddress } from 'utils/addressHelpers'
import { nftPoolV2Abi } from 'config/abi/nftPoolV2'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

const handleHarvest = async (nftpool: NFTPoolConfig) => {
  const { request } = await simulateContract(config, {
    abi: nftPoolAbi,
    address: getAddress(nftpool.contractAddress, nftpool.chainId),
    functionName: 'claimReward',
    chainId: nftpool.chainId
  })
  const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

const handleHarvestv2 = async (nftpool: NFTPoolConfig) => {
  const { request } = await simulateContract(config, {
    abi: nftPoolV2Abi,
    address: getAddress(nftpool.contractAddress, nftpool.chainId),
    functionName: 'claimAllRewards',
    chainId: nftpool.chainId
  })
  const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

const handlePrevHarvest = async (nftpool: NFTPoolConfig, index) => {
  const { request } = await simulateContract(config, {
    abi: nftPoolAbi,
    address: getAddress(nftpool.contractAddress, nftpool.chainId),
    functionName: 'claimPrevRewardsByRound',
    args: [index],
    chainId: nftpool.chainId
  })
  const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

const handleClearHarvest = async (nftpool: NFTPoolConfig, index) => {
  const { request } = await simulateContract(config, {
    abi: nftPoolV2Abi,
    address: getAddress(nftpool.contractAddress, nftpool.chainId),
    functionName: 'clearRewardsByRound',
    args: [index],
    chainId: nftpool.chainId
  })
  const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

const useNftHarvest = (nftpool: NFTPoolConfig) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()

  const handleNftHarvest = useCallback(async () => {
   
    await handleHarvestv2(nftpool)

    dispatch(updateNftUserStakedBalance(nftpool.nftCollectionId, account, hosts.locker))
    dispatch(updateNftUserBalance(nftpool.nftCollectionId, account, hosts.locker))
  }, [account, dispatch, nftpool])

  const handleNftPrevHarvest = useCallback(
    async (index) => {
      await handlePrevHarvest(nftpool, index)
      dispatch(updateNftUserStakedBalance(nftpool.nftCollectionId, account, hosts.locker))
      dispatch(updateNftUserBalance(nftpool.nftCollectionId, account, hosts.locker))
    },
    [account, dispatch, nftpool],
  )

  const handleNftClearHarvest = useCallback(
    async (index) => {
      await handleClearHarvest(nftpool, index)
      dispatch(updateNftUserStakedBalance(nftpool.nftCollectionId, account, hosts.locker))
      dispatch(updateNftUserBalance(nftpool.nftCollectionId, account, hosts.locker))
    },
    [account, dispatch, nftpool],
  )

  return { onNftHarvest: handleNftHarvest, onNftPrevHarvest: handleNftPrevHarvest, onClear: handleNftClearHarvest }
}

export default useNftHarvest
