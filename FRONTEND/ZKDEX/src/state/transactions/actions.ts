import { createAction } from '@reduxjs/toolkit'
import { ChainId } from 'sdk'

export interface SerializableTransactionReceipt {
  to: `0x${string}`
  from: `0x${string}`
  contractAddress: `0x${string}`
  transactionIndex: number
  blockHash: `0x${string}`
  transactionHash: `0x${string}`
  blockNumber: string
  status?: string
}

export const addTransaction = createAction<{
  chainId: ChainId
  hash: `0x${string}`
  from: `0x${string}`
  approval?: { tokenAddress: `0x${string}`; spender: `0x${string}` }
  claim?: { recipient: `0x${string}` }
  summary?: string
}>('transactions/addTransaction')
export const clearAllTransactions = createAction<{ chainId: ChainId }>('transactions/clearAllTransactions')
export const finalizeTransaction = createAction<{
  chainId: ChainId
  hash: `0x${string}`
  receipt: SerializableTransactionReceipt
}>('transactions/finalizeTransaction')
export const checkedTransaction = createAction<{
  chainId: ChainId
  hash: `0x${string}`
  blockNumber: string
}>('transactions/checkedTransaction')
export const resetTransactions = createAction('transactions/resetTransactions');
