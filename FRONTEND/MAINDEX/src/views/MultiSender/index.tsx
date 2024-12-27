/* eslint-disable no-await-in-loop */
import { Flex, CardHeader, Text, useModal, Button, TextHeader } from 'uikit'
import Page from 'views/Page'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
import SearchInput from 'components/SearchInput'
import NumberInput from 'components/NumberInput/NumberInput'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { BigNumber } from 'bignumber.js'
import { getFullDisplayBalance } from 'utils/formatBalance'
import styled from 'styled-components'
import ActionPanel from './components/actionPanel'
import InputPanel from './components/inputPanel'
import { readContract } from '@wagmi/core'
import { useAccount, useReadContract } from 'wagmi'
import contracts from 'config/constants/contracts'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'
import useRefresh from 'hooks/useRefresh'
import { isMobile } from 'components/isMobile'
import { Wrapper } from 'views/Swap/components/styleds'
import { AppBody } from '../../components/App'
import { defaultChainId } from 'config/constants/chains'


const CustomBodyWrapper = styled.div`
  padding: 10px;
  margin-left: 20px;
  margin-right: 20px;
`

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

const Container = styled.div`
  padding: 16px;
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
`
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
`

interface tInfo {
  tDec: number
  tSym: string
  tName: string
}

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

const MultiSender: React.FC = () => {
  const { t } = useTranslation()

  const { chain } = useAccount()
  const { address: account } = useAccount()

  const [tokenAddress, setToken] = useState<`0x${string}`>('0x0')
  const [addresses, setAddresses] = useState<string[]>([])
  const [amounts, setAmounts] = useState<number[]>([])
  const [totalAmount, setTotal] = useState(new BigNumber(0))
  const [howMany, setHowMany] = useState<number>(200)
  const [tokenInfo, setTokenInfo] = useState<tInfo>()

  const [isToken, setIsToken] = useState<boolean>(false)

  const [chainId, setChainId] = useState<number>(chain?.id)
  useEffect(() => {
    if(chain && chain.id !== chainId) {
      setChainId(chain.id)
    }
  },[chain])

  const { slowRefresh } = useRefresh()
  const [tBalance, setCBalance] = useState(new BigNumber(0))
  const {data, isLoading, refetch } = useReadContract({
        abi: ERC20_ABI,
        address: isToken ? tokenAddress : '0x0',
        functionName: 'balanceOf',
        args: [account ?? '0x0'],
        chainId: chain?.id
  })

  useEffect(() => {
    if(data && !isLoading) setCBalance(new BigNumber(data.toString()))
  },[data])

  useEffect(() => {
    if(isToken) refetch()
  },[slowRefresh, tokenAddress])

  const handleChangeQueryToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value as `0x${string}`)
    try {
      const tDecRaw = await readContract(config, {
        abi: ERC20_ABI,
        address: event.target.value as `0x${string}`,
        functionName: 'decimals',
        chainId
      })
      const tDec = new BigNumber(tDecRaw.toString()).toNumber()
      const tSym = await readContract(config, {
        abi: ERC20_ABI,
        address: event.target.value as `0x${string}`,
        functionName: 'symbol',
        chainId
      }) as string
      const tName = await readContract(config, {
        abi: ERC20_ABI,
        address: event.target.value as `0x${string}`,
        functionName: 'name',
        chainId
      }) as string
      setTokenInfo({
        tDec,
        tSym,
        tName
      })
      setIsToken(true)
    } catch {
      setIsToken(false)
    }
  }
  const handleChangeQueryHowMany = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHowMany(Number(event.target.value))
  }

  const handleProcessInput = (addr: string[], amnt: number[]) => {
    setAddresses(addr)
    setAmounts(amnt)
    let totalAmountRaw = 0
    for (let i = 0; i < amnt.length; i++) {
      totalAmountRaw += amnt[i]
    }
    setTotal(new BigNumber(totalAmountRaw))
  }

  const [onPresentSendModal] = useModal(
    <ActionPanel
      tokenAddress={tokenAddress}
      tokenInfo={tokenInfo}
      addresses={addresses}
      amounts={amounts}
      totalAmount={totalAmount}
      howMany={howMany}
      chainId={chainId}
      tBalance={tBalance}
    />,
  )
  const onClickNext = async () => {
    onPresentSendModal()
  }

  const txCount = Math.ceil(addresses.length / howMany)

  const [haveContract, setHaveContract] = useState(false)
  useEffect(() => {
    setHaveContract(false)
    if (chainId in contracts.aridropper) {
      setHaveContract(true)
    }
  }, [chainId])




  return (
    <>
      <Page>
        <AppBody>
          <StyledCardHeader>
            <HeaderContainer flexDirection="column" alignItems="flex-start" justifyContent="flex-start" style={{ paddingLeft: '32px' }}>
              <StyledTitle>Quick Airdrop</StyledTitle>
            </HeaderContainer>
          </StyledCardHeader>

          <Wrapper>
            <CustomBodyWrapper>

            <GridContainer
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
            <Tile>
                <Flex alignItems='flex-start'>
                  <LabelText>{t('Token Address')}</LabelText>
                </Flex>
                <SearchInput onChange={handleChangeQueryToken} placeholder="Enter Token Address" />
            </Tile>

            <Tile>
            <Flex alignItems='flex-start'>
              <LabelText>{t('Wallets Per Tx')}</LabelText>
            </Flex>
                <NumberInput
                  onChange={handleChangeQueryHowMany}
                  placeholder="How Many At Once"
                  startingNumber={howMany.toString()}
                />
            </Tile>
            {isToken && tokenInfo.tDec &&
              <Text>{`Balance: ${tBalance?.shiftedBy(-tokenInfo?.tDec).toFixed(3)}`}</Text>
            }
       </GridContainer>
          
          <Flex justifyContent="center" mb="30px" mt="30px" mr="10px" ml="10px">
            <InputPanel onProcessInput={handleProcessInput} />
          </Flex>
        

          {isToken && (
            <>
              <Container>
                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('Token')}:</Text>
                  <Text>{`${tokenInfo.tName}`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="textSubtle">{t(`Total ${tokenInfo.tSym} being sent:`)}</Text>
                  <Text>{`${getFullDisplayBalance(totalAmount, 0, 4)}`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="textSubtle">{t(`${tokenInfo.tSym} balance:`)}</Text>
                  <Text>{`${getFullDisplayBalance(tBalance, tokenInfo.tDec, 4)}`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="textSubtle">{t('How Many Wallets')}:</Text>
                  <Text>{`${addresses.length}`}</Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="textSubtle">{t('Total TXs Needed')}:</Text>
                  <Text>{`${txCount}`}</Text>
                </Flex>
                </Container>
            </>
          )}
         
        {account ? (
                <Flex flexDirection="column" alignItems="center" mb="8px" mt="30px">
                  <Flex flexDirection='row' alignItems='center' mb="16px">
                    <TextHeader>
                      AIRDROP FEE:{' '}
                    </TextHeader>
                    {haveContract &&
                      <TextHeader color='primary' fontSize='14px'>{`${parseFloat(new BigNumber(0).shiftedBy(-18).toFixed(5))} ${
                        chain?.nativeCurrency.symbol
                      }`}</TextHeader>
                    }
                  </Flex>
                  <GradientButton 
                    onClick={onClickNext} 
                    disabled={!isToken || !haveContract || addresses.length === 0 || totalAmount.eq(0) || tBalance.lt(totalAmount.shiftedBy(tokenInfo?.tDec))}>
                    Send Tokens
                  </GradientButton>
                </Flex>
              ) : (
                <Flex justifyContent="center" mb="8px" mt="30px">
                  <ConnectWalletButton chain={chainId ?? defaultChainId} />
                </Flex>
              )}
       

        
          </CustomBodyWrapper>
          </Wrapper>
      </AppBody>
      </Page>
    </>
  )
}

export default MultiSender
