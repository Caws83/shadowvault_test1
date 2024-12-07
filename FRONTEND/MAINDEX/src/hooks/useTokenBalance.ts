import { useEffect, useState } from 'react'
import useRefresh from './useRefresh'
import useLastUpdated from './useLastUpdated'
import {  useAccount, usePublicClient } from 'wagmi'
import { getMSWAPAddress } from 'utils/addressHelpers'
import { cakeAbi } from 'config/abi/cake'
import { BIG_ZERO } from 'utils/bigNumber'
import BigNumber from 'bignumber.js'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'
import { Address } from 'viem'

type UseTokenBalanceState = {
  balance: BigNumber
  fetchStatus: FetchStatus
}

export enum FetchStatus {
  NOT_FETCHED = 'not-fetched',
  SUCCESS = 'success',
  FAILED = 'failed',
}

const useTokenBalance = (tokenAddress: `0x${string}`, chainId: number): UseTokenBalanceState => {
  const { NOT_FETCHED, SUCCESS, FAILED } = FetchStatus
  const [balanceState, setBalanceState] = useState<UseTokenBalanceState>({
    balance: BIG_ZERO,
    fetchStatus: NOT_FETCHED,
  })
  const { address: account } = useAccount()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await readContract(config, {
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account],
          chainId
        })
        setBalanceState({ balance: new BigNumber(res.toString()), fetchStatus: SUCCESS })
      } catch (e) {
        console.error(e)
        setBalanceState((prev) => ({
          ...prev,
          fetchStatus: FAILED,
        }))
      }
    }

    if (account) {
      fetchBalance()
    }
  }, [account, tokenAddress, fastRefresh, SUCCESS, FAILED])

  return balanceState
}

export const useTotalSupply = (chainId: number) => {
  const { slowRefresh } = useRefresh()
  const [totalSupply, setTotalSupply] = useState<string>()

  useEffect(() => {
    async function fetchTotalSupply() {
      const supply = await readContract(config, {
        address: getMSWAPAddress(),
        abi: cakeAbi,
        functionName: 'totalSupply',
        chainId
      })
      setTotalSupply(supply.toString())
    }

    fetchTotalSupply()
  }, [slowRefresh])

  return totalSupply
}

export const useTotalSupplyTarget = (chainId: number, address: Address) => {
  const { slowRefresh } = useRefresh()
  const [totalSupply, setTotalSupply] = useState<string>()

  useEffect(() => {
    async function fetchTotalSupply() {
      const supply = await readContract(config, {
        address: address,
        abi: cakeAbi,
        functionName: 'totalSupply',
        chainId
      })
      setTotalSupply(supply.toString())
    }

    fetchTotalSupply()
  }, [slowRefresh])

  return totalSupply
}

export const useBurnedBalance = (tokenAddress: Address, chainId: number) => {
  const [balance, setBalance] = useState(BIG_ZERO)
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await readContract(config, {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: ['0x000000000000000000000000000000000000dEaD'],
        chainId
      })
      setBalance(new BigNumber(res.toString()))
    }

    fetchBalance()
  }, [tokenAddress, slowRefresh])

  return balance
}

export const useGetBnbBalance = (chainId: number) => {
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.NOT_FETCHED)
  const [balance, setBalance] = useState(BIG_ZERO)
  const { address: account } = useAccount()
  const { lastUpdated, setLastUpdated } = useLastUpdated()
  const publicClient = usePublicClient({chainId})

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const walletBalance = await publicClient.getBalance({ address: account })
        setBalance(new BigNumber(walletBalance.toString()))
        setFetchStatus(FetchStatus.SUCCESS)
      } catch {
        setFetchStatus(FetchStatus.FAILED)
      }
    }

    if (account) {
      fetchBalance()
    }
  }, [account, lastUpdated, setBalance, setFetchStatus, publicClient])

  return { balance, fetchStatus, refresh: setLastUpdated }
}

export const useGetBnbBalanceTarget = (target: `0x${string}`, chainId: number) => {
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.NOT_FETCHED)
  const [balance, setBalance] = useState(BIG_ZERO)
  const { lastUpdated, setLastUpdated } = useLastUpdated()
  const publicClient = usePublicClient({chainId})

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const walletBalance = await publicClient.getBalance({ address: target })
        setBalance(new BigNumber(walletBalance.toString()))
        setFetchStatus(FetchStatus.SUCCESS)
      } catch {
        setFetchStatus(FetchStatus.FAILED)
      }
    }
    fetchBalance()
  }, [lastUpdated, target, setBalance, setFetchStatus, publicClient])

  return { balance, fetchStatus, refresh: setLastUpdated }
}

export const useTokenBalanceTarget = (tokenAddress: `0x${string}`, target: `0x${string}`, chainId: number) => {
  const { NOT_FETCHED, SUCCESS, FAILED } = FetchStatus
  const [balanceState, setBalanceState] = useState<UseTokenBalanceState>({
    balance: BIG_ZERO,
    fetchStatus: NOT_FETCHED,
  })
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await readContract(config, {
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [target],
          chainId
        })
        setBalanceState({ balance: new BigNumber(res.toString()), fetchStatus: SUCCESS })
      } catch (e) {
        console.error(e)
        setBalanceState((prev) => ({
          ...prev,
          fetchStatus: FAILED,
        }))
      }
    }

    fetchBalance()
  }, [tokenAddress, target, fastRefresh, SUCCESS, FAILED])

  return balanceState
}

export default useTokenBalance
