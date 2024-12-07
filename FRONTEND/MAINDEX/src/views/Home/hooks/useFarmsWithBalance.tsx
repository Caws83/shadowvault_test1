import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import ethers from 'ethers'
import { getAddress } from 'utils/addressHelpers'
import { farmsConfig } from 'config/constants'
import { FarmConfig } from 'config/constants/types'
import useRefresh from 'hooks/useRefresh'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import hosts from 'config/constants/hosts'
import { useAccount } from 'wagmi'
import { Abi } from 'viem'
import { multicall, readContracts } from '@wagmi/core'

export interface FarmWithBalance extends FarmConfig {
  balance: BigNumber
}

let farms = []
const fetchFarmData = async () => {
  farms = await farmsConfig()
}

fetchFarmData()

const useFarmsWithBalance = () => {
  const [farmsWithStakedBalance, setFarmsWithStakedBalance] = useState<{ [symbol: string]: FarmWithBalance[] }>({})
  const [earningsSum, setEarningsSum] = useState<{ [symbol: string]: number }>({})
  const { address: account } = useAccount()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchBalances = async () => {
      const calls: { [symbol: string]: { abi: Abi; address: `0x${string}`; functionName: string; args: any[], chainId: number }[] } = {}
      Object.values(hosts).forEach((host) => {
        if (host === undefined) {
          return
        }
        const hostKey = host.payoutToken.symbol
        const filteredFarms = farms.filter((f) => f.host.payoutToken.symbol === hostKey && f.isVisible === true)
        filteredFarms.forEach((farm) => {
          calls[farm.host.payoutToken.symbol].push({
            abi: farm.host.chefAbi,
            address: getAddress(farm.host.masterChef, farm.chainId),
            functionName: farm.host.pendingCall,
            args: [farm.pid, account],
            chainId: farm.chainId
          })
        })
      })
      const callRes: { [symbol: string]: any } = {}
      const farmsWithBalances: { [symbol: string]: FarmWithBalance[] } = {}
      await Promise.all(
        Object.values(hosts).map(async (host) => {
          const hostKey = host.payoutToken.symbol
          if (callRes[hostKey] === undefined) {
            callRes[hostKey] = {}
          }
          const hostCalls = calls[hostKey]
          callRes[hostKey] = await readContracts(config, { contracts: hostCalls })
          if (farmsWithBalances[hostKey] === undefined) {
            farmsWithBalances[hostKey] = []
          }
          let index = 0
          const filteredFarms = farms.filter((f) => f.host.payoutToken.symbol === hostKey && f.isVisible === true)
          filteredFarms.forEach((farm) => {
            const balance = new BigNumber(callRes[hostKey][index])
            farmsWithBalances[hostKey].push({ ...farm, balance })
            index++
          })
        }),
      )
      const totalEarned: { [symbol: string]: number } = {}
      Object.values(hosts).forEach((host) => {
        const hostKey = host.payoutToken.symbol
        if (totalEarned[hostKey] === undefined) {
          totalEarned[hostKey] = 0
        }
        totalEarned[hostKey] = farmsWithBalances[hostKey].reduce((accum, earning) => {
          const earningNumber = new BigNumber(earning.balance.toString())
          if (earningNumber.eq(0)) {
            return accum
          }
          return accum + earningNumber.div(DEFAULT_TOKEN_DECIMAL.toString()).toNumber()
        }, 0)
      })
      const farmsWithUserBalances: { [symbol: string]: FarmWithBalance[] } = {}
      Object.values(hosts).forEach((host) => {
        const hostKey = host.payoutToken.symbol
        if (farmsWithUserBalances[hostKey] === undefined) {
          farmsWithUserBalances[hostKey] = []
        }
        farmsWithBalances[hostKey].forEach((farm) => {
          if (new BigNumber(farm.balance.toString()).gt(0)) {
            farmsWithUserBalances[hostKey].push(farm)
          }
        })
      })
      setFarmsWithStakedBalance(farmsWithUserBalances)
      setEarningsSum(totalEarned)
    }

    if (account) {
      fetchBalances()
    }
  }, [account, fastRefresh])

  return {
    farmsWithStakedBalance,
    earningsSum,
  }
}

export default useFarmsWithBalance
