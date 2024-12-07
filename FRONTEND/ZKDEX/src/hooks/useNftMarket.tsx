import { useCallback } from 'react'
import useToast from './useToast'
import { useAccount } from 'wagmi'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { nftCollectionAbi } from '../config/abi/nftCollection'
import { nftMarketAbi } from '../config/abi/nftMarket'
import { erc404Token } from 'config/abi/tokens/erc404Token2'
import { NFT_MARKETPLACE } from '../config/marketPlace'
import { config } from 'wagmiConfig'
import { Address } from 'viem'
  

const buyNFT = async (collectionAddress: Address, chainId: number, bnbCost: bigint, nftId: bigint) => {
 
  const { request } = await simulateContract(config, {
    abi: nftMarketAbi,
    address: NFT_MARKETPLACE,
    functionName: 'buyTokenUsingBNB',
    args: [collectionAddress, nftId],
    chainId: chainId,
    value: bnbCost
  })
  const data = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash: data})
  return receipt
}

const createAsk = async (collectionAddress: Address, chainId: number, sellPrice: bigint, nftId: bigint) => {
 
  const { request } = await simulateContract(config, {
    abi: nftMarketAbi,
    address: NFT_MARKETPLACE,
    functionName: 'createAskOrder',
    args: [collectionAddress, nftId, sellPrice],
    chainId: chainId
  })
  const data = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash: data})
  return receipt
}

const modifyAsk = async (collectionAddress: Address, chainId: number, sellPrice: bigint, nftId: bigint) => {
 
  const { request } = await simulateContract(config, {
    abi: nftMarketAbi,
    address: NFT_MARKETPLACE,
    functionName: 'modifyAskOrder',
    args: [collectionAddress, nftId, sellPrice],
    chainId: chainId
  })
  const data = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash: data})
  return receipt
}

const approveNFT = async (collectionAddress: Address, chainId: number) => {
 
  const { request } = await simulateContract(config, {
    abi: nftCollectionAbi,
    address: collectionAddress,
    functionName: 'setApprovalForAll',
    args: [NFT_MARKETPLACE, true],
    chainId: chainId
  })
  const data = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash: data})
  return receipt
}

const cancelNFT = async (collectionAddress: Address, chainId: number, nftId: bigint) => {
 
  const { request } = await simulateContract(config, {
    abi: nftMarketAbi,
    address: NFT_MARKETPLACE,
    functionName: 'cancelAskOrder',
    args: [collectionAddress, nftId],
    chainId: chainId
  })
  const data = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash: data})
  return receipt
}

const claimRevenue = async (collectionAddress: Address, chainId: number) => {
 
  const { request } = await simulateContract(config, {
    abi: nftMarketAbi,
    address: NFT_MARKETPLACE,
    functionName: 'claimPendingRevenue',
    chainId: chainId
  })
  const data = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash: data})
  return receipt
}

const transferNFT = async (collectionAddress: Address, chainId: number, nftId: bigint, to: Address, from: Address) => {
 
  const { request } = await simulateContract(config, {
    abi: nftCollectionAbi,
    address: collectionAddress,
    functionName: 'safeTransferFrom',
    args: [from, to, nftId],
    chainId: chainId
  })
  const data = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {hash: data})
  return receipt
}


const useMarket = (collectionAddress: Address, chainId: number) => {
  const { address: account } = useAccount()
  const { toastSuccess, toastError } = useToast()


  const handleBuy = useCallback(
    async (nftId: bigint, bnbCost: bigint) => {
      let receipt = await buyNFT(collectionAddress, chainId, bnbCost, nftId)
      if (receipt.status) {
        toastSuccess('Purchase Succesfull!')
      } else {
        // user rejected tx or didn't go thru
        toastError(
          'Error',
          'User Rejected tx or it did not go through properly. Please Try again, and check gas!',
        )
      }
      return receipt
    },
    [toastError, toastSuccess, account],
  )

  const handleCancel = useCallback(
    async (nftId: bigint) => {
      let receipt = await cancelNFT(collectionAddress, chainId, nftId)
      if (receipt.status) {
        toastSuccess('Succesfully canceled!')
      } else {
        // user rejected tx or didn't go thru
        toastError(
          'Error',
          'User Rejected tx or it did not go through properly. Please Try again, and check gas!',
        )
      }
      return receipt
    },
    [toastError, toastSuccess, account],
  )

  const handleClaim = useCallback(
    async () => {
      let receipt = await claimRevenue(collectionAddress, chainId)
      if (receipt.status) {
        toastSuccess('Succesfully claimed!')
      } else {
        // user rejected tx or didn't go thru
        toastError(
          'Error',
          'User Rejected tx or it did not go through properly. Please Try again, and check gas!',
        )
      }
      return receipt
    },
    [toastError, toastSuccess, account],
  )

  const handleCreate = useCallback(
    async (nftId: bigint, sellPrice: bigint) => {
      let receipt = await createAsk(collectionAddress, chainId, sellPrice, nftId)
      if (receipt.status) {
        toastSuccess('NFT is now for Sale!')
      } else {
        // user rejected tx or didn't go thru
        toastError(
          'Error',
          'User Rejected tx or it did not go through properly. Please Try again, and check gas!',
        )
      }
      return receipt
    },
    [toastError, toastSuccess, account],
  )

  const handleModify = useCallback(
    async (nftId: bigint, sellPrice: bigint) => {
      let receipt = await modifyAsk(collectionAddress, chainId, sellPrice, nftId)
      if (receipt.status) {
        toastSuccess('Ask Price Has Changed!')
      } else {
        // user rejected tx or didn't go thru
        toastError(
          'Error',
          'User Rejected tx or it did not go through properly. Please Try again, and check gas!',
        )
      }
      return receipt
    },
    [toastError, toastSuccess, account],
  )

  const handleApprove = useCallback(
    async () => {
      let receipt = await approveNFT(collectionAddress, chainId)
      if (receipt.status) {
        toastSuccess('Approval Success')
      } else {
        // user rejected tx or didn't go thru
        toastError(
          'Error',
          'User Rejected tx or it did not go through properly. Please Try again, and check gas!',
        )
      }
      return receipt
    },
    [toastError, toastSuccess, account],
  )

  const handleTransfer = useCallback(
    async (nftId: bigint, to: Address, from: Address) => {
      let receipt = await transferNFT(collectionAddress, chainId, nftId, to, from)
      if (receipt.status) {
        toastSuccess('Transfer Success')
      } else {
        // user rejected tx or didn't go thru
        toastError(
          'Error',
          'User Rejected tx or it did not go through properly. Please Try again, and check gas!',
        )
      }
      return receipt
    },
    [toastError, toastSuccess, account],
  )


  
    const handleUserIds = useCallback(
      async (balance: bigint) => {
        let tokenIds: bigint[] = []

        try {
          const tIds = await readContract(config, {
            address: collectionAddress,
            abi: erc404Token,
            functionName: 'owned',
            args: [account ?? "0x0"],
            chainId
          })
          return tIds
        } catch{


        for(let i=0; i<balance; i++){
          const tId = await readContract(config, {
            address: collectionAddress,
            abi: nftCollectionAbi,
            functionName: 'tokenOfOwnerByIndex',
            args: [account ?? "0x0", BigInt(i)],
            chainId
          })
          tokenIds.push(tId)
        }
      }
        
        return tokenIds
      },
      [toastError, toastSuccess, account],
    )


  return { 
    nftBuy: handleBuy, 
    getUserIds: handleUserIds, 
    nftSell: handleCreate, 
    nftApprove: handleApprove, 
    nftCancel: handleCancel,
    nftTransfer: handleTransfer,
    nftModify: handleModify,
    nftClaim: handleClaim
  }
}
export default useMarket
