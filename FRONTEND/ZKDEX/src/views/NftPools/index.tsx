import { Flex, Heading, Text, Toggle } from 'uikit'
import Page from 'components/Layout/Page'
import PageHeader from 'components/PageHeader'
import hosts from 'config/constants/hosts'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useFetchNftPublicPoolsDataByHost, useFetchNftUserPoolsByHost, useGetNftPools, useNftPools } from 'state/nftpools/hooks'
import styled from 'styled-components'
import NftPoolsTable from './components/NftPoolsTable/NftPoolsTable'
import NftPoolTabButtons from './components/NftPoolTabButtons'
import { useAccount } from 'wagmi'
import contracts from 'config/constants/contracts'
import CreateNFTPool from './components/CreatePoolCard'

import BigNumber from 'bignumber.js'
import usePersistState from 'hooks/usePersistState'

const PoolControls = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;

  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px 32px;
    margin-bottom: 0;
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

const ViewControls = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
`

const NftPools: React.FC = () => {
  const location = useLocation()
  const { livePools, finishedPools, userDataLoaded } = useNftPools()
  const { t } = useTranslation()
  const {chain} = useAccount()
  const { address: account } = useAccount()
  const [stakedOnly, setStakedOnly] = usePersistState(false, { localStorageKey: 'nft_Pool_staked' })

  
  useFetchNftUserPoolsByHost(account, hosts.farmageddon)

  const [haveContract, setHaveContract] = useState(false)
  useEffect(() => {
    setHaveContract(false)
    if (chain && chain.id in contracts.nftPoolFactoryV3) {
      setHaveContract(true)
    }
  }, [chain])

  const [ showAllChains, setAllChains ] = useState(true)

  const showFinishedPools = location.pathname.includes('history')

  const pools = showFinishedPools ? finishedPools : livePools
  let poolsToShow = pools

  if(stakedOnly){
    poolsToShow = pools.filter((pool) => pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0))
  }   

 
  
  if(!showAllChains && chain) poolsToShow = poolsToShow.filter((c) => c.chainId === chain.id)

  return (
    <>
      <PageHeader firstHeading="NFT Pools" secondHeading="Just stake some NFTs to earn!">
        <Heading scale="md" color="text">
          {t('High APR, low risk.')}
        </Heading>
      </PageHeader>
      <Page>
      {haveContract &&
          <Flex flex="1" height="fit-content" justifyContent="flex-start" alignItems="center" mt={['24px', null, '0']}>
            <CreateNFTPool />
          </Flex>
        }
        <PoolControls>
          <ViewControls>
            <NftPoolTabButtons />
            <ToggleWrapper>
              <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} scale="sm" />
              <Text> {t('Staked only')}</Text>
            </ToggleWrapper>
            <ToggleWrapper>
              <Toggle checked={showAllChains} onChange={() => setAllChains(!showAllChains)} scale="sm" />
              <Text> {t('All Chains')}</Text>
            </ToggleWrapper>
          </ViewControls>
        </PoolControls>
        {showFinishedPools && (
          <Text fontSize="20px" color="failure" pb="32px">
            {t('These pools are no longer distributing rewards. Please unstake your tokens.')}
          </Text>
        )}
        
        <NftPoolsTable pools={poolsToShow} account={account} userDataLoaded={userDataLoaded} />
      </Page>
    </>
  )
}

export default NftPools
