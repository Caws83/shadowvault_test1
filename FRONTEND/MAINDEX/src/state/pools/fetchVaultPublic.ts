import { convertSharesToCake } from 'views/Pools/helpers'
import { cakeVaultAbi } from 'config/abi/cakeVault'
import { getCakeVaultAddress } from 'utils/addressHelpers'
import { PoolCategory } from 'config/constants/types'
import { readContracts } from '@wagmi/core'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { config } from 'wagmiConfig'

export const fetchPublicVaultData = async () => {
  try {
    const calls = [
      'getPricePerFullShare',
      'totalShares',
      'calculateHarvestCakeRewards',
      'calculateTotalPendingCakeRewards',
    ].map((method) => ({
      abi: cakeVaultAbi,
      address: getCakeVaultAddress(),
      functionName: method,
      chainId: 109
    }))
    const info = await readContracts(config, { contracts: calls })
    const [sharePrice, shares, estimatedCakeBountyReward, totalPendingCakeHarvest] = info
    const totalSharesAsBigNumber = shares ? new BigNumber((shares.result as bigint).toString()) : BIG_ZERO
    const sharePriceAsBigNumber = sharePrice ? new BigNumber((sharePrice.result as bigint).toString()) : BIG_ZERO
    const totalCakeInVaultEstimate = convertSharesToCake(totalSharesAsBigNumber, sharePriceAsBigNumber)
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalCakeInVault: totalCakeInVaultEstimate.cakeAsBigNumber.toJSON(),
      estimatedCakeBountyReward: (estimatedCakeBountyReward.result as bigint).toString(),
      totalPendingCakeHarvest: (totalPendingCakeHarvest.result as bigint).toString(),
      poolCategory: PoolCategory.AUTO,
    }
  } catch (error) {
    console.log((error as Error).message)
    return {
      totalShares: '0',
      pricePerFullShare: '0',
      totalCakeInVault: '0',
      estimatedCakeBountyReward: '0',
      totalPendingCakeHarvest: '0',
      poolCategory: PoolCategory.AUTO,
    }
  }
}

export const fetchVaultFees = async () => {
  try {
    const calls = ['performanceFee', 'callFee', 'withdrawFee', 'withdrawFeePeriod'].map((method) => ({
      abi: cakeVaultAbi,
      address: getCakeVaultAddress(),
      functionName: method,
      chainId: 109,
    }))

    const info = await readContracts(config, { contracts: calls })
    const [performanceFee, callFee, withdrawalFee, withdrawalFeePeriod] = info
    return {
      performanceFee: new BigNumber(performanceFee.result.toString()).toNumber(),
      callFee: new BigNumber(callFee.result.toString()).toNumber(),
      withdrawalFee: new BigNumber(withdrawalFee.result.toString()).toNumber(),
      withdrawalFeePeriod: new BigNumber(withdrawalFeePeriod.result.toString()).toNumber(),
    }
  } catch (error) {
    return {
      performanceFee: 0,
      callFee: 0,
      withdrawalFee: 0,
      withdrawalFeePeriod: 0,
    }
  }
}

export default fetchPublicVaultData
