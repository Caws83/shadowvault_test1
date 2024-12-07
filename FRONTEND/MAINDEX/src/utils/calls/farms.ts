import { simulateContract, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import BigNumber from 'bignumber.js'
import { Host } from 'config/constants/types'
import { getAddress } from 'utils/addressHelpers'
import sendTransactionPM from 'utils/easy/calls/paymaster'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

export const stakeFarm = async (pid, decimals: number, amount: string, host: Host, payWithPM: boolean, feeTokenAddress: string, getRequest: boolean = false) => {
  const value = new BigNumber(amount).shiftedBy(decimals)
  if (pid === 0 && host.hasLeaveStaking) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      functionName: 'enterStaking',
      address: getAddress(host.masterChef, host.chainId),
      args: [BigInt(value.toString())],
      chainId: host.chainId
    })
    if(getRequest){
      return request
    }
    const hash = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
    return receipt.status
  }

  if (host.isLocker) {
    const info = await readContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'lockTimes',
      args: [BigInt(pid)],
      chainId: host.chainId,
    })
    if (!info[4]) {
      const fee = await readContract(config, {
        abi: host.chefAbi,
        address: getAddress(host.masterChef, host.chainId),
        functionName: 'lockFee',
        args: [],
        chainId: host.chainId,
      })
      const { request } = await simulateContract(config, {
        abi: host.chefAbi,
        address: getAddress(host.masterChef, host.chainId),
        functionName: 'deposit',
        args: [BigInt(pid), BigInt(value.toString())],
        value: fee,
        chainId: host.chainId,
      })
      if(getRequest){
        return request
      }
      const hash = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
      // const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      return receipt.status
    }
  }

  let hash: `0x${string}`
  if (host.requiresReferral) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'deposit',
      args: [BigInt(pid), BigInt(value.toString()), getAddress(host.referralAddress, host.chainId)],
      chainId: host.chainId,
    })
    if(getRequest){
      return request
    }
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  } else if (host.requiresExtraBool) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'deposit',
      args: [BigInt(pid), BigInt(value.toString()), true],
      chainId: host.chainId,
    })
    if(getRequest){
      return request
    }
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  } else {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'deposit',
      args: [BigInt(pid), BigInt(value.toString())],
      chainId: host.chainId,
    })
    if(getRequest){
      return request
    }
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  }
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

export const unstakeFarm = async (pid, decimals: number, amount: string, host: Host, payWithPM: boolean, feeTokenAddress: string) => {
  const value = new BigNumber(amount).shiftedBy(decimals);
  if (pid === 0 && host.hasLeaveStaking) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'leaveStaking',
      args: [BigInt(value.toString())],
      chainId: host.chainId,
    })
    const hash = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
    return receipt.status
  }

  let hash: `0x${string}`
  if (host.requiresExtraBool) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'withdraw',
      args: [BigInt(pid), BigInt(value.toString()), true],
      chainId: host.chainId,
    })
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  } else {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'withdraw',
      args: [BigInt(pid), BigInt(value.toString())],
      chainId: host.chainId,
    })
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  }
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}

export const harvestFarm = async (pid, host: Host, payWithPM: boolean, feeTokenAddress: string) => {
  if (pid === 0 && host.hasLeaveStaking) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'leaveStaking',
      args: [0n],
      chainId: host.chainId,
    })
    const hash = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
    return receipt.status
  }

  let hash: `0x${string}`
  if (host.requiresReferral) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'deposit',
      args: [BigInt(pid), 0n, getAddress(host.referralAddress, host.chainId)],
      chainId: host.chainId,
    })
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  } else if (host.requiresExtraBool) {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'deposit',
      args: [BigInt(pid), 0n, true],
      chainId: host.chainId,
    })
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  } else {
    const { request } = await simulateContract(config, {
      abi: host.chefAbi,
      address: getAddress(host.masterChef, host.chainId),
      functionName: 'deposit',
      args: [BigInt(pid), 0n],
      chainId: host.chainId,
    })
    const info = await sendTransactionPM(request, payWithPM, host.chainId, feeTokenAddress)
    // const info = await writeContract(config, request)
    hash = info
  }
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  return receipt.status
}
