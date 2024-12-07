import { Flex, Text, Toggle } from 'uikit'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import Loading from 'components/Loading'
import PageHeader from 'components/PageHeader'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useFetchNftLaunchPublicData, useFetchNftLaunchUserData, useNftLaunchs } from 'state/nftlaunch/hooks'
import styled from 'styled-components'
import NftLaunchCard from './components/NftLaunchCard'
import NftLaunchTabButtons from './components/NftLaunchTabButtons'
import { useAccount } from 'wagmi'
import contracts from 'config/constants/contracts'
import AddSale from './components/CreateCard'

const CardLayout = styled(FlexLayout)`
  justify-content: center;
`

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


const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

const NftLaunch: React.FC = () => {
  const location = useLocation()
  const { nftLiveLaunchs, nftFinishedLaunchs, userDataLoaded } = useNftLaunchs()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const {chain} = useAccount()

  const [haveContract, setHaveContract] = useState(false)
  useEffect(() => {
    setHaveContract(false)
    if (chain && chain.id in contracts.nftLaunchHost) {
      setHaveContract(true)
    }
  }, [chain])

  // usePollFarmsWithUserDataByPartner(hosts.farmageddon)
  useFetchNftLaunchPublicData()
  useFetchNftLaunchUserData(account)
  
  const showFinishedLaunchs = location.pathname.includes('history')
  const [ showAllChains, setAllChains ] = useState(true)


  const nftlaunchs = showFinishedLaunchs ? nftFinishedLaunchs : nftLiveLaunchs;
  let filteredLaunches;
  
  if (chain?.id !== 97 && chain?.id !== 282) {
    filteredLaunches = nftlaunchs.filter(pool => pool.chainId !== 97 && pool.chainId !== 282)
    
  } else if (chain?.id === 97 || chain?.id === 282) {
    filteredLaunches = nftlaunchs
  } 

  if(!showAllChains && chain) filteredLaunches = filteredLaunches.filter((c) => c.chainId === chain.id)
  return (
    <>
      <PageHeader firstHeading="Mint NFTs" secondHeading="New NFT Sales" />

      <Page>
      {haveContract &&
          <Flex flex="1" height="fit-content" justifyContent="flex-start" alignItems="center" mt={['24px', null, '0']}>
            <AddSale />
          </Flex>
        }
        <PoolControls>
          <ViewControls>
            <NftLaunchTabButtons />
            <ToggleWrapper>
              <Toggle checked={showAllChains} onChange={() => setAllChains(!showAllChains)} scale="sm" />
              <Text> {t('All Chains')}</Text>
            </ToggleWrapper>
          </ViewControls>
        </PoolControls>
        {account && !userDataLoaded && (
          <Flex justifyContent="center" mb="4px">
            <Loading />
          </Flex>
        )}
        <CardLayout style={{ marginTop: '50px' }}>
          {filteredLaunches.map((launch) => (
            <NftLaunchCard key={launch.nftCollectionId} launch={launch} account={account} isLoading={!userDataLoaded} />
          ))}
        </CardLayout>
      </Page>
    </>
  )
}

export default NftLaunch
