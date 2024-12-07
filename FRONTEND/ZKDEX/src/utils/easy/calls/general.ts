import { Address, Token } from 'config/constants/types'
import { getAddress, getCompostAddress, getWrappedAddress } from 'utils/addressHelpers'
import { EasyTransactionError } from 'utils/types'
import { simulateContract, readContract, writeContract, waitForTransactionReceipt, getPublicClient } from '@wagmi/core'
import { TransactionReceipt, maxUint256 } from 'viem'
import { compostAbi } from 'config/abi/compost'
import { config } from 'wagmiConfig'
import { ERC20_ABI} from 'config/abi/ERC20ABI'
import sendTransactionPM from './paymaster'

export const approveAddress = async (
  address: Address,
  account: `0x${string}`,
  amount: bigint,
  contract: Address,
  chainId: number,
  payWithPM: boolean,
  payToken: string
): Promise<boolean> => {
  try {
    const allowance = await readContract(config, {
      abi: ERC20_ABI,
      address: getAddress(address, chainId),
      functionName: 'allowance',
      args: [account, getAddress(contract, chainId)],
      chainId
    })
    if (allowance <= amount) {
      const { request } = await simulateContract(config, {
        abi: ERC20_ABI,
        address: getAddress(address, chainId),
        functionName: 'approve',
        args: [getAddress(contract, chainId), maxUint256],
        chainId
      })
      const hash = await sendTransactionPM(request, payWithPM, chainId, payToken)
      // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      if (receipt.status === 'reverted') {
        return false
      }
    }
    return true
  } catch {
    return false
  }
}
export const approveAddressString = async (
  address: `0x${string}`,
  account: `0x${string}`,
  amount: bigint,
  contract: Address,
  chainId: number,
  payWithPM: boolean,
  payToken: string
): Promise<boolean> => {
  try {
    const allowance = await readContract(config, {
      abi: ERC20_ABI,
      address: address,
      functionName: 'allowance',
      args: [account, getAddress(contract, chainId)],
      chainId
    })
    if (allowance <= amount) {
      const { request } = await simulateContract(config, {
        abi: ERC20_ABI,
        address: address,
        functionName: 'approve',
        args: [getAddress(contract, chainId), maxUint256],
        chainId
      })
      const hash = await sendTransactionPM(request, payWithPM, chainId, payToken)
      // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      if (receipt.status === 'reverted') {
        return false
      }
    }
    return true
  } catch {
    return false
  }
}

export const approveToken = async (
  token: Token,
  account: `0x${string}`,
  amount: bigint,
  contract: Address,
  chainId: number,
  payWithPM: boolean,
  payToken: string
): Promise<boolean> => {
  return approveAddress(token.address, account, amount, contract, chainId, payWithPM, payToken)
}

export const cleanString = (amount: string): string => {
  let inAmount = amount
  if (typeof inAmount === 'string') {
    const index = inAmount.indexOf('.')
    if (index > -1) {
      inAmount = inAmount.substring(0, index)
    }
  }
  return inAmount
}

export const swapToken = async (
  inToken: Token,
  inRouter: string,
  outToken: Token,
  outRouter: `0x${string}`,
  amount: bigint,
  account: `0x${string}`,
  chainId: number,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string }> => {
const client = getPublicClient(config, {chainId})
const native = getWrappedAddress(chainId)
try {
    const isBNBIn = inToken.symbol === client.chain.nativeCurrency.symbol

    const outAddress = outToken.symbol === client.chain.nativeCurrency.symbol ? native : getAddress(outToken.address, chainId)
    const inAddress = isBNBIn ? native : getAddress(inToken.address, chainId)
  

    const preHarvest = await readContract(config, {
      abi: ERC20_ABI,
      address: outAddress,
      functionName: 'balanceOf',
      args: [account],
      chainId
    })
    let hash
    if (isBNBIn) {
      const args = [outAddress, outRouter, allowedSlippage]
      const { request } = await simulateContract(config, {
        abi: compostAbi,
        address: getCompostAddress(),
        functionName: '_bnbToToken',
        args,
        value: amount,
        from: account,
        chainId
      })
      const info = await sendTransactionPM(request, payWithPM, chainId, payToken)
      // const info = await writeContract(config, request)
      hash = info
    } else {
      const args = [inAddress, cleanString(amount.toString()), outAddress, inRouter, outRouter, allowedSlippage]
      const { request } = await simulateContract(config, {
        abi: compostAbi,
        address: getCompostAddress(),
        functionName: '_tokenToToken',
        args,
        from: account,
        chainId
      })
      const info = await sendTransactionPM(request, payWithPM, chainId, payToken)
      // const info = await writeContract(config, request)
      hash = info
    }
    const swapReceipt: TransactionReceipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (swapReceipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: `Failed to swap ${inToken.symbol} to ${outToken.symbol}`,
      }
    }
    const postHarvest = await readContract(config, {
      abi: ERC20_ABI,
      address: outAddress,
      functionName: 'balanceOf',
      args: [account],
      chainId
    })
    const finalAmount = postHarvest - preHarvest
    return {
      finalAmount,
      error: EasyTransactionError.None,
    }
  } catch (e) {
    console.error((e as Error).message)
    return {
      finalAmount: 0n,
      error: EasyTransactionError.Transaction,
      msg: 'Failed to run function',
    }
  }
}
