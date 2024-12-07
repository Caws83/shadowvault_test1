import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { Button, Flex } from "../../uikit";
import NftCard from "./NftCard";
import { useReadContract, useReadContracts } from "wagmi";
import { NFT_MARKETPLACE } from "../../config/marketPlace";
import { nftMarketAbi } from "../../config/abi/nftMarket";
import { isMobile } from 'components/isMobile';
import useRefresh from "hooks/useRefresh";
import { RECLAIM_AUCTIONS_TO_FETCH } from "config";


interface State {
    ids: readonly any[];
    sales: readonly any[];
}

const ForSaleCard: React.FC<React.PropsWithChildren<{
    collectionAddress: Address;
    colName: string;
    chainId: number;
}>> = ({ collectionAddress, colName, chainId }) => {
    const [info, setData] = useState<State>({
        ids: [],
        sales: [],
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const { slowRefresh} = useRefresh()

    const {data, isLoading, refetch} = useReadContract({
                address: NFT_MARKETPLACE,
                abi: nftMarketAbi,
                functionName: "viewAsksByCollection",
                args: [collectionAddress, BigInt((currentPage - 1) * itemsPerPage), BigInt(itemsPerPage)],
                chainId: chainId,
    });
    
    useEffect(() => {
        if(data && !isLoading){
            setData({
                ids: data ? data[0] : [],
                sales: data ? data[1] : [],
            });
        }
    }, [data])

    useEffect(() => {
        refetch()
    },[slowRefresh])

    const totalPages = Math.ceil(info.sales.length / itemsPerPage);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const isOnFirstPage = currentPage === 1;
    const isOnLastPage = currentPage === totalPages;
    const maxButtonsToShow = Math.min(5, totalPages)

    return (
        <>
         {totalPages > 1 && (
                <Flex justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
                  {!isMobile &&
                    <Button
                        onClick={() => handlePageChange(1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnFirstPage}
                    >
                        First
                    </Button>
                  }
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnFirstPage}
                    >
                        {"<"}
                    </Button>

                    {!isMobile && Array.from({ length: totalPages }).slice(0, maxButtonsToShow).map((_, index) => (
                      <Button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        variant={currentPage === index + 1 ? "primary" : "secondary"}
                        style={{ margin: '2px', fontSize: '10px' }}
                      >
                        {index + 1}
                      </Button>
                    ))}


                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnLastPage}
                    >
                        {">"}
                    </Button>
                    {!isMobile &&
                    <Button
                        onClick={() => handlePageChange(totalPages)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnLastPage}
                    >
                        Last
                    </Button>
                    }
                </Flex>
            )}

            <Flex justifyContent="center" alignItems="center" style={{ overflowY: 'auto', flexWrap: 'wrap' }}>
                {info.ids.map((tokenId, index) => (
                    <NftCard
                        key={index}
                        collectionAddress={collectionAddress}
                        colName={colName}
                        nftId={tokenId}
                        chainId={chainId}
                        price={info.sales[index].price}
                        type={0}
                    />
                ))}
            </Flex>

            {totalPages > 1 && (
                <Flex justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
                  {!isMobile &&
                    <Button
                        onClick={() => handlePageChange(1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnFirstPage}
                    >
                        First
                    </Button>
                  }
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnFirstPage}
                    >
                        {"<"}
                    </Button>

                    {!isMobile && Array.from({ length: totalPages }).map((_, index) => (
                        <Button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            variant={currentPage === index + 1 ? "primary" : "secondary"}
                            style={{ margin: '2px', fontSize: '10px' }}
                        >
                            {index + 1}
                        </Button>
                    ))}

                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnLastPage}
                    >
                        {">"}
                    </Button>
                    {!isMobile &&
                    <Button
                        onClick={() => handlePageChange(totalPages)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '10px' }}
                        disabled={isOnLastPage}
                    >
                        Last
                    </Button>
                    }
                </Flex>
            )}
        </>
    );
};

export default ForSaleCard;
