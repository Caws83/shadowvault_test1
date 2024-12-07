import React, { useEffect, useState } from 'react'
import { Currency, Pair } from 'sdk'
import { Button, ChevronDownIcon, Text, useModal, Flex, CopyIcon } from 'uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import { PolymorphicComponent, BaseButtonProps } from 'uikit/components/Button/types'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { CurrencyLogo, DoubleCurrencyLogo } from '../Logo'
import { Input as NumericalInput } from './NumericalInput'
import { useAccount, usePublicClient } from 'wagmi'
import { getAddress, getPriceCheckaddress, getWrappedAddress } from 'utils/addressHelpers'
import { readContract } from '@wagmi/core'
import BigNumber from 'bignumber.js'
import { tokenPriceAbi } from 'config/abi/tokenPrice'
import { Dex } from 'config/constants/types'
import { config } from 'wagmiConfig'
import { useGetTokenPriceString } from 'hooks/useBUSDPrice'
import { isMobile } from 'components/isMobile'




const InputRow = styled.div<{ selected: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })``
const IconButton: PolymorphicComponent<BaseButtonProps, 'button'> = styled(Button)<BaseButtonProps>`
  padding: 0;
  m=0;
  mr=0;
  ml=0;
`
const InputPanel = styled.div<{ hideInput?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  border-radius: 10px;
  border: 0.5px solid ${({ theme }) => theme.colors.secondary}; 
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 1;
  margin-bottom: 5px;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect: (currency: Currency, chainId: number) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  minimal?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  chainId: number
  dex: Dex
}
export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  minimal = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  chainId,
  dex
}: CurrencyInputPanelProps) {
  const { address: account } = useAccount()
  const selectedCurrencyBalance = useCurrencyBalance(chainId, account as `0x${string}` ?? undefined, currency ?? undefined)
  const { t } = useTranslation()
const publicClient = usePublicClient({chainId: chainId})
const inputAddress = currency?.symbol === publicClient.chain.nativeCurrency.symbol ? getWrappedAddress(dex.chainId) : currency?.address ? currency.address : undefined

const [ price, setPrice] = useState('0')
const priceRaw = useGetTokenPriceString(dex,inputAddress,currency?.decimals, value)
useEffect(() => {
  const parsedPrice = new BigNumber(priceRaw ?? "0").multipliedBy(value).toFixed(3);
  setPrice(isNaN(Number(parsedPrice)) ? "-" : parsedPrice);
}, [value, priceRaw]);
/*
  const [ price, setPrice] = useState('0')
  useEffect(() => {

  async function getPrice() {
    const factoryAddress = getAddress(dex.factory, dex.chainId)
    if(currency){
      
      
      try {
      const priceRaw = await readContract(config, {
        address: getPriceCheckaddress(dex.chainId),
        abi: tokenPriceAbi,
        functionName: 'TokenPrice',
        args: [inputAddress, factoryAddress],
        chainId: dex.chainId
      })
      const num = new BigNumber(priceRaw[0].toString())
      const den = new BigNumber(priceRaw[1].toString())
      const usd = new BigNumber(priceRaw[2].toString())
      const dec = new BigNumber(18 - currency.decimals)
      const priceBN = num.multipliedBy(usd).dividedBy(den).shiftedBy(dec.times(-1).toNumber())
      setPrice(new BigNumber(priceBN.shiftedBy(-18)).multipliedBy(value).toFixed(3))
    } catch (err) {
      setPrice("")
      console.log(err)
    }
    
  }
  }

getPrice()
},[currency, dex, value])
*/
  
  const copyAddress = () => {
    if (navigator.clipboard && navigator.permissions) {
      navigator.clipboard.writeText(inputAddress)
    } else if (document.queryCommandSupported('copy')) {
      const ele = document.createElement('textarea')
      ele.value = inputAddress
      document.body.appendChild(ele)
      ele.select()
      document.execCommand('copy')
      document.body.removeChild(ele)
    }
  }

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      chainId={chainId}
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
    />,
  )

const hasCurrency = currency && currency.symbol && currency.symbol.length > 20
const balance = selectedCurrencyBalance?.toSignificant(6) ?? "-";
const displayBalance = balance && parseFloat(balance) < 0.000001 ? "< .000001" : balance;

  return (
    <>

      <Flex alignItems="center" justifyContent="space-between" mb="20px">

  <Flex alignItems="center" style={{ height: '28px' }}>
    <CurrencySelectButton
      selected={!!currency}
      className="open-currency-select-button"
      onClick={() => {
        if (!disableCurrencySelect) {
          onPresentCurrencyModal();
        }
      }}
    >
      <Flex alignItems="center">
        {pair ? (
          <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={20} margin />
        ) : currency ? (

          <CurrencyLogo chainId={chainId} currency={currency} size="30px" style={{marginLeft: 0, marginRight: '4px' }} />

        ) : null}
        {pair ? (
          <Text id="pair">
            {pair?.token0.symbol}:{pair?.token1.symbol}
          </Text>
        ) : (

          <Text id="pair" fontSize="15px">

            {hasCurrency
              ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(currency.symbol.length - 5)}`
              : currency?.symbol || t('Select')}
          </Text>
        )}
        {!disableCurrencySelect && <ChevronDownIcon />}
      </Flex>
    </CurrencySelectButton>

    {inputAddress && currency && !minimal && !isMobile && (
      <Flex>
        <IconButton variant="text" onClick={copyAddress} mr="8px">
          <CopyIcon color="white" width="20px" />
        </IconButton>

        <AddToWalletButton
          padding="0"
          m="0"
          tokenAddress={inputAddress}
          tokenSymbol={currency.symbol}
          tokenDecimals={currency.decimals}
          variant="text"
          noText
        />
      </Flex>
    )}
  </Flex>

  {!minimal && (

    <Text fontSize="15px" style={{ display: 'inline', cursor: 'pointer' }} mr="4px">

      
        {t('%amount%', { amount: displayBalance ?? '' })}
    
    </Text>
  )}
</Flex>

      {!hideInput && (
      <InputPanel id={id}>
        <Container hideInput={hideInput}>
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
           
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={(val) => {
                    onUserInput(val)
                    value=val
                  }}
                  style={{ marginRight: '8px' }}
                />
                <Flex>
               
                  <Flex flexDirection="column">
                    <Text fontSize='13px' color="secondary" bold> USD Price</Text>
                    <Text fontSize='13px'>{`$ ${isNaN(parseFloat(price)) ? "0.00" : parseFloat(price).toFixed(2)}`}</Text>
                  </Flex>
                

                
                {account && currency && showMaxButton && label !== 'To' && (
                  <Button onClick={onUserInput(balance)} scale="md" variant="text">
                    MAX
                  </Button>
                )}
               </Flex>
              </>
           
          </InputRow>
        </Container>
      </InputPanel>
       )}
    </>
  )
}
