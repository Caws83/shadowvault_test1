import { Flex, Heading, LinkExternal, Text, Toggle } from 'uikit'
import Page from 'components/Layout/Page'
import { isMobile } from 'components/isMobile'
import PageHeader from 'components/PageHeader'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'bignumber.js'
import { API_URL, BASE_BSC_SCAN_URLS } from 'config'
import Chart from 'views/Charts'
import { GetCICPriceFromLBank } from 'state/pools'
import { useParams } from 'react-router-dom'
import { dexs } from 'config/constants/dex'
import useRefresh from 'hooks/useRefresh'


const BorderContainer = styled.div`
  padding: 12px;
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`
const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

// set in proper order BELOW for PRICES
const labels = {
  109: [
    'BONE',
    'ETH',
  ],
  56: [
    'BNB',
    'ETH',
  ]
}

const priceTokens = {
  109: [
    '0xC76F4c819D820369Fb2d7C1531aB3Bb18e6fE8d8', // WBONE -- SHIBARIUM
    '0x8ed7d143Ef452316Ab1123d28Ab302dC3b80d3ce', // ETH
  ],
  56: [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
   
  ],
 
}

// const Analytics: React.FC = () => {
function Analytics () {
 
  const { pair } = useParams()
  let isSingle = false
  if (pair !== undefined) isSingle = true

  const [prices, setPrices] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([])
  const [keys, setKeys] = useState<any[]>([])
  const [keys2, setKeys2] = useState<any[]>([])
  const isSmallerScreen = !isMobile
  const [noVolume, setNoVolume] = useState(false)
  const [dexVolume, setDVolume] = useState(new BigNumber(0))
  const slowRefresh = useRefresh()

   useEffect(() => {

    // Replace 'API_URL' with the actual API endpoint URL
    const API_URL2 = `${API_URL}/V2/pairs`

    fetch(API_URL2)
      .then((response) => response.json())
      .then((jsonData) => {
        if (Array.isArray(jsonData)) {
          setData(jsonData)
        } else {
          console.error('API response is not an array.')
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
   }, [])

  const getVolume = (info) => {
    for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
      if (info.base_id === priceTokens[info.chain_id][i]) return `${new BigNumber(info.base_volume).toFixed(2)} ${info.base_symbol}`
    }
    return `${new BigNumber(info.quote_volume).toFixed(2)} ${info.quote_symbol}`
  }
  const getVolumeUSD = useCallback(
    (info) => {
      for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
        if (info.base_id === priceTokens[info.chain_id][i]  && prices[info.chain_id]) {
          const PUSD = new BigNumber(info.base_volume).multipliedBy(prices[info.chain_id][i])
          return `${PUSD.toNumber().toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        }
        if (info.quote_id === priceTokens[info.chain_id][i]  && prices[info.chain_id]) {
          const PUSD = new BigNumber(info.quote_volume).multipliedBy(prices[info.chain_id][i])
          return `${PUSD.toNumber().toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        }
      }
      return `$0`
    },
    [prices],
  )

  useEffect(() => {
    const rawKeys: any[] = []
    let rawDVolUSD: BigNumber = new BigNumber(0)
    for (let i = 0; i < data.length; i++) {
      const key = Object.keys(data[i])[0]
      const info = data[i][key]
      let vUSD = new BigNumber(0)
      if(info){
        for (let m = 0; m < priceTokens[info.chain_id].length; m++) {
          if (info.base_id === priceTokens[info.chain_id][m]  && prices[info.chain_id]) {
            vUSD = new BigNumber(info.base_volume).multipliedBy(prices[info.chain_id][m])
          }
          if (info.quote_id === priceTokens[info.chain_id][m]  && prices[info.chain_id]) {
            vUSD = new BigNumber(info.quote_volume).multipliedBy(prices[info.chain_id][m])
          }
        }
      }
      rawKeys.push(key)
      if (vUSD.gt(0) && !vUSD.isNaN()) rawDVolUSD = rawDVolUSD.plus(vUSD)
    }
    setKeys(rawKeys)
    setDVolume(rawDVolUSD)
  }, [data, prices])

  const getPairSymbols = (info) => {
    for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
      if (info.quote_id === priceTokens[info.chain_id][i]) return `${info.base_symbol}/${info.quote_symbol}`
    }
    return `${info.quote_symbol} / ${info.base_symbol}`
  }

  const getName = (info) => {
    for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
      if (info.quote_id === priceTokens[info.chain_id][i]) return `${info.base_name}`
    }
    return `${info.quote_name}`
  }

  const getSymPrice = async (symbol) => {
    const apiUrl = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`

    let symPrice = 0
    try {
      const res = await fetch(apiUrl)
      if (res.status >= 400) {
        throw new Error('Bad response from server')
      }
      const price = await res.json()

      symPrice = parseFloat(price.USD)
    } catch (err) {
      console.error('Unable to connect to API', err)
    }
    return symPrice
  }

  useEffect(() => {
    async function getPrices() {
      const updatedPrices = [];
  
      // Loop through each chain in priceTokens
      for (const chainId in labels) {
        const tokens = labels[chainId];
        const chainPrices = [];
  
        // Fetch prices for each token in the chain
        for (const token of tokens) {
          const rawPrice = await getSymPrice(token)
          chainPrices.push(rawPrice);
        }
  
        updatedPrices[chainId] = chainPrices;
      }
  
      setPrices(updatedPrices);
    }
  
    getPrices();
  }, [data]);

  const getPriceUSD = (info, price) => {
    for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
      if (info.base_id === priceTokens[info.chain_id][i] && prices[info.chain_id]) {
        const PUSD = new BigNumber(prices[info.chain_id][i]).dividedBy(price)
        return `$${PUSD.toNumber().toLocaleString('en-US', { maximumFractionDigits: 5 })} USD`
      }
      if (info.quote_id === priceTokens[info.chain_id][i]  && prices[info.chain_id]) {
        const PUSD = new BigNumber(price).multipliedBy(prices[info.chain_id][i])
        return `$${PUSD.toNumber().toLocaleString('en-US', { maximumFractionDigits: 5 })} USD`
      }
    }
    return `$0`
  }

  const [loading, setLoading] = useState(true)
  const [data2, setData2] = useState([])

  useEffect(() => {
    setLoading(true)

    if (isSingle && keys.length > 0) {
      const dataToDisplay = []
      const pairToDisplay = data.find((item, index) => item[keys[index]].pair_id === pair)
      const tokenPairsToDisplay = data.find((item, index) => item[keys[index]].base_id === pair)
      const otherTokenToDisplay = data.find((item, index) => item[keys[index]].quote_id === pair)
      if (pairToDisplay !== undefined) dataToDisplay.push(pairToDisplay)
      if (tokenPairsToDisplay !== undefined) dataToDisplay.push(tokenPairsToDisplay)
      if (otherTokenToDisplay !== undefined) dataToDisplay.push(otherTokenToDisplay)

      setData2(dataToDisplay)
      return
    }
    if (keys.length > 0) {
      let dataToDisplay = []
      let tempArray = data.map((item, index) => {
        let volume = 0
        const info = item[keys[index]]
        for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
          if (info.base_id === priceTokens[info.chain_id][i]  && prices[info.chain_id]) {
            volume = new BigNumber(info.base_volume).multipliedBy(prices[info.chain_id][i]).toNumber()
          }
          if (info.quote_id === priceTokens[info.chain_id][i]  && prices[info.chain_id]) {
            volume = new BigNumber(info.quote_volume).multipliedBy(prices[info.chain_id][i]).toNumber()
          }
        }

        return { item, volume }
      })

      // Sort the temporary array by volume in descending order
      tempArray.sort((a, b) => b.volume - a.volume)
      if (!noVolume) {
        tempArray = tempArray.filter((item) => new BigNumber(item.volume).gt(50))
      }
      // Extract the sorted items back into a new array
      dataToDisplay = tempArray.map((entry) => entry.item)

      const rawKeys: any[] = []
      for (let i = 0; i < dataToDisplay.length; i++) {
        const key = Object.keys(dataToDisplay[i])[0]
        rawKeys.push(key)
      }

      setData2(dataToDisplay)
      return
    }
    setData2([])
  }, [data, isSingle, keys, noVolume, pair, prices])

  useEffect(() => {
    const rawKeys: any[] = []
    for (let i = 0; i < data2.length; i++) {
      const key = Object.keys(data2[i])[0]
      rawKeys.push(key)
    }
    setKeys2(rawKeys)
    setLoading(false)
  }, [data2])

  const getBaseId = (info) => {
    for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
      if (info.quote_id === priceTokens[info.chain_id][i]) return `${info.base_id}`
    }
    return `${info.quote_id}`
  }

  const getBaseSymbol = (info) => {
    for (let i = 0; i < priceTokens[info.chain_id].length; i++) {
      if (info.base_id === priceTokens[info.chain_id][i]) return `${info.quote_symbol}`
    }
    return `${info.base_symbol}`
  }

  return (
    <>
      <PageHeader firstHeading="Analytics" secondHeading="View Pair and Token Info" />

      <ToggleWrapper>
        <Toggle checked={noVolume} onChange={() => setNoVolume(!noVolume)} scale="sm" />
        <Text> Include No Volume</Text>
      </ToggleWrapper>
      <Flex justifyContent="center">
        <Heading scale="xl" color="text" mb="14px">
          24hr:
        </Heading>
        <Heading scale="xl" color="white" mb="14px">
          {` $ ${dexVolume.toNumber().toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`}
        </Heading>
      </Flex>

      {prices[109] && prices[109][0] && (
  <Flex justifyContent="center">
    <Text color="secondary" fontSize="18px" textTransform="uppercase">
      Bone Price
    </Text>
    <Text color="white" fontSize="18px">
      {`: ${new BigNumber(prices[109][0]).toFixed(4)} `}
    </Text>
    <Text color="secondary" fontSize="16px" textTransform="uppercase">
      USD
    </Text>
  </Flex>
)}
      <Page>
        {keys2.length > 0 && data2.length === keys2.length && !loading && (
          <Flex justifyContent="center" flexDirection="column">
            {data2.map((item, index) => (
              <BorderContainer key={keys2[index]}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <LinkExternal
                    fontSize="12px"
                    color="secondary"
                    small
                    href={`${BASE_BSC_SCAN_URLS[109]}/token/${getBaseId(item[keys2[index]])}`}
                  >
                    {`${getName(item[keys2[index]])}`}
                  </LinkExternal>
                  <LinkExternal
                    fontSize="12px"
                    color="secondary"
                    small
                    href={`${BASE_BSC_SCAN_URLS[109]}/token/${item[keys2[index]].pair_id}`}
                  >
                    {`${getPairSymbols(item[keys2[index]])}`}
                  </LinkExternal>
                </Flex>

                <Flex flexDirection="row" justifyContent="space-between">
                  <Flex flexDirection="column">
                    <Text color="textSubtle" fontSize="14px">
                      Last Price
                    </Text>
                    <Text fontSize="12px" color="textDisabled">{`${getPriceUSD(
                      item[keys2[index]],
                      item[keys2[index]].last_price,
                    )}`}</Text>
                    <Text fontSize="12px" color="textDisabled">{`${new BigNumber(item[keys2[index]].last_price).toFixed(
                      6,
                    )}`}</Text>
                  </Flex>

                  <Flex flexDirection="column">
                    <Text color="textSubtle" fontSize="14px">
                      TX Count
                    </Text>
                    <Text fontSize="12px" color="textDisabled">{`${item[keys2[index]].tx_count}`}</Text>
                  </Flex>

                  {!isSmallerScreen && (  
                    <>     
                    <Flex flexDirection="column">
                    <Text color="textSubtle" fontSize="14px">
                      Chain Id
                    </Text>
                    <Text fontSize="12px" color="textDisabled">{`${item[keys2[index]].chain_id}`}</Text>
                  </Flex>
                  <Flex flexDirection="column">
                    <Text color="textSubtle" fontSize="14px">
                      24hr Change
                    </Text>
                    <Text fontSize="12px" color={new BigNumber(item[keys2[index]].change_24hr).gt(0) ? "green" : "red"}>{`${item[keys2[index]].change_24hr} %`}</Text>
                  </Flex>
                  
                    
                      <Flex flexDirection="column">
                        <Text color="textSubtle" fontSize="14px">
                          24hr High
                        </Text>
                        <Text fontSize="12px" color="textDisabled">{`${getPriceUSD(
                          item[keys2[index]],
                          item[keys2[index]].high_price_24hr,
                        )}`}</Text>
                        <Text fontSize="12px" color="textDisabled">{`${new BigNumber(
                          item[keys2[index]].high_price_24hr,
                        ).toFixed(6)}`}</Text>
                      </Flex>

                      <Flex flexDirection="column">
                        <Text color="textSubtle" fontSize="14px">
                          24hr Low
                        </Text>
                        <Text fontSize="12px" color="textDisabled">{`${getPriceUSD(
                          item[keys2[index]],
                          item[keys2[index]].low_price_24hr,
                        )}`}</Text>
                        <Text fontSize="12px" color="textDisabled">{`${new BigNumber(
                          item[keys2[index]].low_price_24hr,
                        ).toFixed(6)}`}</Text>
                      </Flex>
                    </>
                  )}
                  <Flex flexDirection="column">
                    <Text color="textSubtle" fontSize="14px">
                      24hr Volume
                    </Text>
                    <Text fontSize="12px" color="textDisabled">{`$${getVolumeUSD(item[keys2[index]])} USD`}</Text>
                    <Text fontSize="12px" color="textDisabled">{`${getVolume(item[keys2[index]])}`}</Text>
                  </Flex>
                </Flex>

                <Chart
                  token={getBaseId(item[keys2[index]])}
                  symbol={getBaseSymbol(item[keys2[index]])}
                  setH="320px"
                  setW="100%"
                  show={false}
                  dex={dexs.forgeTest}
                />
              </BorderContainer>
            ))}
          </Flex>
        )}
      </Page>
    </>
  )
}

export default Analytics
