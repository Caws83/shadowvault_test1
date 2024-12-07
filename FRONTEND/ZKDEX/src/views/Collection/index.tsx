import { useAccount } from "wagmi";
import {  useEffect, useState } from "react";
import { Address } from "viem";
import styled from 'styled-components'
import { Button, ButtonMenu, ButtonMenuItem, Card, ChevronLeftIcon, Flex } from "../../uikit";
import ForSaleView from "./ForSaleView";
import MySaleCard from "./MySalesView";
import MyWalletCard from "./MyWalletCard";
import { colInfo, nftInfo } from "../../config/types";
import { useNavigate, useParams } from "react-router-dom";
import { CHAINID } from "../../config/marketPlace";
import PageHeader from "../../components/PageHeader";
import { SwitchToNetwork } from "../../components/SwitchToNetWork";
import ViewAllCard from "./viewAllCard";
import { API_URL } from "config";


export const StyledCard = styled(Card)`
  width: 100%; 
 
`;
const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: px auto;
  width: 100%;
`

function CollectionCard() {


    const [ name, setName ] = useState("")
    const { chain, collection } = useParams()
    const { address } = useAccount()
    const navigate = useNavigate()
    const chainId = Number(chain) ?? CHAINID
    const collectionAddress = collection as Address ?? "0x0"
    const [ attributes, setAtt ] = useState<string[]>([])
    const [ totalSupply, setTotalSupply ] = useState(0)


     useEffect(() => {
      // Replace 'API_URL' with the actual API endpoint URL
      const API_URL1 = `${API_URL}/V2/market/${collectionAddress}`
      fetch(API_URL1)
        .then((response) => response.json())
        .then((jsonData) => {
          if(jsonData as colInfo) {
            setName(jsonData.name)
            setTotalSupply(jsonData.TotalSupply)
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
     }, [])

   useEffect(() => {
      // Replace 'API_URL' with the actual API endpoint URL
      const API_URL2 = `${API_URL}/V2/market/${collectionAddress}/1`
      fetch(API_URL2)
        .then((response2) => response2.json())
        .then((jsonData2) => {
          if(jsonData2 as nftInfo) {
            const tmp = []
            for(let i=0; i<jsonData2.attributes.length; i++){
              tmp.push(jsonData2.attributes[i]['trait_type'])
            }
            setAtt(tmp)
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
     }, [])

    
   const [viewIndex, setVI] = useState(0)

    return (
   <>
      <PageHeader firstHeading={`${name} Listings`} />
      

      <Flex justifyContent="flex-end">
          <SwitchToNetwork chainId={CHAINID}  />
      </Flex>
      <Flex justifyContent="flex-start" alignItems="center">
                    <ChevronLeftIcon />
                    <Button variant="text" onClick={() => navigate(`/Market`)} >
                      {' Back To Collections'}
                    </Button>
                    
                  </Flex>
            
           
            
    
              {address &&
              <>
              <Flex justifyContent="center" alignItems="center" mb="24px">
                <ButtonMenu
                  activeIndex={viewIndex}
                  scale="sm"
                  variant="subtle"
                  onItemClick={(index) => {
                    setVI(index)
                  }}
                >
            
                  <ButtonMenuItem as="button">{'Sales'}</ButtonMenuItem>
                  <ButtonMenuItem as="button">{'Your Sales'}</ButtonMenuItem>
                  <ButtonMenuItem as="button">{'Your Wallet'}</ButtonMenuItem>
                                   
                </ButtonMenu>
                </Flex>
                </>
                }
                <Divider />

<Flex flexDirection="row" alignItems="center" flexWrap="wrap">
{attributes &&
  attributes.map((att, index) => (
    <Button key={index} scale='xs' variant='light'>
      {att}
    </Button>
  ))
}
            </Flex>
              
                <>
                  {viewIndex === 0 &&
                    <ForSaleView 
                        collectionAddress={collectionAddress}
                        colName={name}
                        chainId={chainId}
                    />
                  }
                  {viewIndex === 1 &&
                    
                      <MySaleCard
                        collectionAddress={collectionAddress}
                        colName={name}
                        chainId={chainId}
                        address={address ?? "0x0"}
                      />
                    
                  }
                  {viewIndex === 2 &&
                   
                      <MyWalletCard
                        collectionAddress={collectionAddress}
                        colName={name}
                        chainId={chainId}
                        address={address ?? "0x0"}
                      />
                  }
                 
              
                </>
                </>
    )
    
}

export default CollectionCard