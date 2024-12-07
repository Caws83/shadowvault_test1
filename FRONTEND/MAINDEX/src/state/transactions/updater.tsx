import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Text, Flex, Link } from 'uikit'
import { getBscScanLink } from 'utils'
import { useBlock } from 'state/block/hooks'
import useToast from 'hooks/useToast'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, finalizeTransaction } from './actions'
import { useChainId } from 'wagmi'
import { fetchTransaction, waitForTransactionReceipt } from "@wagmi/core";
import BigNumber from 'bignumber.js'
import { TransactionReceipt } from 'viem'

export function shouldCheck(
  currentBlock: BigNumber,
  tx: { addedTime: number; receipt?: any; lastCheckedBlockNumber?: BigNumber },
): boolean {
  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = currentBlock.minus(tx.lastCheckedBlockNumber)
  if (blocksSinceCheck.lt(1)) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck.gt(9)
  }
  if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck.gt(2)
  }
  // otherwise every block
  return true
}

export default function Updater(): null {
  const chainId = useChainId()
  const { currentBlock } = useBlock()

  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>((s) => s.transactions)

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [chainId, state])

  const { toastError, toastSuccess } = useToast()

  useEffect(() => {
    if (!chainId || !currentBlock) return

    Object.keys(transactions)
      .filter((hash) => shouldCheck(new BigNumber(currentBlock), transactions[hash]))
      .forEach(async (hash) => {
        waitForTransactionReceipt({chainId, hash: hash as `0x${string}` }).then((receipt: TransactionReceipt) => {
          if (receipt && receipt.blockHash !== null) {
            console.log(receipt);
            dispatch(
              finalizeTransaction({
                chainId,
                hash: hash as `0x${string}`,
                receipt: {
                  blockHash: receipt.blockHash,
                  blockNumber: receipt.blockNumber?.toString(),
                  contractAddress: receipt.contractAddress,
                  from: receipt.from,
                  status: 'success',
                  to: receipt.to,
                  transactionHash: receipt.transactionHash,
                  transactionIndex: receipt.transactionIndex,
                },
              }),
            )

            const toast = receipt.status === 'success' ? toastSuccess : toastError
            toast(
              'Transaction receipt',
              <Flex flexDirection="column">
                <Text>{transactions[hash]?.summary ?? `Hash: ${hash.slice(0, 8)}...${hash.slice(58, 65)}`}</Text>
                {chainId && (
                  <Link external href={getBscScanLink(hash, 'transaction', chainId)}>
                    View Transaction
                  </Link>
                )}
              </Flex>,
            )
          } else {
            dispatch(checkedTransaction({ chainId, hash: hash as `0x${string}`, blockNumber: currentBlock }))
          }        
        });
      });
  }, [chainId, transactions, currentBlock, dispatch, toastSuccess, toastError])

  return null
}
