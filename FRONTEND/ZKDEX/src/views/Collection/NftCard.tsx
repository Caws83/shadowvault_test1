import { useEffect, useState } from 'react';
import styled from 'styled-components'
import { Box, CardBody, Flex, Text, Image, Button, useModal, BoneIcon } from '../../uikit'
import { useAccount, useBalance } from 'wagmi';
import {  LOTTERYNFT, NATIVESYMBOL } from '../../config/marketPlace';
import BigNumber from 'bignumber.js';
import useMarket from '../../hooks/useNftMarket';
import SellModal from '../../components/CreateModal';
import LotteryCard from '../../components/lotteryInfo';
import { nftInfo } from '../../config/types';
import {Address} from 'viem'
import { API_URL } from 'config';


const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

const NftCard: React.FC<React.PropsWithChildren<{
    collectionAddress: Address, 
    colName: string, 
    nftId: bigint, 
    chainId: number,
    price: bigint,
    type: number,
}>> = ({
    collectionAddress,
    colName,
    nftId,
    chainId,
    price,
    type
}) => {
    const [mintedId, setMintedId] = useState("");
    const [name, setName] = useState("")
    const [ isLoading, setLoading] = useState(false)
    const { address } = useAccount()
    const { nftBuy } = useMarket(collectionAddress, chainId)
    const isLottery = collectionAddress === LOTTERYNFT


    const [onPresentCreateModal] = useModal(<SellModal collectionAddress={collectionAddress} nftId={nftId} chainId={chainId} image={mintedId} type={type} askPrice={price}/>)

    const { data: balance } = useBalance({
        address: address,
        chainId: chainId,
    })

    const canBuy = type === 0 && address && balance ? balance.value > price : false

    const handleBuy = async () => {
        setLoading(true)
        await nftBuy(nftId, price)
        setLoading(false)
    }
    
    useEffect(() => {
      // Replace 'API_URL' with the actual API endpoint URL
      const API_URL2 = `${API_URL}/V2/market/${collectionAddress}/${nftId.toString()}`

        fetch(API_URL2)
        .then((response) => response.json())
        .then((jsonData) => {
          if (jsonData as nftInfo) {
            setMintedId(jsonData.image_url)
            setName(jsonData.name)
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })

       
    }, [])


  return (
    <Box p="10px">
    <CardBody p="5px" style={{ borderRadius: "5%", width:"280px", backgroundColor: "#2C322E", boxShadow: "2px 2px 0 rgba(255, 255, 255, 0.5)" }} >
      <Image alt={"example"} src={mintedId} width={270} height={270} mb="8px" />
        
          <Text fontSize="12px" color="textSubtle" mb="8px">
            {colName}
          </Text>
          <Text as="h4" fontWeight="600" mb="8px">
              {name}
          </Text>
          {isLottery && <LotteryCard collectionAddress={collectionAddress} nftId={nftId} chainId={chainId} />}
      
      {type === 0 && 
      <Flex justifyContent="center" alignItems="center">
        <Button  onClick={handleBuy} disabled={!canBuy} isLoading={isLoading}>
            {'Purchase'}
        </Button>
      </Flex>
      }
      {type === 2 && <Divider /> }
      {(type === 1 || type === 2) &&
      <Flex justifyContent="center" alignItems="center">
        <Button  onClick={onPresentCreateModal} >
            {type === 2 ? 'Create Ask' : 'Edit / Cancel'}
        </Button>
      </Flex>
      }
      {type !== 2 &&
     <Box borderTop="1px solid" borderTopColor="cardBorder" pt="8px">
     <Flex flexDirection="row" justifyContent="space-between">
     
         <Text fontSize="12px" color="textSubtle" maxWidth="120px" ellipsis title={'Asking price'}>
           {'Asking price:'}
         </Text>
            <Flex>
            <BoneIcon />
              <Text fontWeight="600">
                {`${(new BigNumber(price.toString()).shiftedBy(-18).toNumber()).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 5,
                })} ${NATIVESYMBOL}` }
              </Text>
            </Flex>

     </Flex>
   </Box>
   
    }
   
    </CardBody>
    </Box>
  )
}

export default NftCard
