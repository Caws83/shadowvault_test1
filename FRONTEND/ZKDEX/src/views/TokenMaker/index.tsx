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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 8px;
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
  margin-left: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  background-color: 'white';
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
        <AppBody>
          <CardHeader>
            <Flex flexDirection='row' alignItems='center' justifyContent='flex-end' mr='8px'>
            <TextHeader>
              CREATE TOKEN FEE:
            </TextHeader>
              {haveContract && (
                <TextHeader color='primary' fontSize='14px'>{` ${parseFloat(new BigNumber(expertMode ? fee : "0").shiftedBy(-18).toFixed(5))} ${
                  chain?.nativeCurrency.symbol ?? "CRO"
                }`}</TextHeader>
              )}
            </Flex>
          </CardHeader>

          <Wrapper>
            <CustomBodyWrapper>
              {!tokenCreateShow ? null :
              <>
              <GridContainer
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <Tile>
                  <Flex alignItems='flex-start'>
                    <Text color={noName ? 'textSubtle' : 'textSubtle'}>{t('Token Name:')}</Text>
                  </Flex>
                  <SearchInput starting={name} onChange={handleChangeQueryName} placeholder='Enter Token Name' />
                </Tile>

                <Tile>
                  <Flex alignItems='flex-start'>
                    <Text color={noSym ? 'textSubtle' : 'textSubtle'}>{t('Token Symbol:')}</Text>
                  </Flex>
                  <SearchInput starting={symbol} onChange={handleChangeQuerySymbol} placeholder='Enter Symbol' />
                </Tile>

                <Tile>
                  <Flex alignItems='flex-start'>
                    <Text color={noSupply ? 'textSubtle' : 'textSubtle'}>{t('Initial Supply:')}</Text>
                  </Flex>
                  <NumberInput
                    onChange={handleChangeQuerySupply}
                    placeholder='Enter Token Total Supply'
                    startingNumber={initialSupply}
                  />
                </Tile>

              </GridContainer>
              <>
                <Flex mt='30px' mb='20px' alignItems='center' justifyContent='center'>
                  <Heading color='secondary' scale='md'>
                    Additional Options
                  </Heading>
                </Flex>

                <ToggleWrapper>
                  <Flex alignItems='flex-start' mt='20px'>
                    <Toggle checked={expertMode} onChange={() => changeExpertMode()} scale='sm' />
                    <TextSwitchLabel>Expert Mode</TextSwitchLabel>
                  </Flex>
                </ToggleWrapper>

          

                {!expertMode ? null : (
                  <>
                    <GridContainer
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      

                      <Tile>
                        <ToggleWrapper>
                          <Flex mt='20px'>
                            <Toggle checked={renounced} onChange={() => changedRenounced(!renounced)} scale='sm' />
                            <TextSwitchLabel>Don't Renounce</TextSwitchLabel>
                          </Flex>
                        </ToggleWrapper>

                        {!renounced ? null : (
                          <Tile>
                            <Flex alignItems='flex-start' mt='30px'>
                              <Text color={noOwner ? 'textSubtle' : 'textSubtle'}>{t('Owner Of Token:')}</Text>
                            </Flex>
                            <SearchInput onChange={handleChangeQueryOwner} placeholder='Owner' starting={owner} />
                          </Tile>
                        )}

                        <Tile>
                          <ToggleWrapper>
                            <Flex mt='20px' flexDirection='row'>
                              <Toggle
                                checked={taxesEnabled}
                                onChange={() => changeEnableTaxes(!taxesEnabled)}
                                scale='sm'
                              />
                              <TextSwitchLabel>Taxes</TextSwitchLabel>
                            </Flex>
                          </ToggleWrapper>
                        </Tile>
                        {!taxesEnabled ? null : (
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
                                  <Tile >
                                    <Flex alignItems='flex-start'>
                                      <Text>{t('Liquidity Fee %:')}</Text>
                                    </Flex>
                                    <NumberInput
                                      onChange={handleChangeQueryLiqFee}
                                      placeholder='Enter % for Liquidity'
                                      startingNumber='0'
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
                          <Flex mt='10px' flexDirection='row'>
                            <Toggle checked={useBurn} onChange={() => changeUseBurn(!useBurn)} scale='sm' />
                            <TextSwitchLabel>Burn A Token</TextSwitchLabel>
                          </Flex>
                        </ToggleWrapper>
                      </Tile>

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
                                startingNumber='0'
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
                    </GridContainer>
                  </>
                )}
                      <ToggleWrapper>
                  <Flex alignItems='flex-start' mt='20px'>
                    <Toggle checked={presale} onChange={() => changePresale()} scale='sm' />
                    <TextSwitchLabel>Launch presale</TextSwitchLabel>
                  </Flex>
                </ToggleWrapper>
              </>

              {expertMode ? null : (
                <Flex mt='20px' mb='0px'>
                  <TileText>
                    <Text style={{ paddingBottom: 10 }}>Non-expert mode uses the following as defaults:</Text>
                    <Text>- Renounced </Text>
                    <Text>- 0% Tax</Text>
                    <Text>{`- Dex: ${foundDex?.id}`}</Text>
                  </TileText>
                </Flex>
              )}

              <Flex mt='20px' mb='20px' justifyContent='center'>
                <Button onClick={createTokenClick} disabled={disableBuying}>
                  Create Token
                </Button>
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
      )}
    </Page>
  )
}

export default TokenMaker
