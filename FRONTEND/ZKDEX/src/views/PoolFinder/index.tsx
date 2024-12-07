import React, { useCallback, useEffect, useState } from 'react'
import { Currency, getETHER, JSBI } from 'sdk'
import { Button, ChevronDownIcon, Text, AddIcon, useModal, Flex, TextHeader } from 'uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { Dex } from 'config/constants/types'
import { LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Layout/Column'
import { CurrencyLogo } from '../../components/Logo'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row from '../../components/Layout/Row'
import CurrencySearchModal from '../../components/SearchModal/CurrencySearchModal'
import { PairState, usePair } from '../../hooks/usePairs'
import { usePairAdder, useUserDex } from '../../state/user/hooks'
import StyledInternalLink from '../../components/Links'
import { currencyId } from '../../utils/currencyId'
import Dots from '../../components/Loader/Dots'
import { AppBody } from '../../components/App'
import AppHeader from 'views/Swap/components/AppHeader'
import Page from '../Page'
import { useAccount, useReadContract } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { Address, zeroAddress } from 'viem'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { BigNumber } from 'bignumber.js'
import { dexs } from 'config/constants/dex'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

const StyledButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: none;
  border-radius: 4px;
  padding: 25px;
`

export default function PoolFinder() {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const { chain } = useAccount()
  const [dex, setDex] = useUserDex()

  
  const showConnectButton = !account || chain?.id !== dex?.chainId
  const ETHER = getETHER(dex.chainId)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)
  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)
 

  const getDex = () => {
    for (const key in dexs) {
      if (dexs[key].chainId === chain?.id) {
        return dexs[key]
      }
    }
    return dex
  }
 
  useEffect(() => {
    handleDexChange(getDex())
  },[chain])



  const [pairState, pair] = usePair(dex, currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0)),
    )

  // const positionOld: TokenAmount | undefined = useTokenBalance( dex.chainId, account ?? undefined, pair?.liquidityToken)


  const {data} = useReadContract({
      abi: ERC20_ABI,
      address: pair?.liquidityToken.address as Address,
      functionName: 'balanceOf',
      args: [account ?? zeroAddress],
      chainId: dex.chainId
})

  const hasPosition = Boolean(data && new BigNumber(data.toString()).gt(0))

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField],
  )

  const prerequisiteMessage = (
    <LightCard  mt="20px" mb="20px" padding="10px 5px">
          <Flex justifyContent={'center'} alignItems={'center'}>
      <Text textAlign="center">
        {!account ? t('Connect to a wallet to find pools') : t('Select a token to find your liquidity.')}
      </Text>
      </Flex>
    </LightCard>
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      chainId={dex.chainId}
      onCurrencySelect={handleCurrencySelect}
      showCommonBases
      selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
    />,
    true,
    true,
    'selectCurrencyModal',
  )

  const handleDexChange = (newDex: Dex) => {
    setDex(newDex)
  }

  return (
   
    <Page>
      
      <AppBody>
      <AppHeader backTo="/liquidity">
          <Flex flexDirection='row' alignItems='center' justifyContent='flex-end' mr='8px'>
           <TextHeader>
             ADD LIQUIDITY FEE:
            </TextHeader>
            <TextHeader color='primary' fontSize='10px'>{` ${parseFloat(new BigNumber(0).shiftedBy(-18).toFixed(5))} ${
                  chain?.nativeCurrency.symbol
                }`}</TextHeader>
         
          </Flex>
        </AppHeader>
   
        <AutoColumn style={{ padding: '3rem' }} gap="md">
          <StyledButton
            endIcon={<ChevronDownIcon />}
            onClick={() => {
              onPresentCurrencyModal()
              setActiveField(Fields.TOKEN0)
            }}
          >
            {currency0 ? (
              <Row>
                <CurrencyLogo currency={currency0} chainId={dex.chainId} />
                <Text   mt="20px" mb="20px" ml="8px">{currency0.symbol}</Text>
              </Row>
            ) : (
              <Text mt="20px" mb="20px" ml="8px">{t('Select a Token')}</Text>
            )}
          </StyledButton>

          <ColumnCenter>
            <AddIcon />
          </ColumnCenter>

          <StyledButton
            endIcon={<ChevronDownIcon />}
            onClick={() => {
              onPresentCurrencyModal()
              setActiveField(Fields.TOKEN1)
            }}
          >
            {currency1 ? (
              <Row >
                <CurrencyLogo currency={currency1} chainId={dex.chainId}/>
                <Text mt="20px" mb="20px" ml="8px">{currency1.symbol}</Text>
              </Row>
            ) : (
              <Text  mt="20px" mb="20px" as={Row}>{t('Select a Token')}</Text>
            )}
          </StyledButton>

          {hasPosition && (
            <ColumnCenter
              style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
            >
              <Text textAlign="center">{t('Pool Found!')}</Text>
              <Flex justifyContent="center" mt="30px" mb="20px">
              <StyledInternalLink to={`/remove/${currency0.address ?? currency0.symbol}/${currency1.address ?? currency1.symbol}`}>
      <Button>
      Manage this pool
      </Button>
   
    </StyledInternalLink>
    </Flex>
            </ColumnCenter>
          )}

          {currency0 && currency1 ? (
            pairState === PairState.EXISTS ? (
              hasPosition && pair ? (
                <MinimalPositionCard pair={pair} dex={dex} />
              ) : (
                <LightCard padding="10px 5px">
                  <AutoColumn gap="sm" justify="center">
                    <Text textAlign="center">{t('You don’t have liquidity in this pool yet.')}</Text>
                    {showConnectButton ? (
                      <ConnectWalletButton chain={dex.chainId} />
                    ):(
                    <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                      <Text textAlign="center">{t('Add Liquidity')}</Text>
                    </StyledInternalLink>
                    )}
                  </AutoColumn>
                </LightCard>
              )
            ) : validPairNoLiquidity ? (
          <Flex justifyContent="center" mt="30px" mb="20px">
                <AutoColumn gap="sm" justify="center">
                 
                  <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                  <Button>
                    {t('Create pool.')}
                    </Button>
                  </StyledInternalLink>
                </AutoColumn>
          </Flex>
            ) : pairState === PairState.INVALID ? (
              <LightCard padding="10px 5px">
                <AutoColumn gap="sm" justify="center">
                  <Text textAlign="center" fontWeight={500}>
                    {t('Invalid pair.')}
                  </Text>
                </AutoColumn>
              </LightCard>
            ) : pairState === PairState.LOADING ? (
              <LightCard padding="10px 5px">
                <AutoColumn gap="sm" justify="center">
                  <Text textAlign="center">
                    {t('Loading')}
                    <Dots />
                  </Text>
                </AutoColumn>
              </LightCard>
            ) : null
          ) : (
            prerequisiteMessage
          )}
        </AutoColumn>
        {/* <CurrencySearchModal
          isOpen={showSearch}
          onCurrencySelect={handleCurrencySelect}
          onDismiss={handleSearchDismiss}
          showCommonBases
          selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
        /> */}
      </AppBody>
    </Page>

  )
}
