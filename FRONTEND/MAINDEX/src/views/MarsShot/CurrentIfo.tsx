import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { isMobile } from 'components/isMobile'
import { useAccount, useReadContracts } from 'wagmi'
import { lanchManagerAbi } from 'config/abi/launchManager'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { latinise } from 'utils/latinise'
import { readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'
import RoundData from './RoundData'
import { Flex, Text, Toggle, Button } from 'uikit'
import QuestionHelper from 'components/QuestionHelper'
import { defaultChainId } from 'config/constants/chains'

const PageContainer = styled.div``;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  padding-bottom: 20px;
  ${Text} {
    margin-left: 8px;
  }
`

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  border-radius: 20px;
  padding-top: 20px;
`;

const TableHead = styled.thead`
  background-color: #0577DA;
  color: white;
  border-radius: 20px;
`;

const TableRow = styled.tr``;

const TableHeadCell = styled.th`
  padding: 10px;
  text-align: center;
  background-color: #0577DA;
  color: white;
  border: none;
  font-size: ${isMobile ? '10px' : '12px'};
`;

const TableBody = styled.tbody``;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Ifo = ({ state, setTopLiveIfo, searchQuery, setSponsors, account }) => {

  const [haveContract, setHaveContract] = useState(false)
  const { chain } = useAccount()
  useEffect(() => {
    setHaveContract(false)
    if (chain && chain?.id in contracts.tokenFactory) {
      setHaveContract(true)
    }
  }, [chain])

  const chainId = haveContract ? chain?.id : defaultChainId

  const [onlyContributed, setShowOnlyContributed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10;
  const maxSponsorships = 20
  
 
  const { data, refetch } = useReadContracts({
    contracts: [
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'getLiveRounds',
        args: [currentPage, itemsPerPage],
        chainId: chainId,
      },
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'getFinishedRounds',
        args: [currentPage, itemsPerPage],
        chainId: chainId,
      },
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'getTop',
        args: [5n],
        chainId: chainId,
      },
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'getTopLiveWithSponsorship',
        chainId: chainId,
        args: [maxSponsorships],
      },
    ],
  });

  const liveRounds = data?.[0]?.result ?? [];
  const finishedRounds = data?.[1]?.result ?? [];
  const top5Rounds = data?.[2]?.result ?? [];
  const sponsors = data?.[3]?.result ?? [];


  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
  
    return () => clearInterval(interval);
  }, [refetch]);

  // Set top live IFO and sponsors on data change
  useEffect(() => {
    if (top5Rounds.length > 0) {
      setTopLiveIfo(top5Rounds[0][0]);
    }
    if (sponsors.length > 0) {
      setSponsors(sponsors[0]);
    }
  }, [top5Rounds, sponsors, setTopLiveIfo, setSponsors]);

   // Filter rounds based on state and search query without applying onlyContributed
   const initialFilteredData = useMemo(() => {
    let dataToFilter = state === 1 ? liveRounds[0] : state === 2 ? finishedRounds[0] : top5Rounds[0];
  
    if (searchQuery && state !== 0 && dataToFilter.length > 0) {
      const lowercaseQuery = latinise(searchQuery.toLowerCase());
      dataToFilter = dataToFilter.filter((item) =>
        latinise(item.name.toLowerCase()).includes(lowercaseQuery)
      );
    }
  
    return dataToFilter;
  }, [state, searchQuery, liveRounds, finishedRounds, top5Rounds]);
  
  // Fetch user data based on filtered rounds
  useEffect(() => {
    const fetchUserData = async () => {
      if (initialFilteredData?.length > 0) {
        try {
          const calls = initialFilteredData.map((item) => ({
            abi: lanchManagerAbi,
            address: getAddress(contracts.launchManager, chainId),
            functionName: 'getUserContributionAndAllocation',
            args: [BigInt(item.roundId), account ?? ''],
            chainId: chainId,
          }));
          const results = await readContracts(config, { contracts: calls });
          setUserData(results);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      } else {
        setUserData([]);
      }
    };
    fetchUserData();
  }, [account, initialFilteredData]);

  const finalFilteredData = useMemo(() => {
    let dataToFilter = initialFilteredData || []; // Default to an empty array if undefined
  
    if (onlyContributed && account && userData?.length === initialFilteredData?.length) {
      dataToFilter = dataToFilter.filter((item, index) =>
        userData[index]?.result[1] > 0n || item.creator === account
      );
    }
  
    if (state !== 0) {
      dataToFilter = dataToFilter.slice().reverse();
    }
  
    return dataToFilter;
  }, [onlyContributed, account, userData, state]);
  
  const finalUserData = useMemo(() => {
    let dataToFilter = userData || []; // Default to an empty array if undefined
  
    if (onlyContributed && account && userData?.length === initialFilteredData?.length) {
      dataToFilter = dataToFilter.filter((data, index) =>
        data?.result[1] > 0n || initialFilteredData[index]?.creator === account
      );
    }
  
    if (state !== 0) {
      dataToFilter = dataToFilter.slice().reverse();
    }
  
    return dataToFilter;
  }, [onlyContributed, account, userData, state]);
  
  
console.log(initialFilteredData, userData)

  useEffect(() => {
    const totalRounds = state === 1 ? liveRounds[1] : state === 2 ? finishedRounds[1] : top5Rounds[1];
    setTotalPages(Math.ceil(Number(totalRounds?.toString()) / itemsPerPage));
  }, [state, liveRounds, finishedRounds, top5Rounds]);
  
 
   const handlePageChange = (pageNumber) => {
     setCurrentPage(pageNumber);
   };

  return (
    <PageContainer>
      {account && state !== 0 && (
        <ToggleWrapper>
          <Flex flexDirection="row">
            <Toggle checked={onlyContributed} onChange={() => setShowOnlyContributed(!onlyContributed)} scale="sm" />
            <Text>My Rockets</Text>
            <QuestionHelper
              mr="10px"
              text={
                <>
                  <Text>Shows tokens you own, or have contributed too.</Text>
                </>
              }
              ml="4px"
            />
          </Flex>
        </ToggleWrapper>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {state === 0 && !isMobile && <TableHeadCell>Rank</TableHeadCell>}
              <TableHeadCell></TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Raised</TableHeadCell>
              <TableHeadCell>Minimum</TableHeadCell>
              {state !== 2 && <TableHeadCell>{!isMobile ? 'Time Left' : 'Time'}</TableHeadCell> }
              {!isMobile && <TableHeadCell>TG</TableHeadCell>}
              {!isMobile && <TableHeadCell>Web</TableHeadCell>}
              <TableHeadCell>Action</TableHeadCell>
            </TableRow>
          </TableHead>
         
          <TableBody>
          {finalFilteredData && finalFilteredData.length > 0 && finalFilteredData.map((item, index) => (
            <RoundData 
              key={index} 
              item={item} 
              chainId={chainId} 
              userData={finalUserData[index]?.result} 
              state={state} 
              account={account} 
              index={index} 
            />
          ))}

          </TableBody>
          
        </Table>
      </TableContainer>
      <PaginationContainer>
        {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => (
          <Button
            variant='text'
            scale='sm'
            key={i}
            onClick={() => handlePageChange(i + 1)}
            disabled={i + 1 === currentPage}
          >
            {i + 1}
          </Button>
        ))}
      </PaginationContainer>
    </PageContainer>
  );
};

export default Ifo;
