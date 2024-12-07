import { Trade, TokenAmount, CurrencyAmount, getETHER } from 'sdk'
import { useCallback, useMemo, useState } from 'react'
import useTokenAllowance from './useTokenAllowance'
import { Field } from '../state/swap/actions'
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { calculateGasMargin } from '../utils'
import {  useAccount } from 'wagmi'
import {  Address, maxUint256 } from 'viem'
import {  getPublicClient, simulateContract, writeContract } from '@wagmi/core'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'
import sendTransactionPM from 'utils/easy/calls/paymaster'
import { useGasTokenManager } from 'state/user/hooks'
import { getAddress } from 'utils/addressHelpers'


export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval, a function to approve, and a function to get the request
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: Address,
  chainId?: number,
): [ApprovalState, () => Promise<void>, () => Promise<any | null>] { // Updated return type to include `getRequest`
  const ETHER = getETHER(chainId)
  const { address: account } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const [request, setRequest] = useState<any | null>(null); // State to store the request
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender, chainId)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED
    if (!currentAllowance) return ApprovalState.UNKNOWN
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  // Function to get the request object
  const getRequest = useCallback(async (): Promise<any | null> => {
    if (!token) {
      console.error('no token')
      return null
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return null
    }

    if (!spender) {
      console.error('no spender')
      return null
    }

    let useExact = false
    const publicClient = getPublicClient(config, { chainId })
    
    const estimateGas = await publicClient
      .estimateContractGas({
        address: token.address as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, maxUint256],
        chainId,
        account
      })
      .catch(() => {
        useExact = true
        return publicClient.estimateContractGas({
          address: token.address as Address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spender, BigInt(amountToApprove.raw.toString())],
          chainId,
          account
        })
      })
      
    const { request } = await simulateContract(config, {
      address: token.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, useExact ? BigInt(amountToApprove.raw.toString()) : maxUint256],
      gas: calculateGasMargin(estimateGas),
      chainId
    })
    
    setRequest(request); // Store the request in state
    return request; // Return the request
  }, [token, amountToApprove, spender, chainId, account])

  // Function to approve
  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }

    const request = await getRequest();
    if (!request) {
      console.error('failed to get request')
      return
    }

    try {
      const r = await sendTransactionPM(request, payWithPM, chainId, getAddress(payToken.address, chainId))
      if (r === undefined) {
        console.log("undefined")
      }
    } catch (err) {
      console.log(err);
    }
  }, [approvalState, getRequest, payWithPM, chainId, payToken])

  return [approvalState, approve, getRequest] // Return the getRequest function along with the existing returns
}


// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(router: Address, chainId: number, trade?: Trade, allowedSlippage = 0) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage, chainId)[Field.INPUT] : undefined),
    [trade, allowedSlippage],
  )
  return useApproveCallback(amountToApprove, router, chainId)
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallbackBest(
  amountToApprove?: CurrencyAmount,
  spender?: Address,
  chainId?: number,
): [ApprovalState, () => Promise<void>] {
  const ETHER = getETHER(chainId)
  const { address: account } = useAccount()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender, chainId)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN
    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  // const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false
    const publicClient =  getPublicClient(config, {chainId})
    const estimateGas = await publicClient
      .estimateContractGas({
        address: token.address as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, maxUint256],
        chainId,
        account
      })
      .catch(() => {
        useExact = true
        return publicClient.estimateContractGas({
          address: token.address as Address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spender, BigInt(amountToApprove.raw.toString())],
          chainId,
          account
        })
      })
    const { request } = await simulateContract(config, {
      address: token.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, useExact ? BigInt(amountToApprove.raw.toString()) : maxUint256],
      gas: calculateGasMargin(estimateGas),
      chainId
    })
    try {
    const info = await writeContract(config, request)
    /*
    addTransaction(info, chainId,
      account, {
      summary: `Approve ${amountToApprove.currency.symbol}`,
      approval: { tokenAddress: token.address as Address, spender },
    })
    */
  } catch (err) {
    console.log(err);
  }
    // eslint-disable-next-line consistent-return
  }, [approvalState, token, amountToApprove, spender])

  return [approvalState, approve]
}

export function useApproveCallbackFromTradeBest(router: Address, chainId: number, trade?: Trade, allowedSlippage = 0) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage, chainId)[Field.INPUT] : undefined),
    [trade, allowedSlippage],
  )
  return useApproveCallbackBest(amountToApprove, router)
}
