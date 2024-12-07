import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { CHAINID } from '../../config/marketPlace';
import { Address } from 'viem';
import PageHeader from '../../components/PageHeader';
import { SwitchToNetwork } from '../../components/SwitchToNetWork';
import { Button, Card, Flex, Text } from '../../uikit';
import AddCollectionCard from '../../components/AddCollectionCard';
import CollectionsCard from './CollectionCard';
import useTheme from '../../hooks/useTheme';
import { isMobile } from 'components/isMobile';
import { allInfo } from '../../config/types';
import Select, { OptionProps } from '../../components/Select/Select';
import { API_URL } from "config";

const StyledCard = styled(Card)`
  width: 90%;
  margin: 0 auto; 
  display: flex;
  justify-content: center; 
  align-items: center;
`;

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
  }
`;

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`;

interface State {
    collection: Address;
    volume: string;
    name: string;
    TotalSupply: string;
    LowPrice: string;
    HighPrice: string;
    amountListed: string;
}

const SORT_FIELD = {
    createdAt: 'default',
    volume: 'totalVolume',
    items: 'numberTokensListed',
    lowestPrice: 'lowestPrice',
    highestPrice: 'highestPrice',
};

const SORT_FIELD_INDEX_MAP = new Map([
    [SORT_FIELD.createdAt, 0],
    [SORT_FIELD.volume, 1],
    [SORT_FIELD.items, 2],
    [SORT_FIELD.lowestPrice, 3],
    [SORT_FIELD.highestPrice, 4],
]);

const blackList = [
    '0x50D66f49fD0574CD0240FaD06574244D72Afb63a',
    '0xC6AbCB5B2dd66A63243234017dAadAb216F946f4',
    '0x36f9EB523310619138F5c91174cedC57652807B3',
]
const isBlacklisted = (address) => {
    for(let i=0; i<blackList.length; i++) {
      if(address === blackList[i]) return true
    }
    return false
  }

function App() {
    const [sortDirection, setSortDirection] = useState<boolean>(false);
    const [sortField, setSortField] = useState<string>(SORT_FIELD.items);
    const [searchTerm, setSearchTerm] = useState("");

    const { theme } = useTheme();

    const options = useMemo(() => {
        return [
            {
                label: 'Collection',
                value: SORT_FIELD.createdAt,
            },
            {
                label: 'Volume',
                value: SORT_FIELD.volume,
            },
            {
                label: 'Items',
                value: SORT_FIELD.items,
            },
            {
                label: 'Lowest Price',
                value: SORT_FIELD.lowestPrice,
            },
            {
                label: 'Highest Price',
                value: SORT_FIELD.highestPrice,
            },
        ];
    }, []);

    const [info, setData] = useState<State[]>([]);

    useEffect(() => {
        const API_URL2 = `${API_URL}/V2/marketinfo`;
        fetch(API_URL2)
            .then((response) => response.json())
            .then((jsonData) => {
                let tmpData: State[] = [];
                if (jsonData as allInfo) {
                    for (const key in jsonData) {
                        const colAddress = key as Address;
                        if(!isBlacklisted(colAddress)){
                        tmpData.push({
                            collection: colAddress,
                            volume: jsonData[colAddress].info.volume,
                            name: jsonData[colAddress].info.name,
                            TotalSupply: jsonData[colAddress].info.TotalSupply,
                            LowPrice: jsonData[colAddress].info.LowPrice,
                            HighPrice: jsonData[colAddress].info.HighPrice,
                            amountListed: jsonData[colAddress].info.amountListed,
                        });
                        }
                    }
                }
                setData(tmpData);
            });
    }, []);

    const [sortedData, setSorted] = useState<State[]>();
    useEffect(() => {
        if (!sortedData && info.length > 0) {
            setSorted(info);
            handleSort(sortField, sortDirection);
        }
    });

    const handleSort = (newField: string, sort: boolean) => {
        let tmpSorted = filteredData;
        
        if (newField === SORT_FIELD.volume) {
            tmpSorted = filteredData.sort(
                (a, b) => (sort ? -1 : 1) * (parseFloat(b.volume) - parseFloat(a.volume))
            );
        } else if (newField === SORT_FIELD.items) {
            tmpSorted = filteredData.sort(
                (a, b) => (sort ? -1 : 1) * (parseFloat(b.amountListed) - parseFloat(a.amountListed))
            );
        } else if (newField === SORT_FIELD.highestPrice) {
            tmpSorted = filteredData.sort(
                (a, b) => (sort ? -1 : 1) * (parseFloat(b.HighPrice) - parseFloat(a.HighPrice))
            );
        } else if (newField === SORT_FIELD.lowestPrice) {
            tmpSorted = filteredData.sort(
                (a, b) => (sort ? -1 : 1) * (parseFloat(b.LowPrice) - parseFloat(a.LowPrice))
            );
        }

        setSortField(newField);
        setSorted(tmpSorted);
    };

    const arrow = (field: string) => {
        const directionArrow = !sortDirection ? '↑' : '↓';
        return sortField === field ? directionArrow : '';
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

   

    const filteredData = useMemo(() => {
        return info.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [info, searchTerm]);

    useEffect(() => {
      handleSort(sortField, sortDirection)
      setCurrentPage(1)
    },[filteredData])

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const isOnFirstPage = currentPage === 1;
    const isOnLastPage = currentPage === totalPages;
    const maxButtonsToShow = Math.min(5, totalPages)
    return (
        <>
            <PageHeader firstHeading="Collections" secondHeading="Buy & Sell NFTs" />

            <Flex justifyContent="flex-end">
                <SwitchToNetwork chainId={CHAINID} />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
                <AddCollectionCard />

                <LabelWrapper style={{ marginRight: '5px' }}>
                    <Text textTransform="uppercase">{'Sort by'}</Text>
                    <Select
                        options={options}
                        selectedId={SORT_FIELD_INDEX_MAP.get(sortField)}
                        onChange={(option: OptionProps) => handleSort(option.value, sortDirection)}
                    />
                </LabelWrapper>
            </Flex>
            <Divider />

            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />

{totalPages > 1 && (
        <Flex justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
          {!isMobile &&
            <Button
                onClick={() => handlePageChange(1)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnFirstPage}
            >
                First
            </Button>
          }
            <Button
                onClick={() => handlePageChange(currentPage - 1)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnFirstPage}
            >
                {"<"}
            </Button>

            {!isMobile && Array.from({ length: totalPages }).slice(0, maxButtonsToShow).map((_, index) => (
    <Button
        key={index + 1}
        onClick={() => handlePageChange(index + 1)}
        variant={currentPage === index + 1 ? "primary" : "secondary"}
        style={{ margin: '2px', fontSize: '16px' }}
    >
        {index + 1}
    </Button>
))}

            <Button
                onClick={() => handlePageChange(currentPage + 1)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnLastPage}
            >
                {">"}
            </Button>
            {!isMobile &&
            <Button
                onClick={() => handlePageChange(totalPages)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnLastPage}
            >
                Last
            </Button>
            }
        </Flex>
    )}

            <StyledCard style={{ overflowX: 'auto' }}>
                <Flex flexDirection="row" height="40px">
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        minWidth={isMobile ? '250px' : '350px'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            handleSort(SORT_FIELD.createdAt, !sortDirection)
                            setSortDirection(!sortDirection)
                        }}
                    >
                        <Text fontSize="16px" color={theme?.colors.primary} bold>
                            {' Collection '}
                        </Text>
                    </Flex>

                    <Flex
                        justifyContent="flexStart"
                        alignItems="center"
                        minWidth={isMobile ? '150px' : '200px'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            handleSort(SORT_FIELD.volume, !sortDirection)
                            setSortDirection(!sortDirection)
                        }}
                    >
                        <Text fontSize="14px" color={theme?.colors.contrast} bold>
                            {' Volume '}
                            {arrow(SORT_FIELD.volume)}
                        </Text>
                    </Flex>

                    <Flex
                        justifyContent="flexStart"
                        alignItems="center"
                        minWidth={isMobile ? '150px' : '200px'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            handleSort(SORT_FIELD.items, !sortDirection)
                            setSortDirection(!sortDirection)
                        }}
                    >
                        <Text fontSize="14px" color={theme?.colors.contrast} bold>
                            {' Listed '}
                            {arrow(SORT_FIELD.items)}
                        </Text>
                    </Flex>

                    <Flex
                        justifyContent="flexStart"
                        alignItems="center"
                        minWidth={isMobile ? '150px' : '200px'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            handleSort(SORT_FIELD.lowestPrice, !sortDirection)
                            setSortDirection(!sortDirection)
                        }}
                    >
                        <Text fontSize="14px" color={theme?.colors.contrast} bold>
                            {' Lowest '}
                            {arrow(SORT_FIELD.lowestPrice)}
                        </Text>
                    </Flex>

                    <Flex
                        justifyContent="flexStart"
                        alignItems="center"
                        minWidth={isMobile ? '150px' : '200px'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            handleSort(SORT_FIELD.highestPrice, !sortDirection)
                            setSortDirection(!sortDirection)
                        }}
                    >
                        <Text fontSize="14px" color={theme?.colors.contrast} bold>
                            {' Highest '}
                            {arrow(SORT_FIELD.highestPrice)}
                        </Text>
                    </Flex>

                   
                </Flex>

                {sortedData &&
                    sortedData
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((collection) => (
                            <CollectionsCard
                                key={collection.collection}
                                collectionInfo={collection}
                                chainId={CHAINID}
                            />
                        ))}
            </StyledCard>

            {totalPages > 1 && (
        <Flex justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
          {!isMobile &&
            <Button
                onClick={() => handlePageChange(1)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnFirstPage}
            >
                First
            </Button>
          }
            <Button
                onClick={() => handlePageChange(currentPage - 1)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnFirstPage}
            >
                {"<"}
            </Button>

            {!isMobile && Array.from({ length: totalPages }).slice(0, maxButtonsToShow).map((_, index) => (
    <Button
        key={index + 1}
        onClick={() => handlePageChange(index + 1)}
        variant={currentPage === index + 1 ? "primary" : "secondary"}
        style={{ margin: '2px', fontSize: '16px' }}
    >
        {index + 1}
    </Button>
))}

            <Button
                onClick={() => handlePageChange(currentPage + 1)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnLastPage}
            >
                {">"}
            </Button>
            {!isMobile &&
            <Button
                onClick={() => handlePageChange(totalPages)}
                variant="secondary"
                style={{ margin: '2px', fontSize: '16px' }}
                disabled={isOnLastPage}
            >
                Last
            </Button>
            }
        </Flex>
    )}
        </>
    );
}

export default App;
