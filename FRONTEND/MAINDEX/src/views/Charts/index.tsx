import { Flex, Text, IconButton, ChartIcon } from 'uikit'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { shardConfig } from 'config'
import { Dex } from 'config/constants/types'
import { dexs, dexList } from 'config/constants/dex'
import { Address, zeroAddress } from 'viem'
import { readContract } from '@wagmi/core'
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { farmFactoryAbi } from 'config/abi/farmFactory'
import tokens from 'config/constants/tokens'
import { usePublicClient } from 'wagmi'
import { config } from 'wagmiConfig'

interface ChartProps {
  token: string
  symbol: string
  setH: string
  setW: string
  show: boolean
  dex: Dex
}

const ColoredIconButton = styled(IconButton)`
  color: ${({ theme }) => theme.colors.textSubtle};
`

const Chart: React.FC<ChartProps> = (props) => {
  const { token, symbol, show, setH, setW, dex } = props


  const [showGraph, setShowGraph] = useState(show)

  const chainId = dex.chainId
  const chainName = () => {
    if (chainId === 56 || chainId === 97) return "bsc"
    if (chainId === 109) return "shibarium"
    if (chainId === 1) return "ether"
    if (chainId === 11155111) return "sepolia"
    if (chainId === 25) return "cronos"
    if (chainId === 56) return "bnb"
    if (chainId === 8453) return "base"
    if (chainId === 245022926) return "neon"
    return undefined
  }

  // get pair address
  const native = getWrappedAddress(chainId)
  const usd = getAddress(tokens.usdForChat.address, chainId)
  const [ pairAddress, setPair] = useState<Address>(zeroAddress)

  useEffect(() => {
    async function go() {
      for (const currentDex of dexList) {
        if (currentDex.chainId === chainId) {
          const currentDexFactory = getAddress(currentDex.factory, chainId);
          const abi = currentDex.dexABI ?? farmFactoryAbi;

          if (native !== token) {
            try {
              const p = await readContract(config, {
                abi: abi as any,
                address: currentDexFactory,
                functionName: "getPair",
                args: [token as Address, native],
                chainId,
              })
              if (p !== zeroAddress) {
                setPair(p);
                break;
              }
            } catch {}
          } else {
            try {
              const p = await readContract(config, {
                abi: abi as any,
                address: currentDexFactory,
                functionName: "getPair",
                args: [token as Address, usd],
                chainId,
              })
              if (p !== zeroAddress) {
                setPair(p);
                break;
              }
            } catch {}
          }
        }
      }
    }
    go();
  }, [token, chainId, native, usd, dexList]);
  


  return (
    <Flex flexDirection="column">
      {!show && (
        <Flex justifyContent="flex-end" mr="25px">
          <ColoredIconButton onClick={() => setShowGraph(!showGraph)} variant="text" scale="sm">
            <ChartIcon width="24px" color="primary" />
            <Text color="textSubtle">{showGraph ? 'Minimize' : symbol} </Text>
          </ColoredIconButton>
        </Flex>
      )}

    
      {showGraph && chainId === 109 &&(
        <iframe
          src={`https://web3shards.io/chart?chain=shibarium&theme=dark&mode=natural&stats=false&apiKey=${shardConfig.apiKey}&token=${token}&socketId=${shardConfig.socketId}`}
          style={{ border: '0px none #ffffff' }}
          title="Token Chart"
          name="Chart"
          height={setH}
          width={setW}
        />
      )}

      
      {showGraph && pairAddress !== zeroAddress && chainId !== 109 &&(
         <iframe id="dextools-widget"
          title="DEXTools Trading Chart"
          height={setH}
          width={setW}
          src={`https://www.dextools.io/widget-chart/en/${chainName()}/pe-light/${pairAddress}?theme=dark&chartType=1&chartResolution=30&drawingToolbars=false`}
         
        />
      )}    


    </Flex>
  )
}

export default Chart
