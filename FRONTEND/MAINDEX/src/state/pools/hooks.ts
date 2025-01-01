import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, useAppDispatch } from 'state'
import useRefresh from 'hooks/useRefresh'
import { Host } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import useParsedQueryString from 'hooks/useParsedQueryString'
import {
  fetchPoolsPublicDataAsync,
  fetchPoolsUserDataAsync,
  fetchCakeVaultPublicData,
  fetchCakeVaultUserData,
  fetchCakeVaultFees,
  fetchPoolsStakingLimitsAsync,
  fetchPoolsPublicDataByHostAsync,
  fetchPoolsStakingLimitsByHostAsync,
  fetchPoolsUserDataByHostAsync,
  updatePoolsHost,
} from '.'
import { State, Pool } from '../types'
import { transformPool } from './helpers'
import { useAccount } from 'wagmi'
import { defaultChainId } from 'config/constants/chains'

export const useFetchPublicPoolsDataByHost = (host: Host, all?: boolean) => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchPoolsPublicDataByHost = async () => {
      // const blockNumber = await simpleRpcProvider.getBlockNumber()
      const blockNumber = (await Date.now()) / 1000
      if(all) dispatch(fetchPoolsPublicDataAsync(blockNumber))
      else dispatch(fetchPoolsPublicDataByHostAsync(blockNumber, host))
    }

    fetchPoolsPublicDataByHost()
    if(all) dispatch(fetchPoolsStakingLimitsAsync())
    dispatch(fetchPoolsStakingLimitsByHostAsync(host))
  }, [dispatch, slowRefresh, host, all])
}

export const useFetchPublicPoolsData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchPoolsPublicData = async () => {
      const blockNumber = (await Date.now()) / 1000
      dispatch(fetchPoolsPublicDataAsync(blockNumber))
    }

    fetchPoolsPublicData()
    dispatch(fetchPoolsStakingLimitsAsync())
  }, [dispatch, slowRefresh])
}

export const useFetchUserPoolsByHost = (account, host: Host, all?: boolean) => {
  const { fastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      if(all) dispatch(fetchPoolsUserDataAsync(account))
      else dispatch(fetchPoolsUserDataByHostAsync(account, host))
    }
  }, [account, all, dispatch, fastRefresh, host])
}

export const useFetchUserPools = (account) => {
  const { fastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }, [account, dispatch, fastRefresh])
}

export function usePoolsHostManager(): [Host, (userHost: Host) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const { chain } = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const isTestnet = chainId === 245022926

  let userHost = usePoolsHost()

  if (userHost === undefined) {
    if(!isTestnet) userHost = hosts.marswap
    else userHost = hosts.marstest
    dispatch(updatePoolsHost(userHost))
  }

  const setPoolsHost = useCallback(
    (host: Host) => {
      dispatch(updatePoolsHost(host))
    },
    [dispatch],
  )
  return [userHost, setPoolsHost]
}

export const usePoolsHost = (): Host => {
  const host = useSelector((state: State) => state.pools.host)
  return host
}

export const usePools = (): { pools: Pool[]; userDataLoaded: boolean } => {
  const { pools, userDataLoaded } = useSelector((state: State) => ({
    pools: state.pools.data,
    userDataLoaded: state.pools.userDataLoaded,
  }))
  return { pools: pools.map(transformPool), userDataLoaded }
}

export const useFetchCakeVault = () => {
  const { address: account } = useAccount()
  const { fastRefresh, slowRefresh } = useRefresh()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCakeVaultPublicData())
  }, [dispatch, slowRefresh])

  useEffect(() => {
    dispatch(fetchCakeVaultUserData({ account }))
  }, [dispatch, fastRefresh, account])

  useEffect(() => {
    dispatch(fetchCakeVaultFees())
  }, [dispatch])
}

export const useCakeVault = () => {
  const {
    totalShares: totalSharesAsString,
    pricePerFullShare: pricePerFullShareAsString,
    totalCakeInVault: totalCakeInVaultAsString,
    estimatedCakeBountyReward: estimatedCakeBountyRewardAsString,
    totalPendingCakeHarvest: totalPendingCakeHarvestAsString,
    fees: { performanceFee, callFee, withdrawalFee, withdrawalFeePeriod },
    userData: {
      isLoading,
      userShares: userSharesAsString,
      cakeAtLastUserAction: cakeAtLastUserActionAsString,
      lastDepositedTime,
      lastUserActionTime,
    },
  } = useSelector((state: State) => state.pools.cakeVault)
  const estimatedCakeBountyReward = useMemo(() => {
    return estimatedCakeBountyRewardAsString
  }, [estimatedCakeBountyRewardAsString])

  const totalPendingCakeHarvest = useMemo(() => {
    return totalPendingCakeHarvestAsString
  }, [totalPendingCakeHarvestAsString])

  const totalShares = useMemo(() => {
    return totalSharesAsString
  }, [totalSharesAsString])

  const pricePerFullShare = useMemo(() => {
    return pricePerFullShareAsString
  }, [pricePerFullShareAsString])

  const totalCakeInVault = useMemo(() => {
    return totalCakeInVaultAsString
  }, [totalCakeInVaultAsString])

  const userShares = useMemo(() => {
    return userSharesAsString
  }, [userSharesAsString])

  const cakeAtLastUserAction = useMemo(() => {
    return cakeAtLastUserActionAsString
  }, [cakeAtLastUserActionAsString])

  return {
    totalShares,
    pricePerFullShare,
    totalCakeInVault,
    estimatedCakeBountyReward,
    totalPendingCakeHarvest,
    fees: {
      performanceFee,
      callFee,
      withdrawalFee,
      withdrawalFeePeriod,
    },
    userData: {
      isLoading,
      userShares,
      cakeAtLastUserAction,
      lastDepositedTime,
      lastUserActionTime,
    },
  }
}

function parseHostFromURLParameter(urlParam: any): Host {
  if (typeof urlParam === 'string') {
    return hosts[urlParam]
  }
  return undefined
}
function parseSearchFromURLParameter(urlParam1: any): string {
  if (typeof urlParam1 === 'string') {
    return urlParam1
  }
  return undefined
}
function parseProjectSymbolFromURLParameter(urlParam2: any): string {
  if (typeof urlParam2 === 'string') {
    return urlParam2
  }
  return undefined
}

export function useDefaultsFromURLSearch(): { host: Host | undefined; search: string | undefined; projectSymbol: string | undefined } | undefined {
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<{ host: Host; search: string; projectSymbol: string }>()

  useEffect(() => {
    const parsedHost = parseHostFromURLParameter(parsedQs.host)
    const parsedSearch = parseSearchFromURLParameter(parsedQs.search)
    const parsedSymbol = parseProjectSymbolFromURLParameter(parsedQs.projectSymbol)
    setResult({
      host: parsedHost,
      search: parsedSearch,
      projectSymbol: parsedSymbol
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedQs])

  return result
}
