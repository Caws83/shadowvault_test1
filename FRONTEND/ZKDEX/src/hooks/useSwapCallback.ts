import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from 'sdk'
import { useMemo } from 'react'
import { getAddress } from 'utils/addressHelpers'
import { Address, Dex } from 'config/constants/types'
// import contracts from 'config/constants/contracts'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../config/constants'
import { calculateGasMargin } from '../utils'
import isZero from '../utils/isZero'
import useTransactionDeadline from './useTransactionDeadline'
import { getPublicClient, waitForTransactionReceipt, simulateContract, writeContract } from "@wagmi/core";
import { pancakeRouterAbi } from 'config/abi/pancakeRouter'
import { useGasPrice, useGasTokenManager } from 'state/user/hooks'
import contracts from 'config/constants/contracts'
import { superRouterAbi } from 'config/abi/superRouter'
import { config } from 'wagmiConfig'
import useToast from 'hooks/useToast'
import { TransactionReceipt } from 'viem'
import sendTransactionPM from 'utils/easy/calls/paymaster'


export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Address
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: bigint
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
export function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips,
  routerAddress: Address,
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  chainId: number,
  account: string,
  FLAT_FEE: number,
): SwapCall[] {

  const txFee = FLAT_FEE

  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName
  const deadline = useTransactionDeadline(chainId)

  return useMemo(() => {
    if (!trade || !recipient || !account || !chainId || !deadline || !routerAddress) return []

    const swapMethods = []

    swapMethods.push(
      Router.swapCallParameters(
        trade,
        {
          feeOnTransfer: false,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          deadline: deadline.toNumber(),
        },
        chainId,
        txFee,
      ),
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(
          trade,
          {
            feeOnTransfer: true,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber(),
          },
          chainId,
          txFee,
        ),
      )
    }

    return swapMethods.map((parameters) => ({ parameters, contract: routerAddress }))
  }, [account, allowedSlippage, chainId, deadline, recipient, trade, routerAddress, txFee])
}

function useSwapCallArgumentsBest(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips,
  routerAddress: Address,
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  chainId: number,
  account: string,
  FLAT_FEE: number,
): SwapCall[] {

  const txFee = FLAT_FEE

  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName
  const deadline = useTransactionDeadline(chainId)

  return useMemo(() => {
    if (!trade || !recipient || !account || !chainId || !deadline || !routerAddress) return []

    const swapMethods = []

    swapMethods.push(
      Router.swapCallParameters(
        trade,
        {
          feeOnTransfer: false,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          deadline: deadline.toNumber(),
        },
        chainId,
        txFee,
      ),
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(
          trade,
          {
            feeOnTransfer: true,
            allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
            recipient,
            deadline: deadline.toNumber(),
          },
          chainId,
          txFee,
        ),
      )
    }

    return swapMethods.map((parameters) => ({ parameters, contract: routerAddress }))
  }, [account, allowedSlippage, chainId, deadline, recipient, trade, routerAddress, txFee])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  dex:Dex,
  account: string,
  FLAT_FEE: number,
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {

  const isMarswap = dex ? dex.isMars : false
  const router = dex ? dex.router : undefined
  const chainId = dex ? dex.chainId : undefined

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, router, recipientAddressOrName, chainId, account as string, FLAT_FEE)
  const gasPrice = useGasPrice()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName
  return useMemo(() => {
    if (!trade || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (swapCalls === undefined || swapCalls.length === 0) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'No swapCalls' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      }
      return { state: SwapCallbackState.LOADING, callback: null, error: null }
    }
    const publicClient = getPublicClient(config, {chainId})
    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(async (call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call

              
              
              if(!isMarswap) args.push(getAddress(contract, chainId))

            if(isMarswap) {
            try {
              const gasEstimate = await publicClient.estimateContractGas({
                account: account,
                address: getAddress(contract, chainId),
                abi: pancakeRouterAbi,
                functionName: methodName as
                  | 'swapETHForExactTokens'
                  | 'swapExactETHForTokens'
                  | 'swapExactETHForTokensSupportingFeeOnTransferTokens'
                  | 'swapExactTokensForETH'
                  | 'swapExactTokensForETHSupportingFeeOnTransferTokens'
                  | 'swapExactTokensForTokens'
                  | 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
                  | 'swapTokensForExactETH'
                  | 'swapTokensForExactTokens',
                args: args as any,
                value: value,
                chainId,
                gasPrice
              })
              return { call, gasEstimate }
            } catch (error: any) {
              return {call, error}
            }

          } else {

            try {
              
              const gasEstimate = await publicClient.estimateContractGas({
                account: account,
                address: getAddress(contracts.superRouter, chainId),
                abi: superRouterAbi,
                functionName: methodName as
                  | 'swapETHForExactTokens'
                  | 'swapExactETHForTokens'
                  | 'swapExactETHForTokensSupportingFeeOnTransferTokens'
                  | 'swapExactTokensForETH'
                  | 'swapExactTokensForETHSupportingFeeOnTransferTokens'
                  | 'swapExactTokensForTokens'
                  | 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
                  | 'swapTokensForExactETH'
                  | 'swapTokensForExactTokens',
                args: args as any,
                value: value,
                chainId,
                gasPrice
              })
              return { call, gasEstimate }
            } catch (error: any) {
              return {call, error}
            }

          }

          }),
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation

        try {
         const { request } = await simulateContract(config, {
            address: isMarswap ? getAddress(contract, chainId) : getAddress(contracts.superRouter, chainId),
            abi: isMarswap  ? pancakeRouterAbi : superRouterAbi,
            functionName: methodName,
            args: args as any,
            ...(value && !isZero(value) ? { value, from: account } : { from: account }),
            gas: calculateGasMargin(gasEstimate).toString(),
            chainId,
            gasPrice
          })
          
        
          const hash = await sendTransactionPM(request,payWithPM, chainId, getAddress(payToken.address, chainId))
          return hash
          
        } catch (error: any) {
           // if the user rejected the tx, pass this along
           if (error?.cause?.code === 4001) {
            throw new Error('Transaction rejected.')
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Swap failed`, error, methodName, args, value)
            throw new Error(`Swap failed: ${error.details}`)
          }

        }
      },
      error: null,
    }
  }, [trade, account, chainId, recipient, recipientAddressOrName, swapCalls])
}

export function useSwapCallbackBest(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  dex: Dex,
  account: string,
  FLAT_FEE: number,
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  
  const isMarswap = dex ? dex.isMars : false
  const router = dex ? dex.router : undefined
  const chainId = dex ? dex.chainId : undefined
  
  const swapCalls = useSwapCallArgumentsBest(trade, allowedSlippage, router, recipientAddressOrName, chainId, account as string, FLAT_FEE)
  const gasPrice = useGasPrice()
  const { toastSuccess, toastError } = useToast()

  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName
  return useMemo(() => {
    if (!trade || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (swapCalls === undefined || swapCalls.length === 0) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'No swapCalls' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      }
      return { state: SwapCallbackState.LOADING, callback: null, error: null }
    }
    const publicClient = getPublicClient(config, {chainId})
    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(async (call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call

            
            if(!isMarswap) args.push(getAddress(contract, chainId))

          if(isMarswap) {
          try {
            const gasEstimate = await publicClient.estimateContractGas({
              account: account,
              address: getAddress(contract, chainId),
              abi: pancakeRouterAbi,
              functionName: methodName as
                | 'swapETHForExactTokens'
                | 'swapExactETHForTokens'
                | 'swapExactETHForTokensSupportingFeeOnTransferTokens'
                | 'swapExactTokensForETH'
                | 'swapExactTokensForETHSupportingFeeOnTransferTokens'
                | 'swapExactTokensForTokens'
                | 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
                | 'swapTokensForExactETH'
                | 'swapTokensForExactTokens',
              args: args as any,
              value: value,
              chainId,
              gasPrice
            })
            return { call, gasEstimate }
          } catch (error: any) {
            return {call, error}
          }

        } else {

          try {
            
            const gasEstimate = await publicClient.estimateContractGas({
              account: account,
              address: getAddress(contracts.superRouter, chainId),
              abi: superRouterAbi,
              functionName: methodName as
                | 'swapETHForExactTokens'
                | 'swapExactETHForTokens'
                | 'swapExactETHForTokensSupportingFeeOnTransferTokens'
                | 'swapExactTokensForETH'
                | 'swapExactTokensForETHSupportingFeeOnTransferTokens'
                | 'swapExactTokensForTokens'
                | 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
                | 'swapTokensForExactETH'
                | 'swapTokensForExactTokens',
              args: args as any,
              value: value,
              chainId,
              gasPrice
            })
            return { call, gasEstimate }
          } catch (error: any) {
            return {call, error}
          }

        }

        }),
      )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation

        try {
          const { request} = await simulateContract(config, {
            address: isMarswap ? getAddress(contract, chainId) : getAddress(contracts.superRouter, chainId),
            abi: isMarswap  ? pancakeRouterAbi : superRouterAbi,
            functionName: methodName,
            args: args as any,
            ...(value && !isZero(value) ? { value, from: account } : { from: account }),
            gas: calculateGasMargin(gasEstimate),
            chainId,
            gasPrice
          })
          const hash = await writeContract(config, request);
          const receipt = await waitForTransactionReceipt(config, {hash}) as TransactionReceipt

          if (receipt.status) {
            toastSuccess(
              'Congrats', 
                'Your Swap  Was Successful'
            )
          } else {
            // user rejected tx or didn't go thru
            toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
          }
       
 
          return hash
        } catch (error: any) {
           // if the user rejected the tx, pass this along
           if (error?.cause?.code === 4001) {
            throw new Error('Transaction rejected.')
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Swap failed`, error, methodName, args, value)
            throw new Error(`Swap failed: ${error.details}`)
          }

        }
      },
      error: null,
    }
  }, [trade, account, chainId, recipient, recipientAddressOrName, swapCalls])
}

export function useFetchSwapRequest(
  trade: Trade | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  dex: Dex,
  account: string,
  FLAT_FEE: number,
): { request: null | any; error: string | null } {



  const isMarswap = dex ? dex.isMars : false
  const router = dex ? dex.router : undefined
  const chainId = dex ? dex.chainId : undefined

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, router, account, chainId, account as string, FLAT_FEE)
  const gasPrice = useGasPrice()

  const recipient = account === null ? account : account

  return useMemo(() => {
    if (!trade || !account || !chainId) {
      return { request: null, error: 'Missing dependencies' }
    }
    if (swapCalls === undefined || swapCalls.length === 0) {
      return { request: null, error: 'No swapCalls' }
    }
    if (!recipient) {
      if (account !== null) {
        return { request: null, error: 'Invalid recipient' }
      }
      return { request: null, error: null }
    }

    const publicClient = getPublicClient(config, { chainId })

    return {
      request: async function getSwapRequest() {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(async (call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call

            if (!isMarswap) args.push(getAddress(contract, chainId))

            try {
              const gasEstimate = await publicClient.estimateContractGas({
                account: account,
                address: isMarswap ? getAddress(contract, chainId) : getAddress(contracts.superRouter, chainId),
                abi: isMarswap ? pancakeRouterAbi : superRouterAbi,
                functionName: methodName as
                  | 'swapETHForExactTokens'
                  | 'swapExactETHForTokens'
                  | 'swapExactETHForTokensSupportingFeeOnTransferTokens'
                  | 'swapExactTokensForETH'
                  | 'swapExactTokensForETHSupportingFeeOnTransferTokens'
                  | 'swapExactTokensForTokens'
                  | 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
                  | 'swapTokensForExactETH'
                  | 'swapTokensForExactTokens',
                args: args as any,
                value: value,
                chainId,
                gasPrice
              })
              return { call, gasEstimate }
            } catch (error: any) {
              return { call, error }
            }
          }),
        )

        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation

        try {
          const {request} = await simulateContract(config, {
            address: isMarswap ? getAddress(contract, chainId) : getAddress(contracts.superRouter, chainId),
            abi: isMarswap ? pancakeRouterAbi : superRouterAbi,
            functionName: methodName,
            args: args as any,
            ...(value && !isZero(value) ? { value, from: account } : { from: account }),
            gas: calculateGasMargin(gasEstimate).toString(),
            chainId,
            gasPrice
          })

          return request
        } catch (error: any) {
          console.error(`Swap request failed`, error, methodName, args, value)
          throw new Error(`Swap request failed: ${error.details}`)
        }
      },
      error: null,
    }
  }, [trade, account, chainId, recipient, swapCalls, isMarswap])
}


