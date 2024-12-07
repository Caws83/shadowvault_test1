import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Route, useLocation } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { Image, RowType, Toggle, Text, Flex, Box } from 'uikit'
import styled from 'styled-components'
import Page from 'components/Layout/Page'
import {
  useFarmHostManager,
  useFarms,
  useHostPrice,
  usePollFarmsWithUserDataByPartner,
  useDefaultsFromURLSearch,
} from 'state/farms/hooks'
import { Farm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import { getFarmApr } from 'utils/apr'
import { orderBy } from 'lodash'
import isArchivedPid from 'utils/farmHelpers'
import { latinise } from 'utils/latinise'
import { useUserFarmStakedOnly } from 'state/user/hooks'
import PageHeader from 'components/PageHeader'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import EasySelectHost from 'components/Select/EasySelectHost'
import Loading from 'components/Loading'
import { Host } from 'config/constants/types'
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard'
import Table from './components/FarmTable/FarmTable'
import FarmTabButtons from './components/FarmTabButtons'
import CreateCard from './components/CreateLockerCard'
import { RowProps } from './components/FarmTable/Row'
import { DesktopColumnSchema, ViewMode } from './components/types'
import { useAccount } from 'wagmi'
import ToggleView from './components/ToggleView/ToggleView'
import useTheme from 'hooks/useTheme'
import usePersistState from 'hooks/usePersistState'
import FlexLayout from 'components/Layout/Flex'
import hosts from 'config/constants/hosts'
import { defaultChainId } from 'config/constants/chains'


const ControlContainer = styled.div`
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

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
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

const NUMBER_OF_FARMS_VISIBLE = 12


const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

const Farms: React.FC<{ isLocker: boolean }> = ({ isLocker }) => {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [viewMode, setViewMode] = usePersistState(ViewMode.CARD, { localStorageKey: 'pancake_farm_view' })
  const [userHost, setFarmHost] = useFarmHostManager(isLocker)
  const { chain } = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const isTestnet = chainId === 282
  const { data: farmsLP, userDataLoaded } = useFarms()
  const { isDark } = useTheme()
  // const cakePrice = usePriceCakeBusd()
  const [query, setQuery] = useState('')
  const { address: account } = useAccount()
  const [sortOption, setSortOption] = useState('hot')
  const chosenFarmsLength = useRef(0)
  const [currentId, setCurrentId] = useState<number>(undefined)

  const [hostOptions, setHostOptions] = useState([])

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived
  

  useEffect(() => {

    if (isLocker) {
      if(!isTestnet) setFarmHost(hosts.marswap);
      else setFarmHost(hosts.marstest)
    } else if(!isLocker) {
      if(!isTestnet) setFarmHost(hosts.marswap);
      else setFarmHost(hosts.marstest)
    }
  },[isLocker, setFarmHost, isTestnet]);

  useEffect(() => {
    if (loadedUrlParams !== undefined) {
      setFarmHost(loadedUrlParams.host)
      setQuery(loadedUrlParams.search)
    }
  }, [loadedUrlParams, setFarmHost])


  useEffect(() => {
    let index = 0
    const tempHostOptions = []

    farmsLP.forEach((farm1) => {
      let isAdded = false
      // if reg farm page and is a locker farm
      if(!isLocker && farm1.host.isLocker) isAdded = true
      if(!isTestnet && farm1.host.chainId === 282) isAdded = true
      // if locker page and is a reg farm
      if(isLocker && !farm1.host.isLocker) isAdded = true
      tempHostOptions.forEach((check) => {
        // exclude locker farms
        if (check === farm1.host) {
          isAdded = true
        }
      })

      if (!isAdded) {
        if (farm1.host === userHost) {
          setCurrentId(index)
        }
        tempHostOptions.push(farm1.host)
        index++
      }
    })
    setHostOptions(tempHostOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHostOptions, userHost, farmsLP])

  try {
    usePollFarmsWithUserDataByPartner(userHost, true)
  } catch {
    // eslint-disable-next-line
    console.log('Failed to poll farms with userdata by partner')
  }

  
  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly()

  

  const activeFarms = farmsLP.filter(
    (farm) =>
      farm.host === userHost &&
      (isTestnet || farm.host.chainId !== 282) && // Show all if testnet, otherwise exclude chainId 282
      farm.isVisible &&
      (farm.host.isLocker ? true : farm.multiplier !== '0X') &&
      !isArchivedPid(farm.pid),
  );
  
  const inactiveFarms = farmsLP.filter(
    (farm) =>
      farm.host === userHost &&
      (isTestnet || farm.host.chainId !== 282) && // Show all if testnet, otherwise exclude chainId 282
      farm.isVisible &&
      ((farm.host.isLocker && (!farm.isLocked || new BigNumber(farm.unLockTime.toString()).lt(Date.now() / 1000))) ||
        (!farm.host.isLocker && farm.multiplier === '0X')) &&
      !isArchivedPid(farm.pid),
  );

  const archivedFarms = farmsLP.filter((farm) => isArchivedPid(farm.pid))

  const stakedOnlyFarms = activeFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance.toString()).isGreaterThan(0),
  )

  const stakedInactiveFarms = inactiveFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance.toString()).isGreaterThan(0),
  )

  const stakedArchivedFarms = archivedFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance.toString()).isGreaterThan(0),
  )

  const getHostPrice = useHostPrice()
  const farmsList = useCallback(
    (farmsToDisplay: Farm[]): FarmWithStakedValue[] => {
      let farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        if (!farm.lpTotalInQuoteToken || !farm.quoteToken.busdPrice) {
          return farm
        }
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteToken.busdPrice)
        const hostprice = getHostPrice(farm.host)
        console.log(farm.host.payoutToken.symbol, hostprice.toString())
        const rewardPerBlock = new BigNumber(farm.blockReward)
        const { cakeRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(
              new BigNumber(farm.poolWeight),
              hostprice,
              totalLiquidity,
              farm.lpAddresses[farm.chainId],
              farm.host,
              rewardPerBlock,
            )
          : { cakeRewardsApr: 0, lpRewardsApr: 0 }
        const pricePerToken = totalLiquidity.dividedBy(farm.lpTotalMC).shiftedBy(18)

        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity, pricePerToken }
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
          return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery)
        })
      }
      return farmsToDisplayWithAPR
    },
    [getHostPrice, query, isActive],
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)
  const [observerIsSet, setObserverIsSet] = useState(false)

  const chosenFarmsMemoized = useMemo(() => {
    let chosenFarms = []

    const sortFarms = (farms2: FarmWithStakedValue[]): FarmWithStakedValue[] => {
      switch (sortOption) {
        case 'apr':
          return orderBy(farms2, (farm: FarmWithStakedValue) => farm.apr + farm.lpRewardsApr, 'desc')
        case 'multiplier':
          return orderBy(
            farms2,
            (farm: FarmWithStakedValue) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
            'desc',
          )
        case 'earned':
          return orderBy(
            farms2,
            (farm: FarmWithStakedValue) => (farm.userData ? Number(farm.userData.earnings) : 0),
            'desc',
          )
        case 'liquidity':
          return orderBy(farms2, (farm: FarmWithStakedValue) => Number(farm.liquidity), 'desc')
        default:
          return farms2
      }
    }

    if (isActive) {
      chosenFarms = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    }
    if (isInactive) {
      chosenFarms = stakedOnly ? farmsList(stakedInactiveFarms) : farmsList(inactiveFarms)
    }
    if (isArchived) {
      chosenFarms = stakedOnly ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms)
    }

    const filteredFarms = chosenFarms
    return sortFarms(filteredFarms).slice(0, numberOfFarmsVisible)
  }, [
    sortOption,
    activeFarms,
    farmsList,
    inactiveFarms,
    archivedFarms,
    isActive,
    isInactive,
    isArchived,
    stakedArchivedFarms,
    stakedInactiveFarms,
    stakedOnly,
    stakedOnlyFarms,
    numberOfFarmsVisible,
  ])

  chosenFarmsLength.current = chosenFarmsMemoized.length

  useEffect(() => {
    const showMoreFarms = (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
          if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
            return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
          }
          return farmsCurrentlyVisible
        })
      }
    }

    if (!observerIsSet) {
      const loadMoreObserver = new IntersectionObserver(showMoreFarms, {
        rootMargin: '0px',
        threshold: 1,
      })
      loadMoreObserver.observe(loadMoreRef.current)
      setObserverIsSet(true)
    }
  }, [chosenFarmsMemoized, observerIsSet])

  const rowData = chosenFarmsMemoized.map((farm) => {
    const { token, quoteToken } = farm
    const tokenAddress = token.address
    const quoteTokenAddress = quoteToken.address
    const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '')
    const hostprice = getHostPrice(farm.host)
    const row: RowProps = {
      apr: {
        value: getDisplayApr(farm.apr, farm.lpRewardsApr),
        id: farm.id,
        pid: farm.pid,
        multiplier: farm.multiplier,
        lpLabel,
        lpSymbol: farm.lpSymbol,
        tokenAddress,
        quoteTokenAddress,
        payoutToken: farm.host.payoutToken,
        cakePrice: hostprice,
        originalValue: farm.apr,
      },
      farm: {
        label: lpLabel,
        pid: farm.pid,
        id: farm.id,
        token: farm.token,
        quoteToken: farm.quoteToken,
        host: farm.host,
        dex: farm.dex,
        pricePerToken: farm.pricePerToken,
        unLockTime: farm.unLockTime,
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData?.earnings ?? 0)),
        earningValue: getBalanceNumber(new BigNumber(farm.userData?.earnings ?? 0).times(hostprice)),
        pid: farm.pid,
      },
      liquidity: {
        liquidity: farm.liquidity,
        pricePerToken: farm.pricePerToken,
        totalStaked: new BigNumber(farm.lpTotalMC),
        totalSupply: new BigNumber(farm.lpTotalSupply),
      },
      multiplier: {
        multiplier: farm.multiplier,
      },
      details: farm,
    }
    return row
  })

  const renderContent = (): JSX.Element => {
    /*
    if (viewMode === ViewMode.TABLE && rowData.length) {
    const columnSchema = DesktopColumnSchema

    const columns = columnSchema.map((column) => ({
      id: column.id,
      name: column.name,
      label: column.label,
      sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
        switch (column.name) {
          case 'farm':
            return b.id - a.id
          case 'apr':
            if (a.original.apr.value && b.original.apr.value) {
              return Number(a.original.apr.value) - Number(b.original.apr.value)
            }

            return 0
          case 'earned':
            return a.original.earned.earnings - b.original.earned.earnings
          default:
            return 1
        }
      },
      sortable: column.sortable,
    }))

    return <Table data={rowData} columns={columns} userDataReady={userDataReady} />
  }
    */
  return (
    <FlexLayout>
     
        {isActive && chosenFarmsMemoized.map((farm) => (
          <FarmCard
            key={farm.id}
            farm={farm}
            displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
            cakePrice={getHostPrice(farm.host)}
            account={account}
            removed={false}
          />
        ))}
      
    
        {isInactive && chosenFarmsMemoized.map((farm) => (
          <FarmCard
            key={farm.id}
            farm={farm}
            displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
            cakePrice={getHostPrice(farm.host)}
            account={account}
            removed
          />
        ))}
  

        {isArchived && chosenFarmsMemoized.map((farm) => (
          <FarmCard
            key={farm.id}
            farm={farm}
            displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
            cakePrice={getHostPrice(farm.host)}
            account={account}
            removed
          />
        ))}
    
    </FlexLayout>
  )
}

  const handleSortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  const handleHostOptionChange = (option: Host): void => {
    setFarmHost(option)
  }

  return (
    <>
     

      <Page>
        {userHost.isLocker && isLocker &&
          <Flex flex="1" height="fit-content" justifyContent="flex-start" alignItems="center" mt={['24px', null, '0']}>
            <CreateCard host={userHost} />
          </Flex>
        }
        <ControlContainer>
          <ViewControls>
            {/* <ToggleView viewMode={viewMode} isDark={isDark} onToggle={(mode: ViewMode) => setViewMode(mode)} /> */}
            <ToggleWrapper>
              <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} scale="sm" />
              <Text> {t('Staked only')}</Text>
            </ToggleWrapper>
            
            <FarmTabButtons hasStakeInFinishedFarms={stakedInactiveFarms.length > 0} isLocker={userHost.isLocker} />
          </ViewControls>
          <FilterContainer>
            {isLocker &&
            <LabelWrapper style={{ marginRight: '5px' }}>
              <Text textTransform="uppercase">{t('Sort by')}</Text>
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
                    label: t('Multiplier'),
                    value: 'multiplier',
                  },
                  {
                    label: t('Earned'),
                    value: 'earned',
                  },
                  {
                    label: t('Liquidity'),
                    value: 'liquidity',
                  },
                ]}
                onChange={handleSortOptionChange}
              />
            </LabelWrapper>
            }

{hostOptions.length > 0 && (

<LabelWrapper style={{ marginRight: 16, width: 320 }}>
  <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
    {t('Filter By Partner')}
  </Text>
  <EasySelectHost options={hostOptions} selectedId={currentId} onChange={handleHostOptionChange} />
</LabelWrapper>
)}

            <LabelWrapper style={{ marginLeft: 16 }}>
              <Text textTransform="uppercase">{t('Search')}</Text>
              <SearchInput onChange={handleChangeQuery} placeholder="Search" />
            </LabelWrapper>



          </FilterContainer>
        </ControlContainer>
        
       
      
        <br />
        {renderContent()}
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
        <div ref={loadMoreRef} />
        
      </Page>
    </>
  )
}

export default Farms
