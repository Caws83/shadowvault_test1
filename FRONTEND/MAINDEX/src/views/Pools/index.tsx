import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Flex, Image, Text, Toggle, Box } from 'uikit'
import orderBy from 'lodash/orderBy'
import partition from 'lodash/partition'
import { useTranslation } from 'contexts/Localization'
import usePersistState from 'hooks/usePersistState'
import {
  usePools,
  useFetchCakeVault,
  useCakeVault,
  useFetchPublicPoolsDataByHost,
  useFetchUserPoolsByHost,
  usePoolsHostManager,
  useDefaultsFromURLSearch,
} from 'state/pools/hooks'
import { usePollFarmsWithUserDataByPartner } from 'state/farms/hooks'
import { latinise } from 'utils/latinise'
// import Page from 'components/Layout/Page'
import PageHeader from 'components/PageHeader'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import EasySelectHost from 'components/Select/EasySelectHost'
import { Pool } from 'state/types'
import Loading from 'components/Loading'
import { PoolCategory, Host } from 'config/constants/types'
import poolsConfig from 'config/constants/pools'
import PoolTabButtons from './components/PoolTabButtons'
import CreateCard from './components/CreatePoolCard'
import PoolsTable from './components/PoolsTable/PoolsTable'
import { getAprData, getCakeVaultEarnings } from './helpers'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import contracts from 'config/constants/contracts'
import ToggleView, { ViewMode } from './components/ToggleView/ToggleView'
import useTheme from 'hooks/useTheme'
import CakeVaultCard from './components/CakeVaultCard'
import PoolCard from './components/PoolCard'
import FlexLayout from 'components/Layout/Flex'
import Page from 'views/Page'


let pools = []
const fetchPoolsData = async () => {
  pools = await poolsConfig()
}

fetchPoolsData()

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

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0;
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

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 14px;
  }
`

const ControlStretch = styled(Flex)`
  > div {
    flex: 1;
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
interface PoolsProps {
  isWidget?: boolean;
}

const NUMBER_OF_POOLS_VISIBLE = 12

const Pools: React.FC<PoolsProps> = (isWidget) => {
  const loadedUrlParams = useDefaultsFromURLSearch()

  const location = useLocation()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { isDark } = useTheme()
  const { pools: poolsWithoutAutoVault, userDataLoaded } = usePools()
  const [stakedOnly, setStakedOnly] = usePersistState(false, { localStorageKey: 'pancake_pool_staked' })
  const [numberOfPoolsVisible, setNumberOfPoolsVisible] = useState(NUMBER_OF_POOLS_VISIBLE)
  const [observerIsSet, setObserverIsSet] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  // const [viewMode, setViewMode] = usePersistState(ViewMode.CARD, { localStorageKey: 'pancake_pool_view' })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('hot')
  const {chain} = useAccount()
  const [ projectSymbol, setProjectSymbol ] = useState<string>(undefined)

  const [haveContract, setHaveContract] = useState(false)
  useEffect(() => {
    setHaveContract(false)
    if (chain && chain.id in contracts.poolFactoryV3) {
      setHaveContract(true)
    }
  }, [chain])

  const [currentId, setCurrentId] = useState<number>(undefined)
  const [userHost, setPoolsHost] = usePoolsHostManager()
  const [hostOptions, setHostOptions] = useState([])

  useEffect(() => {
    if (loadedUrlParams !== undefined) {
      setPoolsHost(loadedUrlParams.host)
      setSearchQuery(loadedUrlParams.search)
      if(loadedUrlParams.projectSymbol && isWidget) {
        setProjectSymbol(loadedUrlParams.projectSymbol)
      }
    }
  }, [loadedUrlParams, setPoolsHost])

  const chosenPoolsLength = useRef(0)
  const {
    userData: { cakeAtLastUserAction, userShares },
    fees: { performanceFee },
    pricePerFullShare,
    totalCakeInVault,
  } = useCakeVault()
  const accountHasVaultShares = userShares && new BigNumber(userShares).gt(0)
  const performanceFeeAsDecimal = performanceFee && performanceFee / 100

  useEffect(() => {
    let index = 0
    const tempHostOptions = []
    pools.forEach((pool1) => {
      let isAdded = false
      if(chain && chain.id !== 282 && pool1.chainId === 282) isAdded = true
      tempHostOptions.forEach((check) => {
        if (check === pool1.host ) {
          isAdded = true
        }
      })

      if (!isAdded) {
        if (pool1.host === userHost) {
          setCurrentId(index)
        }
        tempHostOptions.push(pool1.host)
        index++
      }
    })
    setHostOptions(tempHostOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHostOptions, userHost, pools])
  
  const pools2 = useMemo(() => {
    return poolsWithoutAutoVault
    /*
    const cakePool = poolsWithoutAutoVault.find((pool) => pool.poolCategory === PoolCategory.SINGLE)
    if(cakePool) {
      const cakeAutoVault = { ...cakePool, isAutoVault: true }
      return [cakeAutoVault, ...poolsWithoutAutoVault]
    } else return poolsWithoutAutoVault
    */
  }, [poolsWithoutAutoVault])

  // TODO aren't arrays in dep array checked just by reference, i.e. it will rerender every time reference changes?
  const [finishedPools, openPools] = useMemo(() => partition(pools2, (pool) => pool.isFinished), [pools2])
  const stakedOnlyFinishedPools = useMemo(
    () =>
      finishedPools.filter((pool) => {
        if (pool.isAutoVault) {
          return accountHasVaultShares
        }
        if (pool.isVisible === undefined || pool.isVisible === true) {
          return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
        }
        return false
      }),
    [finishedPools, accountHasVaultShares],
  )
  const stakedOnlyOpenPools = useMemo(
    () =>
      openPools.filter((pool) => {
        if (pool.isAutoVault) {
          return accountHasVaultShares
        }
        if (pool.isVisible === undefined || pool.isVisible === true) {
          return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
        }
        return false
      }),
    [openPools, accountHasVaultShares],
  )
  const hasStakeInFinishedPools = stakedOnlyFinishedPools.length > 0
  const [ showAllHosts, setAllHosts ] = useState(true)
  const [ showAllChains, setAllChains ] = useState(true)

  try {
    usePollFarmsWithUserDataByPartner(userHost, showAllHosts)
  } catch {
    // eslint-disable-next-line
    console.log('Failed to pool farms with user data by partner')
  }
/*
  try {
    useFetchCakeVault()
  } catch {
    // eslint-disable-next-line
    console.log('Failed to get cake vault data')
  }
*/
  try {
    useFetchPublicPoolsDataByHost(userHost, showAllHosts)
  } catch {
    // eslint-disable-next-line
    console.log('Failed to get public pools data data')
  }
  try {
    useFetchUserPoolsByHost(account, userHost, showAllHosts)
  } catch {
    // eslint-disable-next-line
    console.log('Failed to getuser pool data')
  }

  useEffect(() => {
    const showMorePools = (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setNumberOfPoolsVisible((poolsCurrentlyVisible) => {
          if (poolsCurrentlyVisible <= chosenPoolsLength.current) {
            return poolsCurrentlyVisible + NUMBER_OF_POOLS_VISIBLE
          }
          return poolsCurrentlyVisible
        })
      }
    }

    if (!observerIsSet) {
      const loadMoreObserver = new IntersectionObserver(showMorePools, {
        rootMargin: '0px',
        threshold: 1,
      })
      loadMoreObserver.observe(loadMoreRef.current)
      setObserverIsSet(true)
    }
  }, [observerIsSet])

  const showFinishedPools = location.pathname.includes('history')

  const handleChangeSearchQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  const handleHostOptionChange = (option: Host): void => {
    setPoolsHost(option)
  }

  const sortPools = (poolsToSort: Pool[]) => {
    switch (sortOption) {
      case 'apr':
        // Ternary is needed to prevent pools without APR (like MIX) getting top spot
        return orderBy(
          poolsToSort,
          (pool: Pool) => (pool.apr ? getAprData(pool, performanceFeeAsDecimal).apr : 0),
          'desc',
        )
      case 'earned':
        return orderBy(
          poolsToSort,
          (pool: Pool) => {
            if (!pool.userData || !pool.earningTokenPrice) {
              return 0
            }
            return pool.isAutoVault
              ? getCakeVaultEarnings(
                  account,
                  new BigNumber(cakeAtLastUserAction),
                  new BigNumber(userShares),
                  new BigNumber(pricePerFullShare),
                  new BigNumber(pool.earningTokenPrice),
                ).autoUsdToDisplay
              : new BigNumber(pool.userData.pendingReward.toString()).times(pool.earningTokenPrice).toNumber()
          },
          'desc',
        )
      case 'totalStaked':
        return orderBy(
          poolsToSort,
          (pool: Pool) => {
            let totalStaked = Number.NaN
            if (pool.isAutoVault) {
              if (new BigNumber(totalCakeInVault.toString()).isFinite()) {
                totalStaked = +formatUnits(BigInt(totalCakeInVault.toString()), pool.stakingToken.decimals)
              }
            } else if (new BigNumber(pool.totalStaked?.toString()).isFinite()) {
              totalStaked = +formatUnits(BigInt(pool.totalStaked.toString()), pool.stakingToken.decimals)
            }
            return Number.isFinite(totalStaked) ? totalStaked : 0
          },
          'desc',
        )
      default:
        return poolsToSort
    }
  }

  let chosenPools = []
  if (showFinishedPools) {
    chosenPools = stakedOnly ? stakedOnlyFinishedPools : finishedPools
  } else {
    chosenPools = stakedOnly ? stakedOnlyOpenPools : openPools

  }

  if(chain?.id !== 282) chosenPools = chosenPools.filter((p) => p.chainId !== 282)
  

  if(!showAllChains && chain) chosenPools = chosenPools.filter((c) => c.chainId === chain.id)

  let filteredPools =[]
  if(chosenPools.length === 1 && chosenPools[0].isAutoVault) filteredPools = []
  else if(!showAllHosts){
    filteredPools = chosenPools.filter((pool) => pool.host === userHost)
   } else filteredPools = chosenPools

  if (searchQuery) {
    const lowercaseQuery = latinise(searchQuery.toLowerCase())
    filteredPools = filteredPools.filter((pool) =>
      latinise(pool.earningToken.symbol.toLowerCase()).includes(lowercaseQuery),
    )
  }

  filteredPools = sortPools(filteredPools).slice(0, numberOfPoolsVisible)
  chosenPoolsLength.current = filteredPools.length

  const cardLayout = (
    <CardLayout>
      {filteredPools && filteredPools.length > 0 && filteredPools.map((pool) =>
        pool.isAutoVault ? (
          <CakeVaultCard key="auto" pool={pool} showStakedOnly={stakedOnly} />
        ) : (
          <PoolCard key={pool.sousId} pool={pool} account={account} isWidget={false} />
        ),
      )}
    </CardLayout>
  )

  const tableLayout = <PoolsTable pools={filteredPools} account={account} userDataLoaded={userDataLoaded} />

  

  if (isWidget && projectSymbol) {
    const poolsFromContract = poolsWithoutAutoVault.filter((pool) =>
      pool.earningToken.symbol.toLowerCase() === projectSymbol.toLowerCase() ||
      pool.stakingToken.symbol.toLowerCase() === projectSymbol.toLowerCase()
    );
  
    return (
      <CardLayout>
        {poolsFromContract.map((pool) =>
          <PoolCard key={pool.sousId} pool={pool} account={account} isWidget={false} />
        )}
      </CardLayout>
    );
    
  } else if(isWidget) {
    <Text>Error Loading projectSymbol ....</Text>
  }
  

  return (
    <>
    
      {/* <PageHeader firstHeading="Staking" secondHeading="High APR, low risk." /> */}

      <Page>
        {/*
        {haveContract &&
          <Flex flex="1" height="fit-content" justifyContent="flex-start" alignItems="center" mt={['24px', null, '0']}>
            <CreateCard />
          </Flex>
        }
        <PoolControls>
          <ViewControls>
           
            <ToggleWrapper>
              <ToggleView viewMode={viewMode} isDark={isDark} onToggle={(mode: ViewMode) => setViewMode(mode)} />
              <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} scale="sm" />
              <Text> {t('Staked only')}</Text>
            </ToggleWrapper>
            <ToggleWrapper>
              <Toggle checked={showAllHosts} onChange={() => setAllHosts(!showAllHosts)} scale="sm" />
              <Text> {t('All Hosts')}</Text>
            </ToggleWrapper>
            <ToggleWrapper>
              <Toggle checked={showAllChains} onChange={() => setAllChains(!showAllChains)} scale="sm" />
              <Text> {t('All Chains')}</Text>
            </ToggleWrapper>
           
            <PoolTabButtons hasStakeInFinishedPools={hasStakeInFinishedPools} />
          </ViewControls>
       
          <FilterContainer>
            <LabelWrapper style={{ marginRight: '5px' }}>
              <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                {t('Sort by')}
              </Text>
              <ControlStretch>
                <Select
                  options={[
                    {
                      label: t('Hot'),
                      value: 'hot',
                    },
                    {
                      label: t('APR'),
                      value: 'apr',
                    },
                    {
                      label: t('Earned'),
                      value: 'earned',
                    },
                    {
                      label: t('Total staked'),
                      value: 'totalStaked',
                    },
                  ]}
                  onChange={handleSortOptionChange}
                />
              </ControlStretch>
            </LabelWrapper>

            <LabelWrapper style={{ marginLeft: 16 }}>
              <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                {t('Search')}
              </Text>
              <SearchInput onChange={handleChangeSearchQuery} placeholder="Search Pools" />
            </LabelWrapper>
          </FilterContainer>
        
        </PoolControls>
  
        {hostOptions.length > 0 && !showAllHosts && (
          <Box>
            <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
              {t('Filter By Partner')}
            </Text>
            <EasySelectHost options={hostOptions} selectedId={currentId} onChange={handleHostOptionChange} />
          </Box>
        )}
        <br />
        */}
    
        {showFinishedPools && (
          <Flex mb="10px" justifyContent="center">
            <Text fontSize="14px" color="primary" pb="32px">
              {t('These pools are no longer distributing rewards.')}
            </Text>
          </Flex>
        )}
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center" mb="4px">
            <Loading />
          </Flex>
        )}
        {/* {viewMode === ViewMode.CARD ? cardLayout : tableLayout} */}
        {cardLayout}
        
        <div ref={loadMoreRef} />
        
      </Page>
    </>
  )
}

export default Pools
