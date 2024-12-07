import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Text, Flex, useTooltip, Toggle, useModal, Button, Heading, Slider } from 'uikit'
import useTheme from 'hooks/useTheme'
import { useTranslation } from 'contexts/Localization'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import SearchInput from 'components/SearchInput/SearchInput'
import NumberInput from 'components/NumberInput/NumberInput'
import { DatePicker } from 'components/DatePicker'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import DexSelector from 'components/DexSelector/DexSelector'
import ConfirmCreate from './newSaleConfirm'
import { useAccount, useReadContracts } from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import { IFOFactoryAbiV3 } from 'config/abi/IFOFactoryV3'
import contracts from 'config/constants/contracts'
import { Dex } from 'config/constants/types'
import { useUserDex } from 'state/user/hooks'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { Address } from 'viem'
import { addDays, addHours } from 'date-fns'
import { isMobile } from 'components/isMobile'

import { TokenImageIFO } from 'components/TokenImage'

interface CreateModalProps {
  tokenAddress: Address
  chainId: number
  percentageTokensIn: BigNumber
  softcapIn: number
  aiModeIn?: boolean
  resetTokenAddress?: () => void;
  onDismiss?: () => void
}

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
`
const BorderContainer = styled.div``

const Tile = styled.div`
  border-radius: 4px;
  width: ${isMobile ? '300px' : '350px'};
  display: flex;
  flex-direction: column;
  padding-bottm: 10px;
`

const TileText = styled.div`
  border-radius: 4px;
  width: ${isMobile ? '300px' : '350px'};
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`

const NewPresale: React.FC<CreateModalProps> = ({ tokenAddress, chainId, percentageTokensIn, softcapIn, aiModeIn, resetTokenAddress }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { balance: balanceRaw } = useGetBnbBalance(chainId)
  const balance = new BigNumber(balanceRaw.toString())
  const { chain } = useAccount()
  const [dex, setDex] = useUserDex()
  const [localDex, setLocalDex] = useState<Dex>(dex)
  const [fee, setFee] = useState(new BigNumber(0))
  const [feeOfSales, setFeeOfSales] = useState(new BigNumber(0))
  const [supply, setSupply] = useState(new BigNumber(0))
  const addy = getAddress(contracts.ifoFactoryV3, chainId) as Address

  const [expertMode, setExpertMode] = useState<boolean>(false)

  const [socialsEnabled, setSocialsEnabled] = useState<boolean>(false)

  const { data } = useReadContracts({
    contracts: [
      {
        abi: IFOFactoryAbiV3,
        address: addy,
        functionName: 'subFee',
        chainId,
      },
      {
        abi: IFOFactoryAbiV3,
        address: addy,
        functionName: 'marsFee',
        chainId,
      },
      { abi: ERC20_ABI, address: tokenAddress, functionName: 'symbol', chainId },
      { abi: ERC20_ABI, address: tokenAddress, functionName: 'decimals', chainId },
      { abi: ERC20_ABI, address: tokenAddress, functionName: 'name', chainId },
      { abi: ERC20_ABI, address: tokenAddress, functionName: 'totalSupply', chainId },
      {
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: 'balanceOf',
        args: [account],
        chainId,
      },
    ],
  })

  useEffect(() => {
    try {
      if (data && data[0].status === 'success') {
        setFee(new BigNumber(data[0]?.result.toString()))
        setFeeOfSales(new BigNumber(data[1]?.result.toString()))

        setSym(data[2]?.result as string)
        setDec(new BigNumber(data[3]?.result.toString()).toNumber())
        setName(data[4]?.result as string)
        setSupply(new BigNumber(data[5]?.result.toString()))
        setCBalance(new BigNumber(data[6]?.result.toString()))
      }
    } catch (e) {
      console.log(e)
    }
  }, [data])

  const TooltipComponent = () => (
    <>
      <Text mb='16px'>{t('Create A New PreSale for your Token!')}</Text>
      <Text mb='16px'>{t('You can create a locker for your Token. See below for more details.')}</Text>
      <Text style={{ fontWeight: 'bold' }}>
        {t('There is a cost of %fee% %symbol% for creating a presale. There is a %feeOfSales%% commission taking on the amount raised.', {
          fee: fee.shiftedBy(-18).toFixed(0),
          feeOfSales: feeOfSales.dividedBy(10).toNumber(),
          symbol: chain?.nativeCurrency.symbol ?? "CRO",
        })}
      </Text>
    </>
  )

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom',
    tooltipPadding: { right: 15 },
  })

  const now = new Date()
  const nowPlus1Hour = addHours(now, 1)
  const nowPlus7Days = addDays(now, 7)

  const [tokenAmount, setAmount] = useState(new BigNumber(0))
  const [tokenAmountBasic, setAmountBasic] = useState(new BigNumber(0))
  const [tokenGoalBasic, setGoalBasic] = useState(new BigNumber(softcapIn).shiftedBy(18).multipliedBy(2))
  const [tokenLimitBasic, setLimitBasic] = useState(new BigNumber(softcapIn).shiftedBy(18).dividedBy(10))
  const [devWallet, setDev] = useState(account ?? '')
  const [startDate, setStart] = useState<Date>(nowPlus1Hour)
  const [endDate, setEnd] = useState<Date>(nowPlus7Days)
  const [softCap, setSC] = useState(new BigNumber(softcapIn).shiftedBy(18))
  const [hardCap, setHC] = useState(new BigNumber(softcapIn).shiftedBy(18).multipliedBy(2))
  const [socials, setSocials] = useState<string[]>(['', '', '', '', '']) // logo, website, banner, telegram, twitter

  const [LPPercent, setLPPercent] = useState(80)
  const [listingPrice, setListingPrice] = useState(new BigNumber(0))
  const [lockDays, setLockDays] = useState(0)
  const [router, setRouter] = useState<Address>(getAddress(dex.router, dex.chainId))

  const [salePrice, setSalePrice] = useState(new BigNumber(0))
  const [tokensForLP, setTokensForLp] = useState(new BigNumber(0))


  useEffect(() => {
    const feeToTake = tokenGoalBasic.multipliedBy(feeOfSales).dividedBy(1000)
    const bnbForLiquidity = tokenGoalBasic.minus(feeToTake).multipliedBy(LPPercent).dividedBy(100)
    setTokensForLp(listingPrice.shiftedBy(-cDec).multipliedBy(bnbForLiquidity))
    setAmount(listingPrice.shiftedBy(-cDec).multipliedBy(bnbForLiquidity).plus(tokenAmountBasic))
  }, [LPPercent, listingPrice, tokenAmountBasic, tokenGoalBasic])

  useEffect(() => {
    if (tokenAmountBasic.isGreaterThan(0) && tokenGoalBasic.isGreaterThan(0)) {
      setSalePrice(tokenAmountBasic.dividedBy(tokenGoalBasic).shiftedBy(cDec))
      setListingPrice(tokenAmountBasic.dividedBy(tokenGoalBasic).shiftedBy(cDec))
    }
  }, [tokenAmountBasic, tokenGoalBasic])

  useEffect(() => {
    const tokenAmount = new BigNumber(supply.dividedBy(100)).multipliedBy(percent)
    const amount = new BigNumber(tokenAmount)

    setAmountBasic(amount)
  }, [supply])


  const [cBalance, setCBalance] = useState(new BigNumber(0))
  const [cSym, setSym] = useState('')
  const [cDec, setDec] = useState(18)
  const [cName, setName] = useState('')

  const [useLP, setUseLP] = useState(true)
  const [burnLP, setBurnLP] = useState(true)

  const [logo, setLogo] = useState('')
  const [website, setWebsite] = useState('')
  const [banner, setBanner] = useState('')
  const [twitter, setTwitter] = useState('')
  const [telegram, setTelegram] = useState('')

  const onHandleDexChange = (newDex: Dex) => {
    if (localDex !== newDex) {
      setLocalDex(newDex)
      setRouter(getAddress(newDex.router, newDex.chainId))
    }
    if (dex !== newDex) {
      setDex(newDex)
    }
  }
  const wbonePrice = useGetWcicPrice(localDex)

  // const wbonePrice = useGetWcicPrice(dexs.marswap)
  const createPreSaleClick = () => {
    setSocials([logo, website, banner, telegram, twitter])
    onPresentConfirmModal()
  }

  const [onPresentConfirmModal] = useModal(
    <ConfirmCreate
      account={account}
      bonePrice={wbonePrice}
      boneBalance={balance}
      dex={localDex}
      info={{
        tokenAddress,
        cBalance,
        cSym,
        cDec,
        cName,
        tokenAmount,
        tokenAmountBasic,
        tokenGoalBasic,
        tokenLimitBasic,
        devWallet,
        startDate,
        endDate,
        softCap,
        hardCap,
        fee,
        feeOfSales,
        LPPercent,
        burnLP,
        listingPrice,
        salePrice,
        lockDays,
        router,
        socials
      }}
      resetTokenAddress={resetTokenAddress}
    />,
  )

  const handleChangeQueryGoalBasic = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = new BigNumber(event.target.value).shiftedBy(18)
    setGoalBasic(amount)
    setHC(amount)
  }

  const handleChangeQueryLimitBasic = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = new BigNumber(event.target.value).shiftedBy(18)
    setLimitBasic(amount)
  }

  const handleChangeQueryDev = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDev(event.target.value)
  }
  const handleDateChangeStart = newDate => {
    setStart(newDate)
  }
  const handleDateChangeEnd = newDate => {
    setEnd(newDate)
  }
  const handleChangeQuerySoft = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = new BigNumber(event.target.value).shiftedBy(18)
    console.log(amount)
    setSC(amount)

    if (!expertMode) {
      const now = new Date()
      const nowPlus1Hour = addHours(now, 1)
      const nowPlus7Days = addDays(now, 7)
      setStart(nowPlus1Hour)
      setEnd(nowPlus7Days)

      const softCapNumber = new BigNumber(amount)
      const userLimit = softCapNumber.dividedBy(10)
      setLimitBasic(userLimit)
      const hc = softCapNumber.multipliedBy(2)
      setHC(hc)
      setGoalBasic(hc)
      setDev(account)
      setLPPercent(Number(80))
    }
  }

  const handleChangeLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogo(event.target.value)
  }

  const handleChangeBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBanner(event.target.value)
  }

  const handleChangeWebsite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWebsite(event.target.value)
  }

  const handleChangeTwitter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwitter(event.target.value)
  }

  const handleChangeTelegram = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTelegram(event.target.value)
  }

  const handleChangeQueryLockDays = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLockDays(Number(event.target.value))
  }

  const handleChangeQueryAutoLPPercent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLPPercent(Number(event.target.value))
  }

  const changBurnLP = value => {
    setBurnLP(value)
    setLockDays(0)
  }

  const changeUseLP = value => {
    if (value) {
      setLPPercent(80)
      setListingPrice(tokenAmountBasic.dividedBy(tokenGoalBasic).shiftedBy(cDec))
      setLockDays(0)
      setBurnLP(true)
    } else {
      setLPPercent(0)
      setListingPrice(new BigNumber(0))
      setLockDays(0)
      setBurnLP(false)
    }
    setUseLP(value)
  }

  const changeExpertMode = () => {
    changBurnLP(true)
    changeUseLP(true)
    setExpertMode(!expertMode)
    setStart(nowPlus1Hour)
    setEnd(nowPlus7Days)

    const softCapNumber = new BigNumber(softCap)
    const userLimit = softCapNumber.dividedBy(10)
    setLimitBasic(userLimit)
    const hc = softCapNumber.multipliedBy(2)
    setHC(hc)
    setGoalBasic(hc)
    setDev(account)
    setLPPercent(Number(80))
  }

  const changeSocial = () => {
    setSocialsEnabled(!socialsEnabled)
  }

  const tokenAmountError = cBalance.lt(tokenAmount) || tokenAmount.isNaN() || tokenAmount.eq(0)
  const hardSoftError = !softCap.gt(0)
  const lpPercentError = LPPercent > 99 || (LPPercent < 51 && LPPercent !== 0)
  const useLPPercentError = useLP && LPPercent === 0
  const endError = !endDate || endDate <= startDate
  const startError = !startDate || endDate <= startDate
  const walletError = devWallet === undefined || devWallet === ''
  const dexError = localDex?.chainId !== chainId
  const routerError = router !== getAddress(localDex.router, chainId)

  const [percent, setPercent] = useState(percentageTokensIn)

  const isDisabledInNormalMode = () => {
    return new BigNumber(balance).lt(fee) || hardSoftError || percent===new BigNumber(0)
  }
  const isDisabledInExpertMode = () => {
    return (
      new BigNumber(balance).lt(fee) ||
      tokenAmountError ||
      startError ||
      endError ||
      hardSoftError ||
      lpPercentError ||
      useLPPercentError ||
      walletError ||
      dexError ||
      routerError ||
      percent===new BigNumber(0)
    )
  }

  const isDisabled = expertMode ? isDisabledInExpertMode() : isDisabledInNormalMode()
  const [preSaleDiscountPercent, setPreSaleDiscountePrcent] = useState(0)

  const handleChangePercent = (sliderPercent: number) => {
    setPercent(new BigNumber(sliderPercent))
    const tokenAmount1 = new BigNumber(supply.dividedBy(100)).multipliedBy(sliderPercent)
    console.log(tokenAmount1.toString())
    setAmountBasic(tokenAmount1)
    setAmount(tokenAmount1.plus(tokensForLP))
  }

  const handleChangePercentPresaleDiscount = (sliderPercent: number) => {
    setPreSaleDiscountePrcent(sliderPercent)
    const presalePricePercentValue = new BigNumber(salePrice.dividedBy(100)).multipliedBy(sliderPercent)
    const presalePrice = salePrice.minus(presalePricePercentValue)
    console.log(presalePricePercentValue, presalePrice, salePrice)
    setListingPrice(presalePrice)
  }

console.log(router)
  return (
    <BorderContainer>
      {tooltipVisible && tooltip}

      {cBalance && (
        <>
          <Flex mt='10px' alignItems='flex-start' justifyContent='space-between' flexDirection='row'>
            <Text>{t(`Token Balance:`)}</Text>
            <Text color='primary'>{`${cBalance
              .shiftedBy(-cDec)
              .toNumber()
              .toLocaleString('en-US', { maximumFractionDigits: 2 })} ${cSym}`}</Text>
          </Flex>
          <Flex mt='10px' alignItems='flex-start' justifyContent='space-between' flexDirection='row'>
            <Text>{t(`Total Supply:`)}</Text>
            <Text color='primary'>{`${supply
              .shiftedBy(-cDec)
              .toNumber()
              .toLocaleString('en-US', { maximumFractionDigits: 2 })} ${cSym}`}</Text>
          </Flex>
          
          <Flex mt='30px' mb='20px' alignItems='center' justifyContent='center'>
            <Heading color='secondary' scale='md'>
              Presale Options
            </Heading>
          </Flex>

          <Flex mb='10px' alignItems='flex-start' justifyContent='space-between' flexDirection='row'>
            <Text>{t(`Choose Dex:`)}</Text>
            <DexSelector newDex={localDex} UpdateDex={onHandleDexChange} hideChain={true} />
          </Flex>
       
            <Flex justifyContent='space-between'>
              <Flex flexDirection='row'>
                <Text style={{ fontSize: 12, paddingBottom: 10, paddingTop: 20 }} color='textSubtle'>
                  {t(`Percentage For PreSale:`)}
                </Text>
              </Flex>
            </Flex>
            <Slider
              min={10}
              max={90}
              value={percent.toNumber()}
              onValueChanged={handleChangePercent}
              name='Percentage For PreSale'
              valueLabel={`${percent}%`}
              step={1}
            />
     
          <Flex mt='10px' alignItems='flex-start' justifyContent='space-between' flexDirection='row'>
            <Text>{t(`Tokens Needed:`)}</Text>
            <Text   style={{ fontSize: 12 }}
  color={tokenAmountError ? 'failure' : 'textSubtle'} >{`${tokenAmount
              .shiftedBy(-cDec)
              .toNumber()
              .toLocaleString('en-US', { maximumFractionDigits: 2 })} ${cSym}`}</Text>
          </Flex>
     
            <Flex justifyContent='space-between'>
              <Flex flexDirection='row'>
                <Text style={{ fontSize: 12, paddingTop: 20 }} color='textSubtle'>
                  {t('Min Target Amount (Softcap): %symbol%', {symbol: chain.nativeCurrency.symbol ?? "CRO"})}
                </Text>
              </Flex>
              {hardSoftError && (
                <Text style={{ fontSize: 10, paddingBottom: 10, paddingTop: 20 }} color='failure'>
                  error
                </Text>
              )}
            </Flex>
            <NumberInput onChange={handleChangeQuerySoft} placeholder='Soft Cap' startingNumber={softcapIn.toString()} />
         
          <ToggleWrapper>
            <Flex mt='30px' flexDirection='row'>
              <Toggle checked={socialsEnabled} onChange={() => changeSocial()} scale='sm' />
              <Text>Socials</Text>
            </Flex>
          </ToggleWrapper>
          {!socialsEnabled ? null : (
            <>
              <Tile>
                <Flex alignItems='center' justifyContent="space-between">
                  <Text style={{ fontSize: 12, paddingBottom: 10, paddingTop: 20}} color={'textSubtle'}>
                    {t('Logo ( Must Have Extension ):')}
                  </Text>
                  <TokenImageIFO source={logo} height={28} width={28} />
                </Flex>
                <SearchInput onChange={handleChangeLogo} placeholder='Enter Logo Url' />
              </Tile>
              <Tile>
                <Flex alignItems='center' justifyContent="space-between">
                  <Text style={{ fontSize: 12, paddingBottom: 10, paddingTop: 20 }} color={'textSubtle'}>
                    {t('Banner:')}
                  </Text>
                    <img src={banner} alt={`logo`} className="desktop-icon" style={{ height: `24px` }} />
                </Flex>
                <SearchInput onChange={handleChangeBanner} placeholder='Enter Banner Url' />
              </Tile>
              <Tile>
                <Flex alignItems='flex-start'>
                  <Text style={{ fontSize: 12, paddingBottom: 10, paddingTop: 20 }} color={'textSubtle'}>
                    {t('Website:')}
                  </Text>
                </Flex>
                <SearchInput onChange={handleChangeWebsite} placeholder='Enter Website Url' />
              </Tile>
              <Tile>
                <Flex alignItems='flex-start'>
                  <Text style={{ fontSize: 12, paddingBottom: 10, paddingTop: 20 }} color={'textSubtle'}>
                    {t('Twitter:')}
                  </Text>
                </Flex>
                <SearchInput onChange={handleChangeTwitter} placeholder='Enter Twitter Url' />
              </Tile>
              <Tile>
                <Flex alignItems='flex-start'>
                  <Text style={{ fontSize: 12, paddingBottom: 10, paddingTop: 20 }} color={'textSubtle'}>
                    {t('Telegram:')}
                  </Text>
                </Flex>
                <SearchInput onChange={handleChangeTelegram} placeholder='Enter Telegram Url' />
              </Tile>
            </>
          )}
          <ToggleWrapper>
            <Flex mt='30px' mb='20px' flexDirection='row'>
              <Toggle checked={expertMode} onChange={() => changeExpertMode()} scale='sm' />
              <Text>Expert Mode</Text>
            </Flex>
          </ToggleWrapper>
          {expertMode ? null : (
            <TileText>
              <Text style={{ paddingBottom: 10 }}>Non-expert mode uses the following as defaults:</Text>
              <Text>- Hardcap = Softcap x 2 </Text>
              <Text>- Presale Price = Launch Price </Text>
              <Text>- User buy limit - 10% of softcap</Text>
              <Text>- AutoLP - 80% of amount raised</Text>
              <Text>- Start Time: Now + 1 Hour</Text>
              <Text>- End Time: 7 days</Text>
            </TileText>
          )}
          {!expertMode ? null : (
            <BorderContainer>
              <Flex mt='30px' mb='20px' alignItems='center' justifyContent='center'>
                <Heading color='secondary' scale='md'>
                  Additional Options
                </Heading>
              </Flex>

              <Tile>
                <Flex justifyContent='space-between'>
                  <Flex mt='20px' mb="20px" flexDirection='row'>
                    <Text style={{ fontSize: 12}} color='textSubtle'>
                      {t(`Presale Discount:`)}
                    </Text>
                  </Flex>
                </Flex>
                <Slider
                  min={0}
                  max={15}
                  value={preSaleDiscountPercent}
                  onValueChanged={handleChangePercentPresaleDiscount}
                  name='PreSale Discount'
                  valueLabel={`${preSaleDiscountPercent}%`}
                  step={1}
                />
              </Tile>

              <Tile>
                <Flex justifyContent='space-between'>
                  <Flex flexDirection='row'>
                    <Text style={{ fontSize: 12, paddingTop: 10 }} color='textSubtle'>
                      {t('Dev Wallet Address:')}
                    </Text>
                  </Flex>
                  {walletError && (
                    <Text style={{ fontSize: 12, paddingBottom: 10, paddingTop: 20 }} color='failure'>
                      error
                    </Text>
                  )}
                </Flex>
                <SearchInput onChange={handleChangeQueryDev} placeholder={'Set Dev Wallet'} starting={account ?? ''} />
              </Tile>
              <Tile>
                <Flex justifyContent='space-between'>
                  <Flex flexDirection='row'>
                    <Text style={{ fontSize: 12, paddingTop: 30 }} color='textSubtle'>
                      {t(`User Buy Limit : %symbol%`, {symbol: chain.nativeCurrency.symbol ?? "CRO" })}
                    </Text>
                  </Flex>
                </Flex>
                <NumberInput
                  onChange={handleChangeQueryLimitBasic}
                  placeholder='Token Quantity'
                  startingNumber={tokenLimitBasic.shiftedBy(-18).toString()}
                />
              </Tile>
              <Tile>
                <Flex justifyContent='space-between'>
                  <Flex flexDirection='row'>
                    <Text style={{ fontSize: 12, paddingTop: 30 }} color='textSubtle'>
                      {t(`Max Target Amount (Hardcap): %symbol%`, {symbol: chain.nativeCurrency.symbol ?? "CRO"})}
                    </Text>
                  </Flex>

                  {hardSoftError && (
                    <Text style={{ fontSize: 12, paddingTop: 30 }} color='failure'>
                      error
                    </Text>
                  )}
                </Flex>
              </Tile>
              <Tile>
                <NumberInput
                  onChange={handleChangeQueryGoalBasic}
                  placeholder='Token Quantity'
                  startingNumber={hardCap.shiftedBy(-18).toString()}
                />
                <Flex flexDirection="column" justifyContent='left' mt="10px" mb="20px">
                <Text>{`Sale Price:`}</Text>
                 
                  <Text>{`${tokenGoalBasic
                    .shiftedBy(-cDec)
                    .dividedBy(tokenAmountBasic.shiftedBy(-18))
                    .multipliedBy(wbonePrice.toString())
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })} USD`}</Text>
                  <Text>
                    {t(
                      `${salePrice
                        .shiftedBy(-cDec)
                        .toNumber()
                        .toLocaleString('en-US', { maximumFractionDigits: 9 })} ${cSym} Per ${
                        chain?.nativeCurrency.symbol ?? "CRO"
                      }`,
                    )}
                  </Text>
                </Flex>
              </Tile>
              <Flex mt='30px' mb='20px' alignItems='center' justifyContent='center'>
                <Heading color='secondary' scale='md'>
                  LP Options
                </Heading>
              </Flex>
              <ToggleWrapper>
                <Flex mt='20px' flexDirection='row'>
                  <Toggle checked={useLP} onChange={() => changeUseLP(!useLP)} scale='sm' />
                  <Text color='primary'>Auto Add LP</Text>
                </Flex>
              </ToggleWrapper>

              <ToggleWrapper>
                <Flex mt='20px' flexDirection='row'>
                  <Toggle checked={burnLP} onChange={() => changBurnLP(!burnLP)} scale='sm' />
                  <Text color='primary'>Auto Burn LP</Text>
                </Flex>
              </ToggleWrapper>

              {useLP && (
                <>
                  <Flex justifyContent='space-between'>
                    <Flex mt="30px" flexDirection='row'>
                      <Text color='textSubtle'>{t(`% to add to LP:`)}</Text>
                    </Flex>
                    {(lpPercentError || useLPPercentError) && <Text color='failure'>error</Text>}
                  </Flex>
                  <NumberInput
                    onChange={handleChangeQueryAutoLPPercent}
                    placeholder='Percentage'
                    startingNumber={LPPercent.toString()}
                  />
                  {!burnLP && (
                    <>
                      <Flex mt='40px' alignItems='flex-start'>
                        <Flex flexDirection='row'>
                          <Text color='textSubtle'>{t(`Days to Lock LP:`)}</Text>
                        </Flex>
                      </Flex>
                      <NumberInput
                        onChange={handleChangeQueryLockDays}
                        placeholder='Days'
                        startingNumber={lockDays.toString()}
                      />
                    </>
                  )}
                  <Flex mb='40px'></Flex>
                </>
              )}

              <Flex mt='30px' mb='20px' alignItems='center' justifyContent='center'>
                <Heading color='secondary' scale='md'>
                  Time
                </Heading>
              </Flex>

              <Flex mt='40px' justifyContent='space-between'>
                <Text color='textSubtle'>{t('Start Day / Time (local):')}</Text>
                {startError && <Text color='failure'>error</Text>}
            
              <DatePicker
                selected={startDate}
                onChange={date => handleDateChangeStart(date)}
                showTimeSelect
                dateFormat='Pp'
              />
  </Flex>
              <Flex mt='20px' justifyContent='space-between'>
                <Text color='textSubtle'>{t('End Day / Time (local):')} </Text>
                {endError && <Text color='failure'>error</Text>}
            
              <DatePicker
                selected={endDate}
                onChange={date => handleDateChangeEnd(date)}
                showTimeSelect
                dateFormat='Pp'
              />
                </Flex>
            </BorderContainer>
          )}
          <>
            <Flex mt='40px' mb='20px' alignItems='center' justifyContent='center'>
              <Button onClick={createPreSaleClick} disabled={isDisabled} scale='sm' id='clickCreateNewPreSale'>
                {t('Create Presale')}
              </Button>
            </Flex>
          </>
        </>
      )}
    </BorderContainer>
  )
}

export default NewPresale
