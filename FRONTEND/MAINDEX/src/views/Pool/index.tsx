import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Pair } from 'sdk'
import { Text, Flex, CardBody, CardFooter, Button, AddIcon, CardHeader, TextHeader } from 'uikit'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import { Dex } from 'config/constants/types'
import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePairs } from '../../hooks/usePairs'
import { toV2LiquidityToken, useTrackedTokenPairs, useUserDex } from '../../state/user/hooks'
import Dots from '../../components/Loader/Dots'
import { AppBody } from '../../components/App'
import Page from '../Page'
import { useAccount, useChainId } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import BigNumber from 'bignumber.js'
import { dexs } from 'config/constants/dex'
import CenterBody from 'components/App/CenterBody'

const Body = styled(CardBody)`
  background-image: radial-gradient(circle, rgba(144, 205, 240, 0.09) 0%, rgb(27, 27, 31) 100%);
`

const StyledCardHeader = styled(CardHeader)`
  background: #1b1b1f;
  border-bottom: 1px solid #3c3f44;
  padding: 24px;
`;

const StyledTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  padding: 4px 0;
  background: linear-gradient(9deg, rgb(255, 255, 255) 0%, rgb(138, 212, 249) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const GradientButton = styled(Button)`
  background: linear-gradient(9deg, rgb(0, 104, 143) 0%, rgb(138, 212, 249) 100%) !important;
  color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: none;
  font-size: 16px !important;
  padding: 0 24px !important;
  height: 48px !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 104, 143, 0.3) !important;
    transform: translateY(-1px) !important;
  }
  
  &:active {
    transform: translateY(1px) !important;
    box-shadow: 0 2px 8px rgba(0, 104, 143, 0.2) !important;
  }
`;

export default function Pool() {
  const { address: account, chain, chainId } = useAccount()
  const { t } = useTranslation()
 
  const [dex, setDex] = useState<Dex>(dexs.marsCZK)
  const showConnectButton = !account || chainId !== dex.chainId
  
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

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs(dex.chainId)

  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(dex, tokens), tokens })),
    [trackedTokenPairs, dex],
  )

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  )
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    dex.chainId,
    account ?? undefined,
    liquidityTokens,
  )
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(
        ({ liquidityToken }) => v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  )
  const v2Pairs = usePairs(
    dex,
    liquidityTokensWithBalances.map(({ tokens }) => tokens),
  )
  
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const renderBody = () => {
    if (!account) {
      return (
        <Text color="textSubtle" textAlign="center">
          {t('Connect to a wallet to view your liquidity.')}
        </Text>
      )
    }
    if (v2IsLoading) {
      return (
        <Text color="textSubtle" textAlign="center">
          <Dots>{t('Loading')}</Dots>
        </Text>
      )
    }

    if (allV2PairsWithLiquidity?.length > 0) {
      return allV2PairsWithLiquidity.map((v2Pair, index) => (
        <FullPositionCard
          key={v2Pair?.liquidityToken?.address}
          pair={v2Pair}
          dex={dex}
          mb={index < allV2PairsWithLiquidity.length - 1 ? '16px' : 0}
        />
        
      ))
    }
    
    return (
    
      <Text  mt="0px" color="textSubtle" textAlign="center">
        {t('No liquidity found.')}
      </Text>
 
    )
  }

  const handleDexChange = (newDex: Dex) => {
    setDex(newDex)
  }


  return (
  
    <Page>
      <div className="animated-border-box">
        <AppBody>
          <StyledCardHeader>
            <StyledTitle>Provide Liquidity</StyledTitle>
          </StyledCardHeader>
          <Body>
      
            {renderBody()}
          
            {account && !v2IsLoading && (
              <Flex flexDirection="column" alignItems="center" mt="24px">
                <Text color="textSubtle" mt="0px" mb="20px">
                  {t("Don't see a pool you joined?")}
                </Text>
                {showConnectButton ? (
                  <ConnectWalletButton chain={dex.chainId} />
                ):(
                <Button id="import-pool-link" variant="secondary" scale="sm" as={Link} to="/find">
                  {t('Find other LP tokens')}
                </Button>
                )}
              </Flex>
            )}
            <Flex flexDirection='column' alignItems='center' mt="30px" mb="20px">
              <Flex flexDirection='row' alignItems='center' justifyContent='center' mb="16px">
                <TextHeader>
                  LIQUIDITY FEE:
                </TextHeader>
                <TextHeader color='primary' fontSize='10px'>{` ${parseFloat(new BigNumber(0).shiftedBy(-18).toFixed(5))} ${
                      chain?.nativeCurrency.symbol
                    }`}</TextHeader>
              </Flex>
              <GradientButton id="join-pool-button" as={Link} to="/add">
                {t('Add Liquidity')}
              </GradientButton>
            </Flex>
          </Body>
         
         
        </AppBody>
      </div>
    </Page>

  )
}
