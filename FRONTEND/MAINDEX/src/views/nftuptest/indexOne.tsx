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
import { upload } from "thirdweb/storage";
import { createThirdwebClient } from "thirdweb";



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
  // const [apiKey] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY5ODNmNDMwYThkRjM5OTQxMzk0ZjM0NzI2NEIzZjJkMGZiOTczMWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwODU0ODkyMTQxNCwibmFtZSI6Im1hcnN3YXAifQ.lV3dQ4RXj8O0p2zQ8k_8ZRTiaCCeB0CobAdLXapF6_c");
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionDescription, setCollectionDescription] = useState<string>("");
  const [createMetadata, setCreateMetadata] = useState<boolean>(true);
  const [finalCID, setFinalCID] = useState<string>("");
  const [ status, setStatus ] = useState<string>("Awaiting Input...")
  const [ progress, setProgress ] = useState<string>("waiting")
  const [ isLoading, setIsLoading ] = useState(false)
  const { t } = useTranslation()
  const [ apiKey, setApiKey ] = useState("")
  const client = createThirdwebClient({ clientId: "e61c119591e47ccaa45e04c086448b28" });

  let userCIDS = JSON.parse(localStorage.getItem('userCIDS')) || [];
  const setInfoToLS = (nftName, jCIDS) => {
      userCIDS.push({ name: nftName, jsons: jCIDS });
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
  const handleCollectionAPIKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

 
const uploadFiles = async (file: any, withoutDir: boolean) => {
  let answer: string = "";
  const uris = await upload({
      client,
      files: [file],
      uploadWithoutDirectory: withoutDir,
  });
  const ccid = `${uris}`;
  console.log(ccid)
  if(!withoutDir){
  const uriCID = ccid.substring("ipfs://".length);
  const API_URL = `https://cloudflare-ipfs.com/ipfs/${uriCID}`;
  setStatus("waiting");
  await new Promise(resolve => setTimeout(resolve, 5000));
  setStatus("fetching");
  await fetch(API_URL)
      .then((response) => response.json())
      .then((jsonData) => {
          if (jsonData) {
            const firstItem = jsonData[0];
            const cid = firstItem.match(/\/\/([^/]+)/)[1];
            answer = cid;
          }
      })
      .catch((error) => {
          console.error('Error fetching data:', error);
          answer = "failed";
      });
    } else {
      answer = ccid
    }

  return answer;
};


  const uploadToNFTStorage = async () => {
   
    // const client = createThirdwebClient({ clientId: apiKey });
    setIsLoading(true)
    const metaDataToUpload = []
    if (createMetadata && (!selectedFiles || selectedFiles.length === 0)) {
      alert("Please select at least one file.");
      return;
    }

    if (!collectionName || !collectionDescription) {
      alert("Please enter collection name and description.");
      return;
    }
    let jsonNumber = 1

   
const length = selectedFiles.length
        for (let i = 0; i < length; i++) {
           


    console.log(`Uploading files`);
    setProgress(`(${i+1}/ ${length}) Uploading Images ...`)
   
        const imageUris = await uploadFiles([...selectedFiles][i], true)
        
      if (createMetadata) {
        setStatus("Creating New Meta Data....")
              const jsonData = {
                  token: jsonNumber, // Incrementing token ID
                  name: collectionName,
                  description: collectionDescription,
                  attributes: [
                      {
                          trait_type: "Creator",
                          value: "MarSwap Creator"
                      }
                  ],
                  image: imageUris, // `ipfs://${cid}/${file.name}`
              };
              const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
              const newFile = new File([blob], `${jsonNumber}.json`);
              jsonNumber++
              metaDataToUpload.push(newFile)
        
      } else {
        setStatus("Updating your MetaData.....")
  
      
      
            const file = premadeJsonFiles![jsonNumber-1]
              const reader = new FileReader();
              const json = await new Promise((resolve, reject) => {
                  reader.onload = (event) => {
                      const result = event.target!.result as string;
                      try {
                          const jsonData = JSON.parse(result);
                          jsonData.image = imageUris, // `ipfs://${cid}/${originalFilename}`;
                          resolve(jsonData);
                      } catch (error) {
                          reject(error);
                      }
                  };
                  reader.onerror = (event) => {
                      reject(event.target!.error);
                  };
                  reader.readAsText(file);
              });
      
              const modifiedFile = new File([JSON.stringify(json)], file.name, { type: 'application/json' });
      
              // Close the reader after reading the file
              reader.abort();
      
      metaDataToUpload.push(modifiedFile)
      jsonNumber++
      }
    }


      // final upload of metadata
        setStatus("Uploading MetaData.....")
        const finalJsonMeta = await uploadFiles(metaDataToUpload, false)
        console.log("Json Files Uploaded to", finalJsonMeta);
        setFinalCID(finalJsonMeta); // Set the final CID from the second output of storeDirectory
        setStatus("Completed.....")
        setInfoToLS(collectionName, finalJsonMeta)
  
    
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
        <Tile style={{ width: isMobile ? '95%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('ThirdWeb API Key:')}</Text>
            </Flex>
            <SearchInput onChange={handleCollectionAPIKey} placeholder="ThirdWeb Client Key" />
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
    <Flex justifyContent="space-between">
        <Text>Progress:</Text>
        <Text>{`${progress}`}</Text>
      </Flex>
      {isLoading && <PageLoader /> }
      <Flex justifyContent="space-between">
        <Text>Status:</Text>
        <Text>{`${status}`}</Text>
      </Flex>
      
      {finalCID && (
        <Flex justifyContent="space-between">
          <Text>JSONs CID:</Text>
          <LinkExternal small href={`https://cloudflare-ipfs.com/ipfs/${finalCID}`} mr="16px">
            {isMobile ? `${finalCID.slice(0, 14)}` : `${finalCID}`}
          </LinkExternal>
          <CopyAddress account={finalCID} logoOnly={true} />
        </Flex>
      )}
    
    
    </InfoPanel>
   

  </Flex>
  </BorderContainer>
  
          <Flex justifyContent="center" m="12px">
            <Button onClick={uploadToNFTStorage}>
              Full Upload
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
          <Text>JSONs CID:</Text>
          <LinkExternal small href={`https://cloudflare-ipfs.com/ipfs/${finalCID}`} mr="16px">
            {isMobile ? `${finalCID.slice(0, 14)}` : `${finalCID}`}
          </LinkExternal>
          <CopyAddress account={finalCID} logoOnly={true} />
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
