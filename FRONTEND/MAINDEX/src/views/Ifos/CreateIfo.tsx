import React, { useEffect, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem, Flex, Heading, Text, CardHeader, TextHeader } from 'uikit'
import contracts from 'config/constants/contracts'
import styled from 'styled-components'
import Page from 'components/Layout/Page'
import NewPresale from './components/NewPresale'
import BigNumber from 'bignumber.js'
import SearchInput from 'components/SearchInput/SearchInput'
import { IFOFactoryAbiV3 } from 'config/abi/IFOFactoryV3'
import { useAccount, useReadContracts } from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { Address } from 'viem'
import { ethers } from 'ethers'
import { Wrapper } from 'views/Swap/components/styleds'
import { AppBody } from '../../components/App'
import { defaultChainId } from 'config/constants/chains'
import ConnectWalletButton from 'components/ConnectWalletButton'

const BorderContainer = styled.div`
  justify-content: center;
  align-items: center;
  flex-direction: column;
  display: flex;
  padding-bottom: 80px;
`
const CustomBodyWrapper = styled.div`
  padding: 5px;
  justify-content: center;
  align-items: center;
  display: flex;
`

const StyledCardHeader = styled(CardHeader)`
  background: rgba(20, 20, 22, 0.95);
  border-bottom: 1px solid #3c3f44;
  padding: 0;
`;

const HeaderContainer = styled(Flex)`
  width: 100%;
  padding: 24px;
  padding-right: 32px;
`;

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

const StyledWrapper = styled(Wrapper)`
  background-image: radial-gradient(circle, rgba(144, 205, 240, 0.09) 0%, rgb(27, 27, 31) 100%);
  padding: 24px;
`;

const LabelText = styled(Text)`
  font-size: 17px;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 8px;
`;

const Ifos = () => {
  const { t } = useTranslation()
  const params = useParams()
  const isHistoryActive = params['*'] === 'history'

  const { chain } = useAccount()
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [haveContract, setHaveContract] = useState(false)
  const [amountIn, setAmountIn]  = useState(new BigNumber(45))
  const [softCap, setSoftcap] = useState(new BigNumber(500000))
  const [AIMode, setAIMode] = useState<boolean>(false)
  const [ chainId, setChainId ] = useState(defaultChainId)

  useEffect(() => {
    setHaveContract(false)
    if (chain && chain.id in contracts.ifoFactoryV3) {
      setHaveContract(true)
    }
    setChainId(chain?.id ?? defaultChainId)
  }, [chain])

  const addy = getAddress(contracts.ifoFactoryV3, chainId) as Address
  const [tokenAddress, setToken] = useState<string>('');
  const handleChangeQueryToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value)
    setIsValidAddress(ethers.isAddress(event.target.value));
  }
  useEffect(() => {
    const hashParams = new URL(window.location.href).hash.split('?')[1];
    const urlParams = new URLSearchParams(hashParams);
    const token = urlParams.get('token');
    const amount = urlParams.get('amount');
    const softcap = urlParams.get('softcap');
    const auto = urlParams.get('auto')
    if (token) {
      setToken(token);
      setIsValidAddress(ethers.isAddress(token));
    }
    if (amount) {
      setAmountIn(new BigNumber(amount));
    }
    if (softcap) {
      setSoftcap(new BigNumber(softcap));
    }

    if (auto === "true") {
      setAIMode(true)
    }
    
  }, [])

  const resetTokenAddress = () => {
    setToken('');
    setIsValidAddress(false);
  }
    
  const [fee, setFee] = useState(new BigNumber(0))

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
      { abi: ERC20_ABI, address: tokenAddress as Address, functionName: 'symbol', chainId },
      { abi: ERC20_ABI, address: tokenAddress as Address, functionName: 'decimals', chainId },
      { abi: ERC20_ABI, address: tokenAddress as Address, functionName: 'name', chainId },
    ],
  })

  useEffect(() => {
    if (data && data[0].status === 'success') {
      setFee(new BigNumber(data[0]?.result.toString()))
    }
  }, [data])

  return (
    <Page style={{ paddingTop: 60 }}>
      <BorderContainer>
        <AppBody>
          <StyledCardHeader>
            <HeaderContainer flexDirection='row' alignItems='center' justifyContent='space-between' style={{ paddingLeft: '32px' }}>
              <StyledTitle>Create Presale</StyledTitle>
              <Flex flexDirection='row' alignItems='center'>
                <TextHeader>
                  PRESALE FEE:{' '}
                </TextHeader>
                <TextHeader color='primary' fontSize='10px'>{`${parseFloat(new BigNumber(fee).shiftedBy(-18).toFixed(5))} ${
                  chain?.nativeCurrency.symbol ?? 'CRO'
                }`}</TextHeader>
              </Flex>
            </HeaderContainer>
          </StyledCardHeader>

          <StyledWrapper>
            <CustomBodyWrapper>
              <Flex flexDirection='column' style={{ maxWidth: 340 }}>
                {haveContract ? (
                  <>
                    <Flex>
                      <LabelText>{t('Token Address:')}</LabelText>
                    </Flex>
                    
                    <SearchInput onChange={handleChangeQueryToken} placeholder='Enter Token Address:' starting={`${tokenAddress}`} />
                    {isValidAddress ?
                      <NewPresale 
                        tokenAddress={tokenAddress as Address} 
                        chainId={chainId} 
                        percentageTokensIn={amountIn} 
                        softcapIn={softCap.toNumber()} 
                        aiModeIn={AIMode}
                        resetTokenAddress={resetTokenAddress} 
                      /> 
                      : null
                    }
                  </>
                ) : (
                  <ConnectWalletButton chain={defaultChainId} />
                )}
              </Flex>
            </CustomBodyWrapper>
          </StyledWrapper>
        </AppBody>
      </BorderContainer>
    </Page>
  )
}

export default Ifos
