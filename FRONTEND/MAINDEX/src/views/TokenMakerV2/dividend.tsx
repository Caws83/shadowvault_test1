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
import { waitForTransactionReceipt, readContract } from '@wagmi/core'
import { useAccount, useEstimateFeesPerGas, useWalletClient } from 'wagmi'
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { dexs } from 'config/constants/dex'
import { BASE_BSC_SCAN_URLS } from 'config'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress'
import { isMobile } from 'components/isMobile'
import { Dex } from 'config/constants/types'
import { config } from 'wagmiConfig'
import { Address, TransactionReceipt, createWalletClient, custom } from 'viem'
import useToast from 'hooks/useToast'
import { dividendToken, byteCode } from 'config/abi/tokens/dividendToken'
import DexSelector from 'components/DexSelector/DexSelector'
import { USDT } from 'config/constants/tokens'
import { getETHER, Token } from 'sdk'
import EasySelect from './EasySelect'
import RewardSelect from './RewardSelect'
import axios from 'axios';
import { ethers } from 'ethers'
import { apis, keys } from '.'
import { useGetWcicPrice } from '../../hooks/useBUSDPrice'
import artifact from 'config/abi/tokens/DividendToken.json'
import { eip712WalletActions } from 'viem/zksync'


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

const BorderContainer = styled.div`
  padding: 16px;
  flex-grow: 1;
  flex-basis: 0;
  margin: 16px;
`
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

const fees = {
  97: "10000",
  109: "200000000000000000000",
}
// deploy DividendTokenDividendTracker
const divTracker = {
  97: '0x1013c2A899525dF9A48F99526b375D211D2F6E64',
  109: "0xA06383679520461c6D9C8F270B00a803fE26E9cE",
}



const zeroAddress = '0x0000000000000000000000000000000000000000'

const Dividend: React.FC = () => {
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const { data: walletClient, refetch } = useWalletClient({chainId: chain?.id})
  const { toastSuccess, toastError } = useToast()
  const ETHER = getETHER(chain?.id)
  const wrapped = getWrappedAddress(chain?.id)
  const nativeValue = useGetWcicPrice()
  const { balance } = useGetBnbBalance(chain?.id)

  const [haveContract, setHaveContract] = useState(false)
useEffect(() => {
  setHaveContract(false)
  if (chain && chain.id in divTracker) {
    setHaveContract(true)
  }
}, [chain])

  const [ basetoken, setBaseToken ] = useState<Address>(wrapped ?? zeroAddress)
  const [ rewardToken, setRToken ] = useState<Address>(wrapped ?? zeroAddress)
  const [ minTokenForReward, setMTFR ] = useState('0')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [ maxWallet, setMaxWallet ] = useState('100') // 2%
  const [ maxTxAmount, setMaxTx ] = useState('100')  // 2%

  const [marketingWallet, setMWallet] = useState<Address>(zeroAddress)

  const [lBuyFee, setLBuyFee] = useState('0')
  const [lSellFee, setLSellFee] = useState('0')
  const [mBuyFee, setMBuyFee] = useState('0')
  const [mSellFee, setMSellFee] = useState('0')
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
    const solidityFileUrl = `${mainUrl}/source/dividendToken.sol`;
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
    setTotalB(new BigNumber(lBuyFee).plus(mBuyFee).plus(rBuyFee).toString())
  },[lBuyFee,mBuyFee, rBuyFee])
  const [totalSell, setTotalS] = useState('0')
  useEffect(() => {
    setTotalS(new BigNumber(lSellFee).plus(mSellFee).plus(rSellFee).toString())
  },[lSellFee,mSellFee, rSellFee])

  // disablers
  const noName = name === ''
  const noSym = symbol === ''
  const noSupply = Number.isNaN(Number(initialSupply))
  const noFee = new BigNumber(balance.toString()).lt(fees[chain?.id])
  const noOwner = owner === zeroAddress
  const noMWallet = marketingWallet === zeroAddress
  const feeToHigh = 
    new BigNumber(totalBuy).gt(20) || new BigNumber(totalSell).gt(20) ||
    new BigNumber(mBuyFee).gt(20) || new BigNumber(mSellFee).gt(20) ||
    new BigNumber(lBuyFee).gt(20) || new BigNumber(lSellFee).gt(20) ||
    new BigNumber(rBuyFee).gt(20) || new BigNumber(rSellFee).gt(20)
  const maxWError = new BigNumber(initialSupply).times(maxWallet).dividedBy(100).lt(new BigNumber(initialSupply).dividedBy(10000))
  const maxTXError = new BigNumber(initialSupply).times(maxTxAmount).dividedBy(100).lt(new BigNumber(initialSupply).dividedBy(10000))
  const noBase = basetoken === zeroAddress
  const minToHigh = new BigNumber(minTokenForReward).gt(new BigNumber(initialSupply).dividedBy(10))
  const noReward = rewardToken === zeroAddress

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
    noBase ||
    noReward ||
    minToHigh

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
  
  const handleChangeQueryBToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setBaseToken(value as Address)
  }
  const handleChangeQueryRToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setRToken(value as Address)
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
 
  const handleChangeQueryRFeeB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    setRBuyFee(value)
  }
  const handleChangeQueryRFeeS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? "0" : event.target.value
    
    setRSellFee(value)
  }
  const handleChangeQueryMinToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setMTFR(value)
  }

  const [rewardOption, setRewardOption] = useState(0)
 
  
  let tokens = JSON.parse(localStorage.getItem('tokens')) || [];
  

  
  const onClickConfirmUltimate = async () => {
    const maxW = new BigNumber(initialSupply).shiftedBy(18).times(maxWallet).dividedBy(100).toFixed(0)
    const maxTx = new BigNumber(initialSupply).shiftedBy(18).times(maxTxAmount).dividedBy(100).toFixed(0)
    const minToken = new BigNumber(minTokenForReward).shiftedBy(18).toFixed(0)
    const supply = new BigNumber(initialSupply).shiftedBy(18).toFixed(0)

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
              [rewardToken, router, marketingWallet, basetoken, divTracker[chain?.id]],
              [
                new BigNumber(lSellFee).times(10).integerValue().toNumber(), 
                new BigNumber(lBuyFee).times(10).integerValue().toNumber(), 
                new BigNumber(mSellFee).times(10).integerValue().toNumber(),  
                new BigNumber(mBuyFee).times(10).integerValue().toNumber(), 
                new BigNumber(rSellFee).times(10).integerValue().toNumber(),  
                new BigNumber(rBuyFee).times(10).integerValue().toNumber()
              ],
            minToken,
            rewardOption,
            owner
        ],
        maxFeePerGas: data?.maxFeePerGas,
        gasPerPubdata: 50000n,
        factoryDeps: ["0x010000e716952346bd67f7d09d0c3d981a84c303f536eacf6f4ec888930b180c"]
      });
    }else {

    hash = await walletClient.deployContract({
      abi: dividendToken,
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
        [rewardToken, router, marketingWallet, basetoken, divTracker[chain?.id]],
        [
          new BigNumber(lSellFee).times(10).integerValue().toNumber(), 
          new BigNumber(lBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(mSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(mBuyFee).times(10).integerValue().toNumber(), 
          new BigNumber(rSellFee).times(10).integerValue().toNumber(),  
          new BigNumber(rBuyFee).times(10).integerValue().toNumber()
        ],
        BigInt(minToken),
        rewardOption,
        owner
      ],
      chain: chain
    })
  }

          const receipt = await waitForTransactionReceipt(config, {hash}) as TransactionReceipt
          if (receipt.status) {
            toastSuccess(
              'Congrats',
                `Token Launched!`
            )
            const constructorArgs = [
              name,
              symbol,
              18,
              supply,
              maxW,
              maxTx,
              [rewardToken, router, marketingWallet, basetoken, divTracker[chain?.id]],
              [
                new BigNumber(lSellFee).times(10).integerValue().toNumber(), 
                new BigNumber(lBuyFee).times(10).integerValue().toNumber(), 
                new BigNumber(mSellFee).times(10).integerValue().toNumber(),  
                new BigNumber(mBuyFee).times(10).integerValue().toNumber(), 
                new BigNumber(rSellFee).times(10).integerValue().toNumber(),  
                new BigNumber(rBuyFee).times(10).integerValue().toNumber()
              ],
            minToken,
            rewardOption,
            owner
          ];
          
          // Create an instance of the AbiCoder
          const abiCoder = new ethers.AbiCoder();
          // Encode constructor arguments
          const encodedConstructorArgs = abiCoder.encode(
              ["string", "string", "uint8", "uint256", "uint256", "uint256", "address[5]", "uint16[6]", "uint256", "uint8", "address"],
              constructorArgs
          );
            // verify contract
            if(!chain.custom) onclickVerify(receipt.contractAddress, encodedConstructorArgs)
        
              console.log(receipt)
        // Add the new contract address to the array

        tokens.push({ symbol: symbol, contractAddress: receipt.contractAddress, chain: chain.name, type: 'dividend' });

        // Store the updated tokens array back to local storage
        localStorage.setItem('tokens', JSON.stringify(tokens));

          } else {
            // user rejected tx or didn't go thru
            toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
          }
  }

  const onclickVerify = async (address, conCode) => {
    const source = await readSolidityFile(solidityFileUrl)
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
     contractname: `DividendToken`,
     compilerversion:'v0.8.19+commit.7dd6d404',
     optimizationUsed: 1,
     constructorArguements: `${conCodeSliced}`,
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
  const onChangeRewardToken = (token: Token) => {
    setRToken(token.address as Address ?? getWrappedAddress(chain?.id))
  }
  const onChangeReward = (option: number) => {
    setRewardOption(option)
  }
  const [useCustomBase, setUseCustomBase] = useState(false)
  const changeCustomBase = () => {
    setUseCustomBase(!useCustomBase)
    setBaseToken(getWrappedAddress(chain?.id))
  }
  const [useCustomReward, setUseCustomReward] = useState(false)
  const changeCustomReward = () => {
    setUseCustomReward(!useCustomReward)
    setRToken(getWrappedAddress(chain?.id))
  }


  if(!account) {
    return (
      <Flex m="10px" alignItems="center" justifyContent="center">
        <ConnectWalletButton chain={109} />
      </Flex>
    )
  }
  if(!haveContract) {
    return (
      <Flex m="10px" alignItems="center" justifyContent="center">
        <Text>This Token not available on this chain!</Text>
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

   <Tile style={{ width: isMobile ? '47%' : '267px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noName ? "failure" : "textSubtle"}>{t('Token Name:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryName} placeholder="Ex: MARSWAP" />
          </Flex>
        </Tile>

       <Tile style={{ width: isMobile ? '47%' : '267px' }}>
          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
              <Text color={noSym ? "failure" : "textSubtle"}>{t('Token Symbol:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQuerySymbol} placeholder="Ex: MSWAP" />
          </Flex>
        </Tile>  

       <Tile style={{ width: isMobile ? '47%' : '267px' }}>
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

       <Tile style={{ width: isMobile ? '47%' : '267px' }}>
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

        <Tile style={{ width: isMobile ? '95%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noMWallet ? "failure" : "textSubtle"}>{t('Marketing Wallet:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryMWallet} starting={zeroAddress} />
          </Flex>
        </Tile>
        <Tile style={{ width: isMobile ? '95%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noOwner ? "failure" : "textSubtle"}>{t('Owner Of Token:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryOwner} starting={owner} />
          </Flex>
          </Tile>

          <Tile style={{ width: isMobile ? '95%' : '360px' }}>
          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
              <Text color="textSubtle">{t('Marketing Fee Token:')}</Text>
            </Flex>
            <RewardSelect options={["This Token", "Base Token", "Reward Token"]} onChange={onChangeReward} />
          </Flex>
        </Tile>

          <Tile style={{ width: isMobile ? '95%' : '360px' }}>
          <Flex flexDirection="column">
          <Flex justifyContent="space-between">
              <Text color={noReward ? "failure" : "textSubtle"}>{t('Reward Token:')}</Text>
              <Flex>
                <Toggle checked={useCustomReward} onChange={() => changeCustomReward()} scale="sm" />
                <Text>Custom</Text>
              </Flex>
            </Flex>
            {useCustomReward ? (
            <SearchInput onChange={handleChangeQueryRToken} starting={rewardToken} />
            ):(
              <EasySelect options={[ETHER as Token, USDT[chain?.id]]} onChange={onChangeRewardToken} />
            )}
           
          </Flex>
        </Tile>
        <Tile style={{ width: isMobile ? '95%' : '360px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={minToHigh ? "failure" : "textSubtle"}>{t('Min token balance for rewards:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryMinToken}
              placeholder="EX: 1000"
              startingNumber={minTokenForReward}
            />
          </Flex>
        </Tile>

          

              <Tile style={{ width: isMobile ? '47%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={maxWError ? "failure" : "textSubtle"}>{t('Max Wallet %:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryMaxWallet}
              placeholder="Max Wallet Size %"
              startingNumber={maxWallet}
            />
          </Flex>

          </Tile>

         

          <Tile style={{ width: isMobile ? '47%' : '545px' }}>
          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={maxTXError ? "failure" : "textSubtle"}>{t('Max TX %:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQueryMaxTx}
              placeholder="Max Tx limit %"
              startingNumber={maxTxAmount}
            />
          </Flex>
          </Tile>

        
          

<Flex flexDirection={isMobile ? "row" : "column"} >
<Flex flexDirection={isMobile ? "column" : "row"} m="1%" >

              <Tile style={{ width: isMobile ? '100%' : '360px' }}>
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

            

              <Tile style={{ width: isMobile ? '100%' : '360px' }}>
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

             
              <Tile style={{ width: isMobile ? '100%' : '360px' }}>
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



              <Tile style={{ width: isMobile ? '100%' : '360px' }}>
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

            
              <Tile style={{ width: isMobile ? '100%' : '360px' }}>
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

            

              <Tile style={{ width: isMobile ? '100%' : '360px' }}>
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


       
          <InfoPanel>

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
            <Flex justifyContent="space-between">
              <Text>Reward:</Text>
              <Text>{`${rewardToken.slice(0, 12)}`}</Text>
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
              <Text>Max Wallet:</Text>
              <Text>{`${maxWallet} %`}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text>Max TX:</Text>
              <Text>{`${maxTxAmount} %`}</Text>
            </Flex>
        
            
            <Flex justifyContent="space-between">
              <Text>Balance for Rewards:</Text>
              <Text>{`${minTokenForReward}`}</Text>
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
              <Text>Liquidity:</Text>
              <Text>{`${lBuyFee} / ${lSellFee}`}</Text>
            </Flex>
           
            <Flex justifyContent="space-between">
              <Text>Rewards:</Text>
              <Text>{`${rBuyFee} / ${rSellFee}`}</Text>
            </Flex>



            <Flex flexDirection="row">
              <QuestionHelper text={<Text>Max 20% buy or sell. as well as 15% per.</Text>} ml="4px" />
              <Text color={feeToHigh ? "failure" : "textSubtle"} mr="4px">Total:</Text>
              <Text color="secondary" mr="4px">{`Buy: ${totalBuy}% |`}</Text>
              <Text color="secondary" mr="4px">{`Sell: ${totalSell}%`}</Text>
            </Flex>

            <Flex flexDirection="row">
              <QuestionHelper text={<Text>Max 20% buy or sell. as well as 15% per.</Text>} ml="4px" />
              <Text color={feeToHigh ? "failure" : "textSubtle"} mr="4px">Max  :</Text>
              <Text color="secondary" mr="4px">{`Buy: 20% |`}</Text>
              <Text color="secondary" mr="4px">{`Sell: 20%`}</Text>
            </Flex>
          </InfoPanel>
       

     </Flex>
         
            
          
        </BorderContainer>

          <Flex justifyContent="center" m="12px">
            <Button onClick={onClickConfirmUltimate} disabled={disableBuying}>
              Deploy Dividend Token
            </Button>
          </Flex>

{tokens && 
<>
          <Divider />
<ActionContainer>    
  <BorderContainer>
    <Flex alignItems="center" justifyContent="space-between">
      <Heading color="secondary" scale="lg">
        Your launched token
      </Heading>
    </Flex>
    {tokens.map((newToken) => (
      newToken.chain === chain.name && newToken.type === 'dividend' &&
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
  
export default Dividend
