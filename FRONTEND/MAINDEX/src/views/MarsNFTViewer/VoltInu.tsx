import { Flex, Button } from "../../uikit";
import NftCard from "./NftCard-Mars";
import { useAccount, useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import { nftCollectionAbi } from "../../config/abi/nftCollection";
import useRefresh from "hooks/useRefresh";
import { isMobile } from "react-device-detect";
import {voltRarities} from './voltRarities'

function VoltInu() {
    const collectionAddress = "0x6Dd1f1d8Ca0bAB1123Ad6945a75bd29d84c702ec";
    const chainId = 109;

    const [userIds, setUserIds] = useState<readonly bigint[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { slowRefresh } = useRefresh();
    const { address } = useAccount();

    const { data, isLoading, refetch } = useReadContract({
        address: collectionAddress,
        abi: nftCollectionAbi,
        functionName: "walletOfOwner",
        args: [address ?? "0x0"],
        chainId: chainId,
    });

    useEffect(() => {
        refetch();
    }, [slowRefresh, collectionAddress]);

    useEffect(() => {
        if (data && !isLoading) setUserIds(data);
    }, [data]);

    const totalPages = Math.ceil(userIds.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, userIds.length);
    const displayedUserIds = userIds.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const maxButtonsToShow = Math.min(5, totalPages);
    const midPoint = Math.ceil(maxButtonsToShow / 2);
    let startPage = Math.max(currentPage - midPoint + 1, 1);
    let endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);

    if (endPage - startPage < maxButtonsToShow - 1) {
        startPage = Math.max(endPage - maxButtonsToShow + 1, 1);
    }

    return (
        <>
            {totalPages > 1 && (
                <Flex justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
                   
                        <Button
                            onClick={() => handlePageChange(1)}
                            variant="secondary"
                            style={{ margin: '2px', fontSize: '16px' }}
                        >
                            First
                        </Button>
                    
                    
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '16px' }}
                        disabled={currentPage === 1}
                    >
                        {"<"}
                    </Button>

                    {isMobile ? (
                        <Button
                            onClick={() => handlePageChange(currentPage)}
                            variant="primary"
                            style={{ margin: '2px', fontSize: '16px' }}
                        >
                            {currentPage}
                        </Button>
                    ) : (
                        Array.from({ length: endPage - startPage + 1 }).map((_, index) => (
                            <Button
                                key={startPage + index}
                                onClick={() => handlePageChange(startPage + index)}
                                variant={currentPage === startPage + index ? "primary" : "secondary"}
                                style={{ margin: '2px', fontSize: '16px' }}
                            >
                                {startPage + index}
                            </Button>
                        ))
                    )}
                    
                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        variant="secondary"
                        style={{ margin: '2px', fontSize: '16px' }}
                        disabled={currentPage === totalPages}
                    >
                        {">"}
                    </Button>
                   
                   
                        <Button
                            onClick={() => handlePageChange(totalPages)}
                            variant="secondary"
                            style={{ margin: '2px', fontSize: '16px' }}
                        >
                            {totalPages}
                        </Button>
                    
                </Flex>
            )}

            <Flex justifyContent="center" alignItems="center" style={{ overflowY: 'auto', flexWrap: 'wrap' }}>
                {displayedUserIds.map((tokenId, index) => (
                    <NftCard
                        key={index}
                        collectionAddress={collectionAddress}
                        nftId={tokenId}
                        chainId={chainId}
                        rarities={voltRarities}
                    />
                ))}
            </Flex>
        </>
    );
}

export default VoltInu;
