import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from 'state'
import { getBalanceAmount } from 'utils/formatBalance'
import { farmsConfig } from 'config/constants'
import useRefresh from 'hooks/useRefresh'
import { useGetTokenPrice, useGetWcicPrice } from 'hooks/useBUSDPrice'
import tokens from 'config/constants/tokens'
import { getAddress } from 'utils/addressHelpers'
import { Dex, Host, Token } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import useParsedQueryString from 'hooks/useParsedQueryString'
import {
  fetchFarmsPublicDataAsync,
  fetchFarmUserDataAsync,
  /* nonArchivedFarms, */ updateFarmHost,
  setNewData,
} from '.'
import { State, Farm, FarmsState } from '../types'
import { useAccount, useReadContract } from 'wagmi'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'
import { defaultChainId } from 'config/constants/chains'

export const usePollFRTFarmsWithUserData = (includeArchive = false) => {
  const dispatch = useDispatch<AppDispatch>()
  const { slowRefresh } = useRefresh()
  const { address: account } = useAccount()

  useEffect(() => {
    async function get() {
      const farms = await farmsConfig()
      const noAccountFarmConfig = farms.map((farm) => ({
        ...farm,
        userData: {
          allowance: '0',
          tokenBalance: '0',
          stakedBalance: '0',
          earnings: '0',
        },
      }))
      dispatch(setNewData(noAccountFarmConfig))
      // const farmsToFetch = farms.filter((farm) => farm.host.payoutToken.symbol === tokens.mswap.symbol)
      const ids = farms.map((farmToFetch) => farmToFetch.id)
      dispatch(fetchFarmsPublicDataAsync(ids))

      if (account) {
        dispatch(fetchFarmUserDataAsync({ account, ids }))
      }
    }
    get()
  }, [includeArchive, dispatch, slowRefresh, account])
}

export const usePollFarmsWithUserDataByPartner = (host: Host, all?: boolean) => {
  const dispatch = useDispatch<AppDispatch>()
  const { slowRefresh } = useRefresh()
  const { address: account } = useAccount()
  useEffect(() => {
    async function get() {
      const farms = await farmsConfig()
      const noAccountFarmConfig = farms.map((farm) => ({
        ...farm,
        userData: {
          allowance: '0',
          tokenBalance: '0',
          stakedBalance: '0',
          earnings: '0',
        },
      }))

      dispatch(setNewData(noAccountFarmConfig))
      let farmsToFetch = farms
      if(!all) farmsToFetch = farms.filter((farmInfo) => farmInfo.host === host)
      const ids = farmsToFetch.map((farmToFetch) => farmToFetch.id)
      dispatch(fetchFarmsPublicDataAsync(ids))

      if (account) {
        dispatch(fetchFarmUserDataAsync({ account, ids }))
      }
    }
    get()
  }, [dispatch, slowRefresh, account, host, all])
}

export const usePollCoreFarmData = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { sslowRefresh } = useRefresh()

  useEffect(() => {
    async function get() {
      const baseFarms = [1,2,3]
      const farms = await farmsConfig(false)
      const noAccountFarmConfig = farms.map((farm) => ({
        ...farm,
        userData: {
          allowance: '0',
          tokenBalance: '0',
          stakedBalance: '0',
          earnings: '0',
        },
      }))

      dispatch(setNewData(noAccountFarmConfig))

      const frtTVLFarms = farms.filter((farm) => farm.host.payoutToken.symbol === tokens.wneon.symbol)
      frtTVLFarms.forEach((farm) => baseFarms.push(farm.id))
      dispatch(fetchFarmsPublicDataAsync(baseFarms))
    }
    get()
  }, [dispatch, sslowRefresh])
}

export const useFarms = (): FarmsState => {
  const farms = useSelector((state: State) => state.farms)
  return farms
}

export function useFarmHostManager(isLocker?: boolean): [Host, (userHost: Host) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const { chain } = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const isTestnet = chainId === 245022926
  let userHost = useFarmHost()

  if (isLocker && userHost === undefined) {
    if(!isTestnet) userHost = hosts.forgeTest
    else userHost = hosts.forgeTest
    
    dispatch(updateFarmHost(userHost))
  } else if(userHost === undefined){
    if(!isTestnet) userHost = hosts.forgeTest
    else userHost = hosts.forgeTest
    dispatch(updateFarmHost(userHost))
  }

  const setFarmHost = useCallback(
    (host: Host) => {
      dispatch(updateFarmHost(host))
    },
    [dispatch],
  )

  return [userHost, setFarmHost]
}


export const useFarmHost = (): Host => {
  const host = useSelector((state: State) => state.farms.host)
  return host
}

export const useFarmFromId = (id): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.id === id))
  return farm
}

export const useFarmFromLpSymbol = (lpSymbol: string): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.lpSymbol === lpSymbol))
  return farm
}

export const useFarmUser = (id) => {
  const farm = useFarmFromId(id)
  return {
    allowance: farm.userData ? farm.userData.allowance : "0",
    tokenBalance: farm.userData ? farm.userData.tokenBalance : "0",
    stakedBalance: farm.userData ? farm.userData.stakedBalance : "0",
    earnings: farm.userData ? farm.userData.earnings : "0",
  }
}



export const fetchTokenBalances = async (account: string, token: Token, chainId: number): Promise<string> => {

  if (account !== null && account !== undefined && account !== '') {
    if (chainId === defaultChainId && token.symbol !== 'WCRO' ) {
      const balance = await readContract(config, {
        address: getAddress(token.address, chainId),
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`],
        chainId: chainId
      })
      return new BigNumber(balance.toString()).toJSON()
    }
  }
  return '0'
}

// Return the base token price for a farm, from a given pid
export const useBusdPriceFromId = (id: number): BigNumber => {
  const farm = useFarmFromId(id)
  if (id === -1) {
    return BIG_ZERO
  }
  return farm && new BigNumber(farm.token.busdPrice)
}

export const useLpTokenPrice = (symbol: string) => {
  const farm = useFarmFromLpSymbol(symbol)
  const farmTokenPriceInUsd = useBusdPriceFromId(farm.id)
  let lpTokenPrice = BIG_ZERO

  if (farm.lpTotalSupply && farm.lpTotalInQuoteToken) {
    // Total value of base token in LP
    const valueOfBaseTokenInFarm = farmTokenPriceInUsd.multipliedBy(farm.tokenAmountTotal)
    // Double it to get overall value in LP
    const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.multipliedBy(2)
    // Divide total value of all tokens, by the number of LP tokens
    const totalLpTokens = getBalanceAmount(new BigNumber(farm.lpTotalSupply))
    lpTokenPrice = overallValueOfAllTokensInFarm.multipliedBy(totalLpTokens)
  }

  return lpTokenPrice
}

// /!\ Deprecated , use the USDT hook in /hooks

export const usePriceBnbBusd = (dex: Dex): BigNumber => {
  // const bnbBusdFarm = useFarmFromId(3) // USDT OR STABLECOIN FARM
  // return new BigNumber(bnbBusdFarm.quoteToken.busdPrice)
  const BNBBusd = useGetWcicPrice(dex)
  return BNBBusd
}

const GetHostPriceBusdByHost = (host: Host): BigNumber => {
  // const hostFarm = useFarmFromId(host.priceId)
  const hostPriceString = useGetTokenPrice(host.dex, host.payoutToken)
  // const hostPriceString = hostFarm.token.busdPrice ? hostFarm.token.busdPrice : '0'
  const hostPrice = useMemo(() => {
    const hostPriceBN = new BigNumber(hostPriceString)
    return hostPriceBN
  }, [hostPriceString])

  return hostPrice
}

export const useHostPricesBusd = () => {
  const hostPrices = useRef({})
  Object.values(hosts).forEach((host) => {
    hostPrices.current[host.payoutToken.symbol] = GetHostPriceBusdByHost(host)
  })
  return hostPrices.current
}

export const useHostPrice = () => {
  const hostPrices = useHostPricesBusd()
  return useCallback(
    (host: Host) => {
      return hostPrices[host.payoutToken.symbol]
    },
    [hostPrices],
  )
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


export function useDefaultsFromURLSearch(): { host: Host | undefined; search: string | undefined } | undefined {
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<{ host: Host; search: string }>()

  useEffect(() => {
    const parsedHost = parseHostFromURLParameter(parsedQs.host)
    const parsedSearch = parseSearchFromURLParameter(parsedQs.search)
    setResult({
      host: parsedHost,
      search: parsedSearch,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedQs])

  return result
}
