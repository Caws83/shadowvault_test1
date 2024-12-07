import React, { useState } from "react";
import { Flex, Text, Heading, Button, LinkExternal, Toggle } from 'uikit'
import { NFTStorage, File } from 'nft.storage';
import PageLoader from "components/Loader/PageLoader";
import { useTranslation } from 'contexts/Localization'
import SearchInput from 'components/SearchInput'
import Divider from 'views/Farms/components/Divider'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress'
import { isMobile } from 'components/isMobile'
import styled from 'styled-components'


const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 10px;

  ${Text} {
    margin-left: 8px;
  }
`
const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
  }
`
const BorderContainer = styled.div`
  padding: 16px;
  flex-grow: 1;
  flex-basis: 0;
  margin: 16px;
`
const Tile = styled.a`
  background-color: #101010;
  border: 1px solid #808080;
  border-radius: 8px;
  padding: 8px;
  margin: ${isMobile ? '2px' : '6px'};
  display: flex;
  flex-direction: column;
`;

const InfoPanel = styled.a`
  background-image: url('images/home/backgrounds/backRed.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border: 1px solid #818589;
  border-radius: 8px;
  padding: 18px;
  margin: ${isMobile ? '2px' : '6px'};
  margin-top: 12px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const NftUp: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [premadeJsonFiles, setPremadeJsonFiles] = useState<FileList | null>(null);
  const [apiKey] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY5ODNmNDMwYThkRjM5OTQxMzk0ZjM0NzI2NEIzZjJkMGZiOTczMWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwODU0ODkyMTQxNCwibmFtZSI6Im1hcnN3YXAifQ.lV3dQ4RXj8O0p2zQ8k_8ZRTiaCCeB0CobAdLXapF6_c");
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionDescription, setCollectionDescription] = useState<string>("");
  const [createMetadata, setCreateMetadata] = useState<boolean>(true);
  const [finalCID, setFinalCID] = useState<string>("");
  const [imageCID, setImageCID] = useState<string>("");
  const [ status, setStatus ] = useState<string>("Awaiting Input...")
  const [ isLoading, setIsLoading ] = useState(false)
  const { t } = useTranslation()


  let userCIDS = JSON.parse(localStorage.getItem('userCIDS')) || [];
  const setInfoToLS = (nftName, iCIDS, jCIDS) => {
      userCIDS.push({ name: nftName, images: iCIDS, jsons: jCIDS });
      localStorage.setItem('userCIDS', JSON.stringify(userCIDS));
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handlePremadeJsonSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPremadeJsonFiles(e.target.files);
    }
  };

  const handleCreateMetadataToggle = () => {
    setCreateMetadata(!createMetadata);
  };

  const handleCollectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionName(e.target.value);
  };

  const handleCollectionDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionDescription(e.target.value);
  };
  const uploadToNFTStorage = async () => {
    setIsLoading(true)
    if (createMetadata && (!selectedFiles || selectedFiles.length === 0)) {
      alert("Please select at least one file.");
      return;
    }

    if (!collectionName || !collectionDescription) {
      alert("Please enter collection name and description.");
      return;
    }

    const storage = new NFTStorage({ token: apiKey });

    console.log(`Uploading files`);
    setStatus("Uploading Images.....")
    try {
      let cid = '';
      if (selectedFiles && selectedFiles.length > 0) {
        cid = await storage.storeDirectory([...selectedFiles]);
        setImageCID(cid)
      }

      if (createMetadata) {
        setStatus("Creating New Meta Data....")
        async function* generateModifiedJsons() {
          for (let index = 0; index < 666; index++) {
            const file = selectedFiles![0];
            const jsonData = {
              token: index + 1, // Incrementing token ID
              name: collectionName,
              description: collectionDescription,
              attributes: [
                {
                  trait_type: "Creator",
                  value: "MarSwap Creator"
                }
              ],
              image: `ipfs://${cid}/${file.name}`
            };
            yield new File([JSON.stringify(jsonData)], `${index + 1}.json`, { type: 'application/json' });
          }
        }
        setStatus("Uploading MetaData.....")
        const modifiedJsonCids = await storage.storeDirectory(generateModifiedJsons());
        console.log("Modified JSON files uploaded:", modifiedJsonCids);
        setFinalCID(modifiedJsonCids);
        setInfoToLS(collectionName, cid, modifiedJsonCids)
      } else {
        setStatus("Updating your MetaData.....")
        async function* generateModifiedJsons() {
          for (let index = 0; index < premadeJsonFiles!.length; index++) {
            const file = premadeJsonFiles![index];
            const reader = new FileReader();
            reader.readAsText(file);
            const json = await new Promise((resolve) => {
              reader.onload = (e) => {
                const json = JSON.parse(e!.target!.result as string);
                // Extract original filename from the json object
                const originalFilename = json.image.split('/').pop(); // Extracting filename from the image URL
                json.image = `ipfs://${cid}/${originalFilename}`;
                resolve(json);
              };
            });
            yield new File([JSON.stringify(json)], file.name, { type: 'application/json' });
          }
        }
        setStatus("Uploading MetaData.....")
        const modifiedJsonCids = await storage.storeDirectory(generateModifiedJsons());
        console.log("Modified JSON files uploaded:", modifiedJsonCids);
        setFinalCID(modifiedJsonCids); // Set the final CID from the second output of storeDirectory
        setStatus("Completed.....")
        setInfoToLS(json.name, cid, modifiedJsonCids)
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
    
    setIsLoading(false)
  };


  return (
    <>
      <BorderContainer>
  <Flex flexDirection={isMobile ? "column" : "row"}>
    <Flex flexDirection="row" flexWrap="wrap" justifyContent="center">
   
    <Tile style={{ width: isMobile ? '95%' : '545px' }}>
            <Flex justifyContent="space-between">
              <Flex>
                <Toggle checked={!createMetadata} onChange={() => handleCreateMetadataToggle()} scale="sm" />
                <Text>Use PreMade MetaData</Text>
              </Flex>
            </Flex>
          </Tile>

          <Tile style={{ width: isMobile ? '95%' : '545px' }}>
            <Flex flexDirection="column" minWidth="50%">
              <label style={{ color: 'white', fontWeight: 'bold' }}>
                Choose Images:
                <input
                  type="file"
                  onChange={handleFileSelect}
                  multiple
                />
              </label>
            </Flex>
          </Tile>
     
      
      {createMetadata ? (
        <>
        <Tile style={{ width: isMobile ? '95%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('Collection Name:')}</Text>
            </Flex>
            <SearchInput onChange={handleCollectionNameChange} placeholder="ex: Red Planet NFT" />
          </Flex>
        </Tile>
        <Tile style={{ width: isMobile ? '95%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('Description:')}</Text>
            </Flex>
            <SearchInput onChange={handleCollectionDescriptionChange} placeholder="ex: The Best NFT Collection on the planet" />
          </Flex>
        </Tile> 
      </>
      ) : (
        <Tile style={{ width: isMobile ? '95%' : '545px' }}>
        <Flex flexDirection="column" minWidth="50%">
          <label style={{ color: 'white', fontWeight: 'bold' }}>
            Choose Jsons(metadata):
            <input
              type="file"
              onChange={handlePremadeJsonSelect}
              multiple
            />
          </label>
        </Flex>
      </Tile>
      )}
          

    </Flex>
    
    <InfoPanel>
      {isLoading && <PageLoader /> }
      <Flex justifyContent="space-between">
        <Text>Status:</Text>
        <Text>{`${status}`}</Text>
      </Flex>
      {imageCID && (
        <Flex justifyContent="space-between">
          <Text>Images CID:</Text>
          <LinkExternal small href={`https://cloudflare-ipfs.com/ipfs/${imageCID}`} mr="16px">
            {isMobile ? `${imageCID.slice(0, 14)}` : `${imageCID}`}
          </LinkExternal>
          <CopyAddress account={imageCID} logoOnly={true} />
        </Flex>
      )}
      {finalCID && (
        <Flex justifyContent="space-between">
          <Text>JSONs CID:</Text>
          <LinkExternal small href={`https://cloudflare-ipfs.com/ipfs/${finalCID}`} mr="16px">
            {isMobile ? `${finalCID.slice(0, 14)}` : `${finalCID}`}
          </LinkExternal>
          <CopyAddress account={imageCID} logoOnly={true} />
        </Flex>
      )}
    
    
    </InfoPanel>
   

  </Flex>

  </BorderContainer>
  
          <Flex justifyContent="center" m="12px">
            <Button onClick={uploadToNFTStorage}>
              Setup IPFS
            </Button>
          </Flex>

  {userCIDS && 
  <>
            <Divider />
  <ActionContainer>    
    <BorderContainer>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading color="secondary" scale="lg">
          Your Stored Collection Data
        </Heading>
      </Flex>
    {userCIDS.map((cids) => (
       
      <Flex flexDirection="row" alignItems="center" justifyContent="center"> 
      <Text color="secondary" bold fontSize="18px" mr="16px">{`(${cids.name})`}</Text>
        <Flex flexDirection="column">
          <Flex flexDirection="row">
          <Text>Images CID:</Text>
          <LinkExternal small href={`https://cloudflare-ipfs.com/ipfs/${imageCID}`} mr="16px">
            {isMobile ? `${imageCID.slice(0, 14)}` : `${imageCID}`}
          </LinkExternal>
          <CopyAddress account={imageCID} logoOnly={true} />
          </Flex>
          <Flex flexDirection="row">
          <Text>JSONs CID:</Text>
          <LinkExternal small href={`https://cloudflare-ipfs.com/ipfs/${finalCID}`} mr="16px">
            {isMobile ? `${finalCID.slice(0, 14)}` : `${finalCID}`}
          </LinkExternal>
          <CopyAddress account={imageCID} logoOnly={true} />
          </Flex>
        </Flex>
      </Flex>
    ))}
      
    </BorderContainer>
  
  </ActionContainer>
  
            <Divider />
            </>
  }

   </> 
  );
}

export default NftUp;
