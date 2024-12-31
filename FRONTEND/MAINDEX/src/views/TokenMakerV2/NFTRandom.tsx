/* eslint-disable no-await-in-loop */
import { Flex, Heading, Text, Button, LinkExternal, Toggle, Box } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
import SearchInput from 'components/SearchInput'
import SearchInput2 from './SearchInput'
import NumberInput from 'components/NumberInput'
import NumberInput2 from './NumberInput'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Divider from 'views/Farms/components/Divider'
import styled from 'styled-components'
import QuestionHelper from 'components/QuestionHelper'
import { BigNumber } from 'bignumber.js'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useEstimateFeesPerGas, useWalletClient } from 'wagmi'
import { BASE_BSC_SCAN_URLS } from 'config'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress'
import { isMobile } from 'components/isMobile'
import { config } from 'wagmiConfig'
import { Address, TransactionReceipt, createWalletClient, custom } from 'viem'
import useToast from 'hooks/useToast'
import { abi, byteCode } from 'config/abi/tokens/nftRandom'
import axios from 'axios';
import { ethers } from 'ethers'
import { apis, keys } from '.'
import PageLoader from 'components/Loader/PageLoader'
import { NFTStorage } from 'nft.storage'
import contracts from 'config/constants/contracts'
import { getAddress } from 'utils/addressHelpers'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import artifact from 'config/abi/tokens/MarsRandomNFT.json'
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
  defaultChainId: "100000"
}


const zeroAddress = '0x0000000000000000000000000000000000000000'

const NftR: React.FC = () => {
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const { data: walletClient, refetch } = useWalletClient({chainId: chain?.id})
  const { toastSuccess, toastError } = useToast()
  const treasury = getAddress(contracts.farmWallet, chain?.id)
  const nativeValue = useGetWcicPrice()

  const { balance } = useGetBnbBalance(chain?.id)

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [ baseUri, setBaseUri ] = useState('')
  const [ createdUri, setCreatedUri ] = useState('')
  const [ baseExt, setBaseExt ] = useState('.json')
  const [initialSupply, setSupply] = useState('10000')
  const [costB, setCostBNB] = useState('0')
  const [ payToken, setPayToken ] = useState<Address>(zeroAddress)
  const [costT, setCostToken] = useState('0')
  const [ usePaytoken, setUsePT ] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionDescription, setCollectionDescription] = useState<string>("");
  const [finalCID, setFinalCID] = useState<string>("");
  const [ status, setStatus ] = useState<string>("Awaiting Input...")
  const [ isLoading, setIsLoading ] = useState(false)
  const [ apiKey, setApiKey ] = useState("")


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

  const [names, setNames] = useState([])
  const [ imageName, setImageName ] = useState<string[]>([])
  const [ trait, setTrait] = useState("")
  const [ traits, setTraits ] = useState<string[]>([])
  const [ amounts, setAmounts ] = useState<bigint[]>([])
  
  let userCIDS = JSON.parse(localStorage.getItem('userCIDS')) || [];
  const setInfoToLS = (nftName, jCIDS) => {
      userCIDS.push({ name: nftName, jsons: jCIDS });
      localStorage.setItem('userCIDS', JSON.stringify(userCIDS));
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
      const filesArray = Array.from(e.target.files);
      const filenames = filesArray.map(file => file.name.replace(/\.[^/.]+$/, ""));
      setNames(filenames);
    
    }
  };
  useEffect(() => {
    setImageName([])
    setTraits([])
    setAmounts([])
  }, [names])

  const handleCollectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionName(e.target.value);
  };
  const handleCollectionTraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrait(e.target.value);
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
    setIsLoading(true)
    let newUri
    if (!selectedFiles || selectedFiles.length === 0) {
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
    
    console.log(`Uploading files`);
    setStatus("Uploading Images.....")
    try {
      let imageUris
      if (selectedFiles && selectedFiles.length > 0) {
        const response = await uploadFiles(selectedFiles, false)
        imageUris = response as string[]
      }

     
        setStatus("Creating New Meta Data....")
        async function generateModifiedJsons() {
          const modifiedFiles = [];
      
          for (let index = 0; index < selectedFiles!.length; index++) {
              const jsonData = {
                  token: imageName[index], // Incrementing token ID
                  name: collectionName,
                  description: collectionDescription,
                  attributes: [
                      {
                          trait_type: "Creator",
                          value: "MarSwap Creator"
                      },
                      {
                          trait_type: "Image Name",
                          value: imageName[index]
                      },
                      {
                          trait_type: trait,
                          value: traits[index]
                      }
                  ],
                  image: imageUris[index], // `ipfs://${cid}/${file.name}`
              };
              const modifiedFile = new File([JSON.stringify(jsonData)], `${names[index]}.json`, { type: 'application/json' });
              modifiedFiles.push(modifiedFile);
          }
      
          return modifiedFiles;
      }
      
        setStatus("Uploading MetaData.....")
        const modifiedJsonCids = await uploadFiles(await generateModifiedJsons(), true)
        console.log("Modified JSON files uploaded:", modifiedJsonCids);
        setFinalCID(modifiedJsonCids);
        updateCreatedURI(modifiedJsonCids)
        newUri = modifiedJsonCids
        setInfoToLS(collectionName, modifiedJsonCids)
     
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
    const solidityFileUrl = `${mainUrl}/source/nftRandom.sol`;
    return solidityFileUrl;
  };
  
  
  const solidityFileUrl = constructSolidityUrl();

  const getSum = () => {
    if (!Array.isArray(amounts)) {
      // Handle the case where amounts is not an array (or undefined)
      return 0n; // or any other appropriate value
    }
  
    let sumOfIndices = 0n;
    for (let i = 0; i < amounts.length; i++) {
      sumOfIndices += amounts[i];
    }
    return sumOfIndices;
  }
  


  // disablers
  const noName = name === ''
  const noSym = symbol === ''
  const noSupply = Number.isNaN(Number(initialSupply))
  const noFee = new BigNumber(balance.toString()).lt(fees[chain?.id])
  
  const noImageCount = names.length === 0 || names.length > 100
  const amountsAccurate = new BigNumber(getSum().toString()).eq(initialSupply);
  const rightAmounts = imageName.length === names.length && amounts.length === names.length && traits.length === names.length
  const noCustomTrait = trait === ""
  const noColName = collectionName === ""
  const noDesc = collectionDescription === ""

  const disableBuying =
    noFee ||
    noSupply ||
    noName ||
    noSym  ||
    noImageCount ||
    !amountsAccurate ||
    !rightAmounts ||
    noCustomTrait ||
    noDesc
  
  const updateCreatedURI = (newURI: string) => {
    setCreatedUri(newURI)
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

  
  
  const handleChangeQueryAmounts = (event: React.ChangeEvent<HTMLInputElement>, index) => {
    const { value } = event.target
    const tmp = amounts
    tmp[index] = BigInt(value)
    setAmounts(tmp)
  }
  const handleChangeQueryTraits = (event: React.ChangeEvent<HTMLInputElement>, index) => {
    const { value } = event.target
    const tmp = traits
    tmp[index] = value
    setTraits(tmp)
  }
  const handleCollectionTraitImageName = (event: React.ChangeEvent<HTMLInputElement>, index) => {
    const { value } = event.target
    const tmp = imageName
    tmp[index] = value
    setImageName(tmp)
  };

  let tokens = JSON.parse(localStorage.getItem('tokens')) || [];
  

  const onClickConfirm = async () => {
    let uri
 
      uri = await uploadToNFTStorage()
      if(uri === "failed") {
        alert("Failed, Aborting deployment.")
        return;
      }
    setStatus("Deploying Contract")
    const costBNB = new BigNumber(costB).shiftedBy(18).toFixed(0);
    const costToken = new BigNumber(costT).shiftedBy(18).toFixed(0);
    const supply = new BigNumber(initialSupply).toFixed(0);
    const usedURI = `ipfs://${uri}/`

    let hash

    if(chain.custom) {
      hash = await eip712Wallet.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        account,
        args: [
          name,
          symbol,
          usedURI,
          baseExt,
          supply,
          costBNB,
          payToken,
          costToken,
          treasury,
          names,
          amounts
        ],
        maxFeePerGas: data?.maxFeePerGas,
        gasPerPubdata: 50000n,
      });
    }else {
  
    hash = await walletClient.deployContract({
      abi,
      bytecode: byteCode as Address,
      account,
      value: BigInt(fees[chain?.id]),
      args: [
        name,
        symbol,
        usedURI,
        baseExt,
        BigInt(supply),
        BigInt(costBNB),
        payToken,
        BigInt(costToken),
        treasury,
        names,
        amounts
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
        usedURI,
        baseExt,
        supply,
        costBNB,
        payToken,
        costToken,
        treasury,
        names,
        amounts
      ];
      setStatus("Verifying Contract...")
    // Create an instance of the AbiCoder
    const abiCoder = new ethers.AbiCoder();
    // Encode constructor arguments
    const namesLength = names.length;
    // Generate the type definition for the string[] with the appropriate length
    const stringArrayType = `string[${namesLength}]`;
    const uint256ArrayType = `uint256[${namesLength}]`

// Encode constructor arguments
const encodedConstructorArgs = abiCoder.encode(
    ["string", "string","string", "string", "uint256", "uint256", "address", "uint256", "address", stringArrayType, uint256ArrayType],
    constructorArgs
);
      // verify contract
     if(!chain.custom) onclickVerify(receipt.contractAddress, encodedConstructorArgs)

      // Add the new contract address to the array
      tokens.push({ symbol: symbol, contractAddress: receipt.contractAddress, chain: chain.name, type: 'NFTR'});
  
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
          contractname: `MarsRandomNFT`,
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

        <Tile style={{ width: isMobile ? '47%' : '197px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noName ? "failure" : "textSubtle"}>{t('Token Name:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryName} placeholder="Ex: Ethereum" />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '197px' }}>
          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
              <Text color={noSym ? "failure" : "textSubtle"}>{t('Token Symbol:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQuerySymbol} placeholder="Ex: ETH" />
          </Flex>
        </Tile>  

        <Tile style={{ width: isMobile ? '47%' : '197px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noSupply || !amountsAccurate ? "failure" : "textSubtle"}>{t('NFT MAx Suplply:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQuerySupply}
              placeholder="Ex: 10000"
              startingNumber={initialSupply}
            />
          </Flex>
        </Tile>


        <Tile style={{ width: isMobile ? '47%' : '197px' }}>
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
              <Text color="textSubtle">{t('PayToken (optional)')}</Text>
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


        

     
          
         
        
      
                <Tile style={{ width: isMobile ? '95%' : '820px' }}>
                  <Flex flexDirection="column" minWidth="50%">
                    <label style={{ color: 'white', fontWeight: 'bold' }}>
                      Select Images (Max 100):
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        multiple
                      />
                    </label>
                  </Flex>
                </Tile>
           
            
          
            
              <Tile style={{ width: isMobile ? '95%' : '820px' }}>
                <Flex flexDirection="column" minWidth="50%">
                  <Flex alignItems="flex-start">
                    <Text color={noColName ? "failure" : "textSubtle"}>{t('Collection Name:')}</Text>
                  </Flex>
                  <SearchInput onChange={handleCollectionNameChange} placeholder="ex: Red Planet NFT" />
                </Flex>
              </Tile>
              <Tile style={{ width: isMobile ? '95%' : '820px' }}>
                <Flex flexDirection="column" minWidth="50%">
                  <Flex alignItems="flex-start">
                    <Text color={noDesc ? "failure" : "textSubtle"}>{t('Description:')}</Text>
                  </Flex>
                  <SearchInput onChange={handleCollectionDescriptionChange} placeholder="ex: The Best NFT Collection on the planet" />
                </Flex>
              </Tile> 
              <Tile style={{ width: isMobile ? '95%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('ThirdWeb API Key (free account max 1 gig )')}</Text>
            </Flex>
            <SearchInput onChange={handleCollectionAPIKey} placeholder="ThirdWeb Client Key" />
            <LinkExternal small href={`https://thirdweb.com/dashboard/settings/api-keys`} mr="16px">Get API key </LinkExternal>
          </Flex>
        </Tile>
              <Tile style={{ width: isMobile ? '95%' : '820px' }}>
                <Flex flexDirection="column" minWidth="50%">
                  <Flex alignItems="flex-start">
                    <Text color={noCustomTrait ? "failure" : "textSubtle"}>{t('Custom trait name:')}</Text>
                  </Flex>
                  <SearchInput onChange={handleCollectionTraitChange} placeholder="ex: Color" />
                </Flex>
              </Tile> 
            
          
            <Divider />
      
            {names.map((file, index) => (
               
              <Tile style={{ width: isMobile ? '47%' : '210px' }}>
                 <Box
  p="10px"
  style={{
    backgroundImage: `url(${URL.createObjectURL(selectedFiles[index])})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: '5%',
    backgroundColor: '#2C322E',
    boxShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)',
    width: '190px',
    paddingTop: '100%', // Set padding-top to maintain aspect ratio
  }}
>
</Box>
                <Flex flexDirection="column" minWidth="50%">
               <Flex alignItems="flex-start">
                 <Text color={!imageName[index] ? "failure" : "textSubtle"}>{t('Image Name:')}</Text>
               </Flex>
               <SearchInput2 onChange={handleCollectionTraitImageName} placeholder="ex: Dude 1" index={index} />
             </Flex>

              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={!amounts[index] ? "failure" : "textSubtle"}>{`Mint How Many:`}</Text>
                </Flex>
                <NumberInput2
                  onChange={handleChangeQueryAmounts}
                  placeholder="Ex: 100"
                  startingNumber={'0'}
                  index={index}
                />
              </Flex>

              <Flex flexDirection="column" minWidth="50%">
                  <Flex alignItems="flex-start">
                    <Text color={!traits[index] ? "failure" : "textSubtle"}>{t(`Trait Value for ${trait} `)}</Text>
                  </Flex>
                  <SearchInput2 onChange={handleChangeQueryTraits} placeholder="ex: Blue" index={index} />
                </Flex>
               
            </Tile>
            ))}


                 
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
              <Text>{isMobile ? `${createdUri ? createdUri : baseUri.slice(0, 12)}` : `${createdUri ? createdUri : baseUri}`}</Text>
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
              <Text>Images:</Text>
              <Text>{`${names.length}`}</Text>
            </Flex>
             <Flex justifyContent="space-between">
              <Text>amounts:</Text>
              <Text>{`${getSum().toString()}`}</Text>
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
            </>
}

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
              Deploy NFT
            </Button>
          </Flex>

{tokens && 
<>
          <Divider />
<ActionContainer>    
  <BorderContainer>
    <Flex alignItems="center" justifyContent="space-between">
      <Heading color="secondary" scale="lg">
        Your launched NFT Collections
      </Heading>
    </Flex>
    {tokens.map((newToken) => (
      newToken.chain === chain.name && newToken.type === 'NFTR' &&
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
  
export default NftR
