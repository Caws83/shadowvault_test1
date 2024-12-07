import { getPublicClient } from '@wagmi/core'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import useRefresh from './useRefresh'
import { config } from 'wagmiConfig'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(chainId: number): BigNumber | undefined {
  const { slowRefresh } = useRefresh()
  const [timeStamp, setTimestamp] = useState<BigNumber>(new BigNumber("9999999999"))
  useEffect(() => {
    const fetchData = async () => {
      if(chainId) {
        const publicClient = await getPublicClient(config, {chainId})
        const info = await publicClient.getBlock()
        setTimestamp(new BigNumber(info.timestamp.toString()))
      } else setTimestamp(new BigNumber("9999999999"))
    }
    fetchData()
  },[slowRefresh])

  return timeStamp
}
