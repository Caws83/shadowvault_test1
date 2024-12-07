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
    chainId: number
}>> = ({
    collectionAddress,
    nftId,
    chainId
}) => {


    const [imageURI, setImageURI] = useState('')
    const [ data, setData ] = useState<any>()

    
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
    <Box
  p="10px"
  style={{
    backgroundImage: `url(${imageURI})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: '5%',
    backgroundColor: '#2C322E',
    boxShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)',
    width: '270px',
    paddingTop: '100%', // Set padding-top to maintain aspect ratio
  }}
>
</Box>


        
        <Flex justifyContent="space-between">
          <Text fontSize="12px" color="textSubtle" mb="8px">
            {data ? data.name : ""}
          </Text>
         
          </Flex>
          <CopyAddress account={nftId?.toString()} mb="24px" />
          <Button onClick={onPresentSendModal} scale="sm" id="clickCreateNewPool">
            Transfer NFT
          </Button>
        <StyledRow onClick={toggleExpanded}>
          <ExpandActionCell expanded={expanded} isFullLayout={isTablet || isDesktop} />
          {shouldRenderActionPanel && data && <InfoCell data={data} />}
        </StyledRow>
      
    </CardBody>
    </Box>
  )
}

export default NftCard
