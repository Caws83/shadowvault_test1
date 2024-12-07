import { Address } from "viem";
import { Flex, Button } from "../../uikit";
import NftCard from "./NftCard";
import { useState } from "react";
import { isMobile } from 'components/isMobile';

const ViewAllCard: React.FC<React.PropsWithChildren<{
    collectionAddress: Address,
    colName: string,
    chainId: number
    totalSupply: number
}>> = ({
    collectionAddress,
    colName,
    chainId,
    totalSupply
}) => {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalSupply / itemsPerPage);

    const [currentPage, setCurrentPage] = useState(1);
    const [visiblePages, setVisiblePages] = useState([1, 2, 3, 4, 5]);

    const renderNftCards = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalSupply);

        const nftCards = [];

        for (let tokenId = startIndex + 1; tokenId <= endIndex; tokenId++) {
            nftCards.push(
                <NftCard
                    key={tokenId}
                    collectionAddress={collectionAddress}
                    colName={colName}
                    nftId={BigInt(tokenId)}
                    chainId={chainId}
                    price={0n}
                    type={3}
                />
            );
        }

        return nftCards;
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleScroll = (direction: "left" | "right") => {
        const maxPages = totalPages;

        let newPages = [...visiblePages];
        if (direction === "left") {
            if(isMobile) setCurrentPage(currentPage -1)
            newPages = newPages.map((page) => (page === 1 ? maxPages : page - 1));
        } else {
            if(isMobile) setCurrentPage(currentPage +1)
            newPages = newPages.map((page) => (page === maxPages ? 1 : page + 1));
        }

        setVisiblePages(newPages);
    };

    

    const isOnFirstPage = currentPage === 1;
    const isOnLastPage = currentPage === totalPages;

    const renderPageButtons = () => {
        const maxButtonsToShow = Math.min(isMobile ? 2 : 5, totalPages); // Change this number as needed
        const pageButtons = visiblePages
            .slice(0, maxButtonsToShow)
            .map((i) => (
                <Button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    variant={currentPage === i ? "primary" : "secondary"}
                    style={{ margin: '2px', fontSize: '18px' }}
                >
                    {i}
                </Button>
            ));

        return pageButtons;
    };

    return (
        <>
        {totalPages > 1 && (
            <Flex justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
                {!isMobile &&
                <Button
                    onClick={() => handlePageChange(1)}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
                    disabled={isOnFirstPage}
                >
                    First
                </Button>
                }
                <Button
                    onClick={() => handleScroll("left")}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
                    disabled={isOnFirstPage}
                >
                    {"<"}
                </Button>

                {renderPageButtons()}

                <Button
                    onClick={() => handleScroll("right")}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
                    disabled={isOnLastPage}
                >
                    {">"}
                </Button>
                {!isMobile &&
                <Button
                    onClick={() => handlePageChange(totalPages)}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
                    disabled={isOnLastPage}
                >
                    Last
                </Button>
                }
            </Flex>
        )}

            <Flex justifyContent="center" alignItems="center" style={{ overflowY: 'auto', flexWrap: 'wrap' }}>
                {renderNftCards()}
            </Flex>

        {totalPages > 1 && (
            <Flex justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
                {!isMobile &&
                <Button
                    onClick={() => handlePageChange(1)}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
                    disabled={isOnFirstPage}
                >
                    First
                </Button>
                }
                <Button
                    onClick={() => handleScroll("left")}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
                    disabled={isOnFirstPage}
                >
                    {"<"}
                </Button>

                {renderPageButtons()}

                <Button
                    onClick={() => handleScroll("right")}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
                    disabled={isOnLastPage}
                >
                    {">"}
                </Button>
                {!isMobile &&
                <Button
                    onClick={() => handlePageChange(totalPages)}
                    variant="secondary"
                    style={{ margin: '2px', fontSize: '18px' }}
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

export default ViewAllCard;
