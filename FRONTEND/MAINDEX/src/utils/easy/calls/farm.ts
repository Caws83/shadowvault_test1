import { FarmConfig, Token } from 'config/constants/types'
import { Token as Currency } from 'sdk'
import addresses from 'config/constants/contracts'
import { EasyTransactionError, EasyTransactionSteps } from 'utils/types'
import { getAddress, getCompostAddress } from 'utils/addressHelpers'
import tokens from 'config/constants/tokens'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import { approveAddress, approveToken, swapToken, approveAddressString } from './general'
import {  simulateContract, readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { compostAbi } from 'config/abi/compost'
import { Address, TransactionReceipt } from 'viem'
import BigNumber from 'bignumber.js'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import sendTransactionPM from './paymaster'



export const stakeBNB = async (
  farm: FarmConfig,
  amount: bigint,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string; success?: boolean }> => {
  const preStake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(farm.lpAddresses, farm.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  const args = [getAddress(farm.token.address, farm.chainId), getAddress(farm.quoteToken.address, farm.chainId), getAddress(farm.dex.router, farm.chainId), allowedSlippage]
  const { request } = await simulateContract(config, {
    abi: compostAbi,
    address: getCompostAddress(farm.chainId),
    functionName: '_1StakeUsingBNB',
    args: [...args],
    value: amount,
    from: account,
    chainId: farm.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
  // const hash = await writeContract(config, request)
  const stakeReceipt = (await waitForTransactionReceipt(config, { hash})) as TransactionReceipt

  if (stakeReceipt.status === 'reverted') {
    return {
      finalAmount: 0n,
      error: EasyTransactionError.Transaction,
      msg: 'Failed to stake from contract',
    }
  }
  const postStake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(farm.lpAddresses, farm.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  const finalAmount = postStake - preStake
  return {
    finalAmount,
    error: EasyTransactionError.None,
  }
}

export const stakeToken = async (
  inToken: string,
  inRouter: `0x${string}`,
  farm: FarmConfig,
  amount: bigint,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string; success?: boolean }> => {
  try {
    //const stakeContract = getCompostContract(library.getSigner(account))
    //const lpContract = getLpContract(getAddress(farm.lpAddresses), library.getSigner())
    const lpAddress = getAddress(farm.lpAddresses, farm.chainId)
    const preStake = await readContract(config, {
      abi: ERC20_ABI,
      address: lpAddress,
      functionName: 'balanceOf',
      args: [account],
      chainId: farm.chainId
    })

    const args = [
      amount,
      inToken,
      getAddress(farm.token.address, farm.chainId),
      getAddress(farm.quoteToken.address, farm.chainId),
      inRouter,
      getAddress(farm.dex.router, farm.chainId),
      allowedSlippage
    ]
    const { request } = await simulateContract(config, {
      abi: compostAbi,
      address: getCompostAddress(farm.chainId),
      functionName: '_1StakeToken',
      args,
      from: account,
      chainId: farm.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
    // const hash = await writeContract(config, request)
    const stakeReceipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt

    if (stakeReceipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to stake from contract',
      }
    }
    const postStake = await readContract(config, {
      abi: ERC20_ABI,
      address: lpAddress,
      functionName: 'balanceOf',
      args: [account],
      chainId: farm.chainId
    })
    const finalAmount = postStake - preStake

    return {
      finalAmount,
      error: EasyTransactionError.None,
    }
  } catch (e) {
    console.error((e as Error).message)
    return {
      finalAmount: 0n,
      error: EasyTransactionError.Transaction,
    }
  }
}

export const harvest = async (
  farm: FarmConfig,
  account: `0x${string}`,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string; success?: boolean }> => {
  // const payoutContract = getBep20Contract(getAddress(farm.host.payoutToken.address), library.getSigner())
  // const masterChefContract = getMasterChefFromHost(farm.host, library.getSigner())
  const preHarvest = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(farm.host.payoutToken.address),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  if (farm.pid === 0 && farm.host.hasLeaveStaking) {
    const { request } = await simulateContract(config, {
      abi: farm.host.chefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'leaveStaking',
      args: [0n],
      chainId: farm.chainId
    })
    const hash = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
    // const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
    if (receipt.status === 'reverted') {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to harvest payout token',
      }
    }
  } else {
    const depositInfo = await deposit(farm, 0n, payWithPM, payToken)
    if (depositInfo === false) {
      return {
        finalAmount: 0n,
        error: EasyTransactionError.Transaction,
        msg: 'Failed to harvest payout token',
      }
    }
  }
  const postHarvest = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(farm.host.payoutToken.address, farm.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  const harvested = postHarvest - preHarvest
  return {
    finalAmount: harvested,
    error: EasyTransactionError.None,
  }
}

export const removeLiquidity = async (
  farm: FarmConfig,
  amount: bigint,
  outToken: Token,
  outRouter: `0x${string}`,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string }> => {
  const preStake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(outToken.address, farm.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  const args = [
    getAddress(farm.lpAddresses, farm.chainId),
    amount,
    getAddress(farm.token.address, farm.chainId),
    getAddress(farm.quoteToken.address, farm.chainId),
    getAddress(farm.dex.router, farm.chainId),
    getAddress(outToken.address, farm.chainId),
    outRouter,
    allowedSlippage
  ]
  const { request } = await simulateContract(config, {
    abi: compostAbi,
    address: getCompostAddress(farm.chainId),
    functionName: '_BreakLPReturnToken',
    args,
    chainId: farm.chainId
  })
  const hash = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
  // const hash = await writeContract(config, request)
  const unstakeReceipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt

  if (unstakeReceipt.status === 'reverted') {
    return {
      finalAmount: 0n,
      error: EasyTransactionError.Transaction,
      msg: 'Failed to stake from contract',
    }
  }
  const postStake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(outToken.address, farm.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  const finalAmount = postStake - preStake

  return {
    finalAmount,
    error: EasyTransactionError.None,
  }
}

export const withdrawl = async (
  farm: FarmConfig,
  amount: bigint,
  account: `0x${string}`,
  payWithPM: boolean,
  payToken: string
): Promise<{ finalAmount: bigint; error: EasyTransactionError; msg?: string }> => {
  const preUnstake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(farm.lpAddresses, farm.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  let hash: `0x${string}`
  if (farm.host.requiresExtraBool) {
    const { request } = await simulateContract(config, {
      abi: farm.host.chefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'withdraw',
      args: [farm.pid, amount, true],
      chainId: farm.chainId
    })
    const info = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
    // const info = await writeContract(config, request)
    hash = info
  } else {
    const { request } = await simulateContract(config, {
      abi: farm.host.chefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'withdraw',
      args: [farm.pid, amount],
      chainId: farm.chainId
    })
    const info = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
    // const info = await writeContract(config, request)
    hash = info
  }
  const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
  if (receipt.status === 'reverted') {
    return {
      finalAmount: 0n,
      error: EasyTransactionError.Transaction,
      msg: 'Failed to remove staking',
    }
  }

  const postUnstake = await readContract(config, {
    abi: ERC20_ABI,
    address: getAddress(farm.lpAddresses, farm.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: farm.chainId
  })
  const lpDiff = BigInt(new BigNumber(postUnstake.toString()).minus(preUnstake.toString()).toString())
  return {
    finalAmount: lpDiff,
    error: EasyTransactionError.None,
  }
}

export const deposit = async (farm: FarmConfig, amount: bigint, payWithPM: boolean, payToken: string): Promise<boolean> => {
  try {
    let hash: `0x${string}`
    if (farm.host.requiresReferral) {
      const { request } = await simulateContract(config, {
        abi: farm.host.chefAbi,
        address: getAddress(farm.host.masterChef, farm.chainId),
        functionName: 'deposit',
        args: [farm.pid, amount, getAddress(farm.host.referralAddress)],
        chainId: farm.chainId
      })
      const info = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
      // const info = await writeContract(config, request)
      hash = info
    } else if (farm.host.requiresExtraBool) {
      const { request } = await simulateContract(config, {
        abi: farm.host.chefAbi,
        address: getAddress(farm.host.masterChef, farm.chainId),
        functionName: 'deposit',
        args: [farm.pid, amount, true],
        chainId: farm.chainId
      })
      const info = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
      // const info = await writeContract(config, request)
      hash = info
    } else {
      const { request } = await simulateContract(config, {
        abi: farm.host.chefAbi,
        address: getAddress(farm.host.masterChef, farm.chainId),
        functionName: 'deposit',
        args: [farm.pid, amount],
        chainId: farm.chainId
      })
      const info = await sendTransactionPM(request, payWithPM, farm.chainId, payToken)
      // const info = await writeContract(config, request)
      hash = info
    }
    const depositReceipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    if (depositReceipt.status === 'reverted') {
      console.error(depositReceipt)
      return false
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const HarvestTo = async (
  farm: FarmConfig,
  outToken: Token,
  outRouter: `0x${string}`,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (stage: EasyTransactionError, msg?: string) => void,
) => {
  onStageChange(EasyTransactionSteps.Initializing)
  try {
    onStageChange(EasyTransactionSteps.Harvest)
    const harvestInfo = await harvest(farm, account, payWithPM, payToken)
    if (harvestInfo.error !== EasyTransactionError.None) {
      onStageError(harvestInfo.error, harvestInfo.msg)
      return
    }
    const harvested = harvestInfo.finalAmount
    onStageChange(EasyTransactionSteps.Approval)
    const tokenApproved = await approveToken(farm.host.payoutToken, account, harvested, addresses.compost, farm.chainId, payWithPM, payToken)
    if (tokenApproved === false) {
      onStageError(EasyTransactionError.Allowance, 'Failed to approve contracts for token')
      return
    }
    onStageChange(EasyTransactionSteps.Swap1)
    const swapInfo = await swapToken(
      farm.host.payoutToken,
      getAddress(farm.host.dex.router, farm.chainId),
      outToken,
      outRouter,
      harvested,
      account,
      farm.chainId,
      allowedSlippage, 
      payWithPM, 
      payToken
    )
    if (swapInfo.error !== EasyTransactionError.None) {
      onStageError(swapInfo.error, swapInfo.msg)
      return
    }
    onStageChange(EasyTransactionSteps.Complete)
  } catch (e) {
    console.error((e as Error).message)
    onStageError(EasyTransactionError.General)
  }
}

export const UnstakeTo = async (
  farm: FarmConfig,
  amount: string,
  outToken: Token,
  outRouter: `0x${string}`,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM,
  payToken,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (stage: EasyTransactionError, msg?: string) => void,
) => {
  onStageChange(EasyTransactionSteps.Initializing)
  const outAmount = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL)
  try {
    onStageChange(EasyTransactionSteps.Unstaking)
    const withdrawInfo = await withdrawl(farm, BigInt(outAmount.toString()), account, payWithPM, payToken)
    if (withdrawInfo.error !== EasyTransactionError.None) {
      onStageError(withdrawInfo.error, withdrawInfo.msg)
      return
    }
    const lpAmount = withdrawInfo.finalAmount
    onStageChange(EasyTransactionSteps.Approval)
    const lpApprover = await approveAddress(farm.lpAddresses, account, lpAmount, addresses.compost, farm.chainId, payWithPM, payToken)
    if (lpApprover === false) {
      onStageError(EasyTransactionError.Allowance, 'Failed to approve contracts for LP')
      return
    }
    onStageChange(EasyTransactionSteps.RemoveLiquidity)
    const breakLpInfo = await removeLiquidity(farm, lpAmount, outToken, outRouter, account, allowedSlippage, payWithPM, payToken)
    if (breakLpInfo.error !== EasyTransactionError.None) {
      onStageError(breakLpInfo.error, breakLpInfo.msg)
      return
    }
    onStageChange(EasyTransactionSteps.Complete)
  } catch {
    onStageError(EasyTransactionError.General)
  }
}

export const StakeFrom = async (
  farm: FarmConfig,
  amount: string,
  inToken: Token,
  inRouter: `0x${string}`,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (stage: EasyTransactionError, msg?: string) => void,
) => {
  onStageChange(EasyTransactionSteps.Initializing)
  const isBNB = inToken.symbol === tokens.wNative.symbol
  try {
    const inAmount = new BigNumber(amount).shiftedBy(inToken.decimals);

    onStageChange(EasyTransactionSteps.Approval)
    if (!isBNB) {
      const tokenApproved = await approveToken(inToken, account, BigInt(inAmount.toString()), addresses.compost, farm.chainId, payWithPM, payToken)
      if (tokenApproved === false) {
        onStageError(EasyTransactionError.Allowance, 'Failed to approve contracts for token')
        return
      }
    }

    onStageChange(EasyTransactionSteps.CreateLP)
    let createLPInfo
    if (isBNB) {
      console.info(`Swapping from ${inToken.symbol}`)
      createLPInfo = await stakeBNB(farm, BigInt(inAmount.toString()), account,allowedSlippage, payWithPM, payToken)
    } else {
      console.info('Swapping from ', inToken.symbol)
      createLPInfo = await stakeToken(getAddress(inToken.address, farm.chainId), inRouter, farm, BigInt(inAmount.toString()), account, allowedSlippage, payWithPM, payToken)
    }
    if (createLPInfo.error !== EasyTransactionError.None) {
      onStageError(createLPInfo.error, createLPInfo.msg)
      return
    }
    const lpAmount = createLPInfo.finalAmount
    onStageChange(EasyTransactionSteps.Deposit)
    const depositInfo = await deposit(farm, lpAmount, payWithPM, payToken)
    if (depositInfo === false) {
      onStageError(EasyTransactionError.Transaction, 'Failed to deposit LP Tokens')
      return
    }
    onStageChange(EasyTransactionSteps.Complete)
  } catch (e) {
    console.error((e as Error).message)
    onStageError(EasyTransactionError.General)
  }
}

export const Compound = async (
  farm: FarmConfig,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  onStageChange: (stage: EasyTransactionSteps) => void,
  onStageError: (error: EasyTransactionError, msg?: string) => void,
) => {
  onStageChange(EasyTransactionSteps.Initializing)
  const txError = EasyTransactionError.General
  try {
    onStageChange(EasyTransactionSteps.Harvest)
    const harvestInfo = await harvest(farm, account, payWithPM, payToken)
    if (harvestInfo.error !== EasyTransactionError.None) {
      onStageError(harvestInfo.error, harvestInfo.msg)
      return
    }
    const harvested = harvestInfo.finalAmount
    onStageChange(EasyTransactionSteps.Approval)
    const tokenApproved = await approveToken(farm.host.payoutToken, account, harvested, addresses.compost, farm.chainId, payWithPM, payToken)
    if (tokenApproved === false) {
      onStageError(EasyTransactionError.Allowance, 'Failed to approve contracts for token')
      return
    }

    onStageChange(EasyTransactionSteps.CreateLP)
    const createLPInfo = await stakeToken(
      getAddress(farm.host.payoutToken.address, farm.chainId),
      getAddress(farm.dex.router, farm.chainId),
      farm,
      harvested,
      account,
      allowedSlippage, payWithPM, payToken
    )

    if (createLPInfo.error !== EasyTransactionError.None) {
      onStageError(createLPInfo.error, createLPInfo.msg)
      return
    }
    const lpAmount = createLPInfo.finalAmount
    onStageChange(EasyTransactionSteps.Deposit)
    const depositInfo = await deposit(farm, lpAmount, payWithPM, payToken)
    if (depositInfo === false) {
      onStageError(EasyTransactionError.Transaction, 'Failed to deposit LP Tokens')
      return
    }
    onStageChange(EasyTransactionSteps.Complete)
  } catch {
    onStageError(txError)
  }
}

export const ZapLiquidity = async (
  amount: string,
  inToken: Currency,
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
  chainId: number,
  inRouter: `0x${string}`,
  account: `0x${string}`,
  isBNB: boolean,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  getRequest: boolean = false,
) => {
    const inAmount = new BigNumber(amount).shiftedBy(inToken.decimals) ?? new BigNumber(0);

    if (!isBNB && !getRequest) {
      const tokenApproved = await approveAddressString(inToken.address as Address, account, BigInt(inAmount.toString()), addresses.compost, chainId, payWithPM, payToken)
      if (tokenApproved === false) {
        console.info(EasyTransactionError.Allowance, 'Failed to approve contracts for token')
        return
      }
    }

    let createLPInfo
    if (isBNB) {
      console.info(`Swapping from ${inToken.symbol}`)
      createLPInfo =  await zapBNB(tokenA, tokenB, inRouter, chainId, BigInt(inAmount.toString()), account, allowedSlippage, payWithPM, payToken, getRequest)
    } else {
      console.info('Swapping from ', inToken.symbol)
      createLPInfo = await zapToken(inToken.address, inRouter, tokenA, tokenB, chainId, BigInt(inAmount.toString()), account, allowedSlippage, payWithPM, payToken, getRequest)
    }
    if (createLPInfo.error !== EasyTransactionError.None) {
      console.info("EasyTransactionSteps.Complete2")
      console.info(createLPInfo.error, createLPInfo.msg)
      return createLPInfo
    }
    console.info(EasyTransactionSteps.Complete)
    console.info("EasyTransactionSteps.Complete")
    if(getRequest && createLPInfo.tx){
      return createLPInfo.tx
    }
    return createLPInfo

}

export const zapBNB = async (
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
  router: `0x${string}`,
  chainId: number,
  amount: bigint,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  getRequest: boolean,
): Promise<{ tx?: any; error: EasyTransactionError; msg?: string; success?: boolean }> => {
  const args = [tokenA, tokenB, router, allowedSlippage]
  const { request } = await simulateContract(config, {
    abi: compostAbi,
    address: getCompostAddress(chainId),
    functionName: '_1StakeUsingBNB',
    args: [...args],
    value: amount,
    from: account,
    chainId
  })
  if(getRequest) {
    if(getRequest) {
      return {
        tx: request,
        success: true,
        error: EasyTransactionError.None
      }
    }
  }
  const hash = await sendTransactionPM(request, payWithPM, chainId, payToken)
  // const hash = await writeContract(config, request)
  const stakeReceipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt

  if (stakeReceipt.status === 'reverted') {
    return {
      success: false,
      error: EasyTransactionError.Transaction,
      msg: 'Failed to create LP',
    }
  }
  
  return {
    success: true,
    error: EasyTransactionError.None

  }
}

export const zapToken = async (
  inToken: string,
  inRouter: `0x${string}`,
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
  chainId: number,
  amount: bigint,
  account: `0x${string}`,
  allowedSlippage: number,
  payWithPM: boolean,
  payToken: string,
  getRequest: boolean
): Promise<{ tx?: any;error: EasyTransactionError; msg?: string; success?: boolean }> => {
  try {
    const args = [
      amount,
      inToken,
      tokenA,
      tokenB,
      inRouter,
      inRouter,
      allowedSlippage
    ]
    const { request } = await simulateContract(config, {
      abi: compostAbi,
      address: getCompostAddress(chainId),
      functionName: '_1StakeToken',
      args,
      from: account,
      chainId
    })
    if(getRequest) {
      return {
        tx: request,
        success: true,
        error: EasyTransactionError.None
      }
    }
    const hash = await sendTransactionPM(request, payWithPM, chainId, payToken)
    // const hash = await writeContract(config, request)
    const stakeReceipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt

    if (stakeReceipt.status === 'reverted') {
      return {
        error: EasyTransactionError.Transaction,
        msg: 'Failed to stake from contract',
        success: false
      }
    }
   
    return {
      success: true,
      error: EasyTransactionError.None,
    }
  } catch (e) {
    console.error((e as Error).message)
    return {
      success: false,
      error: EasyTransactionError.Transaction,
    }
  }
}
