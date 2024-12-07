import { useEffect, useState } from 'react';
import { Box, CardBody, Text, Image, useMatchBreakpoints, Flex, useModal, Button } from '../../uikit'
import { nftCollectionAbi } from "../../config/abi/nftCollection"
import {Address} from 'viem'
import { config } from 'wagmiConfig'
import { readContract } from '@wagmi/core'
import { IPFS_GATEWAY } from 'config/constants/nfts'
import CopyAddress from './CopyAddress';
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import styled from 'styled-components';
import InfoCell from './infoCell.';
import ExpandActionCell from './ExpandActionCell';
import SendNFTModal from './SendNFTModal'


const StyledRow = styled.div`
  background-color: transparent;
  display: flex;
  cursor: pointer;
  flex-direction: column;
`

const NftCard: React.FC<React.PropsWithChildren<{
    collectionAddress: Address,
    nftId: bigint, 
    chainId: number,
    rarities: any
}>> = ({
    collectionAddress,
    nftId,
    chainId,
    rarities
}) => {


    const [imageURI, setImageURI] = useState('')
    const [ data, setData ] = useState<any>()
    const [ rarity, setRarity ] = useState('')

    const calculateRarity = (attributes) => {
      let totalRarity = 0; // Initialize total rarity to 0
      let numberOfAttributes = 0; // Initialize number of attributes counter
      attributes.forEach((attribute) => {
          const { trait_type, value } = attribute;
          // Check if rarity percentage exists for the given trait_type and value
          if (rarities[trait_type] && rarities[trait_type][value]) {
              const traitRarity = rarities[trait_type][value];
              totalRarity += traitRarity; // Add rarity percentage to total
              numberOfAttributes++; // Increment attribute counter
          }
      });
      // If there are attributes, calculate average rarity, else return 0
      return numberOfAttributes > 0 ? totalRarity / numberOfAttributes : 0;
  }
  
  const [onPresentSendModal] = useModal(<SendNFTModal colAddress={collectionAddress} tokenId={nftId} chainId={chainId} />)
    
    useEffect(() => {
      async function get() {
      
       setImageURI("")
     
        const baseUrl = await readContract(config, {
          abi: nftCollectionAbi,
          address: collectionAddress,
          functionName: 'tokenURI',
          args: [nftId],
          chainId
        }) as string
        const ipfsChecker = baseUrl.substring(0, 4).toLowerCase()
        let jsonUrl
        if (ipfsChecker === 'http') {
          jsonUrl = baseUrl
        } else {
          const properSubUrl = baseUrl.substring(7)
          jsonUrl = `${IPFS_GATEWAY}/${properSubUrl}`
        }
        fetch(jsonUrl).then((nftResponse) => {
          if (nftResponse.status === 200) {
            nftResponse.json().then((nftJson) => {
              setData(nftJson)
              const nftRarity = calculateRarity(nftJson.attributes);
              console.log("NFT Rarity:", nftRarity.toFixed(2) + "%");
              setRarity(`${nftRarity.toFixed(2)} %`)
              const ipfsChecker2 = nftJson.image.substring(0, 4).toLowerCase()
              let imageUrl
              if (ipfsChecker2 === 'http') {
                imageUrl = nftJson.image
              } else {
                const imageBase = nftJson.image.substring(7)
                imageUrl = `${IPFS_GATEWAY}/${imageBase}`
              }
              setImageURI(imageUrl)
            })
          }
        })  
      
    }
    get()
    }, [nftId, collectionAddress])
    
    const { isTablet, isDesktop } = useMatchBreakpoints()
    const [expanded, setExpanded] = useState(false)
    const shouldRenderActionPanel = useDelayedUnmount(expanded, 300)
    const toggleExpanded = () => {
      setExpanded((prev) => !prev)
    }
   
  return (
    <Box p="10px">
    <CardBody p="5px" style={{ borderRadius: "5%", width:"280px", backgroundColor: "#2C322E", boxShadow: "2px 2px 0 rgba(255, 255, 255, 0.5)" }} >
      <Image alt={"example"} src={imageURI} width={512} height={768} mb="8px" />
        
        <Flex justifyContent="space-between">
          <Text fontSize="12px" color="textSubtle" mb="8px">
            {data ? data.name : ""}
          </Text>
          <Text fontSize="12px" color="textSubtle" mb="8px">
            {`Rarity Score: ${rarity}`}
          </Text>
          </Flex>
          <CopyAddress account={nftId?.toString()} mb="24px" />
          <Button onClick={onPresentSendModal} scale="sm" id="clickCreateNewPool">
            Transfer NFT
          </Button>
        <StyledRow onClick={toggleExpanded}>
          <ExpandActionCell expanded={expanded} isFullLayout={isTablet || isDesktop} />
          {shouldRenderActionPanel && data && <InfoCell data={data} isMars={true} rarities={rarities} />}
        </StyledRow>
      
    </CardBody>
    </Box>
  )
}

export default NftCard
