import { createSlice } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { NFTPoolsState, NFTPool } from 'state/types'
import { getAddress, getPriceCheckaddress } from 'utils/addressHelpers'
import { Dex, Host, Token } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import {
  fetchNftPoolsStakingLimits,
  fetchNftPoolsPublicInfoByHost,
  fetchNftPoolTotalStakingForPool,
} from './fetchNftPools'
import {
  fetchNftPoolsApprovedByHost,
  fetchNftUserBalancesByHost,
  fetchNftUserStakeBalancesByHost,
  fetchNftUserPendingRewardsByHost,
  fetchNftUserInfo,
  /* fetchNftUserInfo, */
} from './fetchNftPoolsUser'
import { getTokenPricesFromFarm } from './helpers'
import { readContract } from '@wagmi/core'
import { tokenPriceAbi } from 'config/abi/tokenPrice'
import { nftPoolAbi } from 'config/abi/nftpool'
import nftPools from 'config/constants/nftpools'
import { config } from 'wagmiConfig'
import {Address} from 'viem'


/* const getRewardPerBlock = async (pool: NFTPool) => {
  const nftpoolchef = getNftPoolContract(pool.nftCollectionId)
  const RewardPerBlock = (await nftpoolchef.rewardPerBlock()) / 10 ** pool.earningToken.decimals
  return RewardPerBlock.toString()
} */

export const getTokenPrice = async (dex: Dex, token: Token) => {
  const factoryAddress = getAddress(dex.factory, dex.chainId)
  const tokenAddress = !token.baseAddress ? getAddress(token.address, dex.chainId) : getAddress(token.baseAddress, dex.chainId)

  try {
    const priceRaw = await readContract(config, {
      abi: tokenPriceAbi,
      address: getPriceCheckaddress(dex.chainId),
      functionName: 'TokenPrice',
      args: [tokenAddress, factoryAddress],
      chainId: dex.chainId
    })

    const num = new BigNumber(priceRaw[0].toString())
    const den = new BigNumber(priceRaw[1].toString())
    const usd = new BigNumber(priceRaw[2].toString())
    const dec = new BigNumber(18 - token.decimals)

    const price = num.multipliedBy(usd).dividedBy(den).shiftedBy(dec.times(-1).toNumber())

    return price.shiftedBy(-18).toNumber()
  } catch {
    return 0
  }
}
const getRound = async (pool: NFTPool) => {
  const round = await readContract(config, {
    abi: nftPoolAbi,
    address: getAddress(pool.contractAddress, pool.chainId),
    functionName: 'currentRound',
    chainId: pool.chainId
  })
  return new BigNumber(round.toString()).toJSON()
}

// Thunks
export const fetchNftPoolsPublicDataByHostAsync = (currentBlock: bigint, host: Host) => async (dispatch, getState) => {
  const poolsInfo = await fetchNftPoolsPublicInfoByHost(host, currentBlock)
  const prices = getTokenPricesFromFarm(getState().farms.data)
  const nftpools = await nftPools()
  const poolList = nftpools.filter((pool) => pool.host === host)
  const liveData = await Promise.all(
    poolList.map(async (pool) => {
      const { startBlock, endBlock, totalStaked, rewardPerBlock } = poolsInfo.find(
        (entry) => entry.nftCollectionId === pool.nftCollectionId,
      )
     
      const  currentRound = await getRound(pool)
      
      const round = new BigNumber(currentRound).toNumber()
      const currentRToken = pool.earningToken[round]

      const isPoolEndBlockExceeded = currentBlock > 0 && endBlock ? currentBlock > Number(endBlock) : false
      const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded
      const earningTokenAddress = currentRToken.address ? getAddress(currentRToken.address, pool.chainId).toLowerCase() : null
      let earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
      if (earningTokenPrice === 0 || earningTokenPrice === undefined) {
        earningTokenPrice = await getTokenPrice(pool.dex, currentRToken)
      }

      // const REWARDPERBLOCK: string = await getRewardPerBlock(pool)
      let rewardPerDayPerToken = new BigNumber(rewardPerBlock).times(86400).toString()
      if (rewardPerBlock && totalStaked && new BigNumber(rewardPerBlock).gt(0) && new BigNumber(totalStaked).gt(0)) {
        rewardPerDayPerToken = (new BigNumber(rewardPerBlock).times(86400)).dividedBy(totalStaked).toString()
      }

      return {
        nftCollectionId: pool.nftCollectionId,
        startBlock,
        endBlock,
        totalStaked,
        stakingTokenPrice: '0',
        earningTokenPrice,
        rewardPerDayPerToken,
        isFinished: isPoolFinished,
        currentRound,
      }
    }),
  )

  dispatch(setNftPoolsPublicData(liveData))
}

// Thunks

export const fetchNftPoolsStakingLimitsByHostAsync = (host: Host) => async (dispatch, getState) => {
  const poolsWithStakingLimit = getState()
    .pools.data.filter((pool) => pool.host === host && pool.stakingLimit !== null && pool.stakingLimit !== undefined)
    .map((pool) => pool.nftCollectionId)

  const stakingLimits = await fetchNftPoolsStakingLimits(poolsWithStakingLimit)
  const nftpools = await nftPools()
  const stakingLimitData = nftpools
    .filter((pool) => pool.host === host)
    .map((pool) => {
      if (poolsWithStakingLimit.includes(pool.nftCollectionId)) {
        return { nftCollectionId: pool.nftCollectionId }
      }
      const stakingLimit = stakingLimits[pool.nftCollectionId] || BIG_ZERO
      return {
        nftCollectionId: pool.nftCollectionId,
        stakingLimit: stakingLimit,
      }
    })

  dispatch(setNftPoolsPublicData(stakingLimitData))
}

export const fetchNftPoolsUserDataByHostAsync = (account: Address, host: Host) => async (dispatch) => {
  try {
    const [approvals, userPoolInfo, stakingTokenBalance, nftpools] = await Promise.all([
      fetchNftPoolsApprovedByHost(account, host),
      fetchNftUserInfo(account, host),
      fetchNftUserBalancesByHost(account, host),
      nftPools(),
    ]);

    const userData = nftpools
      .filter((pool) => pool.host === host)
      .map((pool) => ({
        nftCollectionId: pool.nftCollectionId,
        approved: approvals[pool.nftCollectionId],
        stakingTokenBalance: stakingTokenBalance[pool.nftCollectionId],
        stakedBalance: userPoolInfo[pool.nftCollectionId].balance,
        tokenIds: userPoolInfo[pool.nftCollectionId].tokenIds,
        pendingReward: userPoolInfo[pool.nftCollectionId].pendingReward,
        hasOld: userPoolInfo[pool.nftCollectionId].hasOld,
        prevRewards: userPoolInfo[pool.nftCollectionId].prevRewards,
      }));

    dispatch(setNftPoolsUserData(userData));
  } catch (error) {
    console.error('Error fetching NFT pools user data:', error);
    // Handle the error as needed
  }
};


export const updateNftPoolTotalStaked = (nftCollectionId: number) => async (dispatch) => {
  const totalStaked = await fetchNftPoolTotalStakingForPool(nftCollectionId)
  dispatch(updateNftPoolStaked({ totalStaked, nftCollectionId }))
}



export const updateNftUserApproval = (nftCollectionId: number, account: string, host: Host) => async (dispatch) => {
  const approvals = await fetchNftPoolsApprovedByHost(account, host)
  dispatch(updateNftPoolsUserData({ nftCollectionId, field: 'approved', value: approvals[nftCollectionId] }))
}

export const updateNftUserBalance = (nftCollectionId: number, account: string, host: Host) => async (dispatch) => {
  const tokenBalances = await fetchNftUserBalancesByHost(account, host)
  dispatch(
    updateNftPoolsUserData({ nftCollectionId, field: 'stakingTokenBalance', value: tokenBalances[nftCollectionId] }),
  )
}

export const updateNftUserStakedBalance =
  (nftCollectionId: number, account: string, host: Host) => async (dispatch) => {
    const stakedBalances = await fetchNftUserStakeBalancesByHost(account, host)
    dispatch(
      updateNftPoolsUserData({ nftCollectionId, field: 'stakedBalance', value: stakedBalances[nftCollectionId] }),
    )
  }

export const updateNftUserPendingReward =
  (nftCollectionId: number, account: string, host: Host) => async (dispatch) => {
    const pendingRewards = await fetchNftUserPendingRewardsByHost(account, host)
    dispatch(
      updateNftPoolsUserData({ nftCollectionId, field: 'pendingReward', value: pendingRewards[nftCollectionId] }),
    )
  }

  export const fetchInitialNftPoolsData = () => async (dispatch) => {
    try {
      const data = await nftPools();
      dispatch(setInitialData(data));
    } catch (error) {
      console.error('Error fetching initial NFT pools data:', error);
    }
  };

export const PoolsSlice = createSlice({
  name: 'NftPools',
  initialState: {
    data: [],
    userDataLoaded: false,
    host: hosts.farmageddon,
  } as NFTPoolsState,
  reducers: {
    setInitialData: (state, action) => {
      if(action.payload.length !== state.data.length){
        state.data = action.payload
      }
    },
    setNftPoolsPublicData: (state, action) => {
      const livePoolsData: NFTPool[] = action.payload
      state.data = state.data.map((pool) => {
        const livePoolData = livePoolsData.find((entry) => entry.nftCollectionId === pool.nftCollectionId)
        return { ...pool, ...livePoolData }
      })
    },
    updateNftPoolStaked: (state, action) => {
      const { totalStaked, nftCollectionId } = action.payload
      const index = state.data.findIndex((p) => p.nftCollectionId === nftCollectionId)
      if (index >= 0) {
        state.data[index] = { ...state.data[index], totalStaked }
      }
    },
    updateNftPoolsHost: (state, action) => {
      state.userDataLoaded = false
      state.host = action.payload
    },
    setNftPoolsUserData: (state, action) => {
      const userData = action.payload
      state.data = state.data.map((nftpool) => {
        const userPoolData = userData.find((entry) => entry.nftCollectionId === nftpool.nftCollectionId)
        return { ...nftpool, userData: userPoolData }
      })
      state.userDataLoaded = true
    },
    updateNftPoolsUserData: (state, action) => {
      const { field, value, nftCollectionId } = action.payload
      const index = state.data.findIndex((p) => p.nftCollectionId === nftCollectionId)
      if (index >= 0) {
        state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
      }
    },
  },
})

// Actions
export const {
  setNftPoolsPublicData,
  setNftPoolsUserData,
  updateNftPoolsHost,
  updateNftPoolsUserData,
  updateNftPoolStaked,
  setInitialData,
} = PoolsSlice.actions

export default PoolsSlice.reducer
