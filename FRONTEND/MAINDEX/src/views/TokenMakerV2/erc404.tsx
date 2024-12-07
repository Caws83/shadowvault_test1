/* eslint-disable no-await-in-loop */
import { Flex, Heading, Text, Button, LinkExternal, Toggle } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import React, { useState, useEffect } from 'react'
import SearchInput from 'components/SearchInput'
import NumberInput from 'components/NumberInput/NumberInput'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Divider from 'views/Farms/components/Divider'
import styled from 'styled-components'
import QuestionHelper from 'components/QuestionHelper'
import { BigNumber } from 'bignumber.js'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useWalletClient, useEstimateFeesPerGas } from 'wagmi'
import { BASE_BSC_SCAN_URLS } from 'config'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress'
import { isMobile } from 'components/isMobile'
import { config } from 'wagmiConfig'
import { Address, TransactionReceipt, createWalletClient, custom } from 'viem'
import useToast from 'hooks/useToast'
import { erc404Token, byteCode } from 'config/abi/tokens/erc404Token2'
import axios from 'axios';
import { ethers } from 'ethers'
import { apis, keys } from '.'
import RewardSelect from './RewardSelect'
import PageLoader from 'components/Loader/PageLoader'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import artifact from 'config/abi/tokens/MarswapERC404.json'
import { eip712WalletActions } from 'viem/zksync'
import { upload } from "thirdweb/storage";
import { createThirdwebClient } from "thirdweb";


const Tile = styled.a`
  background-color: #101010;
  border: 1px solid #808080;
  border-radius: 8px;
  padding: 8px;
  margin: ${isMobile ? '1%' : '6px'};
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

const BorderContainer = styled.div`
  padding: 16px;
  flex-grow: 1;
  flex-basis: 0;
  margin: 16px;
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
const fees = {
  97: "10000",
  109: "400000000000000000000",
  56: "750000000000000000",
  25: "2500000000000000000000",
  1: "70000000000000000",
  8453: "70000000000000000",
  282: "100000"
}


const zeroAddress = '0x0000000000000000000000000000000000000000'

const Erc404: React.FC = () => {
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const { data: walletClient, refetch } = useWalletClient({chainId: chain?.id})
  const { toastSuccess, toastError } = useToast()

  const { balance } = useGetBnbBalance(chain?.id)
  const nativeValue = useGetWcicPrice()

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [ baseUri, setBaseUri ] = useState('')
  const [ createdUri, setCreatedUri ] = useState('')
  const [ baseExt, setBaseExt ] = useState('.json')
  const [initialSupply, setSupply] = useState('10000')
  const [mintOnDeploy, setMint] = useState('10000')
  const [costB, setCostBNB] = useState('0')
  const [ payToken, setPayToken ] = useState<Address>(zeroAddress)
  const [costT, setCostToken] = useState('0')
  const [ createURI, setCreateURI ] = useState(false)
  const [ usePaytoken, setUsePT ] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [premadeJsonFiles, setPremadeJsonFiles] = useState<FileList | null>(null);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionDescription, setCollectionDescription] = useState<string>("");
  const [createMetadata, setCreateMetadata] = useState<boolean>(true);
  const [finalCID, setFinalCID] = useState<string>("");
  const [ status, setStatus ] = useState<string>("Awaiting Input...")
  const [ progress, setProgress ] = useState<string>("Ready!")
  const [ isLoading, setIsLoading ] = useState(false)
  const [ apiKey, setApiKey ] = useState<string>()
  const amountToSendAtOnce = 250


  const [eip712Wallet, setEip721Wallet] = useState(null)
    // set walletClient using EIP712
    useEffect(() => {
      const initWalletClient = async () => {
        try {
          const client = createWalletClient({
            chain,
            account,
            transport: custom(window.ethereum!)
          }).extend(eip712WalletActions());
          setEip721Wallet(client);
        } catch {
          console.log("eip712 wallet Error")
        }
      };
      if (window.ethereum && account && chain?.id) {
        initWalletClient();
      }
    }, [window.ethereum, account, chain]);
  
    const {data} = useEstimateFeesPerGas({chainId: chain?.id})

  
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

  const uploadFiles = async (files: any, isMeta: boolean) => {
    const client = createThirdwebClient({ clientId: apiKey });
    let answer: any
    const uris = await upload({
        client,
        files: [files],
    });
    const ccid = `${uris}`;
    const uriCID = ccid.substring("ipfs://".length);
    const API_URL = `https://cloudflare-ipfs.com/ipfs/${uriCID}`;
    setStatus("waiting");
    await new Promise(resolve => setTimeout(resolve, 5000));
    setStatus("fetching");
      await fetch(API_URL)
        .then((response) => response.json())
        .then((jsonData) => {
            if (jsonData) {
              if(!isMeta) {
                answer = jsonData;
              }else{
                console.log(jsonData)
                const firstItem = jsonData[0];
                const cid = firstItem.match(/\/\/([^/]+)/)[1];
                answer = cid;
              }
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            answer = "failed";
            alert("Failed, You may need to Unpin on thirdweb and try again.")
        });
      
    return answer;
};


  const uploadToNFTStorage = async () => {
    let newUri
    try{
    
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

    if (!apiKey) {
      alert("Please enter your ThirdWeb API Client Key, Goto https://thirdweb.com/dashboard/settings/api-keys to get one.")
      return;
    }

    let jsonNumber = 1

    const totalFiles = selectedFiles.length;
        const batches = Math.ceil(totalFiles / amountToSendAtOnce);

        for (let i = 0; i < batches; i++) {
            const startIdx = i * amountToSendAtOnce;
            const endIdx = Math.min((i + 1) * amountToSendAtOnce, totalFiles);
            const batchFiles = [...selectedFiles].slice(startIdx, endIdx);

    setProgress(`(${i+1}/ ${batches}) Uploading Images ${startIdx} to ${endIdx} (${batchFiles.length})`)

  
   
    let imageUris
    if (batchFiles && batchFiles.length > 0) {
      const response = await uploadFiles(batchFiles, false)
      imageUris = response as string[]
    }

      if (createMetadata) {
        setStatus("Creating New Meta Data....")
        async function generateModifiedJsons() {
          const files = [];
          for (let index = 0; index < batchFiles!.length; index++) {
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
                  image: imageUris[index], // `ipfs://${cid}/${file.name}`
              };
              const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
              const newFile = new File([blob], `${jsonNumber}.json`);
              files.push(newFile);
              jsonNumber++
          }
          return files;
      }
      const files = await generateModifiedJsons()
      metaDataToUpload.push(files)
      setStatus("waiting");
      await new Promise(resolve => setTimeout(resolve, 10000));
    } else {
      setStatus("Updating your MetaData.....")
      async function generateModifiedJsons() {
        const modifiedFiles = [];
    
        for (let index = 0; index < premadeJsonFiles!.length; index++) {
          const file = premadeJsonFiles![index]
            const reader = new FileReader();
            const json = await new Promise((resolve, reject) => {
                reader.onload = (event) => {
                    const result = event.target!.result as string;
                    try {
                        const jsonData = JSON.parse(result);
                        jsonData.image = imageUris[index], // `ipfs://${cid}/${originalFilename}`;
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
            modifiedFiles.push(modifiedFile);
    
            // Close the reader after reading the file
            reader.abort();
        }
    
        return modifiedFiles;
    }
    const files = await generateModifiedJsons()
    metaDataToUpload.push(files)
    setStatus("waiting");
    await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

    // final upload of metadata
    setStatus("Uploading MetaData.....")
    const response = await uploadFiles(metaDataToUpload, true)
    const finalJsonMeta = response as string
    console.log("Modified JSON files uploaded:", finalJsonMeta);
        setFinalCID(finalJsonMeta);
        updateCreatedURI(finalJsonMeta)
        newUri = finalJsonMeta
        setInfoToLS(collectionName, finalJsonMeta)
     
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed, You may need to Unpin on thirdweb and try again.")
    }
    
    setIsLoading(false)
    return(newUri)
  };
  
  const readSolidityFile = async (fileUrl: string): Promise<string> => {
    try {
      // Make a GET request to fetch the file content
      const response = await axios.get(fileUrl);
      // Return the file content as a string
      return response.data;
    } catch (error) {
      console.error(`Error reading file: ${error}`);
      return ''; // Return an empty string if there's an error
    }
  };
  
  // Function to construct the Solidity file URL by appending the path to the main URL
  const constructSolidityUrl = () => {
    const mainUrl = window.location.origin; // Get the main URL of the site
    const solidityFileUrl = `${mainUrl}/source/erc404Token2.sol`;
    return solidityFileUrl;
  };
  
  
  const solidityFileUrl = constructSolidityUrl();

  // disablers
  const noName = name === ''
  const noSym = symbol === ''
  const noSupply = Number.isNaN(Number(initialSupply))
  const noFee = new BigNumber(balance.toString()).lt(fees[chain?.id])
  const noUri = createURI ? false : baseUri === ''
  const notEnoughImages =  createURI && new BigNumber(selectedFiles?.length).lt(initialSupply)
  const notMatchingMetaToImages = createURI && !createMetadata && selectedFiles?.length !== premadeJsonFiles?.length

  const disableBuying =
    noFee ||
    noSupply ||
    noName ||
    noSym  ||
    noUri ||
    notEnoughImages ||
    notMatchingMetaToImages
  
  const updateCreatedURI = (newURI: string) => {
    setCreatedUri(newURI)
  }
  const handelCreateURI = () => {
    setCreateURI(!createURI)
    setBaseExt(".json")
  }
  const handelCreateUsePT = () => {
    setUsePT(!usePaytoken)
  }

  const handleChangeQueryName = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setName(value)
  }
  const handleChangeQuerySymbol = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSymbol(value)
  }

  const handleChangeQueryURI = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setBaseUri(value)
  }
  const handleChangeQuerySupply = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSupply(value)
  }
  const handleChangeQueryMint = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setMint(value)
  }
  const handleChangeQueryCostBNB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setCostBNB(value)
  }
  const handleChangeQueryPToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setPayToken(value as Address)
  }
  const handleChangeQueryCostToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setCostToken(value)
  }
  const onChangeExt = (option: number) => {
    if(option === 0) setBaseExt('.json')
    if(option === 1) setBaseExt('')
  }

  
  let tokens = JSON.parse(localStorage.getItem('tokens')) || [];
  

  const onClickConfirm = async () => {
    let uri = createdUri
    if(createURI && createdUri === "") {
      uri = await uploadToNFTStorage()
      if(uri === "failed") {
        alert("Failed, Aborting deployment.")
        return;
      }
    }
    if(createURI && uri === undefined) {
      setStatus("failed making Metadata")
      return
    }
    setStatus("Deploying Contract")
    const costBNB = new BigNumber(costB).shiftedBy(18).toFixed(0);
    const costToken = new BigNumber(costT).shiftedBy(18).toFixed(0);
    const supply = new BigNumber(initialSupply).toFixed(0);
    const usedURI = createURI ? `ipfs://${uri}/` :  `ipfs://${baseUri}/`
  
    let hash

    if(chain.custom) {
      hash = await eip712Wallet.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        account,
        args: [
          name,
          symbol,
          18,
          usedURI,
          baseExt,
          supply,
          costBNB,
          payToken,
          costToken,
          mintOnDeploy,
        ],
        maxFeePerGas: data?.maxFeePerGas,
        gasPerPubdata: 50000n,
      });
    }else {

    hash = await walletClient.deployContract({
      abi: erc404Token,
      bytecode: byteCode as Address,
      account,
      value: BigInt(fees[chain?.id]),
      args: [
        name,
        symbol,
        18,
        usedURI,
        baseExt,
        BigInt(supply),
        BigInt(costBNB),
        payToken,
        BigInt(costToken),
        BigInt(mintOnDeploy),
      ],
      chain: chain
    });
  }
    
    const receipt = await waitForTransactionReceipt(config, { hash }) as TransactionReceipt;
    if (receipt.status) {
      toastSuccess('Congrats', `Token Launched!`);

      const constructorArgs = [
        name,
        symbol,
        18,
        usedURI,
        baseExt,
        supply,
        costBNB,
        payToken,
        costToken,
        mintOnDeploy
      ];
      setStatus("Verifying Contract...")
    // Create an instance of the AbiCoder
    const abiCoder = new ethers.AbiCoder();
    // Encode constructor arguments
    const encodedConstructorArgs = abiCoder.encode(
        ["string", "string", "uint8", "string", "string", "uint256", "uint256", "address", "uint256", "uint256"],
        constructorArgs
    );
      // verify contract
      if(!chain.custom) onclickVerify(receipt.contractAddress, encodedConstructorArgs)

      // Add the new contract address to the array
      tokens.push({ symbol: symbol, contractAddress: receipt.contractAddress, chain: chain.name, type: 'ERC404'});
  
      // Store the updated tokens array back to local storage
      localStorage.setItem('tokens', JSON.stringify(tokens));
    
    } else {
      // user rejected tx or didn't go thru
      toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted');
    }
    setStatus("Creation Completed")
  };


    const onclickVerify = async (address, conCode) => {
      const source = await readSolidityFile(solidityFileUrl)
      const conCodeSliced = conCode.slice(2)
      console.log(conCodeSliced)
         $.ajax({
        type: "POST",
        url: apis[chain?.id],
        data: {
          apikey: keys[chain?.id],
          module: 'contract',
          action: 'verifysourcecode',
          contractaddress: `${address}`,
          sourceCode: `${source}`,
          codeformat: 'solidity-single-file',
          contractname: `MarswapERC404`,
          compilerversion:'v0.8.19+commit.7dd6d404',
          constructorArguements: `${conCodeSliced}`,
          optimizationUsed: 1,
          runs: 200,
        },
        success: function (result) {
          console.log("Request successful. Response:", result);
          if (result.status == "1") {
            console.log("Success: Verification successful");
          } else {
            console.log("Error: Verification failed");
          }
        },
        error: function (error) {
          console.error("Error:", error);
        }
      });
    }

    
      
    
 
  if(!account) {
    return (
      <Flex m="10px" alignItems="center" justifyContent="center">
        <ConnectWalletButton chain={109} />
      </Flex>
    )
  }


  return (
<>
    <BorderContainer>

            <Flex flexDirection="row" ml={isMobile ? null : "30px"}>
              <QuestionHelper
                text={
                  <>
                    <Text>Fee required to create token.</Text>
                    <Text>Paid automatically with TX.</Text>
                  </>
                }
                ml="4px"
              />
              <Text color={noFee ? "failure" : "textSubtle"}>Creation Fee</Text>
              <Text color="secondary">{`:  ${parseFloat(new BigNumber(fees[chain?.id]).shiftedBy(-18).toFixed(6))} ${chain?.nativeCurrency.symbol}`}</Text>
              <Text color="secondary">{`:  $${parseFloat(new BigNumber(fees[chain?.id]).shiftedBy(-18).multipliedBy(nativeValue).toFixed(0))}`}</Text>
            </Flex>
           
          

<Flex flexDirection={isMobile ? "column" : "row"}>
    <Flex flexDirection="row" flexWrap="wrap" justifyContent="center">

        <Tile style={{ width: isMobile ? '47%' : '266px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noName ? "failure" : "textSubtle"}>{t('Token Name:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryName} placeholder="Ex: Ethereum" />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '266px' }}>
          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
              <Text color={noSym ? "failure" : "textSubtle"}>{t('Token Symbol:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQuerySymbol} placeholder="Ex: ETH" />
          </Flex>
        </Tile>  

        <Tile style={{ width: isMobile ? '47%' : '266px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noSupply ? "failure" : "textSubtle"}>{t('Max NFT Supply:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQuerySupply}
              placeholder="Ex: 10000"
              startingNumber={initialSupply}
            />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '405px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('Mint On Deploy:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryMint}
              placeholder="Ex: 10000"
              startingNumber={mintOnDeploy}
            />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '405px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('Cost in Native:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryCostBNB}
              placeholder="Ex: 100"
              startingNumber={'0'}
            />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '95%' : '820px' }}>          
            <Flex justifyContent="space-between">
              <Flex>
                <Toggle checked={usePaytoken} onChange={() => handelCreateUsePT()} scale="sm" />
                <Text ml="4px" >Set Purchase using Token</Text>
              </Flex>
            </Flex>
          </Tile>
{usePaytoken &&
<>
        <Tile style={{ width: isMobile ? '95%' : '600px' }}>
          <Flex flexDirection="column">
            <Flex justifyContent="space-between">
              <Text color="textSubtle">{t('PayToken ( optional )')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryPToken} starting={payToken} />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '210px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('Cost in Token:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryCostToken}
              placeholder="Ex: 100"
              startingNumber={'0'}
            />
          </Flex>
        </Tile>
        </>
}

          <Tile style={{ width: isMobile ? '95%' : createURI ? '405px': '820px' }}>          
            <Flex justifyContent="space-between">
              <Flex>
                <Toggle checked={createURI} onChange={() => handelCreateURI()} scale="sm" />
                <Text ml="4px" >Create Upload Images/Metadata</Text>
              </Flex>
            </Flex>
          </Tile>

        {createURI ? (
          
         <>
          <Tile style={{ width: isMobile ? '95%' : '405px' }}>
                  <Flex justifyContent="space-between">
                    <Flex>
                      <Toggle checked={!createMetadata} onChange={() => handleCreateMetadataToggle()} scale="sm" />
                      <Text ml="4px" >Update Premade MetaData</Text>
                    </Flex>
                  </Flex>
                </Tile>
      
                <Tile style={{ width: isMobile ? '95%' : '820px' }}>
                  <Flex flexDirection="column" minWidth="50%">
                    <label style={{ color: 'white', fontWeight: 'bold' }}>
                      Select Images:
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
              <Tile style={{ width: isMobile ? '95%' : '820px' }}>
                <Flex flexDirection="column" minWidth="50%">
                  <Flex alignItems="flex-start">
                    <Text color="textSubtle">{t('Collection Name:')}</Text>
                  </Flex>
                  <SearchInput onChange={handleCollectionNameChange} placeholder="ex: Red Planet NFT" />
                </Flex>
              </Tile>
              <Tile style={{ width: isMobile ? '95%' : '820px' }}>
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
            <LinkExternal small href={`https://thirdweb.com/dashboard/settings/api-keys`} mr="16px"></LinkExternal>
          </Flex>
        </Tile>
            </>
            ) : (
              <Tile style={{ width: isMobile ? '95%' : '820px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <label style={{ color: 'white', fontWeight: 'bold' }}>
                  Select Jsons(metadata):
                  <input
                    type="file"
                    onChange={handlePremadeJsonSelect}
                    multiple
                  />
                </label>
              </Flex>
            </Tile>
            )}
            </>
        ):(
          <>
          <Tile style={{ width: isMobile ? '95%' : '600px' }}>
          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
            <Text color={noUri ? "failure" : "textSubtle"}>{t('MetaData CID:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryURI} placeholder="Ex: bafyb.......kdzms2e" />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '210px' }}>
          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('Base Extension:')}</Text>
            </Flex>
            <RewardSelect options={[".json", "no Extension"]} onChange={onChangeExt} />
          </Flex>
        </Tile>
        </>
        
      )}


                 
    </Flex>


       
          <InfoPanel >

            <Flex justifyContent="space-between">
              <Text>Name:</Text>
              <Text>{`${name}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Symbol:</Text>
              <Text>{`${symbol}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Base Uri:</Text>
              <Text>{isMobile ? `${createdUri ? createdUri : createURI ? "To be Created!" : baseUri.slice(0, 12)}` : `${createdUri ? createdUri :createURI ? "To be Created!" : baseUri}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Base Ext:</Text>
              <Text>{`${baseExt}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Supply:</Text>
              <Text>{`${initialSupply}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Mint on Deploy:</Text>
              <Text>{`${mintOnDeploy}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Cost Native:</Text>
              <Text>{`${costB}`}</Text>
            </Flex>
            {usePaytoken && 
            <>
            <Flex justifyContent="space-between">
              <Text>Paytoken:</Text>
              <Text>{isMobile ? `${payToken.slice(0, 12)}` : `${payToken}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Cost Token:</Text>
              <Text>{`${costT}`}</Text>
            </Flex>
            </>}

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
            <Button onClick={onClickConfirm} disabled={disableBuying}>
              Deploy ERC404 Token
            </Button>
          </Flex>

{tokens && 
<>
          <Divider />
<ActionContainer>    
  <BorderContainer>
    <Flex alignItems="center" justifyContent="space-between">
      <Heading color="secondary" scale="lg">
        Your launched ERC404 tokens
      </Heading>
    </Flex>
    {tokens.map((newToken) => (
      newToken.chain === chain.name && newToken.type === 'ERC404' &&
    <Flex flexDirection="row" alignItems="center" justifyContent="center"> 
    <Text color="secondary" bold fontSize="18px" mr="16px">{`(${newToken.type})`}</Text>
    <Text color="secondary" bold fontSize="18px" mr="16px">{`(${newToken.symbol})`}</Text>
      <LinkExternal small href={`${BASE_BSC_SCAN_URLS[chain?.id]}/token/${newToken.contractAddress}`} mr="16px">
          {isMobile ? `${newToken.contractAddress.slice(0, 14)}` : `${newToken.contractAddress}`}
      </LinkExternal>
      <CopyAddress account={newToken.contractAddress} logoOnly={true} />
    </Flex>
    ))}
    <Divider />
  </BorderContainer>    
</ActionContainer>


          {userCIDS && 
  <>

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
          <LinkExternal small href={`https://cloudflare-ipfs.com/ipfs/${cids.jsons}`} mr="16px">
            {isMobile ? `${cids.jsons.slice(0, 14)}` : `${cids.jsons}`}
          </LinkExternal>
          <CopyAddress account={cids.jsons} logoOnly={true} />
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
}
       
</>
  )
}
  
export default Erc404
