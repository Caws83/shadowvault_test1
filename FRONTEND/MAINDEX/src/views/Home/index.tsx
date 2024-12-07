import React, {useEffect, useState} from 'react'
import Hero from './components/NewHero'
import Page from '../Page'
import { useReadContracts } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { lpTokenAbi } from 'config/abi/lpToken'
import { DivTrackerAbi } from 'config/abi/divTracker'
import { config } from 'wagmiConfig'
import PairSection, { PairData } from './components/TopPairs'
import { defaultChainId } from 'config/constants/chains'

// edit these as we go ( currently testnet ones )
const pairAddresses = [
  "0x7d95e8039df1551f8c3c7512e3931abd002bcec9",
  "0xf186109de062bdea3d5c62efe7798836e92bdd1a",
  "0x35b4cdab7e6bba1ad1ca217bea1fadfc84c90ca2",
  
]
const names = [
  "vUSD/zkCRO",
  "vETH/vUSD",
  "zkCLMRS/zkCRO"
]


const Home: React.FC = () => {

  const [divTrackers, setDivTrackers] = useState([])
  const [pairData, setPairData] = useState<PairData[]>([])
  
  const calls = pairAddresses.map((pair) => ({
    abi: lpTokenAbi,
    address: pair,
    functionName: 'dividendTracker',
    chainId: defaultChainId,
  }))
  const { data, isLoading } = useReadContracts({ contracts: calls})
  useEffect(() => {
    if (!isLoading && data !== undefined) {
      const newDivTrackers = data.map((result) => result.result)
      setDivTrackers(newDivTrackers)
    }
  }, [isLoading, data])


useEffect(() => {
  const fetchData = async () => {
    if (divTrackers.length > 0) {
      const epoch = Math.floor(Date.now() / 1000) - 24 * 60 * 60
      const calls2 = pairAddresses.reduce((acc, pair, i) => {
        return acc.concat(
          {
            abi: lpTokenAbi,
            address: pair,
            functionName: 'getStatsFromTimestamp',
            args: [epoch],
            chainId: defaultChainId,
          },
          {
            abi: DivTrackerAbi,
            address: divTrackers[i],
            functionName: 'totalDividendsDistributed',
            chainId: defaultChainId,
          }
        );
      }, []);

      try {
        const data2 = await readContracts(config, { contracts: calls2 })

        const organizedData = pairAddresses.map((pair, i) => {
          const stats = data2[i * 2]?.result || []
          const dividends = data2[i * 2 + 1]?.result || null
          return {
            pair: pair,
            token0: stats[0],
            volume0: stats[1],
            token1: stats[2],
            volume1: stats[3],
            txCount: stats[4],
            totalDiv: dividends,
            pairName: names[i] 
          } as PairData
        })
        setPairData(organizedData)
      } catch (error) {
        console.error('Error fetching data2:', error)
      }
    }
  };

  fetchData();
}, [divTrackers]);

// make a new component for under the hero. send pairData and display it.
// we may need to either add symbols for the pair above. or grab it in the component.
// also find out which token is WCRO and calculate.

  return (
    <Page>
      <Hero />
      <PairSection data={pairData} />
    </Page>
  )
}

export default Home
