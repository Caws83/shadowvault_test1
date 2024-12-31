/* eslint-disable no-await-in-loop */
import { Flex, Heading, Text, Button, Toggle, LinkExternal, Link, CardHeader, TextSwitchLabel, useModal, TextHeader } from 'uikit'
import Page from 'views/Page'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState, useRef } from 'react'
import SearchInput from 'components/SearchInput'
import NumberInput from 'components/NumberInput/NumberInput'
import styled from 'styled-components'
import { BigNumber } from 'bignumber.js'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { simulateContract, writeContract, readContracts, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { useAccount, useReadContract } from 'wagmi'
import { tokenMakerAbi } from 'config/abi/tokenMaker'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { dexs } from 'config/constants/dex'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress'
import { isMobile } from 'components/isMobile'
import { Dex } from 'config/constants/types'
import { config } from 'wagmiConfig'
import { Address, TransactionReceipt } from 'viem'
import useToast from 'hooks/useToast'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import NewPresale from 'views/Ifos/components/NewPresale'
import { Wrapper } from 'views/Swap/components/styleds'
import { AppBody } from '../../components/App'
import ConfirmTokenCreation from './ConfirmTokenCreation'
import CreatedTokenModal from './CreatedTokenModal'
import { defaultChainId } from 'config/constants/chains'
import { GiThorHammer } from 'react-icons/gi'

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 8px;
  padding: 24px;
  border-radius: 8px;
`

const Tile = styled.div`
  border-radius: 4px;
  width: ${isMobile ? '300px' : '350px'};
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
`
const BorderContainer = styled.div`
  padding: 10px;
`

const CustomBodyWrapper = styled.div`
  padding: 10px;
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
  width: 100%;
  margin-bottom: 10px;
  background-color: 'white';

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
  }

  &.presale-toggle {
    margin-top: 16px;
  }
`
const TileText = styled.div`
  border-radius: 4px;
  width: ${isMobile ? '300px' : '350px'};
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`

const SubContainer = styled.div`
  margin-left: 0px;
  padding-bottom: 20px;
`

const zeroAddress = '0x0000000000000000000000000000000000000000'

const StyledTitle = styled.h2`
  font-size: 24px;
  color: transparent !important;
  background: linear-gradient(9deg, rgb(255, 255, 255) 0%, rgb(138, 212, 249) 100%) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  margin: 0;
  padding: 0;
  font-weight: 600;
`

const HeaderFlex = styled(Flex)`
  width: 100%;
  padding: 24px;
  border-bottom: 1px solid #3c3f44;
`

const StyledCardHeader = styled(CardHeader)`
  background: #1b1b1f;
  border-bottom: 1px solid #3c3f44;
  padding: 0;
`;

const HeaderContainer = styled(Flex)`
  width: 100%;
  padding: 24px;
  background: #1b1b1f;
  padding-left: 48px;
`;

const LabelText = styled(Text)`
  font-size: 17px;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 8px;
`;

const SettingsText = styled(Text)`
  padding-bottom: 10px;
  font-size: 17px;
  color: ${({ theme }) => theme.colors.secondary};
`;

const SubtleText = styled(Text)`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const GradientButton = styled(Button)`
  background-image: linear-gradient(9deg, rgb(0, 104, 143) 0%, rgb(138, 212, 249) 100%);
  opacity: ${({ disabled }) => (disabled ? '0.6' : '1')};
  color: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    box-shadow: 0 4px 15px rgba(0, 104, 143, 0.3);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-image: linear-gradient(9deg, rgb(0, 104, 143) 0%, rgb(138, 212, 249) 100%);
    color: white;
    cursor: not-allowed;
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(0, 104, 143, 0.2);
  }
`

const TokenMaker: React.FC = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chain } = useAccount()
  const { toastSuccess, toastError } = useToast()
  const chainId = chain?.id ?? defaultChainId

  const { balance } = useGetBnbBalance(chainId)

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [devFee, setDevFee] = useState('0')
  const [burnFee, setBurnFee] = useState('0')
  const [liqFee, setLiqFee] = useState('0')
  const [marketingWallet, setMWallet] = useState(zeroAddress)
  const [burnToken, setBurnToken] = useState(zeroAddress)
  const createdToken = useRef('')
  const [haveContract, setHaveContract] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [displaySet, setDisplay] = useState(false)
  const [tokenCreateShow, setTokenCreateShow] = useState(true)
  const [perentPresaleValue, setPerentPresaleValue] = useState<number>(49)
  const [scValue, setScValue] = useState<number>(0)

  useEffect(() => {
    setHaveContract(false)
    if (chainId in contracts.tokenFactory) {
      setHaveContract(true)
    }
  }, [chainId])

 

  useEffect(() => {
    const hashParams = new URL(window.location.href).hash.split('?')[1]
    const urlParams = new URLSearchParams(hashParams)
    const token = urlParams.get('token')
    const symbol = urlParams.get('symbol')
    const wallet = urlParams.get('wallet')
    const tax = urlParams.get('tax')
    const auto = urlParams.get('auto')
    const presale = urlParams.get('presale')
    const renounced = urlParams.get('renounced')
    const presale_percentage = urlParams.get('presale_percentage')
    const softcap = urlParams.get('softcap')

    reset()

    if (token) {
      setName(token)
    }
    if (symbol) {
      setSymbol(symbol)
    }

    if (wallet && wallet !="Not specified") {
      setExpertMode(true)
      setEnableTaxes(true)
      setUseDevFee(true)
      setMWallet(wallet as Address)
    }

    if (tax) {
      setDevFee(tax)
    }

    if (auto == 'true') {
      setAiMode(true)
    }
    if (renounced == 'false') {
      changedRenounced(true)
    }
    if (presale == 'true') {
      setPresale(true)
    }
    if (presale_percentage) {
      setPerentPresaleValue(Number(presale_percentage))
    }
    if (softcap) {
      setScValue(Number(softcap))
    }
    setDisplay(true)
  }, [account])

  const [showPresale, setShowPresale] = useState<boolean>(false)
  const [router, setRouter] = useState<Address>()
  const [burnRouter, setBurnRouter] = useState<Address>()
  const [initialSupply, setSupply] = useState('100000000')
  const [owner, setOwner] = useState(zeroAddress)
  const [totalFee, setTotal] = useState(0)
  const [expertMode, setExpertMode] = useState<boolean>(false)
  const [presale, setPresale] = useState<boolean>(false)
  const [renounced, setRenounced] = useState<boolean>(false)
  const [taxesEnabled, setEnableTaxes] = useState<boolean>(false)
  const [myTokens, setMyTokens] = useState<`0x${string}`[]>([])
  const [fee, setFee] = useState('0')

  const [foundDex, setDex] = useState<Dex>()

  useEffect(() => {
    for (const key in dexs) {
      if (dexs[key].chainId === chainId) {
        setDex(dexs[key])
        setRouter(getAddress(dexs[key].router, chainId))
        setBurnRouter(getAddress(dexs[key].router, chainId))
        break
      }
    }
  }, [chainId])

  const { data } = useReadContract({
    abi: tokenMakerAbi,
    address: getAddress(contracts.tokenFactory, chainId),
    functionName: 'createFee',
    chainId,
  })
  
  const [showAllTokens, setShowAllTokens] = useState(false)
  const changeShowAllTokens = () => {
    setShowAllTokens(!showAllTokens)
  }

  const displayedTokens = showAllTokens ? myTokens : myTokens.slice(0, 1)

  useEffect(() => {
    if (data) setFee(data.toString())
  }, [data])

  useEffect(() => {
    if(aiMode)
    createTokenClick()
  }, [aiMode, name, symbol])

  useEffect(() => {
    async function get () {
      if (account) {
        const myTokens = await readContract(config, {
          abi: tokenMakerAbi,
          address: getAddress(contracts.tokenFactory, chainId),
          functionName: 'getMyTokens',
          account,
          chainId,
        })

        setMyTokens(myTokens as `0x${string}`[])
      }
    }
    get()
  }, [account, chainId])

  const [myTokenInfo, setMyTokenInfo] = useState([])

  const validateInput = (value: string) => {
    const containsNonSpaceCharacters = /\S/.test(value);
    return (containsNonSpaceCharacters);
  };

  useEffect(() => {
    async function get () {
      const calls = myTokens.map(token => {
        return {
          abi: ERC20_ABI,
          address: token,
          functionName: 'symbol',
          chainId,
        }
      })
      const symbols = await readContracts(config, { contracts: calls })
      setMyTokenInfo(symbols)
    }
    get()
  }, [myTokens])

  const noName = name === ''
  const noSym = symbol === ''
  const noSupply = initialSupply === '' || new BigNumber(initialSupply).eq(0)
  const noFee = new BigNumber(balance.toString()).lt(fee)
  const noOwner = owner === zeroAddress || (owner.length < 42 && owner === '')
  const noMWallet = new BigNumber(devFee).gt(0) && marketingWallet === zeroAddress
  const noburnToken = new BigNumber(burnFee).gt(0) && burnToken === zeroAddress
  const feeToHigh = new BigNumber(burnFee).plus(devFee).plus(liqFee).gt(20)

  const disableBuying = new BigNumber(balance.toString()).lt(fee) || name === '' || symbol === '' || initialSupply === ('0' || '') || !haveContract || !validateInput(name) || !validateInput(symbol) || router === undefined
  console.log( router)
  const reset = async () => {
    setName('')
    setSymbol('')
    setSupply('100000000')
    setOwner(zeroAddress)
    setMWallet(zeroAddress)
    setDevFee('0')
    setLiqFee('0')
    setBurnToken('0')
    setExpertMode(false)
    changeUseBurn(false)
    changeEnableTaxes(false)
    changedRenounced(false)
  }

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

  const handleChangRouter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setRouter(value as Address)
  }
  const handleChangeQueryDevFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setDevFee(value)
    setTotal(new BigNumber(value).plus(liqFee).plus(burnFee).toNumber())
  }
  const handleChangeQueryLiqFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target

    if (/^\d*$/.test(value)) {
      setLiqFee(value);
    }
   
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

  const changeExpertMode = () => {
    setExpertMode(!expertMode)
    changeUseBurn(false)
    changeEnableTaxes(false)
    changedRenounced(false)
  }

  const changePresale = () => {
    setPresale(!presale)
  }

  const changedRenounced = value => {
    setRenounced(value)
    if (value) setOwner(account ?? zeroAddress)
    else setOwner(zeroAddress)
  }

  const changeEnableTaxes = value => {
    setEnableTaxes(value)
    changeUseDex(false)
    changeUseLiqFee(false)
    changeUseDevFee(false)
  }

  const [useBurn, setUseBurn] = useState(false)
  const changeUseBurn = value => {
    setUseBurn(value)
    setBurnFee('0')
    setBurnToken(zeroAddress)
    setTotal(new BigNumber(0).plus(devFee).plus(liqFee).toNumber())
  }

  const [useLiqFee, setUseLiqFee] = useState(false)
  const changeUseLiqFee = value => {
    setUseLiqFee(value)
    setLiqFee('0')
    setTotal(new BigNumber(burnFee).plus(devFee).plus(0).toNumber())
  }

  const [useDevFee, setUseDevFee] = useState(false)
  const changeUseDevFee = value => {
    setUseDevFee(value)
    setDevFee('0')
    setMWallet(zeroAddress)
    setTotal(new BigNumber(burnFee).plus(0).plus(liqFee).toNumber())
  }

  const [useDifDex, setUseDifDex] = useState(false)
  const changeUseDex = value => {
    setUseDifDex(value)
    setRouter(getAddress(foundDex?.router, chain?.id))
  }

  const [createdTokenFinished, setCreatedToken] = useState(false)


  const onClickConfirm = async () => {
    const dev = new BigNumber(devFee).multipliedBy(100).toFixed(0)
    const burn = new BigNumber(burnFee).multipliedBy(100).toFixed(0)
    const liq = new BigNumber(liqFee).multipliedBy(100).toFixed(0)

    console.log(name, symbol, dev, burn, liq, router, marketingWallet, burnToken, burnRouter, initialSupply, owner, fee)
    let requestCall
    if(expertMode){
      const { request } = await simulateContract(config, {
        abi: tokenMakerAbi,
        address: getAddress(contracts.tokenFactory, chainId),
        functionName: 'createToken',
        args: [name, symbol, dev, burn, liq, router, marketingWallet, burnToken, burnRouter, initialSupply, owner],
        value: BigInt(fee),
        chainId,
      })
      requestCall = request
    } else {
      const { request } = await simulateContract(config, {
        abi: tokenMakerAbi,
        address: getAddress(contracts.tokenFactory, chainId),
        functionName: 'createStandardToken',
        args: [name, symbol, initialSupply, owner],
        chainId,
      })
      requestCall = request
    }


    try {
      
      const hash = await writeContract(config, requestCall)
      let receipt
      receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
      if (receipt.status) {

        const myTokens = await readContract(config, {
          abi: tokenMakerAbi,
          address: getAddress(contracts.tokenFactory, chainId),
          functionName: 'getMyTokens',
          account,
          chainId,
        })
        createdToken.current = myTokens[myTokens.length - 1]
        const tokenAddress = createdToken.current
      
        setCreatedToken(true)
       // onPresentCreatedTokenModal()

        if (presale) {
          setTokenCreateShow(false)
          setShowPresale(true)
        }
      } else {
        toastError('Error', 'Transaction failed to go through, check Gas! ( increase limit? )')
      }
    } catch {
      toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
    }
  }

  useEffect(() => {
    if(createdToken.current!='')
      onPresentCreatedTokenModal()
  }, [createdTokenFinished])



  const [onPresentCreatedTokenModal] = useModal(
    <CreatedTokenModal
      address={createdToken.current}
    />
  );



  const createTokenClick = () => {
    onPresentConfirmModal()
  }


  const handleConfirm = (confirmed: boolean) => {
    if(confirmed)
      {
      onClickConfirm()
      }
  };

  const [onPresentConfirmModal] = useModal(
    <ConfirmTokenCreation
      account={account}
      info={{
        name,
        symbol,
        initialSupply,
        taxesEnabled,
        useDevFee,
        devFee,
        useBurn,
        burnFee,
        burnToken,
        useLiqFee,
        liqFee,
        useDifDex,
        presale,
        renounced,
        marketingWallet,
      }}
      onConfirm={handleConfirm}
    />,
  )

  return (
    <Page>
      {!displaySet ? null : (
        <>
          <div className="forge-heading" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3>Build your customized token</h3>
            <h4>
              Ownership &nbsp;&nbsp;|&nbsp;&nbsp; Tax &nbsp;&nbsp;|&nbsp;&nbsp; Burn &nbsp;&nbsp;|&nbsp;&nbsp; Presale
            </h4>
          </div>

          <AppBody>
            {/* <StyledCardHeader>
              <HeaderContainer flexDirection="column" alignItems="flex-start" justifyContent="flex-start" style={{ paddingLeft: '32px' }}>
                <StyledTitle>Token Builder</StyledTitle>
              </HeaderContainer>
            </StyledCardHeader> */}

            <Wrapper>
              <CustomBodyWrapper>
                {!tokenCreateShow ? null :
                <>
                <GridContainer
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Tile>
                    <Flex alignItems='flex-start'>
                      <LabelText>{t('Token Name')}</LabelText>
                    </Flex>
                    <SearchInput starting={name} onChange={handleChangeQueryName} placeholder='Enter Token Name' />
                  </Tile>

                  <Tile>
                    <Flex alignItems='flex-start'>
                      <LabelText>{t('Token Symbol')}</LabelText>
                    </Flex>
                    <SearchInput starting={symbol} onChange={handleChangeQuerySymbol} placeholder='Enter Symbol' />
                  </Tile>

                  <Tile>
                    <Flex alignItems='flex-start'>
                      <LabelText>{t('Initial Supply')}</LabelText>
                    </Flex>
                    <NumberInput
                      onChange={handleChangeQuerySupply}
                      placeholder='Enter Token Total Supply'
                      startingNumber={initialSupply}
                    />
                  </Tile>

                </GridContainer>



                <Flex mt='20px' mb='20px' justifyContent='center'>
                  <TileText>
                    <SettingsText>Default Settings:</SettingsText>
                    <Text style={{ paddingBottom: 8 }}>✓ Renounced Ownership</Text>
                    <Text style={{ paddingBottom: 8 }}>✓ 0% Tax</Text>
                    <Text style={{ paddingBottom: 16 }}>{`✓ Dex: ${foundDex?.id}`}</Text>
                    <ToggleWrapper>
                      <Flex alignItems='center' width="100%">
                        <Toggle checked={expertMode} onChange={() => changeExpertMode()} scale='sm' />
                        <TextSwitchLabel style={{ marginLeft: '8px' }}>Enable Expert Mode</TextSwitchLabel>
                      </Flex>
                    </ToggleWrapper>

                    {expertMode && (
                      <>
                        <ToggleWrapper>
                          <Flex alignItems='center' width="100%">
                            <Toggle checked={renounced} onChange={() => changedRenounced(!renounced)} scale='sm' />
                            <TextSwitchLabel style={{ marginLeft: '8px' }}>Don't Renounce</TextSwitchLabel>
                          </Flex>
                        </ToggleWrapper>

                        {renounced && (
                          <Tile>
                            <Flex alignItems='flex-start' mt='30px'>
                              <Text color={noOwner ? 'textSubtle' : 'textSubtle'}>{t('Owner Of Token:')}</Text>
                            </Flex>
                            <SearchInput onChange={handleChangeQueryOwner} placeholder='Owner' starting={owner} />
                          </Tile>
                        )}

                        <ToggleWrapper>
                          <Flex alignItems='center' width="100%">
                            <Toggle checked={taxesEnabled} onChange={() => changeEnableTaxes(!taxesEnabled)} scale='sm' />
                            <TextSwitchLabel style={{ marginLeft: '8px' }}>Taxes</TextSwitchLabel>
                          </Flex>
                        </ToggleWrapper>

                        {taxesEnabled && (
                          <>
                            <Tile>
                              <ToggleWrapper>
                                <Flex mt='20px' flexDirection='row'>
                                  <Toggle checked={useDevFee} onChange={() => changeUseDevFee(!useDevFee)} scale='sm' />
                                  <TextSwitchLabel>Marketing fee</TextSwitchLabel>
                                </Flex>
                              </ToggleWrapper>
                            </Tile>

                            {useDevFee && (
                              <>
                                <SubContainer>
                                  <Tile>
                                    <Flex alignItems='flex-start'>
                                      <Text color={noMWallet ? 'textSubtle' : 'textSubtle'}>
                                        {t('Marketing Wallet:')}
                                      </Text>
                                    </Flex>
                                    <SearchInput
                                      onChange={handleChangeQueryMWallet}
                                      placeholder='Marketing'
                                      starting={marketingWallet}
                                    />
                                  </Tile>

                                  <Tile>
                                    <Flex alignItems='flex-start'>
                                      <Text>{t('Marketing Wallet Fee %:')}</Text>
                                    </Flex>
                                    <NumberInput
                                      onChange={handleChangeQueryDevFee}
                                      placeholder='Enter % for Marketing'
                                      startingNumber={devFee}
                                    />
                                  </Tile>
                                </SubContainer>
                              </>
                            )}

                            <Tile>
                              <ToggleWrapper>
                                <Flex mt='0px' flexDirection='row'>
                                  <Toggle checked={useLiqFee} onChange={() => changeUseLiqFee(!useLiqFee)} scale='sm' />
                                  <TextSwitchLabel>Liquidity Fee</TextSwitchLabel>
                                </Flex>
                              </ToggleWrapper>
                            </Tile>

                            {useLiqFee && (
                              <>
                                <SubContainer>
                                  <Tile>
                                    <Flex alignItems='flex-start'>
                                      <Text>{t('Liquidity Fee %:')}</Text>
                                    </Flex>
                                    <NumberInput
                                      onChange={handleChangeQueryLiqFee}
                                      placeholder='Enter % for Liquidity'
                                      startingNumber={liqFee}
                                    />
                                  </Tile>
                                </SubContainer>
                              </>
                            )}

                            <Tile>
                              <ToggleWrapper>
                                <Flex mt='0px' mb='0px' flexDirection='row'>
                                  <Toggle checked={useDifDex} onChange={() => changeUseDex(!useDifDex)} scale='sm' />
                                  <TextSwitchLabel>Use a different DEX</TextSwitchLabel>
                                </Flex>
                              </ToggleWrapper>
                            </Tile>

                            {useDifDex && (
                              <>
                                <SubContainer>
                                  <Tile>
                                    <Flex alignItems='flex-start'>
                                      <Text color={noMWallet ? 'textSubtle' : 'textSubtle'}>
                                        {t('Router Address:')}
                                      </Text>
                                    </Flex>
                                    <SearchInput
                                      onChange={handleChangRouter}
                                      placeholder='Router Address'
                                      starting={router}
                                    />
                                  </Tile>
                                </SubContainer>
                              </>
                            )}
                          </>
                        )}

                        <ToggleWrapper>
                          <Flex alignItems='center' width="100%">
                            <Toggle checked={useBurn} onChange={() => changeUseBurn(!useBurn)} scale='sm' />
                            <TextSwitchLabel style={{ marginLeft: '8px' }}>Burn A Token</TextSwitchLabel>
                          </Flex>
                        </ToggleWrapper>

                        {useBurn && (
                          <>
                            <SubContainer>
                              <Tile>
                                <Flex mt='0px' alignItems='flex-start'>
                                  <Text>{t('Burn Fee %:')}</Text>
                                </Flex>
                                <NumberInput
                                  onChange={handleChangeQueryBurnFee}
                                  placeholder='Enter % for Burn Token'
                                  startingNumber={burnFee}
                                />
                              </Tile>

                              <Tile>
                                <Flex alignItems='flex-start'>
                                  <Text color={noburnToken ? 'textSubtle' : 'textSubtle'}>{t('Burn Token:')}</Text>
                                </Flex>
                                <SearchInput
                                  onChange={handleChangeQueryBurnToken}
                                  placeholder='Enter Token Address to Burn'
                                />
                              </Tile>

                              <Tile>
                                <Flex alignItems='flex-start'>
                                  <Text color={!burnRouter ? 'textSubtle' : 'textSubtle'}>{t('Burn Router:')}</Text>
                                </Flex>
                                <SearchInput
                                  onChange={handleChangeQueryBurnRouter}
                                  placeholder='Burn Router'
                                  starting={burnRouter}
                                />
                              </Tile>
                            </SubContainer>
                          </>
                        )}
                      </>
                    )}

                    <ToggleWrapper className="presale-toggle">
                      <Flex alignItems='center' width="100%">
                        <Toggle checked={presale} onChange={() => changePresale()} scale='sm' />
                        <TextSwitchLabel style={{ marginLeft: '8px' }}>Launch presale</TextSwitchLabel>
                      </Flex>
                    </ToggleWrapper>
                  </TileText>
                </Flex>

                <Flex mt='20px' mb='20px' justifyContent='center' flexDirection="column" alignItems="center">
                  <Flex flexDirection='row' alignItems='center' justifyContent='center' mb="16px">
                    <TextHeader>
                      CREATE TOKEN FEE:
                    </TextHeader>
                    {haveContract && (
                      <TextHeader color='primary' fontSize='14px'>{` ${parseFloat(new BigNumber(expertMode ? fee : "0").shiftedBy(-18).toFixed(5))} ${
                        chain?.nativeCurrency.symbol ?? "CRO"
                      }`}</TextHeader>
                    )}
                  </Flex>
                  <GradientButton onClick={createTokenClick} disabled={disableBuying}>
                    Create Token
                  </GradientButton>
                </Flex>
                </>
        }


                {!showPresale ? null : (
                  <BorderContainer>
                    <NewPresale
                      tokenAddress={createdToken.current as Address}
                      chainId={chainId}
                      percentageTokensIn={new BigNumber(perentPresaleValue)}
                      softcapIn={scValue}
                    />
                  </BorderContainer>
                )}

                <GridContainer
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ActionContainer>
                    {myTokens.length > 0 && (
                      <Flex flexDirection='column' justifyContent='flex-end'  mt='20px' mb='20px' width='100%'>
                        <Flex mb="20px" alignItems='center' justifyContent='center'>
                          <Heading color='secondary' scale='md'>
                            Your Tokens
                          </Heading>
                        </Flex>

                        {displayedTokens.map((token, index) => (
                          <Flex alignItems='center' justifyContent='center' flexDirection='row' key={index}>
                            {myTokenInfo && myTokenInfo[index]?.status === 'success' && (
                              <Text
                                color='secondary'
                                bold
                                fontSize='14px'
                                mr='14px'
                              >{`(${myTokenInfo[index]?.result})`}</Text>
                            )}
                            <LinkExternal small href={`${chain?.blockExplorers?.default?.url}/token/${token}`} mr='16px'>
                              {isMobile ? `${token.slice(0, 14)}` : `${token.slice(0, 12)}...${token.slice(-12)}`}
                            </LinkExternal>
                            <CopyAddress account={token} logoOnly={true} />
                          </Flex>
                        ))}

                        {myTokens.length > 1 && (
                          <Flex justifyContent='center'>
                            <Link
                              onClick={changeShowAllTokens}
                              mt='10px'
                              style={{ cursor: 'pointer', textDecoration: 'none' }}
                            >
                              {showAllTokens ? t('Show Less') : t('Show More')}
                            </Link>
                          </Flex>
                        )}
                      </Flex>
                    )}
                  </ActionContainer>
                </GridContainer>
              </CustomBodyWrapper>
            </Wrapper>
          </AppBody>

          <div className="forge-heading" style={{ marginTop: '24px' }}>
            <h4>Use  <a href="#/marshot"><GiThorHammer size={26} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Flash Forge</a> to create a PumpFun-style token.</h4>
          </div>
        </>
      )}
    </Page>
  )
}

export default TokenMaker
