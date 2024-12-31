/* eslint-disable no-await-in-loop */
import { Flex, Heading, Text, Button, LinkExternal, Toggle } from 'uikit'
import Page from 'components/Layout/Page'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
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
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { dexs } from 'config/constants/dex'
import { BASE_BSC_SCAN_URLS } from 'config'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress'
import { isMobile } from 'components/isMobile'
import { Dex } from 'config/constants/types'
import { config } from 'wagmiConfig'
import { Address, TransactionReceipt, createWalletClient, custom } from 'viem'
import useToast from 'hooks/useToast'
import { eip712WalletActions } from 'viem/zksync'
import { ultimateToken, byteCode } from 'config/abi/tokens/ultimateToken'
import DexSelector from 'components/DexSelector/DexSelector'
import { USDT } from 'config/constants/tokens'
import { getETHER, Token } from 'sdk'
import EasySelect from './EasySelect'
import axios from 'axios';
import { ethers } from 'ethers'
import { apis, keys } from '.'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import artifact from 'config/abi/tokens/UltimateToken.json'
import { defaultChainId } from 'config/constants/chains'


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
const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 10px;

  ${Text} {
    margin-left: 8px;
  }
`
const fees = {
  defaultChainId: "100000"
}


const zeroAddress = '0x0000000000000000000000000000000000000000'

const Ultimate: React.FC = () => {
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const { data: walletClient, refetch } = useWalletClient({chainId: chain?.id})
  const { toastSuccess, toastError } = useToast()
  const ETHER = getETHER(chain?.id)
  const wrapped = getWrappedAddress(chain?.id)
  const nativeValue = useGetWcicPrice()

  const { balance } = useGetBnbBalance(chain?.id)

  const [ basetoken, setBaseToken ] = useState<Address>(wrapped ?? zeroAddress)
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [ maxWallet, setMaxWallet ] = useState('100') // 2%
  const [ maxTxAmount, setMaxTx ] = useState('100')  // 2%

  const [ treasuryWallet, setTreasury ] = useState<Address>(zeroAddress)
  const [marketingWallet, setMWallet] = useState<Address>(zeroAddress)

  const [tBuyFee, setTBuyFee] = useState('0')
  const [tSellFee, setTSellFee] = useState('0')
  const [lBuyFee, setLBuyFee] = useState('0')
  const [lSellFee, setLSellFee] = useState('0')
  const [mBuyFee, setMBuyFee] = useState('0')
  const [mSellFee, setMSellFee] = useState('0')
  const [bBuyFee, setBBuyFee] = useState('0')
  const [bSellFee, setBSellFee] = useState('0')
  const [rBuyFee, setRBuyFee] = useState('0')
  const [rSellFee, setRSellFee] = useState('0')

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
    const solidityFileUrl = `${mainUrl}/source/ultimateToken.sol`;
    return solidityFileUrl;
  };
  

  const solidityFileUrl = constructSolidityUrl();
 

  
 const [ foundDex, setDex ] = useState<Dex>()
useEffect(() => {
  for (const key in dexs) {
    if (dexs[key].chainId === chain?.id) {
      setDex(dexs[key]);
      setRouter(getAddress(dexs[key].router, chain?.id))
      break
    }
  }
  refetch()
},[chain])

  const [router, setRouter] = useState<Address>()
  const [initialSupply, setSupply] = useState('1000000')
  const [owner, setOwner] = useState<Address>(zeroAddress)
  const [totalBuy, setTotalB] = useState('0')
  useEffect(() => {
    setTotalB(new BigNumber(lBuyFee).plus(mBuyFee).plus(rBuyFee).plus(tBuyFee).plus(bBuyFee).toString())
  },[lBuyFee,mBuyFee, rBuyFee, tBuyFee, bBuyFee])
  const [totalSell, setTotalS] = useState('0')
  useEffect(() => {
    setTotalS(new BigNumber(lSellFee).plus(mSellFee).plus(rSellFee).plus(tSellFee).plus(bSellFee).toString())
  },[lSellFee,mSellFee, rSellFee, tSellFee, bSellFee])


  // disablers
  const noName = name === ''
  const noSym = symbol === ''
  const noSupply = Number.isNaN(Number(initialSupply))
  const noFee = new BigNumber(balance.toString()).lt(fees[chain?.id])
  const noOwner = owner === zeroAddress
  const noMWallet = marketingWallet === zeroAddress || marketingWallet.toLowerCase() === treasuryWallet.toLowerCase()
  const noTWallet = treasuryWallet === zeroAddress || marketingWallet.toLowerCase() === treasuryWallet.toLowerCase()
  const feeToHigh = 
    new BigNumber(totalBuy).gt(30) || new BigNumber(totalSell).gt(30) ||
    new BigNumber(mBuyFee).gt(15) || new BigNumber(mSellFee).gt(15) ||
    new BigNumber(tBuyFee).gt(15) || new BigNumber(tSellFee).gt(15) ||
    new BigNumber(lBuyFee).gt(15) || new BigNumber(lSellFee).gt(15) ||
    new BigNumber(rBuyFee).gt(15) || new BigNumber(rSellFee).gt(15) ||
    new BigNumber(bBuyFee).gt(15) || new BigNumber(bSellFee).gt(15)
  const maxWError = new BigNumber(initialSupply).times(maxWallet).dividedBy(100).lt(new BigNumber(initialSupply).dividedBy(10000))
  const maxTXError = new BigNumber(initialSupply).times(maxTxAmount).dividedBy(100).lt(new BigNumber(initialSupply).dividedBy(10000))
  const noBase = basetoken === zeroAddress

  const disableBuying =
    noFee ||
    noSupply ||
    noName ||
    noSym ||
    noOwner ||
    noMWallet ||
    feeToHigh ||
    maxWError ||
    maxTXError ||
    noBase

  const handleChangeQueryName = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setName(value)
  }
  const handleChangeQuerySymbol = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSymbol(value)
  }
  const handleChangeQuerySupply = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSupply(value)
  }
  const handleChangeQueryOwner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value === '') setOwner(zeroAddress)
    else setOwner(value as Address)
  }
  const handleChangeQueryMaxWallet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setMaxWallet(value)
  }
  const handleChangeQueryMaxTx = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setMaxTx(value)
  }

  const handleChangeQueryMWallet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setMWallet(value as Address)
  }
  const handleChangeQueryTWallet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setTreasury(value as Address)
  }

  const handleChangeQueryBToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setBaseToken(value as Address)
  }


  const handleChangeQueryDevFeeB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setMBuyFee(value)
  }
  const handleChangeQueryDevFeeS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setMSellFee(value)
  }
  const handleChangeQueryLiqFeeB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setLBuyFee(value)
  }
  const handleChangeQueryLiqFeeS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setLSellFee(value)
  }
  const handleChangeQueryTFeeB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setTBuyFee(value)
  }
  const handleChangeQueryTFeeS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setTSellFee(value)
  }
  const handleChangeQueryBFeeB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setBBuyFee(value)
  }
  const handleChangeQueryBFeeS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setBSellFee(value)
  }
  const handleChangeQueryRFeeB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setRBuyFee(value)
  }
  const handleChangeQueryRFeeS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setRSellFee(value)
  }

  const [marketingIsBase, setMarketingIsBase] = useState(true)
  const changeMarketingIsBase = () => {
    setMarketingIsBase(!marketingIsBase)
  }
  
  let tokens = JSON.parse(localStorage.getItem('tokens')) || [];
  

  const onClickConfirmUltimate = async () => {
    const maxW = new BigNumber(initialSupply).shiftedBy(18).times(maxWallet).dividedBy(100).toFixed(0);
    const maxTx = new BigNumber(initialSupply).shiftedBy(18).times(maxTxAmount).dividedBy(100).toFixed(0);
    const supply = new BigNumber(initialSupply).shiftedBy(18).toFixed(0);

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
          supply,
          maxW,
          maxTx,
          [marketingWallet, router, basetoken, treasuryWallet],
          marketingIsBase,
          [
            new BigNumber(lSellFee).times(10).integerValue().toNumber(), 
            new BigNumber(lBuyFee).times(10).integerValue().toNumber(), 
            new BigNumber(mSellFee).times(10).integerValue().toNumber(),  
            new BigNumber(mBuyFee).times(10).integerValue().toNumber(), 
            new BigNumber(rSellFee).times(10).integerValue().toNumber(),  
            new BigNumber(rBuyFee).times(10).integerValue().toNumber(), 
            new BigNumber(tSellFee).times(10).integerValue().toNumber(), 
            new BigNumber(tBuyFee).times(10).integerValue().toNumber(), 
            new BigNumber(bSellFee).times(10).integerValue().toNumber(),  
            new BigNumber(bBuyFee).times(10).integerValue().toNumber()
          ],
          owner
        ],
        maxFeePerGas: data?.maxFeePerGas,
        gasPerPubdata: 50000n,
        factoryDeps: ["0x010000e7ac3a3454bffd861d5bf5a67e1efbe1daefa79449643a316a68f5aec1"]
      });
    }else {

  
    hash = await walletClient.deployContract({
      abi: ultimateToken,
      bytecode: byteCode,
      account,
      value: BigInt(fees[chain?.id]),
      args: [
        name,
        symbol,
        18,
        BigInt(supply),
        BigInt(maxW),
        BigInt(maxTx),
        [marketingWallet, router, basetoken, treasuryWallet],
        marketingIsBase,
        [
          new BigNumber(lSellFee).times(10).integerValue().toNumber(), 
          new BigNumber(lBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(mSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(mBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(rSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(rBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(tSellFee).times(10).integerValue().toNumber(), 
          new BigNumber(tBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(bSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(bBuyFee).times(10).integerValue().toNumber()
        ],
        owner
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
        supply,
        maxW,
        maxTx,
        [marketingWallet, router, basetoken, treasuryWallet],
        marketingIsBase,
        [
          new BigNumber(lSellFee).times(10).integerValue().toNumber(), 
          new BigNumber(lBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(mSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(mBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(rSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(rBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(tSellFee).times(10).integerValue().toNumber(), 
          new BigNumber(tBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(bSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(bBuyFee).times(10).integerValue().toNumber()
        ],
        owner
    ];
    
    // Create an instance of the AbiCoder
    const abiCoder = new ethers.AbiCoder();
    // Encode constructor arguments
    const encodedConstructorArgs = abiCoder.encode(
        ["string", "string", "uint8", "uint256", "uint256", "uint256", "address[4]", "bool", "uint16[10]", "address"],
        constructorArgs
    );
      // verify contract
      if(!chain.custom) onclickVerify(receipt.contractAddress, encodedConstructorArgs)

      // Add the new contract address to the array
      tokens.push({ symbol: symbol, contractAddress: receipt.contractAddress, chain: chain.name, type: 'ultimate'});
  
      // Store the updated tokens array back to local storage
      localStorage.setItem('tokens', JSON.stringify(tokens));
    
    } else {
      // user rejected tx or didn't go thru
      toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted');
    }
  };


    const onclickVerify = async (address, conCode) => {
      const source = await  readSolidityFile(solidityFileUrl)
      const conCodeSliced = conCode.slice(2)
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
          contractname: `UltimateToken`,
          compilerversion:'v0.8.18+commit.87f61d96',
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


  const handleDexChange = (newDex: Dex) => {
    if (foundDex !== newDex && newDex.chainId === chain?.id) {
      setDex(newDex)
      setRouter(getAddress(newDex.router, newDex.chainId))
    }
  }
  const onChangeBaseToken = (token: Token) => {
    setBaseToken(token.address as Address ?? getWrappedAddress(chain?.id))
  }
  const [useCustomBase, setUseCustomBase] = useState(false)
  const changeCustomBase = () => {
    setUseCustomBase(!useCustomBase)
    setBaseToken(getWrappedAddress(chain?.id))
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
            {foundDex && <DexSelector newDex={foundDex} UpdateDex={handleDexChange}/> }
           
        </Flex>
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

    <Tile style={{ width: isMobile ? '47%' : '210px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noName ? "failure" : "textSubtle"}>{t('Token Name:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryName} placeholder="Ex: Ethereum" />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '210px' }}>
          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
              <Text color={noSym ? "failure" : "textSubtle"}>{t('Token Symbol:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQuerySymbol} placeholder="Ex: ETH" />
          </Flex>
        </Tile>  

        <Tile style={{ width: isMobile ? '47%' : '210px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noSupply ? "failure" : "textSubtle"}>{t('Initial Supply:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQuerySupply}
              placeholder="Ex: 1000000"
              startingNumber={initialSupply}
            />
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '47%' : '210px' }}>
          <Flex flexDirection="column">
            <Flex justifyContent="space-between">
              <Text color={noBase ? "failure" : "textSubtle"}>{t('Base Token:')}</Text>
              <Flex>
                <Toggle checked={useCustomBase} onChange={() => changeCustomBase()} scale="sm" />
                <Text>Custom</Text>
              </Flex>
            </Flex>
            {useCustomBase ? (
            <SearchInput onChange={handleChangeQueryBToken} starting={basetoken} />
            ):(
            <EasySelect options={[ETHER as Token, USDT[chain?.id]]} onChange={onChangeBaseToken} />
            )}
          </Flex>
        </Tile>

        <Tile style={{ width: isMobile ? '95%' : '210px' }}>
          <ToggleWrapper>
            <Flex flexDirection="column">
            <Flex flexDirection="row">
              <QuestionHelper
                text={
                  <>
                    <Text>Send fee to marketing in Base Token?</Text>
                    <Text>if no will send as itself.</Text>
                  </>
                }
                ml="4px"
              />
              <Toggle checked={marketingIsBase} onChange={() => changeMarketingIsBase()} scale="sm" />
              </Flex>
              <Text>Marketing as base</Text>
              </Flex>
          </ToggleWrapper>
        </Tile>

        <Tile style={{ width: isMobile ? '95%' : '358px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noMWallet ? "failure" : "textSubtle"}>{t('Marketing Wallet:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryMWallet} starting={zeroAddress} />
          </Flex>
        </Tile>
        <Tile style={{ width: isMobile ? '95%' : '358px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noOwner ? "failure" : "textSubtle"}>{t('Owner Of Token:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryOwner} starting={owner} />
          </Flex>
          </Tile>
          
            
              
          <Tile style={{ width: isMobile ? '95%' : '358px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={noTWallet ? "failure" : "textSubtle"}>{t('Treasury Wallet:')}</Text>
                </Flex>
                <SearchInput onChange={handleChangeQueryTWallet} starting={zeroAddress} />
              </Flex>
              </Tile>

          

          <Tile style={{ width: isMobile ? '47%' : '542px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={maxWError ? "failure" : "textSubtle"}>{t('Max Wallet %:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryMaxWallet}
              placeholder="Ex: 2"
              startingNumber={maxWallet}
            />
          </Flex>

          </Tile>

          <Tile style={{ width: isMobile ? '47%' : '542px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={maxTXError ? "failure" : "textSubtle"}>{t('Max TX %:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryMaxTx}
              placeholder="Ex: 2"
              startingNumber={maxTxAmount}
            />
          </Flex>
          </Tile>

        

<Flex flexDirection={isMobile ? "row" : "column"} >
<Flex flexDirection={isMobile ? "column" : "row"} m="1%" >

          <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(mBuyFee).gt(15) ? "failure" : "textSubtle"}>{t('Marketing Buy %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryDevFeeB}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(tBuyFee).gt(15) ? "failure" : "textSubtle"}>{t('Treasury Buy %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryTFeeB}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile> 

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(lBuyFee).gt(15) ? "failure" : "textSubtle"}>{t('Liquidity Buy %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryLiqFeeB}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(bBuyFee).gt(15) ? "failure" : "textSubtle"}>{t('Burn Buy %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryBFeeB}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(rBuyFee).gt(15) ? "failure" : "textSubtle"}>{t('Reward Buy %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryRFeeB}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>

</Flex>
<Flex flexDirection={isMobile ? "column" : "row"} m="1%">

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(mSellFee).gt(15) ? "failure" : "textSubtle"}>{t('Marketing Sell %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryDevFeeS}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(tSellFee).gt(15) ? "failure" : "textSubtle"}>{t('Treasury Sell %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryTFeeS}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>
            
              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(lSellFee).gt(15) ? "failure" : "textSubtle"}>{t('Liquidity Sell %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryLiqFeeS}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(bSellFee).gt(15) ? "failure" : "textSubtle"}>{t('Burn Sell %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryBFeeS}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>

              <Tile style={{ width: isMobile ? '100%' : '210px' }}>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={new BigNumber(rSellFee).gt(15) ? "failure" : "textSubtle"}>{t('Reward Sell %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryRFeeS}
                  placeholder="Ex: 1"
                  startingNumber="0"
                />
              </Flex>
              </Tile>
</Flex>
</Flex>          
                 
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
              <Text>Supply:</Text>
              <Text>{`${initialSupply}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Pair Base:</Text>
              <Text>{`${basetoken.slice(0, 12)}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Router:</Text>
              <Text>{`${router?.slice(0, 12)}`}</Text>
            </Flex>
            <Divider />
            <Flex justifyContent="space-between">
              <Text>Owner Wallet:</Text>
              <Text>{`${owner.slice(0, 12)}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Marketing Wallet:</Text>
              <Text>{`${marketingWallet.slice(0, 12)}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Treasury Wallet:</Text>
              <Text>{`${treasuryWallet.slice(0, 12)}`}</Text>
            </Flex>
          
            <Flex justifyContent="space-between">
              <Text>Max Wallet:</Text>
              <Text>{`${maxWallet} %`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Max TX:</Text>
              <Text>{`${maxTxAmount} %`}</Text>
            </Flex>
        
            <Divider />
            <Flex justifyContent="space-between">
              <Text>FEE</Text>
              <Text>BUY / SELL</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Marketing:</Text>
              <Text>{`${mBuyFee} / ${mSellFee}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Treasury:</Text>
              <Text>{`${tBuyFee} / ${tSellFee}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Liquidity:</Text>
              <Text>{`${lBuyFee} / ${lSellFee}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Burn Token:</Text>
              <Text>{`${bBuyFee} / ${bSellFee}`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Rewards:</Text>
              <Text>{`${rBuyFee} / ${rSellFee}`}</Text>
            </Flex>



            <Flex flexDirection="row">
              <QuestionHelper text={<Text>Max 30% buy or sell</Text>} ml="4px" />
              <Text color={feeToHigh ? "failure" : "textSubtle"} mr="4px">Fee:</Text>
              <Text color="secondary" mr="4px">{`Buy: ${totalBuy}% |`}</Text>
              <Text color="secondary" mr="4px">{`Sell: ${totalSell}%`}</Text>
            </Flex>
            <Flex flexDirection="row">
              <QuestionHelper text={<Text>Max 30% buy or sell</Text>} ml="4px" />
              <Text color={feeToHigh ? "failure" : "textSubtle"} mr="4px">Max  :</Text>
              <Text color="secondary" mr="4px">{`Buy: 30% |`}</Text>
              <Text color="secondary" mr="4px">{`Sell: 30%`}</Text>
            </Flex>
          </InfoPanel>
       

     </Flex>
         
            
          
        </BorderContainer>

        <Flex justifyContent="center" m="12px">
            <Button onClick={onClickConfirmUltimate} disabled={disableBuying}>
              Deploy Ultimate Token
            </Button>
          </Flex>

{tokens && 
<>
          <Divider />
<ActionContainer>    
  <BorderContainer>
    <Flex alignItems="center" justifyContent="space-between">
      <Heading color="secondary" scale="lg">
        Your launched Ultimate tokens
      </Heading>
    </Flex>
    {tokens.map((newToken) => (
      newToken.chain === chain.name && newToken.type === 'ultimate' &&
    <Flex flexDirection="row" alignItems="center" justifyContent="center"> 
    <Text color="secondary" bold fontSize="18px" mr="16px">{`(${newToken.type})`}</Text>
    <Text color="secondary" bold fontSize="18px" mr="16px">{`(${newToken.symbol})`}</Text>
      <LinkExternal small href={`${BASE_BSC_SCAN_URLS[chain?.id]}/token/${newToken.contractAddress}`} mr="16px">
          {isMobile ? `${newToken.contractAddress.slice(0, 14)}` : `${newToken.contractAddress}`}
      </LinkExternal>
      <CopyAddress account={newToken.contractAddress} logoOnly={true} />
    </Flex>
    ))}
    
   
  </BorderContainer>
     
</ActionContainer>

          <Divider />
          </>
}
       
</>
  )
}
  
export default Ultimate
