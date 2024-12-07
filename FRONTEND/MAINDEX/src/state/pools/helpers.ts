import BigNumber from 'bignumber.js'
import { Farm, Pool } from 'state/types'
import { getAddress } from 'utils/addressHelpers'

type UserData =
  | Pool['userData']
  | {
      allowance: string
      stakingTokenBalance: string
      stakedBalance: string
      pendingReward: string
    }

export const transformUserData = (userData: UserData) => {
  return {
    allowance: userData ? userData.allowance : '0',
    stakingTokenBalance: userData ? userData.stakingTokenBalance : '0',
    stakedBalance: userData ? userData.stakedBalance : '0',
    pendingReward: userData ? userData.pendingReward : '0',
  }
}

export const transformPool = (pool: Pool): Pool => {
  const { totalStaked, stakingLimit, userData, ...rest } = pool

  return {
    ...rest,
    userData: transformUserData(userData),
    totalStaked: totalStaked,
    stakingLimit: stakingLimit,
  } as Pool
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
        new BigNumber(farm.quoteTokenAmountTotal)
          .multipliedBy(farm.quoteToken.busdPrice)
          .div(new BigNumber(farm.lpTotalSupply))
          .multipliedBy(new BigNumber(2))
          .shiftedBy(-18),
      )
    }

    /* eslint-enable no-param-reassign */
    return prices
  }, {})
}
