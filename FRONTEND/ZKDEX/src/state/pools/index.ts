import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import pools from 'config/constants/pools'
import { PoolsState, Pool, CakeVault, VaultFees, VaultUser } from 'state/types'
import { getPoolApr } from 'utils/apr'
import { getBalanceNumber } from 'utils/formatBalance'
import { getAddress, getPriceCheckaddress } from 'utils/addressHelpers'
import { Dex, Host, PoolCategory, Token } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import { fetchPoolsBlockLimits, fetchPoolsStakingLimits, fetchPoolsTotalStaking } from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserStakeBalances,
  fetchUserPendingRewards,
  fetchPoolsAllowanceByHost,
  fetchUserBalancesByHost,
  fetchUserStakeBalancesByHost,
  fetchUserPendingRewardsByHost,
} from './fetchPoolsUser'
import { fetchPublicVaultData, fetchVaultFees } from './fetchVaultPublic'
import fetchVaultUser from './fetchVaultUser'
import { getTokenPricesFromFarm } from './helpers'
import { readContract } from '@wagmi/core'
import { tokenPriceAbi } from 'config/abi/tokenPrice'
import BigNumber from 'bignumber.js'
import { sousChefV2Abi } from 'config/abi/sousChefV2'
import { usePools } from './hooks'
import { config } from 'wagmiConfig'
import { Address } from 'viem'
import { ERC20_ABI } from 'config/abi/erc20'

const initialState: PoolsState = {
  data: [],
  userDataLoaded: false,
  host: hosts.farmageddon,
  cakeVault: {
    totalShares: null,
    pricePerFullShare: null,
    totalCakeInVault: null,
    estimatedCakeBountyReward: null,
    totalPendingCakeHarvest: null,
    fees: {
      performanceFee: null,
      callFee: null,
      withdrawalFee: null,
      withdrawalFeePeriod: null,
    },
    userData: {
      isLoading: true,
      userShares: null,
      cakeAtLastUserAction: null,
      lastDepositedTime: null,
      lastUserActionTime: null,
    },
  },
}

export const getRewardPerBlock = async (pool: Pool) => {
  if (pool.poolCategory === PoolCategory.SINGLE) {
    const mintRateRaw = await readContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: pool.host.rewardCall,
      args: [],
      chainId: pool.chainId
    })
    const mintRate = new BigNumber(mintRateRaw.toString())
    const totalAllocRaw = await readContract(config, {
      abi: pool.host.chefAbi,
      address: getAddress(pool.host.masterChef, pool.chainId),
      functionName: 'totalAllocPoint',
      args: [],
      chainId: pool.chainId
    })
    const totalAlloc = new BigNumber(totalAllocRaw.toString())
    try {
      const info = await readContract(config, {
        abi: pool.host.chefAbi,
        address: getAddress(pool.host.masterChef, pool.chainId),
        functionName: 'poolInfo',
        args: [pool.pid],
        chainId: pool.chainId
      })
      const allocPoint = new BigNumber(info[1].toString())
      const RewardPerBlock = allocPoint.div(totalAlloc).multipliedBy(mintRate.shiftedBy(-pool.earningToken.decimals))
      return RewardPerBlock.toString()
    } catch (e) {
      console.log(e)
      return '0'
    }
  }

  const RewardPerBlockFromContract = await readContract(config, {
    abi: sousChefV2Abi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'rewardPerBlock',
    chainId: pool.chainId
    
  })
  const rewardPerBlockBN = new BigNumber(RewardPerBlockFromContract.toString())
  const RewardPerBlock = rewardPerBlockBN.shiftedBy(-pool.earningToken.decimals)
  return RewardPerBlock.toString()
}

// USES STABLE PAIR FROM DEX
export const getTokenPrice = async (dex: Dex, token: Token) => {
  const factoryAddress = getAddress(dex.factory, dex.chainId)
  const tokenAddress = !token.baseAddress ? getAddress(token.address, dex.chainId) : getAddress(token.baseAddress, dex.chainId)
  try {
    const priceRaw = await readContract(config, {
      address: getPriceCheckaddress(dex.chainId),
      abi: tokenPriceAbi,
      functionName: 'TokenPrice',
      args: [tokenAddress, factoryAddress],
      chainId: dex.chainId
    })
    const num = new BigNumber(priceRaw[0].toString())
    const den = new BigNumber(priceRaw[1].toString())
    const usd = new BigNumber(priceRaw[2].toString())
    const dec = new BigNumber(18 - token.decimals)
    const priceBN = num.multipliedBy(usd).dividedBy(den).shiftedBy(dec.times(-1).toNumber())
    const price = priceBN.shiftedBy(-18).toNumber()
    console.log(dex.chainId, token.symbol, price)
    return price
  } catch {
    return 0
  }
}

export const getTokenPriceString = async (dex: Dex, tokenAddress: Address, decimals?: number) => {
  const factoryAddress = getAddress(dex.factory, dex.chainId)
  try {
    const priceRaw = await readContract(config, {
      address: getPriceCheckaddress(dex.chainId),
      abi: tokenPriceAbi,
      functionName: 'TokenPrice',
      args: [tokenAddress, factoryAddress],
      chainId: dex.chainId
    })
    let decimalsToUse = decimals
    if (!decimals){
      decimalsToUse = await readContract(config, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
      chainId: dex.chainId
    }) as number
    }
    const num = new BigNumber(priceRaw[0].toString())
    const den = new BigNumber(priceRaw[1].toString())
    const usd = new BigNumber(priceRaw[2].toString())
    const dec = new BigNumber(18 - decimalsToUse)
    const priceBN = num.multipliedBy(usd).dividedBy(den).shiftedBy(dec.times(-1).toNumber())
    const price = priceBN.shiftedBy(-18).toNumber()
    return price
  } catch {
    return 0
  }
}

interface cicPriceInfo {
  USD: string
}

export const GetCICPriceFromLBank2 = async (): Promise<string> => {
  try {
    const priceJson = await fetch('https://min-api.cryptocompare.com/data/price?fsym=BONE&tsyms=USD')
    const cicPrice: cicPriceInfo = await priceJson.json()
    if (!cicPrice.USD) {
      return '0'
    }
    return cicPrice.USD
  } catch {
    return '0'
  }
}

export const GetCICPriceFromLBank = async (dex: Dex): Promise<string> => {
  try {
    const factoryAddress = getAddress(dex.factory, dex.chainId)
    const priceRaw = await readContract(config, {
      abi: tokenPriceAbi,
      address: getPriceCheckaddress(dex.chainId),
      functionName: 'getBNBPrice',
      args: [factoryAddress],
      chainId: dex.chainId
    })
    return new BigNumber(priceRaw.toString()).shiftedBy(-18).toString()
  } catch {
    return '0'
  }
}

// Thunks
export const fetchPoolsPublicDataByHostAsync = (currentBlock: number, host: Host) => async (dispatch, getState) => {

  const poolsConfig = await pools()
  dispatch(updatePoolsPublicData(poolsConfig))

  const blockLimits = await fetchPoolsBlockLimits()
  const totalStakings = await fetchPoolsTotalStaking()

  const prices = getTokenPricesFromFarm(getState().farms.data)

  const liveData = await Promise.all(
    poolsConfig.map(async (pool) => {
      const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
      const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
      const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
      const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded

      const stakingTokenAddress = pool.stakingToken.address ? getAddress(pool.stakingToken.address, pool.chainId).toLowerCase() : null
      const sPriceTokenAddress = pool.stakingToken.baseAddress
        ? getAddress(pool.stakingToken.baseAddress, pool.chainId).toLowerCase()
        : null
      let stakingTokenPrice = sPriceTokenAddress
        ? prices[sPriceTokenAddress]
        : stakingTokenAddress
        ? prices[stakingTokenAddress]
        : 0

      if (stakingTokenPrice === 0 || stakingTokenPrice === undefined) {
        stakingTokenPrice = await getTokenPrice(pool.dex, pool.stakingToken)
      }
      if (stakingTokenPrice === undefined) {
        stakingTokenPrice = 0
      }
      

      const earningTokenAddress = pool.earningToken.address ? getAddress(pool.earningToken.address, pool.chainId).toLowerCase() : null
      const ePriceTokenAddress = pool.earningToken.baseAddress
        ? getAddress(pool.earningToken.baseAddress, pool.chainId).toLowerCase()
        : null
      let earningTokenPrice = ePriceTokenAddress
        ? prices[ePriceTokenAddress]
        : earningTokenAddress
        ? prices[earningTokenAddress]
        : 0

      if (earningTokenPrice === 0 || earningTokenPrice === undefined) {
        earningTokenPrice = await getTokenPrice(pool.dex, pool.earningToken)
      }
      if (earningTokenPrice === undefined) {
        earningTokenPrice = 0
      }

      const REWARDPERBLOCK: string = await getRewardPerBlock(pool)

      const apr = !isPoolFinished
        ? getPoolApr(
            stakingTokenPrice,
            earningTokenPrice,
            getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
            parseFloat(REWARDPERBLOCK),
          )
        : 0

      return {
        ...blockLimit,
        ...totalStaking,
        stakingTokenPrice,
        earningTokenPrice,
        apr,
        isFinished: isPoolFinished,
      }
    }),
  )

  dispatch(setPoolsPublicData(liveData))
}

// Thunks
export const fetchPoolsPublicDataAsync = (currentBlock: number) => async (dispatch, getState) => {
  const poolsConfig = await pools()
  dispatch(updatePoolsPublicData(poolsConfig))

  const blockLimits = await fetchPoolsBlockLimits()
  const totalStakings = await fetchPoolsTotalStaking()

  const prices = getTokenPricesFromFarm(getState().farms.data)
  const liveData = await Promise.all(
    poolsConfig.map(async (pool) => {
      const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
      const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
      const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
      const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded

      const stakingTokenAddress = pool.stakingToken.address ? getAddress(pool.stakingToken.address, pool.chainId).toLowerCase() : null
      let stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0
      if (stakingTokenPrice === 0 || stakingTokenPrice === undefined || isNaN(stakingTokenPrice) ) {
        stakingTokenPrice = await getTokenPrice(pool.dex, pool.stakingToken)
      }
      if ( stakingTokenPrice === undefined || isNaN(stakingTokenPrice)) {
        stakingTokenPrice = 0
      }

      const earningTokenAddress = pool.earningToken.address ? getAddress(pool.earningToken.address, pool.chainId).toLowerCase() : null
      let earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0

      if (earningTokenPrice === 0 || earningTokenPrice === undefined || isNaN(earningTokenPrice)) {
        earningTokenPrice = await getTokenPrice(pool.dex, pool.earningToken)
      }
      if ( earningTokenPrice === undefined || isNaN(earningTokenPrice)) {
        earningTokenPrice = 0
      }
      const REWARDPERBLOCK: string = await getRewardPerBlock(pool)

      const apr = !isPoolFinished
        ? getPoolApr(
            stakingTokenPrice,
            earningTokenPrice,
            getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
            parseFloat(REWARDPERBLOCK),
          )
        : 0

      return {
        ...blockLimit,
        ...totalStaking,
        stakingTokenPrice,
        earningTokenPrice,
        apr,
        isFinished: isPoolFinished,
      }
    }),
  )

  dispatch(setPoolsPublicData(liveData))
}

export const fetchPoolsStakingLimitsByHostAsync = (host: Host) => async (dispatch, getState) => {
  const poolsConfig = await pools()
  dispatch(updatePoolsPublicData(poolsConfig))

  const poolsWithStakingLimit = getState()
    .pools.data.filter((pool) => (pool.host === host) && pool.stakingLimit !== null && pool.stakingLimit !== undefined)
    .map((pool) => pool.sousId)

  const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)

  const stakingLimitData = poolsConfig
    .filter((pool) => (pool.host === host))
    .map((pool) => {
      if (poolsWithStakingLimit.includes(pool.sousId)) {
        return { sousId: pool.sousId }
      }
      const stakingLimit = stakingLimits[pool.sousId] || '0'
      return {
        sousId: pool.sousId,
        stakingLimit: stakingLimit,
      }
    })

  dispatch(setPoolsPublicData(stakingLimitData))
}

export const fetchPoolsStakingLimitsAsync = () => async (dispatch, getState) => {
  const poolsConfig = await pools()
  dispatch(updatePoolsPublicData(poolsConfig))

  const poolsWithStakingLimit = getState()
    .pools.data.filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
    .map((pool) => pool.sousId)

  const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)

  const stakingLimitData = poolsConfig.map((pool) => {
    if (poolsWithStakingLimit.includes(pool.sousId)) {
      return { sousId: pool.sousId }
    }
    const stakingLimit = stakingLimits[pool.sousId] || '0'
    return {
      sousId: pool.sousId,
      stakingLimit: stakingLimit,
    }
  })

  dispatch(setPoolsPublicData(stakingLimitData))
}

export const fetchPoolsUserDataByHostAsync = (account: string, host: Host) => async (dispatch) => {
let allowances
let stakingTokenBalances
let stakedBalances
let pendingRewards

 allowances = await fetchPoolsAllowanceByHost(account, host)
 stakingTokenBalances = await fetchUserBalancesByHost(account, host)
 stakedBalances = await fetchUserStakeBalancesByHost(account, host)
 pendingRewards = await fetchUserPendingRewardsByHost(account, host)

  const poolsConfig = await pools()

  const userData = poolsConfig
    .filter((pool) => (pool.host === host))
    .map((pool) => ({
      sousId: pool.sousId,
      allowance: allowances[pool.sousId],
      stakingTokenBalance: stakingTokenBalances[pool.sousId],
      stakedBalance: stakedBalances[pool.sousId],
      pendingReward: pendingRewards[pool.sousId],
    }))

  dispatch(setPoolsUserData(userData))
}

export const fetchPoolsUserDataAsync = (account: string) => async (dispatch) => {
  const allowances = await fetchPoolsAllowance(account)
  const stakingTokenBalances = await fetchUserBalances(account)
  const stakedBalances = await fetchUserStakeBalances(account)
  const pendingRewards = await fetchUserPendingRewards(account)
  const poolsConfig = await pools()

  const userData = poolsConfig.map((pool) => ({
    sousId: pool.sousId,
    allowance: allowances[pool.sousId],
    stakingTokenBalance: stakingTokenBalances[pool.sousId],
    stakedBalance: stakedBalances[pool.sousId],
    pendingReward: pendingRewards[pool.sousId],
  }))

  dispatch(setPoolsUserData(userData))
}

export const updateUserAllowance = (sousId: number, account: string) => async (dispatch) => {
  const allowances = await fetchPoolsAllowance(account)
  dispatch(updatePoolsUserData({ sousId, field: 'allowance', value: allowances[sousId] }))
}

export const updateUserBalance = (sousId: number, account: string) => async (dispatch) => {
  const tokenBalances = await fetchUserBalances(account)
  dispatch(updatePoolsUserData({ sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }))
}

export const updateUserStakedBalance = (sousId: number, account: string) => async (dispatch) => {
  const stakedBalances = await fetchUserStakeBalances(account)
  dispatch(updatePoolsUserData({ sousId, field: 'stakedBalance', value: stakedBalances[sousId] }))
}

export const updateUserPendingReward = (sousId: number, account: string) => async (dispatch) => {
  const pendingRewards = await fetchUserPendingRewards(account)
  dispatch(updatePoolsUserData({ sousId, field: 'pendingReward', value: pendingRewards[sousId] }))
}

export const fetchCakeVaultPublicData = createAsyncThunk<CakeVault>('cakeVault/fetchPublicData', async () => {
  const publicVaultInfo = await fetchPublicVaultData()
  return publicVaultInfo
})

export const fetchCakeVaultFees = createAsyncThunk<VaultFees>('cakeVault/fetchFees', async () => {
  const vaultFees = await fetchVaultFees()
  return vaultFees
})

export const fetchCakeVaultUserData = createAsyncThunk<VaultUser, { account: `0x${string}` }>(
  'cakeVault/fetchUser',
  async ({ account }) => {
    const userData = await fetchVaultUser(account)
    return userData
  },
)

export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    setPoolsPublicData: (state, action) => {
      const livePoolsData: Pool[] = action.payload
      state.data = state.data.map((pool) => {
        const livePoolData = livePoolsData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, ...livePoolData }
      })
    },
    updatePoolsPublicData: (state, action) => {
        if (action.payload.length !== state.data.length && action.payload.length > 0) {
        state.data = action.payload
        state.userDataLoaded = false
      }
    },
    updatePoolsHost: (state, action) => {
      state.userDataLoaded = false
      state.host = action.payload
    },
    setPoolsUserData: (state, action) => {
      const userData = action.payload
      state.data = state.data.map((pool) => {
        const userPoolData = userData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, userData: userPoolData }
      })
      state.userDataLoaded = true
    },
    updatePoolsUserData: (state, action) => {
      const { field, value, sousId } = action.payload
      const index = state.data.findIndex((p) => p.sousId === sousId)

      if (index >= 0) {
        state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
      }
    },
  },
  extraReducers: (builder) => {
    // Vault public data that updates frequently
    builder.addCase(fetchCakeVaultPublicData.fulfilled, (state, action: PayloadAction<CakeVault>) => {
      state.cakeVault = { ...state.cakeVault, ...action.payload }
    })
    // Vault fees
    builder.addCase(fetchCakeVaultFees.fulfilled, (state, action: PayloadAction<VaultFees>) => {
      const fees = action.payload
      state.cakeVault = { ...state.cakeVault, fees }
    })
    // Vault user data
    builder.addCase(fetchCakeVaultUserData.fulfilled, (state, action: PayloadAction<VaultUser>) => {
      const userData = action.payload
      userData.isLoading = false
      state.cakeVault = { ...state.cakeVault, userData }
    })
  },
})

// Actions
export const { setPoolsPublicData, setPoolsUserData, updatePoolsHost, updatePoolsUserData, updatePoolsPublicData } =
  PoolsSlice.actions

export default PoolsSlice.reducer
