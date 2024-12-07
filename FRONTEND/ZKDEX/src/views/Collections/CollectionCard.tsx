import {  useEffect, useState } from "react";
import { Address } from "viem";
import { Flex, Text, BoneIcon } from "../../uikit";
import { nftInfo } from "../../config/types";
import { BigNumber } from "bignumber.js";
import { useNavigate } from 'react-router-dom';
import { isMobile } from "react-device-detect";
import useTheme from "hooks/useTheme";
import styled from "styled-components";
import { API_URL } from "config";


const StyledImg = styled.img`
  border-radius: 70%;
`;

interface state {
  collection: Address,
  volume: string
  name: string
  TotalSupply: string
  LowPrice: string
  HighPrice: string
  amountListed: string
}


function CollectionsCard({ collectionInfo, chainId }: {  collectionInfo: state, chainId: number }) {
    const [displayOne, setOne] = useState("");
    const [displayTwo, setTwo] = useState("");
    const [ name, setName ] = useState("")
    const [ volume, setVolume ] = useState("0")
    const [ highP, setHighP ] = useState("0")
    const [ lowP, setLowP ] = useState("0")
    const [ listed,setListed] = useState("0")
    const navigate = useNavigate(); 
    const { theme } = useTheme()



    useEffect(() => {
     
      let API_URL2 = `${API_URL}/V2/market/${collectionInfo.collection}/1`
      let API_URL3 = `${API_URL}/V2/market/${collectionInfo.collection}/3`

      if(!API_URL2) API_URL2 = `${API_URL}/V2/market/${collectionInfo.collection}/57896044618658097711785492504343953926634992332820282019728792003956564825892`
      if(!API_URL3) API_URL3 = `${API_URL}/V2/market/${collectionInfo.collection}/57896044618658097711785492504343953926634992332820282019728792003956564825882`

      console.log(API_URL2, API_URL3)
      
      setName(collectionInfo.name)
      setVolume(collectionInfo.volume)
      setHighP(collectionInfo.HighPrice)
      setLowP(collectionInfo.LowPrice)
      setListed(collectionInfo.amountListed)

        fetch(API_URL2)
        .then((response) => response.json())
        .then((jsonData) => {
          if (jsonData as nftInfo) {
            setOne(jsonData.image_url)
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })

        fetch(API_URL3)
        .then((response) => response.json())
        .then((jsonData) => {
          if (jsonData as nftInfo) {
            setTwo(jsonData.image_url)
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
    }, [])

    

    return (
   
      
              <Flex onClick={() => navigate(`/nftCollection/${chainId}/${collectionInfo.collection}`)} flexDirection="row" borderTop="2px solid #777" >

                <Flex justifyContent="flex-start" alignItems="center" minWidth={isMobile ? "250px" : "350px"} >
                  <StyledImg alt="example" src={displayOne} width={50} height={50} style={{ cursor: 'grab' }} />
                    <Text fontSize="18px" color={theme?.colors.secondary} pl="5px" style={{ cursor: 'grab' }} >
                      {name}
                    </Text>
                  </Flex>

                  <Flex justifyContent="flexStart" alignItems="center" minWidth={isMobile ? "150px" : "200px"}>
                  <Text fontSize="16px" color={theme?.colors.secondary} style={{ cursor: 'grab' }} >
                      {new BigNumber(volume).shiftedBy(-18).toFixed(2)}
                    </Text>
                    <BoneIcon  />
                  </Flex>

                  <Flex justifyContent="flexStart" alignItems="center" minWidth={isMobile ? "150px" : "200px"}>
                  <Text fontSize="16px" color={theme?.colors.secondary} style={{ cursor: 'grab' }} >
                  {`${(new BigNumber(listed).toNumber()).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 5,
                      })}` }
                    </Text>
                  </Flex>

                  <Flex justifyContent="flexStart" alignItems="center" minWidth={isMobile ? "150px" : "200px"}>
                  <Text fontSize="16px" color={theme?.colors.secondary} style={{ cursor: 'grab' }} >
                      {new BigNumber(lowP).shiftedBy(-18).toFixed(2)}
                    </Text>
                  </Flex>

                  <Flex justifyContent="flexStart" alignItems="center" minWidth={isMobile ? "150px" : "200px"}>
                  <Text fontSize="16px" color={theme?.colors.secondary} style={{ cursor: 'grab' }} >
                      {new BigNumber(highP).shiftedBy(-18).toFixed(2)}
                    </Text>
                  </Flex>
              
                 

                  <Flex justifyContent="center" alignItems="center">
                    <StyledImg alt="example" src={displayTwo} width={50} height={50} />
                  </Flex>

                </Flex>
               
    
     

      

    )
}

export default CollectionsCard
