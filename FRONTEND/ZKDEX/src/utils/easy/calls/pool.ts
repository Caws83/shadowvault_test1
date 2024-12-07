import { PoolCategory, PoolConfig, Token } from 'config/constants/types'
import addresses from 'config/constants/contracts'
import { getAddress } from 'utils/addressHelpers'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { approveToken, swapToken } from './general'
import { sousChefAbi } from 'config/abi/sousChef'
import { sousChefBnbAbi } from 'config/abi/sousChefBnb'
import { getPublicClient, simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { BigNumber } from 'bignumber.js'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import sendTransactionPM from './paymaster'


export const HarvestPool = async (
  pool: PoolConfig,
  account: `0x${string}`,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string }> => {
  const preHarvest = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(pool.earningToken.address, pool.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: pool.chainId
  })

  if (pool.poolCategory === PoolCategory.SINGLE && pool.host.hasLeaveStaking) {
    const { request } = await simulateContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: 'leaveStaking',
      args: [0n],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to harvest token',
      }
    }
    // added lines for when no leavestaking
  } else if (pool.poolCategory === PoolCategory.SINGLE) {
    const { request } = await simulateContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: 'deposit',
      args: [pool.pid, 0n],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to harvest token',
      }
    }
    // added lines for when NO leavestaking on host
  } else if (pool.poolCategory === PoolCategory.BINANCE) {
    const { request } = await simulateContract(config, {
      abi: sousChefBnbAbi,
      address: getAddress(pool.contractAddress, pool.chainId),
      functionName: 'deposit',
      value: 0n,
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to harvest token',
      }
    }
  } else {
    const { request } = await simulateContract(config, {
      abi: sousChefAbi,
      address: getAddress(pool.contractAddress, pool.chainId),
      functionName: 'deposit',
      value: 0n,
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to harvest token',
      }
    }
  }
  const postHarvest = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(pool.earningToken.address, pool.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: pool.chainId
  })
  const finalAmount = postHarvest - preHarvest
  return {
    finalAmount,
    error: EasyTransactionError.None,
  }
}

export const StakePool = async (pool: PoolConfig, amount: bigint, payWithPM: boolean, payToken: string): Promise<boolean> => {
  // const sousChefContract = getSouschefContract(pool.sousId, library.getSigner())

  if (pool.poolCategory === PoolCategory.SINGLE && pool.host.hasLeaveStaking) {
    const { request } = await simulateContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: 'enterStaking',
      args: [amount],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return false
    }
  } else if (pool.poolCategory === PoolCategory.SINGLE) {
    const { request } = await simulateContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: 'enterStaking',
      args: [pool.pid, amount],
      chainId: pool.chainId
    })
    const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return false
    }
  } else if (pool.poolCategory === PoolCategory.BINANCE) {
    const { request } = await simulateContract(config, {
      abi: sousChefBnbAbi,
      address: getAddress(pool.contractAddress, pool.chainId),
      functionName: 'deposit',
      args: [amount],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return false
    }
  } else {
    const { request } = await simulateContract(config, {
      abi: sousChefAbi,
      address: getAddress(pool.contractAddress, pool.chainId),
      functionName: 'deposit',
      args: [amount],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return false
    }
  }

  return true
}

export const UnstakePool = async (
  pool: PoolConfig,
  amount: string,
  account: `0x${string}`,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string }> => {

  const preUnstake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(pool.stakingToken.address, pool.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: pool.chainId
  })
  
  const value = BigInt(new BigNumber(amount).shiftedBy(pool.stakingToken.decimals).toString())

  if (pool.poolCategory === PoolCategory.SINGLE && pool.host.hasLeaveStaking) {
    
    const { request } = await simulateContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: 'leaveStaking',
      args: [value],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to unstake tokens',
      }
    }
    // added to test leavestaking - ie olive pool
  } else if (pool.poolCategory === PoolCategory.SINGLE) {
    const { request } = await simulateContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: 'withdraw',
      args: [pool.pid, value],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to unstake tokens',
      }
    }
    // added to test leavestaking - ie olive pool
  } else if (pool.poolCategory === PoolCategory.BINANCE) {
    const { request } = await simulateContract(config, {
      abi: sousChefBnbAbi,
      address: getAddress(pool.contractAddress, pool.chainId),
      functionName: 'withdraw',
      args: [value],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to unstake tokens',
      }
    }
  } else {
    const { request } = await simulateContract(config, {
      abi: sousChefAbi,
      address: getAddress(pool.contractAddress, pool.chainId),
      functionName: 'withdraw',
      args: [value],
      chainId: pool.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, pool.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to unstake tokens',
      }
    }
  }

  const postUnstake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(pool.stakingToken.address, pool.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: pool.chainId
  })

  const finalAmount = postUnstake - preUnstake
  return {
    finalAmount,
    error: EasyTransactionError.None,
  }
}

export const UnstakeToToken = async (
  pool: PoolConfig,
  account: `0x${string}`,
  outToken: Token,
  outRouter: `0x${string}`,
  amount: string,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  onStageChange(EasyTransactionSteps.Initializing)
  try {
    onStageChange(EasyTransactionSteps.Unstaking)
    const unstakeInfo = await UnstakePool(pool, amount, account, payWithPM, payToken)
    if (unstakeInfo.error !== EasyTransactionError.None) {
      onStageError(unstakeInfo.error, unstakeInfo.msg)
      return
    }
    onStageChange(EasyTransactionSteps.Approval)
    const tokenApproved = await approveToken(pool.stakingToken, account, unstakeInfo.finalAmount, addresses.compost, pool.chainId, payWithPM, payToken)
    if (tokenApproved === false) {
      onStageError(EasyTransactionError.Allowance, 'Failed to approve contracts for token')
      return
    }
    onStageChange(EasyTransactionSteps.Swap1)
    const swapInfo = await swapToken(
      pool.stakingToken,
      getAddress(pool.dex.router, pool.chainId),
      outToken,
      outRouter,
      unstakeInfo.finalAmount,
      account,
      pool.chainId,
      allowedSlippage,
      payWithPM, payToken
    )
    if (swapInfo.error !== EasyTransactionError.None) {
      onStageError(swapInfo.error, swapInfo.msg)
      return
    }
    onStageChange(EasyTransactionSteps.Complete)
  } catch {
    onStageError(EasyTransactionError.General)
  }
}

export const HarvestToToken = async (
  pool: PoolConfig,
  account: `0x${string}`,
  outToken: Token,
  outRouter: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  onStageChange(EasyTransactionSteps.Initializing)
  try {
    onStageChange(EasyTransactionSteps.Harvest)
    const harvestInfo = await HarvestPool(pool, account, payWithPM, payToken)
    if (harvestInfo.error !== EasyTransactionError.None) {
      onStageError(harvestInfo.error, harvestInfo.msg)
      return
    }
    onStageChange(EasyTransactionSteps.Approval)
    const tokenApproved = await approveToken(pool.earningToken, account, harvestInfo.finalAmount, addresses.compost, pool.chainId, payWithPM, payToken)
    if (tokenApproved === false) {
      onStageError(EasyTransactionError.Allowance, 'Failed to approve contracts for token')
      return
    }
    onStageChange(EasyTransactionSteps.Swap1)
    const swapInfo = await swapToken(
      pool.earningToken,
      getAddress(pool.dex.router, pool.chainId),
      outToken,
      outRouter,
      harvestInfo.finalAmount,
      account,
      pool.chainId,
      allowedSlippage,
      payWithPM, 
      payToken
    )
    if (swapInfo.error !== EasyTransactionError.None) {
      onStageError(swapInfo.error, swapInfo.msg)
      return
    }
    onStageChange(EasyTransactionSteps.Complete)
  } catch {
    onStageError(EasyTransactionError.General)
  }
}

export const StakeFromToken = async (
  pool: PoolConfig,
  amount: bigint,
  inToken: Token,
  inRouter: `0x${string}`,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  onStageChange(EasyTransactionSteps.Initializing)
  const client = getPublicClient(config, {chainId: pool.chainId})
  const isBNB = inToken.symbol === client.chain.nativeCurrency.symbol
  const inAmountBig = isBNB ? new BigNumber(amount.toString()).shiftedBy(18) : new BigNumber(amount.toString()).shiftedBy(inToken.decimals)
  const inAmount = BigInt(inAmountBig.toString())
  try {
    if (!isBNB) {
      onStageChange(EasyTransactionSteps.Approval)
      const tokenApproved = await approveToken(inToken, account, inAmount, addresses.compost,pool.chainId, payWithPM, payToken)
      if (tokenApproved === false) {
        onStageError(EasyTransactionError.Allowance, 'Failed to approve contracts for token')
        return
      }
    }
    onStageChange(EasyTransactionSteps.Swap1)
    const swapInfo = await swapToken(
      inToken,
      inRouter,
      pool.stakingToken,
      getAddress(pool.dex.router, pool.chainId),
      inAmount,
      account,
      pool.chainId, 
      allowedSlippage,
      payWithPM, payToken
    )
    if (swapInfo.error !== EasyTransactionError.None) {
      onStageError(swapInfo.error, swapInfo.msg)
      return
    }
    const depositAmount = swapInfo.finalAmount
    onStageChange(EasyTransactionSteps.Deposit)
    const depositInfo = await StakePool(pool, depositAmount, payWithPM, payToken)
    if (depositInfo === false) {
      onStageError(EasyTransactionError.Transaction, `Failed to stake to pool`)
      return
    }

    onStageChange(EasyTransactionSteps.Complete)
  } catch {
    onStageError(EasyTransactionError.General)
  }
}
