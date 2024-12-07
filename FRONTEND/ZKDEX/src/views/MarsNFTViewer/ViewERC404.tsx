import { Flex, Button, Text } from "../../uikit";
import NftCard from "./NftCard";
import { useAccount, useReadContract } from "wagmi";
import styled from 'styled-components'
import { useEffect, useState } from "react";
import useRefresh from "hooks/useRefresh";
import { erc404Token } from "config/abi/tokens/erc404Token2";
import { Address } from "viem";
import SearchInput from 'components/SearchInput'
import { isMobile } from 'components/isMobile'

const Tile = styled.a`
  background-color: #101010;
  border: 1px solid #808080;
  border-radius: 8px;
  padding: 8px;
  margin: ${isMobile ? '1%' : '6px'};
  display: flex;
  flex-direction: column;
`;

function ViewERC404() {
    const [ collectionAddress, setCol ] = useState<Address>("0x1918c40919251a6106FD3c012765f0973B657B1E")

    const [userIds, setUserIds] = useState<readonly bigint[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { slowRefresh } = useRefresh();
    const { address, chainId } = useAccount();

    const { data, isLoading, refetch } = useReadContract({
        address: collectionAddress,
        abi: erc404Token,
        functionName: "owned",
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

    const handleChangeQueryCollection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        setCol(value as Address)
    }

    const maxButtonsToShow = Math.min(totalPages, 5);
    const midPoint = Math.ceil(maxButtonsToShow / 2);
    let startPage = Math.max(currentPage - midPoint + 1, 1);
    let endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);

    if (endPage - startPage < maxButtonsToShow - 1) {
        startPage = Math.max(endPage - maxButtonsToShow + 1, 1);
    }

    return (
        <>
            <Tile style={{ width: isMobile ? '95%' : '600px' }}>
                <Flex flexDirection="column">
                    <Flex justifyContent="space-between">
                        <Text color="textSubtle">Collection Address</Text>
                    </Flex>
                    <SearchInput onChange={handleChangeQueryCollection} starting={collectionAddress} />
                </Flex>
            </Tile>

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
                    />
                ))}
            </Flex>
        </>
    );
}

export default ViewERC404;
