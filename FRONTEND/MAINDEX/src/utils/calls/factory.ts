import { useEffect, useState } from 'react'
import useRefresh from 'hooks/useRefresh'
import { dexs } from 'config/constants/dex'
import BigNumber from 'bignumber.js'
import { getAddress } from 'utils/addressHelpers'
import { readContract } from '@wagmi/core'
import { farmFactoryAbi } from 'config/abi/farmFactory'
import { Dex } from 'config/constants/types'
import contracts from 'config/constants/contracts'
import { config } from 'wagmiConfig'
import { Address } from 'viem'
import { PairV2Abi } from 'config/abi/PairV2'
import { DivTrackerAbi } from 'config/abi/divTracker'
import { API_URL } from 'config'

export const useGetFactoryTxFee = (dex: Dex) => {
  const { slowRefresh } = useRefresh()
  const [FLAT_FEE, setFlatFee] = useState<number>(0)

  useEffect(() => {
    async function fetchInfo() {
      let feeGetterAddress = 
        dex.isMars ? getAddress(dex.factory, dex.chainId) : getAddress(contracts.superRouter, dex.chainId)
      try {
        const feeRaw = await readContract(config, {
          abi: farmFactoryAbi,
          address: feeGetterAddress,
          functionName: 'flatFee',
          chainId: dex.chainId
        })
        setFlatFee(new BigNumber(feeRaw.toString()).toNumber())
      } catch {
        setFlatFee(0)
      }
      }

    
    fetchInfo()
  }, [slowRefresh, dex])

  return FLAT_FEE
}

export const getFullDivForChain = (dex:Dex) => {
  const { slowRefresh } = useRefresh()
  const [amount, setAmount] = useState(new BigNumber(0))
  useEffect(() => {
    async function fetchInfo() {
      let found = false
// Replace 'API_URL' with the actual API endpoint URL
const API_URL2 = `${API_URL}/V2/divpaid`
fetch(API_URL2)
  .then((response) => response.json())
  .then((jsonData) => {
    if (Array.isArray(jsonData)) {
      for (let i = 0; i < jsonData.length; i++) {
        const key = Object.keys(jsonData[i])[0]
        if(Number(key) === dex.chainId){
          setAmount(new BigNumber(jsonData[i][key].amountPaid))
          found = true
        }
      }
      if(!found) setAmount(new BigNumber(0))
      
    } else {
      console.error('API response is not an array.')
      setAmount(new BigNumber(0))
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error)
  })
}
  fetchInfo()
  }, [slowRefresh, dex])

  return amount
}




export const useGetDividends = (dex: Dex, token1: Address, token2: Address) => {
  const { slowRefresh } = useRefresh()
  const [amount, setAmount] = useState<number>(0)

  useEffect(() => {
    async function fetchInfo() {
      
      
      try {
        const pair = await readContract(config, {
          abi: farmFactoryAbi,
          address: getAddress(dex.factory, dex.chainId),
          functionName: 'getPair',
          args: [token1, token2],
          chainId: dex.chainId
        })
        const divTracker = await readContract(config, {
          abi: PairV2Abi,
          address: pair,
          functionName: 'dividendTracker',
          chainId: dex.chainId
        })
        const rawAmount = await readContract(config, {
          abi: DivTrackerAbi,
          address: divTracker,
          functionName: 'totalDividendsDistributed',
          chainId: dex.chainId
        })
        
      // get amount
      setAmount(new BigNumber(rawAmount.toString()).toNumber())
      } catch {
        setAmount(0)
      }
    }
    
    fetchInfo()
  }, [slowRefresh, token1, token2, dex])

  return amount
}


