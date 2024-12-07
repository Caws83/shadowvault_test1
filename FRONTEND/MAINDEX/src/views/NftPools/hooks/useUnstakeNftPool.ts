// import { getMasterChefFromHost } from 'utils/contractHelpers'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { updateNftUserStakedBalance, updateNftUserBalance, updateNftPoolTotalStaked } from 'state/actions'
import { NFTPoolConfig } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import { getPublicClient, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'

import { useAccount } from 'wagmi'
import { nftPoolV2Abi } from 'config/abi/nftPoolV2'
import { getAddress } from 'utils/addressHelpers'
import { TransactionReceipt } from 'viem'
import { BigNumber } from 'bignumber.js'
import { config } from 'wagmiConfig'

const nftUnstake = async (nftPoolAddress, tokenIds, chainId) => {
  const { request } = await simulateContract(config, {
    abi: nftPoolV2Abi,
    address: getAddress(nftPoolAddress, chainId),
    functionName: 'unstake',
    args: [tokenIds],
    chainId
  })
  const hash = await writeContract(config, request)
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  
  return receipt.status
}

const nftUnstakeall = async (nftPoolAddress, chainId, account) => {
  const publicClient = await getPublicClient(config, {chainId})
  const gasEstimate = await publicClient.estimateContractGas({
    abi: nftPoolV2Abi,
    address: getAddress(nftPoolAddress, chainId),
    functionName: 'unstakeAll',
    chainId,
    account
  })

  const gas = (gasEstimate * 115n) / 110n
  console.info("gas Calculated:", new BigNumber(gas.toString()).toString())
  const { request } = await simulateContract(config, {
    abi: nftPoolV2Abi,
    address: getAddress(nftPoolAddress, chainId),
    functionName: 'unstakeAll',
    gas,
    chainId
  })
  const hash = await writeContract(config, request)
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  
  return receipt.status
}

const useUnstakeNftPool = (nftpool: NFTPoolConfig) => {
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()

  const handleUnstake = useCallback(
    async (tokenIds) => {
      await nftUnstake(nftpool.contractAddress, tokenIds, nftpool.chainId)
      dispatch(updateNftPoolTotalStaked(nftpool.nftCollectionId))
      dispatch(updateNftUserStakedBalance(nftpool.nftCollectionId, account, hosts.locker))
      dispatch(updateNftUserBalance(nftpool.nftCollectionId, account, hosts.locker))
    },
    [account, dispatch, nftpool],
  )

  const handleUnstakeAll = useCallback(async () => {
    await nftUnstakeall(nftpool.contractAddress, nftpool.chainId, account)
    dispatch(updateNftPoolTotalStaked(nftpool.nftCollectionId))
    dispatch(updateNftUserStakedBalance(nftpool.nftCollectionId, account, hosts.locker))
    dispatch(updateNftUserBalance(nftpool.nftCollectionId, account, hosts.locker))
  }, [account, dispatch, nftpool])

  return { onUnstake: handleUnstake, onUnstakeAll: handleUnstakeAll }
}

export default useUnstakeNftPool
