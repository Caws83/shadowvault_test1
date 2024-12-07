/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit'
import {
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  resetTransactions,
  SerializableTransactionReceipt,
} from './actions'

const now = () => new Date().getTime()

export interface TransactionDetails {
  hash: `0x${string}`
  approval?: { tokenAddress: `0x${string}`; spender: `0x${string}` }
  summary?: string
  claim?: { recipient: `0x${string}` }
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: string
  addedTime: number
  confirmedTime?: number
  from: string
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: `0x${string}`]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTransaction, (hashs, { payload: { chainId, from, hash, approval, summary, claim } }) => {
      if (hashs[chainId]?.[hash]) {
        throw Error('Attempted to add existing transaction.')
      }
      const txs = hashs[chainId] ?? {}
      txs[hash] = { hash, approval, summary, claim, from, addedTime: now() }
      hashs[chainId] = txs
    })
    .addCase(clearAllTransactions, (hashs, { payload: { chainId } }) => {
      if (!hashs[chainId]) return
      hashs[chainId] = {}
    })
    .addCase(checkedTransaction, (hashs, { payload: { chainId, hash, blockNumber } }) => {
      const tx = hashs[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = blockNumber > tx.lastCheckedBlockNumber ? blockNumber : tx.lastCheckedBlockNumber
      }
    })
    .addCase(finalizeTransaction, (hashs, { payload: { hash, chainId, receipt } }) => {
      const tx = hashs[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
    .addCase(resetTransactions, () => {
      return initialState
    }),
)
