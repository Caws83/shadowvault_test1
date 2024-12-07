import { BigNumber } from 'bignumber.js'
import { Farm, NFTPool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'

type UserData =
  | NFTPool['userData']
  | {
      approved: boolean
      stakingTokenBalance: string
      stakedBalance: string
      pendingReward: string
      tokenIds: [] | string
      hasOld: boolean
      prevRewards: [] | string
    }

export const transformNftUserData = (userData: UserData) => {
  return {
    approved: userData ? userData.approved : false,
    stakedBalance: userData ? userData.stakedBalance : "0",
    pendingReward: userData ? userData.pendingReward : "0",
    stakingTokenBalance: userData ? userData.stakingTokenBalance : "0",
    tokenIds: userData ? userData.tokenIds : [],
    hasOld: userData ? userData.hasOld : false,
    prevRewards: userData ? userData.prevRewards : [],
  }
}

export const transformNftPool = (pool: NFTPool): NFTPool => {
  const { totalStaked, stakingLimit, tokenFee, userData, ...rest } = pool

  return {
    ...rest,
    userData: transformNftUserData(userData),
    totalStaked: totalStaked,
    stakingLimit: stakingLimit,
    tokenFee: tokenFee,
  } as NFTPool
}

export const getTokenPricesFromFarm = (farms: Farm[]) => {
  return farms.reduce((prices, farm) => {
    const quoteTokenAddress = getAddress(farm.quoteToken.address, farm.chainId).toLocaleLowerCase()
    const tokenAddress = getAddress(farm.token.address, farm.chainId).toLocaleLowerCase()
    const lpAddress = getAddress(farm.lpAddresses, farm.chainId).toLocaleLowerCase()
    /* eslint-disable no-param-reassign */
    if (!prices[quoteTokenAddress]) {
      prices[quoteTokenAddress] = Number(farm.quoteToken.busdPrice)
    }
    if (!prices[tokenAddress]) {
      prices[tokenAddress] = Number(farm.token.busdPrice)
    }
    if (!prices[lpAddress]) {
      prices[lpAddress] = Number(
        (((new BigNumber(farm.quoteTokenAmountTotal).times(farm.quoteToken.busdPrice)).dividedBy(farm.lpTotalSupply)).times(2)).dividedBy(10**18),
      )
    }
    /* eslint-enable no-param-reassign */
    return prices
  }, {})
}
