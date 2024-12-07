import React, { useEffect, useState } from 'react'
import { Ifo as IfoType } from 'config/constants/types'
import IfoLayout from './components/IfoLayout'
import IfoCardV2Data from './components/IfoCardV2Data'
import ifosConfig from 'config/constants/ifos'
import { useAccount } from 'wagmi';
import { Flex, Text } from 'uikit'
import SearchInput from 'components/SearchInput'
import styled from 'styled-components'
import { latinise } from 'utils/latinise'
import { isMobile } from 'components/isMobile'

const LabelWrapper = styled.div`
width: ${isMobile ? "80vw" : "20vw"};
  > ${Text} {
    font-size: 12px;
  }
`

const Ifo = () => {
  const { chain } = useAccount()
   const [searchQuery, setSearchQuery] = useState('')
  const [activeIfo, setActiveIfo] = useState<IfoType[]>([]);
  const hashParams = new URL(window.location.href).hash.split('?')[1]
  // let urlParams = new URLSearchParams(document.location.search)
  const urlParams = new URLSearchParams(hashParams)
  const filter = urlParams.get('filter')
  useEffect(() => {
  if (filter) {
    setSearchQuery(filter)
  }
  },[filter])

  useEffect(() => {
    const fetchPoolsData = async () => {
      const fetchedList = await ifosConfig();
      const activeIfoList = fetchedList.filter((ifo) => ifo.isActive && (chain?.id !== 282 ? ifo.dex.chainId !== 282 : true));
      setActiveIfo(activeIfoList);
    };

    fetchPoolsData();
  }, [chain]);

   let filteredSales = []
  const handleChangeSearchQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }
  if (searchQuery) {
    const lowercaseQuery = latinise(searchQuery.toLowerCase())
    filteredSales = activeIfo.filter((sale) =>
      latinise(sale.token.name.toLowerCase()).includes(lowercaseQuery),
    )
  } else {
    filteredSales = activeIfo 
  }

  return (
    <IfoLayout>
      <Flex justifyContent="center" mt="32px">
        <LabelWrapper>
          <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
            Search name
          </Text>
          <SearchInput onChange={handleChangeSearchQuery} starting={searchQuery} placeholder="Search name" />
        </LabelWrapper>
      </Flex>
    <Flex justifyContent="center" alignItems="center" style={{  paddingTop: 40, paddingBottom: 20,  overflowY: 'auto', flexWrap: 'wrap', rowGap: 40, columnGap: 40 }}>
      {filteredSales.length > 0 ?
        filteredSales 
          .slice()
          .reverse()
          .map((ifo) => (
            <IfoCardV2Data key={ifo.id} ifo={ifo} isInitiallyVisible={false} />
          )):           <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
          No results found.
        </Text>
          }
    </Flex>
  </IfoLayout>
  
  );
};

export default Ifo;
