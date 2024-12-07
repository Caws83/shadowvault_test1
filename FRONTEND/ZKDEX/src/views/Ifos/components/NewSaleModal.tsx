import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Modal, Text, Flex, HelpIcon, useTooltip, Toggle, useModal, Button, TextHeader } from 'uikit'
import useTheme from 'hooks/useTheme'
import { useTranslation } from 'contexts/Localization'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Balance from 'components/Balance'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import SearchInput from 'components/SearchInput/SearchInput'
import NumberInput from 'components/NumberInput/NumberInput'
import Loading from 'components/Loading'
import { DatePicker } from 'components/DatePicker'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import QuestionHelper from 'components/QuestionHelper'
import ConfirmCreate from './newSaleConfirm'
import { useAccount, useReadContracts } from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import { IFOFactoryAbiV3 } from 'config/abi/IFOFactoryV3'
import contracts from 'config/constants/contracts'
import { dexs } from 'config/constants/dex'
import { Dex } from 'config/constants/types'
import DexSelector from 'components/DexSelector/DexSelector'
import CopyAddress from './CopyAddress'
import { useUserDex } from 'state/user/hooks'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { Address } from 'viem'



interface CreateModalProps {
  tokenAddress: Address
  chainId: number
  onDismiss?: () => void
}

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

const BorderContainer = styled.div`
  padding: 16px;
  border: 3px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 32px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.background};
`

const CreateModal: React.FC<CreateModalProps> = ({ onDismiss, tokenAddress, chainId }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { theme } = useTheme()
  const { balance: balanceRaw } = useGetBnbBalance(chainId)
  const balance = new BigNumber(balanceRaw.toString())
  const { chain } = useAccount()
  const showConnectButton = !account || chain.id !== chainId
  
  const [dex, setDex] = useUserDex()
  const [localDex, setLocalDex] = useState<Dex>(dex)

  const [fee, setFee] = useState(new BigNumber(0))
  const [feeOfSales, setFeeOfSales] = useState(new BigNumber(0))
  const addy = getAddress(contracts.ifoFactoryV3, chainId) as Address

  const {data} = useReadContracts({
    contracts: [
      {
        abi: IFOFactoryAbiV3,
        address: addy,
        functionName: 'subFee',
        chainId
      },
      {
        abi: IFOFactoryAbiV3,
        address: addy,
        functionName: 'marsFee',
        chainId
      },
      {abi: ERC20_ABI, address: tokenAddress, functionName: 'symbol', chainId},
      {abi: ERC20_ABI, address: tokenAddress, functionName: 'decimals', chainId},
      {abi: ERC20_ABI, address: tokenAddress, functionName: 'name', chainId},
      {
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: 'balanceOf',
        args: [account],
        chainId
      }
    ], 
  })

  useEffect(() => {
    console.log(data)
    if(data && data[0].status === "success"){
      setFee(new BigNumber(data[0]?.result.toString()))
      setFeeOfSales(new BigNumber(data[1]?.result.toString()))
      
      setSym(data[2]?.result as string)
      setDec(new BigNumber(data[3]?.result.toString()).toNumber())
      setName(data[4]?.result as string)
      setCBalance(new BigNumber(data[5]?.result.toString()))
    }
  },[data])


  const TooltipComponent = () => (
    <>
      <Text mb="16px">{t('Create A New PreSale for your Token!')}</Text>
      <Text mb="16px">{t('You can create a locker for your Token. See below for more details.')}</Text>
      <Text style={{ fontWeight: 'bold' }}>
        {t('There is a cost of %fee% %symbol% for creating a presale. There is a %feeOfSales%% commission taking on the amount raised.', {
          fee: fee.shiftedBy(-18).toFixed(0),
          feeOfSales: feeOfSales.dividedBy(10).toNumber(),
          symbol: chain.nativeCurrency.symbol
        })}
      </Text>
    </>
  )

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom',
    tooltipPadding: { right: 15 },
  })

  

  const [tokenAmount, setAmount] = useState(new BigNumber(0))
  const [tokenAmountBasic, setAmountBasic] = useState(new BigNumber(0))
  const [tokenGoalBasic, setGoalBasic] = useState(new BigNumber(0))
  const [tokenLimitBasic, setLimitBasic] = useState(new BigNumber(0))
  const [devWallet, setDev] = useState(account ?? "")
  const [startDate, setStart] = useState<Date>()
  const [endDate, setEnd] = useState<Date>()
  const [softCap, setSC] = useState(new BigNumber(0))
  const [hardCap, setHC] = useState(new BigNumber(0))

  const [LPPercent, setLPPercent] = useState(51)
  const [listingPrice, setListingPrice] = useState(new BigNumber(0))
  const [lockDays, setLockDays] = useState(0)
  const [router, setRouter] = useState<Address>(getAddress(dex.router, dex.chainId))

  const [salePrice, setSalePrice] = useState(new BigNumber(0))
  const [tokensForLP, setTokensForLp] = useState(new BigNumber(0))


  const [bnbForLiquidityBIG, setBNBFORLIQ ] = useState(new BigNumber(0))

  useEffect(() => {
    setSalePrice(tokenAmountBasic.dividedBy(tokenGoalBasic).shiftedBy(cDec))
    const feeToTake = tokenGoalBasic.multipliedBy(feeOfSales).dividedBy(1000)
    const bnbForLiquidity = tokenGoalBasic.minus(feeToTake).multipliedBy(LPPercent).dividedBy(100)
    setBNBFORLIQ(bnbForLiquidity)
    setTokensForLp(listingPrice.shiftedBy(-cDec).multipliedBy(bnbForLiquidity))
    setAmount(listingPrice.shiftedBy(-cDec).multipliedBy(bnbForLiquidity).plus(tokenAmountBasic))
  },[LPPercent, listingPrice, tokenAmountBasic, tokenGoalBasic])

  const [cBalance, setCBalance] = useState(new BigNumber(0))
  const [cSym, setSym] = useState('')
  const [cDec, setDec] = useState(18)
  const [cName, setName] = useState('')

 
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
        listingPrice,
        lockDays,
        router
      }}
    />,
  )

 
  const handleChangeQueryAmountBasic = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = new BigNumber(event.target.value).shiftedBy(cDec)
    setAmountBasic(amount)
    setAmount(amount.plus(tokensForLP))
  }
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
  const handleDateChangeStart = (newDate) => {
    setStart(newDate)
  }
  const handleDateChangeEnd = (newDate) => {
    setEnd(newDate)
  }
  const handleChangeQuerySoft = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = new BigNumber(event.target.value).shiftedBy(18)
    setSC(amount)
  }

  const handleChangeQueryAutoLPPercent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLPPercent(Number(event.target.value))
  }
  const handleChangeQueryLockDays = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLockDays(Number(event.target.value))
  }

  const handleChangeQueryListingPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = new BigNumber(event.target.value).shiftedBy(cDec)
    setListingPrice(amount)
  }

  const [useLP, setUseLP] = useState(true)
  const changeUseLP = () => {
    
    if(!useLP) {
      setLPPercent(51)
      setListingPrice(new BigNumber(0))
    }
    if(useLP) {
      setLPPercent(0)
      setListingPrice(new BigNumber(0))
    }
    setUseLP(!useLP)
  }

  const tokenAmountError =  cBalance.lt(tokenAmount) || tokenAmount.isNaN() || tokenAmount.eq(0)
  const hardSoftError = Number.isNaN(softCap) || Number.isNaN(hardCap) || new BigNumber(hardCap).lte(softCap) || new BigNumber(softCap).eq(0)
  const listPriceError =  useLP && (listingPrice.gt(salePrice) || listingPrice.isNaN() || listingPrice.eq(0))
  const lpPercentError = LPPercent > 100 || ( LPPercent < 51 && LPPercent !== 0 )
  const useLPPercentError = useLP && LPPercent === 0
  const endError = !endDate ||  endDate <= startDate
  const startError = !startDate || endDate <= startDate
  const walletError = devWallet === undefined || devWallet === ""
  const dexError = localDex?.chainId !== chainId
  const routerError = router !== getAddress(localDex.router, chainId)


  const disableBuying =
    new BigNumber(balance).lt(fee) ||
    tokenAmountError ||
    startError ||
    endError ||
    hardSoftError ||
    lpPercentError ||
    useLPPercentError ||
    listPriceError ||
    walletError ||
    dexError ||
    routerError

  return (
    <Modal
      title={t('Create NEW PreSale')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {tooltipVisible && tooltip}
      <Flex flexDirection="column">
        <Flex alignItems="flex-start" justifyContent="space-between" flexDirection="row">
          <Text>{t('%symbol% Balance:', {symbol: chain.nativeCurrency.symbol})}</Text>
          <Balance bold value={balance.shiftedBy(-18).toNumber()} decimals={2} unit={`${chain.nativeCurrency.symbol}`} />
        </Flex>

        <Flex alignItems="flex-start" justifyContent="space-between" flexDirection="row">
          <Flex flexDirection="row">
            <QuestionHelper text={<Text>Fee To Create the Pre-Sale</Text>} ml="4px" />
            <TextHeader>{t('Creation Fee:')}</TextHeader>
          </Flex>
          <Balance bold value={fee.shiftedBy(-18).toNumber()} decimals={2} unit={`${chain.nativeCurrency.symbol}`} />
        </Flex>
        <Divider />

        {cBalance ? (
          <>
            <CopyAddress account={tokenAddress} mb="8px" />
            <Flex alignItems="flex-start" justifyContent="space-between" flexDirection="row">
              <Text>{t(`Token Balance:`)}</Text>
              <Balance bold value={cBalance.shiftedBy(-cDec).toNumber()} decimals={2} unit={cSym} />
            </Flex>
          </>
        ) : (
          <>
          <Text>Token Balance Loading...... </Text>
          <Loading />
          </>
        )}
      </Flex>
      <Divider />
      <DexSelector newDex={localDex} UpdateDex={onHandleDexChange} />
      {cBalance && (
        <>
          
          <ToggleWrapper>
            <Flex flexDirection="row">
              <QuestionHelper
                text={
                    <Text>After Sale Automatically create LP!</Text>
                }
                ml="4px"
              />
              <Toggle checked={useLP} onChange={() => changeUseLP()} scale="sm" />
              <Text color="primary">Auto Add LP</Text>
            </Flex>
          </ToggleWrapper>

          <Divider />
         
            <>
              <Flex justifyContent="space-between">
                <Flex flexDirection="row">
                  <QuestionHelper
                    text={
                      <>
                        <Text>Amount of tokens to be sold</Text>
                        <Text>in the sale.</Text>
                      </>
                    }
                    ml="4px"
                  />
                    <Text color="secondary">{t(`${cSym} For Sale:`)}</Text>
                </Flex>
                {tokenAmountError && <Text color="failure">error</Text>}
              </Flex>
              <NumberInput onChange={handleChangeQueryAmountBasic} placeholder="Token Quantity" startingNumber={tokenAmount.toString()} />

              <Flex justifyContent="space-between">
                <Flex flexDirection="row">
                  <QuestionHelper
                    text={
                      <>
                        <Text>Goal you want to reach in this</Text>
                        <Text>{`pool, in ${chain.nativeCurrency.symbol}.`} </Text>
                      </>
                    }
                    ml="4px"
                  />
                  <Text color="secondary">{t(`${chain.nativeCurrency.symbol} Goal (HardCap):`)}</Text>
                </Flex>
                {hardSoftError && <Text color="failure">error</Text>}
              </Flex>
              <NumberInput onChange={handleChangeQueryGoalBasic} placeholder="Token Quantity" startingNumber={hardCap.toString()} />
             <Flex justifyContent="space-between">
              <Text>{`Sale Price: ${tokenGoalBasic
                .shiftedBy(-cDec)
                .dividedBy(tokenAmountBasic.shiftedBy(-18))
                .multipliedBy(wbonePrice.toString())
                .toNumber()
                .toLocaleString('en-US', { maximumFractionDigits: 9 })} USD`}</Text>
              <Text color="secondary">{t(`${salePrice.shiftedBy(-cDec).toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })} ${cSym} Per ${chain.nativeCurrency.symbol}`)}</Text>

              </Flex>

            <Flex justifyContent="space-between">
            <Flex flexDirection="row">
              <QuestionHelper
                text={
                  <>
                    <Text>Soft Cap MUST be hit for sale</Text>
                    <Text>to go through. Otherwise all</Text>
                    <Text>funds will be returned to the</Text>
                    <Text>Investors.</Text>
                    <Text>Hard Cap is WHEN all tokens are sold.</Text>

                  </>
                }
                ml="4px"
              />
              <Text color="secondary">{t('Soft Cap:')}</Text>
            </Flex>
            {hardSoftError && <Text color="failure">error</Text>}
          </Flex>
          <NumberInput onChange={handleChangeQuerySoft} placeholder="Soft Cap" startingNumber={softCap.toString()} />

          <Flex justifyContent="space-between">
                <Flex flexDirection="row">
                  <QuestionHelper
                    text={
                      <>
                        <Text>Max contribution per Wallet</Text>
                        <Text>{`in the Sale, in ${chain.nativeCurrency.symbol}`}</Text>
                      </>
                    }
                    ml="4px"
                  />
                  <Text color="secondary">{t(`User Buy Limit (${chain.nativeCurrency.symbol}) :`)}</Text>
                </Flex>
              </Flex>
              <NumberInput onChange={handleChangeQueryLimitBasic} placeholder="Token Quantity" startingNumber={tokenLimitBasic.toString()} />
              <Divider />
            </>
          {useLP &&
          <>

<Flex justifyContent="space-between">
                <Flex flexDirection="row">
                  <QuestionHelper
                    text={
                      <>
                        <Text>Price of Token when adding liquidity.</Text>
                        <Text> {`In amount of tokens per  ${chain.nativeCurrency.symbol}.`}</Text>
                        <Text>This should be lower than PreSale Amount.</Text>
                        <Text color="warning">MAKE SURE THIS IS CORRECT!</Text>
                      </>
                    }
                    ml="4px"
                  />
                  <Text color="primary">{t(`Listing Price per ${chain.nativeCurrency.symbol}:`)}</Text>
                </Flex>
                {listPriceError && <Text color="failure">error</Text>}
              </Flex>
              <NumberInput onChange={handleChangeQueryListingPrice} placeholder="Listing Price" startingNumber={listingPrice.toString()} />
              <Flex justifyContent="space-between">
               <Text>{`Dex Price: ${bnbForLiquidityBIG
                    .shiftedBy(-cDec)
                    .dividedBy(tokensForLP.shiftedBy(-18))
                    .multipliedBy(wbonePrice.toString())
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 5 })} ~USD / ${cSym}`}</Text>
              <Text>{`${listingPrice
                    .shiftedBy(-cDec)
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })} ${cSym}/${chain.nativeCurrency.symbol}`}</Text>

              </Flex>
              <Flex justifyContent="space-between">
              <Text>{`Pre Sale: ${tokenGoalBasic
                .shiftedBy(-cDec)
                .dividedBy(tokenAmountBasic.shiftedBy(-18))
                .multipliedBy(wbonePrice.toString())
                .toNumber()
                .toLocaleString('en-US', { maximumFractionDigits: 9 })} ~USD/${cSym}`}</Text>
              <Text color="secondary">{t(`${salePrice.shiftedBy(-cDec).toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })} ${cSym}/${chain.nativeCurrency.symbol}`)}</Text>

              </Flex>
              <Divider />
              
              <Flex justifyContent="space-between">
                <Flex flexDirection="row">
                  <QuestionHelper
                    text={
                      <>
                        <Text>Percent of earning to add to liquidity after sale.</Text>
                        <Text>We will calculate tokens needed for this, </Text>
                        <Text>and they will be sent to the contract as well.</Text>
                      </>
                    }
                    ml="4px"
                  />
                  <Text color="primary">{t(`% to add to LP:`)}</Text>
                </Flex>
                {(lpPercentError || useLPPercentError) && <Text color="failure">error</Text>}
              </Flex>
              <NumberInput onChange={handleChangeQueryAutoLPPercent} placeholder="Percentage" startingNumber={LPPercent.toString()} />
              <Divider />

             

              <Flex alignItems="flex-start">
                <Flex flexDirection="row">
                  <QuestionHelper
                    text={
                      <>
                        <Text>Days to Lock the LP for.</Text>
                        <Text>Your LP wil lbe locked here for these days.</Text>
                        <Text>Come back to check timer and withdrawal after.</Text>
                      </>
                    }
                    ml="4px"
                  />
                  <Text color="primary">{t(`Days to Lock LP:`)}</Text>
                </Flex>
              </Flex>
              <NumberInput onChange={handleChangeQueryLockDays} placeholder="Days" startingNumber={lockDays.toString()} />
              <Divider />

          </>
          }
         
         <Flex justifyContent="space-between">
            <Flex flexDirection="row">
              <QuestionHelper
                text={
                  <>
                    <Text>Wallet to receive the funds</Text>
                    <Text>after the pool ends. This will</Text>
                    <Text>be the only Wallet able to retrieve</Text>
                    <Text>and finalize the PreSale.</Text>
                  </>
                }
                ml="4px"
              />
              <Text>{t('Dev Wallet Address:')}</Text>
            </Flex>
            {walletError && <Text color="failure">error</Text>}
          </Flex>
          <SearchInput onChange={handleChangeQueryDev} placeholder={"Set Dev Wallet"} starting={account ?? ""} />
          <Divider />

          <Flex justifyContent="space-between">
            <Text>{t('Start Day / Time (local):')}</Text>
            {startError && <Text color="failure">error</Text>}
          </Flex>
          <DatePicker
            selected={startDate}
            onChange={(date) => handleDateChangeStart(date)}
            showTimeSelect
            dateFormat="Pp"
          />

          <Divider />

          <Flex justifyContent="space-between">
            <Text>{t('End Day / Time (local):')}</Text>
            {endError && <Text color="failure">error</Text>}
          </Flex>
          <DatePicker
            selected={endDate}
            onChange={(date) => handleDateChangeEnd(date)}
            showTimeSelect
            dateFormat="Pp"
          />
          <Divider />
          

          {!showConnectButton ? (
            <>
              <Flex alignItems="center" justifyContent="space-between">
                <Button onClick={onPresentConfirmModal} disabled={disableBuying} scale="sm" id="clickCreateNewPreSale">
                  {t('Create NEW')}
                </Button>
              </Flex>

              <BorderContainer>
                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('Token')}:</Text>
                  <Text>{`${cName}`}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  <Text color="secondary">{t(`Total Tokens Needed (${cSym})`)}:</Text>
                  <Text>{`${getFullDisplayBalance(tokenAmount, cDec, 3)}`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('SoftCap')}:</Text>
                  <Text>{`${softCap.shiftedBy(-18).toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })}`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('HardCap')}:</Text>
                  <Text>{`${hardCap.shiftedBy(-18).toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })}`}</Text>
                </Flex>
                
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                  <Text color="textSubtle">{t(`PreSale`)}:</Text>
                  <Text>{`${salePrice
                    .shiftedBy(-cDec)
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 5 })} ${cSym} / ${chain.nativeCurrency.symbol}`}</Text>
                  <Text>{`${tokenGoalBasic
                    .shiftedBy(-18)
                    .dividedBy(tokenAmountBasic.shiftedBy(-cDec))
                    .multipliedBy(wbonePrice.toString())
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })} ~USD / ${cSym}`}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  {!dexError ? (
                    <>
                      <Text color="secondary">{t('Dex:')}:</Text>
                      <Text>{`${localDex?.info.name}`}</Text>
                    </>
                  ):(
                    <Text color="failure"> Dex Error </Text>
                  )}
                </Flex>

                <Flex justifyContent="space-between">
                  {!routerError ? (
                    <>
                      <Text color="secondary">{t('Router:')}:</Text>
                      <Text>{`${router.slice(0, 20)}`}</Text>
                    </>
                  ) : (
                    <Text color="failure"> Router Error </Text>
                  )}
                </Flex>


                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('AutoLP')}:</Text>
                  <Text>{`${useLP}`}</Text>
                </Flex>

                {useLP &&
                <>
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                  <Text color="textSubtle">{t(`Dex Price`)}:</Text>
                  <Text>{`${listingPrice
                    .shiftedBy(-cDec)
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 5 })} ${cSym} / ${chain.nativeCurrency.symbol}`}</Text>
                  <Text>{`${bnbForLiquidityBIG
                    .shiftedBy(-cDec)
                    .dividedBy(tokensForLP.shiftedBy(-18))
                    .multipliedBy(wbonePrice.toString())
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 5 })} ~USD / ${cSym}`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('% to LP')}:</Text>
                  <Text>{`${LPPercent.toFixed(0)} %`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('Tokens to LP')}:</Text>
                  <Text>{`${tokensForLP.shiftedBy(-cDec).toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })}`}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('Days to Lock')}:</Text>
                  <Text>{`${lockDays.toFixed(0)}`}</Text>
                </Flex>

               


</>
                
                }

                
               
               
                <Text>
                  {t(`There is a cost of %fee% ${chain.nativeCurrency.symbol} for creating preale. A %feeOfSales%% commission is taken on the amount raiseds.`, {
                    fee: fee.shiftedBy(-18).toFixed(0),
                    feeOfSales: feeOfSales.dividedBy(10).toNumber(),
                  })}
                </Text>
              </BorderContainer>
            </>
          ) : (
            <ConnectWalletButton chain={chainId} />
          )}
        </>
      )}
      <Flex justifyContent="center" alignItems="center">
        <Text fontSize="16px" bold color="textSubtle" mr="4px">
          {t('What’s this?')}
        </Text>
        <span ref={targetRef}>
          <HelpIcon color="textSubtle" />
        </span>
      </Flex>
    </Modal>
  )
}

export default CreateModal
