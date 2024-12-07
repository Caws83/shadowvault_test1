// import { getMasterChefFromHost } from 'utils/contractHelpers'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { updateNftUserStakedBalance, updateNftUserBalance, updateNftPoolTotalStaked } from 'state/actions'
import { NFTPoolConfig } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import { useAccount } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import { nftPoolV2Abi } from 'config/abi/nftPoolV2'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

const nftStake = async (nftPoolAddress, tokenIds, chainId) => {
  const { request } = await simulateContract(config, {
    abi: nftPoolV2Abi,
    address: getAddress(nftPoolAddress, chainId),
    functionName: 'stake',
    args: [tokenIds],
    chainId
  })
  const hash = await writeContract(config, request)
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  
  return receipt.status
}

const nftStakeAll = async (nftPoolAddress, chainId) => {
  const { request } = await simulateContract(config, {
    abi: nftPoolV2Abi,
    address: getAddress(nftPoolAddress, chainId),
    functionName: 'stakeAll',
    chainId
  })
  const hash = await writeContract(config, request)
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  
  return receipt.status
}

const useStakeNftPool = (nftpool: NFTPoolConfig) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()

  const handleStake = useCallback(
    async (tokenIds) => {
      await nftStake(nftpool.contractAddress, tokenIds, nftpool.chainId)
      dispatch(updateNftPoolTotalStaked(nftpool.nftCollectionId))
      dispatch(updateNftUserStakedBalance(nftpool.nftCollectionId, account, hosts.locker))
      dispatch(updateNftUserBalance(nftpool.nftCollectionId, account, hosts.locker))
    },
    [account, dispatch, nftpool],
  )

  const handleStakeAll = useCallback(async () => {
    await nftStakeAll(nftpool.contractAddress, nftpool.chainId)
    dispatch(updateNftPoolTotalStaked(nftpool.nftCollectionId))
    dispatch(updateNftUserStakedBalance(nftpool.nftCollectionId, account, hosts.locker))
    dispatch(updateNftUserBalance(nftpool.nftCollectionId, account, hosts.locker))
  }, [account, dispatch, nftpool])

  return { onStake: handleStake, onStakeAll: handleStakeAll }
}

export default useStakeNftPool
