import { getAddress, getInfoChefaddress } from 'utils/addressHelpers'
import { infoChefAbi } from 'config/abi/infoChef'
import { NFTPoolConfig, Token } from '../types'
import contracts from '../contracts'
import hosts from '../hosts'
import { dexs } from '../dex'
import { Address, createPublicClient, http } from 'viem'
import { readContracts } from '@wagmi/core'
import { mainnet } from 'viem/chains';
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'
import getSocials from '../socials'


const manual: NFTPoolConfig[] = []

const ethereumv3 = async () => {
  const start = 8000001
  const dex = dexs.marswapeth
  const chainId = dex.chainId
  const factory = getAddress(contracts.nftPoolFactoryV3, chainId)
  const host = hosts.farmageddon
  const publicClient = createPublicClient({ 
    chain: mainnet,
    transport: http()
  })
  try {
    
 
    const info = await publicClient.readContract({address: getInfoChefaddress(chainId), abi: infoChefAbi, functionName: "getNftPoolInfo", args: [factory]})
    const PoolInfo: NFTPoolConfig[] = []
    if(info[0].length === 0) return []
    for (let i = 0; i < info[0].length; i++) {
        let earningTokens: Token[] = []
        for(let t=0; t<info[4][i].earnAddress.length; t++){
          const tAddress = info[4][i].earnAddress[t] as Address
          const data = await readContracts(config, { 
            contracts: [ 
              { 
                address: tAddress, 
                abi: ERC20_ABI, 
                functionName: 'decimals',
                chainId,
              }, 
              { 
                address: tAddress, 
                abi: ERC20_ABI, 
                functionName: 'name', 
                chainId,
              }, 
              { 
                address: tAddress, 
                abi: ERC20_ABI, 
                functionName: 'symbol', 
                chainId,
              }
            ],
          }) 
          const social = getSocials(chainId, tAddress)
          earningTokens.push({
              symbol: data[2].result as string,
              name: data[1].result as string,
              address: { [chainId]: `${tAddress}`},
              decimals: data[0].result as number,
              projectLink: social,
          })
        }
        const nftSocial =  getSocials(chainId, info[1][i].toString())
      PoolInfo.push({
        nftCollectionId: start + i,
        contractAddress: {
          [chainId]: `${info[0][i]}`,
        },
        earningToken: earningTokens,
        stakingToken: {
          symbol: `${info[3][i]}`,
          name: `${info[2][i]}`,
          address: {
            [chainId]: `${info[1][i]}`,
          },
          decimals: 0,
          projectLink: nftSocial,
        },
        host,
        dex,
        isV3: true,
        chainId,
      })
    }

    const reversedPools = PoolInfo.slice().reverse()
    return manual.concat(reversedPools)
  } catch (err) {
    console.log((err as Error).message)
    console.info('Error getting info.')
    return []
  }
}

export default ethereumv3
