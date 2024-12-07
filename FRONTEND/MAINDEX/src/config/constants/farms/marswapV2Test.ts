import { getAddress, getInfoChefaddress } from 'utils/addressHelpers'
import { infoChefAbi } from 'config/abi/infoChef'
import { FarmConfig } from '../types'
import hosts from '../hosts'
import { dexs } from '../dex'
import { createPublicClient, http } from 'viem'
import { CronosZKTest } from '../chains'


const removeFarmsPIDS = [1,2]

  const lockers = async () => {
    const publicClient = createPublicClient({ 
      chain: CronosZKTest,
      transport: http()
    })

 
  try {
    const start = 100000
    const host = hosts.marstest
    const dex = dexs.marsCZKTest
    const chef = getAddress(host.masterChef, 282)
    const info = await publicClient.readContract({address: getInfoChefaddress(282), abi: infoChefAbi, functionName: "getFarmInfo", args: [chef]})


    const FarmInfo: FarmConfig[] = []
    for (let i = 0; i < info[0].length; i++) {
      
      let skipNextIteration = false;

            for (let r = 0; r < removeFarmsPIDS.length; r++) {
                if (removeFarmsPIDS[r] === i) {
                    skipNextIteration = true;
                    break;
                }
            }

            if (!skipNextIteration) {

      if (info[4][i] > 0n) {
        FarmInfo.push({
          id: start + i,
          pid: i,
          lpSymbol: `${info[3][i]}-${info[7][i]}`,
          lpAddresses: {
            282: `${info[0][i]}`,
          },
          token: {
            symbol: `${info[3][i]}`,
            name: `${info[2][i]}`,
            address: {
              282: `${info[1][i]}`,
            },
            decimals: Number(info[4][i]),
            projectLink: 'https://marswap.exchange/',
          },
          quoteToken: {
            symbol: `${info[7][i]}`,
            name: `${info[6][i]}`,
            address: {
              282: `${info[5][i]}`,
            },
            decimals: Number(info[8][i]),
            projectLink: 'https://marswap.exchange/',
          },
          host,
          dex,
          isVisible: true,
          chainId: 282,
        })
      }
    }}


    const reversedFarms = FarmInfo.slice().reverse()

    return reversedFarms
  } catch (e) {
    console.info(e,'Error getting Locker info.')
    return []
  }
}

export default lockers
