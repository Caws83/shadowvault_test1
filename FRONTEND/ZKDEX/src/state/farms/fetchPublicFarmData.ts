import { getAddress, getInfoChefaddress } from 'utils/addressHelpers'
import { Farm } from '../types'
import { infoChefAbi } from 'config/abi/infoChef'
import { masterChefAbi } from 'config/abi/masterchef'
import { lockerMasterChefAbi } from 'config/abi/lockerMasterChefAbi'
import { readContract } from '@wagmi/core'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { config } from 'wagmiConfig'

type PublicFarmData = {
  tokenAmountMc: string
  quoteTokenAmountMc: string
  tokenAmountTotal: string
  quoteTokenAmountTotal: string
  lpTotalInQuoteToken: string
  lpTotalSupply: string
  lpTotalMC: string
  tokenPriceVsQuote: string
  poolWeight: string
  multiplier: string
  blockReward: string
  unLockTime?: string
  lockTime?: string
  lockLength?: string
  isLocked?: boolean
  lockFee?: string
  admin?: string
}

const fetchFarm = async (farm: Farm): Promise<PublicFarmData> => {
  const { pid, lpAddresses, token, quoteToken } = farm
  const lpAddress = getAddress(lpAddresses, farm.chainId)
  const qtAddress = getAddress(quoteToken.address, farm.chainId)
  const tAddress = getAddress(token.address, farm.chainId)
  const mcAddress = getAddress(farm.host.masterChef, farm.chainId)

  const allInfo = await readContract(config, {
    abi: infoChefAbi,
    address: getInfoChefaddress(farm.chainId),
    functionName: 'farmInfo',
    args: [BigInt(pid), mcAddress, lpAddress, qtAddress, tAddress],
    chainId: farm.chainId
  })
  const tokenDecimals = token.decimals
  const quoteTokenDecimals = quoteToken.decimals
  const payoutTokenDecimals = farm.host.payoutToken.decimals
  const allocPoint = new BigNumber(allInfo[0].toString())
  const totalAllocPoint = new BigNumber(allInfo[1].toString())
  const tokenBalanceLP = new BigNumber(allInfo[2].toString())
  const quoteTokenBalanceLP = new BigNumber(allInfo[3].toString())
  const lpTokenBalanceMC = new BigNumber(allInfo[4].toString())
  const lpTotalSupply = new BigNumber(allInfo[5].toString())
  const poolWeight = totalAllocPoint ? allocPoint.div(totalAllocPoint) : BIG_ZERO

  let rewardPerBlockMC = 0n
  if (farm.host.chefAbi == masterChefAbi) {
    rewardPerBlockMC = await readContract(config, {
      abi: masterChefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'cakePerBlock',
      chainId: farm.chainId
    }) as bigint
  } else {
    rewardPerBlockMC = await readContract(config, {
      abi: lockerMasterChefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'cakePerBlock',
      chainId: farm.chainId
    }) as bigint
  }
  // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
  const lpTokenRatio = lpTokenBalanceMC.div(lpTotalSupply)
  // Raw amount of token in the LP, including those not staked
  const tokenAmountTotal = tokenBalanceLP.shiftedBy(-tokenDecimals)
  const quoteTokenAmountTotal = quoteTokenBalanceLP.shiftedBy(-quoteTokenDecimals)
  // Amount of token in the LP that are staked in the MC (i.e amount of token * lp ratio)
  const tokenAmountMc = tokenAmountTotal.multipliedBy(lpTokenRatio)
  const quoteTokenAmountMc = quoteTokenAmountTotal.multipliedBy(lpTokenRatio)
  // Total staked in LP, in quote token value
  const lpTotalInQuoteToken = quoteTokenAmountMc.multipliedBy(2)
  let rewardPerBlock = new BigNumber(rewardPerBlockMC.toString())
  rewardPerBlock = rewardPerBlock.shiftedBy(-payoutTokenDecimals)

  let unlockTimeRaw
  let lockTimeRaw
  let lockLengthRaw
  let isLockedRaw
  let lockFeeReal
  let adminRaw
  if (farm.host.isLocker === true) {
    const info = await readContract(config, {
      abi: lockerMasterChefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'lockTimes',
      args: [BigInt(farm.pid)],
      chainId: farm.chainId
    })
    const lockFeeRaw = await readContract(config, {
      abi: lockerMasterChefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'lockFee',
      chainId: farm.chainId
    })
    unlockTimeRaw = new BigNumber(info[3].toString())
    lockTimeRaw = new BigNumber(info[1].toString())
    lockLengthRaw = new BigNumber(info[2].toString())
    isLockedRaw = info[4]
    lockFeeReal = new BigNumber(lockFeeRaw.toString())
    adminRaw = info[5]
  } else {
    unlockTimeRaw = new BigNumber(0)
    lockTimeRaw = new BigNumber(0)
    lockLengthRaw = new BigNumber(0)
    isLockedRaw = false
    lockFeeReal = new BigNumber(0)
    adminRaw = '0x0'
  }
  return {
    tokenAmountMc: tokenAmountMc.toJSON(),
    quoteTokenAmountMc: quoteTokenAmountMc.toJSON(),
    tokenAmountTotal: tokenAmountTotal.toJSON(),
    quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
    lpTotalSupply: lpTotalSupply.toJSON(),
    lpTotalMC: lpTokenBalanceMC.toJSON(),
    lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
    tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
    poolWeight: poolWeight.toJSON(),
    multiplier: `${allocPoint.div(100).toString()}X`,
    blockReward: rewardPerBlock.toJSON(),
    unLockTime: unlockTimeRaw.toJSON(),
    lockTime: lockTimeRaw.toJSON(),
    lockLength: lockLengthRaw.toJSON(),
    isLocked: isLockedRaw,
    lockFee: lockFeeReal.toJSON(),
    admin: adminRaw,
  }
}

export default fetchFarm
