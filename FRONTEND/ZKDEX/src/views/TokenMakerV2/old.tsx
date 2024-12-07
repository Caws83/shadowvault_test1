/* eslint-disable no-await-in-loop */
import { Flex, Heading, Text, Button, Toggle, LinkExternal } from 'uikit'
import Page from 'components/Layout/Page'
import PageHeader from 'components/PageHeader'
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
import { simulateContract, writeContract,readContracts, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { useAccount, useReadContract } from 'wagmi'
import { tokenMakerAbi } from 'config/abi/tokenMaker'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { dexs } from 'config/constants/dex'
import { BASE_BSC_SCAN_URLS } from 'config'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress'
import { isMobile } from 'components/isMobile'
import { Dex } from 'config/constants/types'
import { config } from 'wagmiConfig'
import { Address, TransactionReceipt } from 'viem'
import useToast from 'hooks/useToast'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import DexSelector from 'components/DexSelector/DexSelector'



const BorderContainer = styled.div`
  padding: 16px;
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
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
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`
const zeroAddress = '0x0000000000000000000000000000000000000000'

const OldVersion: React.FC = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chain } = useAccount()
  const { toastSuccess, toastError } = useToast()

  const { balance } = useGetBnbBalance(chain?.id)

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [devFee, setDevFee] = useState('0')
  const [burnFee, setBurnFee] = useState('0')
  const [liqFee, setLiqFee] = useState('0')
  const [marketingWallet, setMWallet] = useState(zeroAddress)
  const [burnToken, setBurnToken] = useState(zeroAddress)

  const [haveContract, setHaveContract] = useState(false)
  useEffect(() => {
    setHaveContract(false)
    if (chain && chain.id in contracts.tokenFactory) {
      setHaveContract(true)
    }
  }, [chain])

 const [ foundDex, setDex ] = useState<Dex>()
useEffect(() => {
  for (const key in dexs) {
    if (dexs[key].chainId === chain?.id) {
      setDex(dexs[key]);
      setRouter(getAddress(dexs[key].router, chain.id))
      setBurnRouter(getAddress(dexs[key].router, chain.id))
      break
    }
  }
},[chain])

  const [router, setRouter] = useState<Address>()
  const [burnRouter, setBurnRouter] = useState<Address>()

  const [initialSupply, setSupply] = useState('1000000')
  const [owner, setOwner] = useState(zeroAddress)
  const [totalFee, setTotal] = useState(0)

  const [myTokens, setMyTokens] = useState<`0x${string}`[]>([])
  const [fee, setFee] = useState('0')
  const {data} = useReadContract({
        abi: tokenMakerAbi,
        address: getAddress(contracts.tokenFactory, chain?.id),
        functionName: 'createFee',
        chainId: chain?.id
  })

  useEffect(() =>  {
    if(data) setFee(data.toString())
  },[data])
  useEffect(() => {
    async function get() {
      if(account ) {
        const myTokens = await readContract(config, {
          abi: tokenMakerAbi,
          address: getAddress(contracts.tokenFactory, chain.id),
          functionName: 'getMyTokens',
          account,
          chainId: chain.id
        })
        if(account !== owner) {
          setOwner(account)
        }
        setMyTokens(myTokens as Address[])
      }
    }
    get()
  }, [account, chain])

  const [ myTokenInfo, setMyTokenInfo ] = useState([])

  useEffect(() => {

    async function get() {
      const calls = myTokens.map((token) => {
        return {
          abi: ERC20_ABI,
          address: token,
          functionName: 'symbol',
          chainId: chain.id
        }
      })
      const symbols = await readContracts(config, {contracts: calls})
      setMyTokenInfo(symbols)
    }
    get()
  },[myTokens])

  const noName = name === ''
  const noSym = symbol === ''
  const noSupply = Number.isNaN(Number(initialSupply))
  const noFee = new BigNumber(balance.toString()).lt(fee)
  const noOwner = owner === zeroAddress
  const noMWallet = (new BigNumber(devFee).gt(0) && marketingWallet === zeroAddress)
  const noburnToken = (new BigNumber(burnFee).gt(0) && burnToken === zeroAddress)
  const feeToHigh = new BigNumber(burnFee).plus(devFee).plus(liqFee).gt(20)

  const disableBuying =
    new BigNumber(balance.toString()).lt(fee) ||
    Number.isNaN(Number(initialSupply)) ||
    name === '' ||
    symbol === '' ||
    owner === zeroAddress ||
    (new BigNumber(devFee).gt(0) && marketingWallet === zeroAddress) ||
    (new BigNumber(burnFee).gt(0) && burnToken === zeroAddress) ||
    new BigNumber(burnFee).plus(devFee).plus(liqFee).gt(20)

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
    else setOwner(value as `0x${string}`)
  }
  const handleChangeQueryMWallet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setMWallet(value as Address)
  }
  const handleChangeQueryDevFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setDevFee(value)
    setTotal(new BigNumber(value).plus(liqFee).plus(burnFee).toNumber())
  }
  const handleChangeQueryLiqFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setLiqFee(value)
    setTotal(new BigNumber(value).plus(devFee).plus(burnFee).toNumber())
  }
  const handleChangeQueryBurnToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setBurnToken(value)
  }
  const handleChangeQueryBurnRouter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setBurnRouter(value as Address)
  }
  const handleChangeQueryBurnFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setBurnFee(value)
    setTotal(new BigNumber(value).plus(devFee).plus(liqFee).toNumber())
  }

  const [useBurn, setUseBurn] = useState(false)
  const changeUseBurn = () => {
    setUseBurn(!useBurn)
    setBurnFee('0')
    setBurnToken(zeroAddress)
    setTotal(new BigNumber(burnFee).plus(devFee).plus(liqFee).toNumber())
  }

  const [useLiqFee, setUseLiqFee] = useState(false)
  const changeUseLiqFee = () => {
    setUseLiqFee(!useLiqFee)
    setLiqFee('0')
    setTotal(new BigNumber(burnFee).plus(devFee).plus(liqFee).toNumber())
  }

  const [useDevFee, setUseDevFee] = useState(false)
  const changeUseDevFee = () => {
    setUseDevFee(!useDevFee)
    setDevFee('0')
    setMWallet(zeroAddress)
    setTotal(new BigNumber(burnFee).plus(devFee).plus(liqFee).toNumber())
  }

  const onClickConfirm = async () => {
    const dev = new BigNumber(devFee).multipliedBy(100).toFixed(0)
    const burn = new BigNumber(burnFee).multipliedBy(100).toFixed(0)
    const liq = new BigNumber(liqFee).multipliedBy(100).toFixed(0)

    const { request } = await simulateContract(config, {
      abi: tokenMakerAbi,
      address: getAddress(contracts.tokenFactory, chain.id),
      functionName: 'createToken',
      args: [name, symbol, dev, burn, liq, router, marketingWallet, burnToken, burnRouter, initialSupply, owner],
      value: BigInt(fee),
      chainId: chain.id
    })
          const hash = await writeContract(config, request);
          const receipt = await waitForTransactionReceipt(config, {hash}) as TransactionReceipt

          if (receipt.status) {
            toastSuccess(
              'Congrats', 
                'Your Token Was Created'
            )
          } else {
            // user rejected tx or didn't go thru
            toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
          }
  }
  const handleDexChange = (newDex: Dex) => {
    if (foundDex !== newDex && newDex.chainId === chain?.id) {
      setDex(newDex)
      setRouter(getAddress(newDex.router, newDex.chainId))
    }
  }


  if(!haveContract) {
    return (
      <Flex m="10px" alignItems="center" justifyContent="center">
        <ConnectWalletButton chain={109} />
      </Flex>
    )
  }

  return (
   
      <Page>
        <BorderContainer>
        <Flex flexDirection="row" ml={isMobile ? null : "30px"}>
            {foundDex && <DexSelector newDex={foundDex} UpdateDex={handleDexChange}/> }
           
        </Flex>
          <ActionContainer>
            <ToggleWrapper>
              <Flex flexDirection="row">
                <QuestionHelper
                  text={
                    <>
                      <Text>% of sales goes to marketing wallet</Text>
                      <Text>Marketing fee changeable</Text>
                    </>
                  }
                  ml="4px"
                />
                <Toggle checked={useDevFee} onChange={() => changeUseDevFee()} scale="sm" />
                <Text>Marketing fee</Text>
              </Flex>
            </ToggleWrapper>

            <ToggleWrapper>
              <Flex flexDirection="row">
                <QuestionHelper
                  text={
                    <>
                      <Text>Uses a % of sales to add to liquidity</Text>
                      <Text>Fee changeable</Text>
                    </>
                  }
                  ml="4px"
                />
                <Toggle checked={useLiqFee} onChange={() => changeUseLiqFee()} scale="sm" />
                <Text>Liquidity Fee</Text>
              </Flex>
            </ToggleWrapper>

            <ToggleWrapper>
              <Flex flexDirection="row">
                <QuestionHelper
                  text={
                    <>
                      <Text>Uses a % of sales to burn a token</Text>
                      <Text>Token and DEX/ROUTER changeable</Text>
                    </>
                  }
                  ml="4px"
                />
                <Toggle checked={useBurn} onChange={() => changeUseBurn()} scale="sm" />
                <Text>Burn A Token</Text>
              </Flex>
            </ToggleWrapper>

            <Flex flexDirection="row">
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
              <Text color="secondary">{`:  ${parseFloat(new BigNumber(fee).shiftedBy(-18).toFixed(6))} ${chain?.nativeCurrency.symbol}`}</Text>
            </Flex>
            <Flex flexDirection="row">
              <QuestionHelper
                text={
                  <>
                    <Text>Dex used for Liquidity/Burning.</Text>
                    <Text>This can be changed after on contract.</Text>
                  </>
                }
                ml="4px"
              />
              <Text color="textSubtle">Dex</Text>
              <Text >{`: ${foundDex.id}`}</Text>
            </Flex>
          </ActionContainer>

          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noName ? "failure" : "textSubtle"}>{t('Token Name:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryName} placeholder="Enter Token Name" />
          </Flex>

          <Flex flexDirection="column">
            <Flex alignItems="flex-start">
              <Text color={noSym ? "failure" : "textSubtle"}>{t('Token Symbol:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQuerySymbol} placeholder="Enter Symbol" />
          </Flex>

          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noSupply ? "failure" : "textSubtle"}>{t('Initial Supply:')}</Text>
            </Flex>
            <NumberInput
              onChange={handleChangeQuerySupply}
              placeholder="Enter Token Initial Supply"
              startingNumber="1000000"
            />
          </Flex>

          <Flex flexDirection="column" minWidth="50%">
            <Flex alignItems="flex-start">
              <Text color={noOwner ? "failure" : "textSubtle"}>{t('Owner Of Token:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryOwner} placeholder={owner} />
          </Flex>

          {useDevFee && (
            <>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={noMWallet ? "failure" : "textSubtle"}>{t('Marketing Wallet:')}</Text>
                </Flex>
                <SearchInput onChange={handleChangeQueryMWallet} placeholder={zeroAddress} />
              </Flex>

              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text>{t('Marketing Wallet Fee %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryDevFee}
                  placeholder="Enter % for Marketing"
                  startingNumber="0"
                />
              </Flex>
            </>
          )}

          {useLiqFee && (
            <>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text>{t('Liquidity Fee %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryLiqFee}
                  placeholder="Enter % for Liquidity"
                  startingNumber="0"
                />
              </Flex>
            </>
          )}

          {useBurn && (
            <>
              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text>{t('Burn Fee %:')}</Text>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryBurnFee}
                  placeholder="Enter % for Burn Token"
                  startingNumber="0"
                />
              </Flex>

              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={noburnToken ? "failure" : "textSubtle"}>{t('Burn Token:')}</Text>
                </Flex>
                <SearchInput onChange={handleChangeQueryBurnToken} placeholder="Enter Token Address to Burn" />
              </Flex>

              <Flex flexDirection="column" minWidth="50%">
                <Flex alignItems="flex-start">
                  <Text color={!burnRouter ? "failure" : "textSubtle"}>{t('Burn Router:')}</Text>
                </Flex>
                <SearchInput onChange={handleChangeQueryBurnRouter} placeholder={burnRouter} />
              </Flex>
            </>
          )}
          {totalFee > 0 && (
            <Flex flexDirection="row">
              <QuestionHelper text={<Text>Max 20% combined fees</Text>} ml="4px" />
              <Text color={feeToHigh ? "failure" : "textSubtle"}>Total Fee</Text>
              <Text color="secondary">{`: ${totalFee}%`}</Text>
            </Flex>
          )}
        </BorderContainer>

          <Flex justifyContent="center">
            <Button onClick={onClickConfirm} disabled={disableBuying}>
              Confirm transactions
            </Button>
          </Flex>
      
        <Divider />
        <ActionContainer>
          <BorderContainer>
            <Flex alignItems="center" justifyContent="space-between">
              <Heading color="secondary" scale="lg">
                How to launch
              </Heading>
            </Flex>
            <Text>Step 1: Choose Options</Text>
            <Text>Step 2: Create Token</Text>
            <Text>Step 3: Create Pre-Sale</Text>
            <Text>Step 4: Add Liquidity</Text>
          </BorderContainer>

          {myTokens.length > 0 && (
  <BorderContainer>
    <Flex alignItems="center" justifyContent="space-between">
      <Heading color="secondary" scale="lg">
        Your launched tokens
      </Heading>
    </Flex>

    {myTokens.map((token, index) => (
      <Flex flexDirection="row" alignItems="center" justifyContent="center">
        {myTokenInfo && myTokenInfo[index]?.status === "success" && 
          <Text color="secondary" bold fontSize="18px" mr="16px">{`(${myTokenInfo[index]?.result})`}</Text>
        }
      <LinkExternal key={index} small href={`${BASE_BSC_SCAN_URLS[chain?.id]}/token/${token}`} mr="16px">
          {isMobile ? `${token.slice(0, 24)}` : `${token}`}
      </LinkExternal>
      <CopyAddress account={token} logoOnly={true} />
      </Flex>
    ))}
  </BorderContainer>
)}
        </ActionContainer>

        <Divider />
      </Page>
    
  )
}
  
export default OldVersion
