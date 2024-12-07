import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  Flex,
  Button,
  AutoRenewIcon,
  ButtonMenu,
  ButtonMenuItem,
  Image,
  CardsLayout,
  useMatchBreakpoints,
} from 'uikit';
import { useTranslation } from 'contexts/Localization';
import useTheme from 'hooks/useTheme';
import BigNumber from 'bignumber.js';
import { NFTPool } from 'state/types';
import { useNftTokenList } from 'views/NftPools/hooks/useNftTokenList';
import { NftItemInfo, Token } from 'config/constants/types';
import useUnstakeNftPool from 'views/NftPools/hooks/useUnstakeNftPool';
import useToast from 'hooks/useToast';
import useStakeNftPool from 'views/NftPools/hooks/useStakeNftPool';
import { useAccount } from 'wagmi';

interface NftEasyStakeModalProps {
  nftpool: NFTPool;
  stakingTokenBalance: BigNumber;
  earningToken: Token;
  stakingToken: Token;
  isRemovingStake?: boolean;
  onDismiss?: () => void;
}

const selectedStyle = {
  cursor: 'pointer',
  border: '5px solid green',
  gridColumn: 'span 2',
};

const unselectedStyle = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 2',
};

const selectedStyleLarge = {
  cursor: 'pointer',
  border: '5px solid green',
  gridColumn: 'span 4',
};

const unselectedStyleLarge = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 4',
};

const itemsPerPage = 10;

const NftEasyStakeModal: React.FC<NftEasyStakeModalProps> = ({
  nftpool,
  stakingTokenBalance,
  earningToken,
  stakingToken,
  isRemovingStake = false,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { toastSuccess, toastError } = useToast();
  const { address: account } = useAccount();

  const [pendingTx, setPendingTx] = useState(false);
  const [stakeAll, setStakeAll] = useState(true);
  const [tokens, setTokens] = useState<NftItemInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { onUnstake, onUnstakeAll } = useUnstakeNftPool(nftpool);
  const { onStake, onStakeAll } = useStakeNftPool(nftpool);
  const { isLg, isXl, isXxl } = useMatchBreakpoints();
  const isLargerScreen = isLg || isXl || isXxl;

  const getStyle = (token: NftItemInfo) => {
    if (isLargerScreen) {
      if (token.selected) {
        return selectedStyleLarge;
      }
      return unselectedStyleLarge;
    }
    if (token.selected) {
      return selectedStyle;
    }
    return unselectedStyle;
  };

  const { getNftTokenIdListFromWallet, getNftTokenIdListFromPool, getImageForTokenId } = useNftTokenList(nftpool);
  useEffect(() => {
    if (account) {
      if (isRemovingStake) {
        getNftTokenIdListFromPool().then((tokenIdList) => {
          const idList: NftItemInfo[] = tokenIdList.map((tokenId) => ({
            name: '',
            imageURI: '',
            haveImage: false,
            selected: false,
            tokenId: new BigNumber(tokenId.toString()),
            imageLoaded: false,
          }));
          setTokens(idList);
        });
      } else {
        getNftTokenIdListFromWallet().then((tokenIdList) => {
          const idList: NftItemInfo[] = tokenIdList.map((tokenId) => ({
            name: '',
            imageURI: '',
            haveImage: false,
            selected: false,
            tokenId: new BigNumber(tokenId.toString()),
            imageLoaded: false,
          }));
          setTokens(idList);
        });
      }
    }
  }, [getNftTokenIdListFromPool, getNftTokenIdListFromWallet, isRemovingStake, account]);

 

  const handleDismiss = () => {
    setPendingTx(false);
    onDismiss && onDismiss();
  };

  const handleConfirm = async () => {
    setPendingTx(true);

    try {
      if (stakeAll) {
        if (isRemovingStake) {
          await onUnstakeAll();
          toastSuccess(
            `${t('Unstaked')}!`,
            t('Your %symbol% earnings have also been harvested to your wallet!', {
              symbol: earningToken.symbol,
            }),
          );
        } else {
          await onStakeAll();
          toastSuccess(
            `${t('Staked')}!`,
            t('Your %symbol% funds have been staked in the pool!', {
              symbol: stakingToken.name,
            }),
          );
        }
      } else {
        const tokenIdsToProcess = tokens.filter((token) => token.selected).map((token) => token.tokenId);

        if (isRemovingStake) {
          await onUnstake(tokenIdsToProcess);
          toastSuccess(
            `${t('Unstaked')}!`,
            t('Your %symbol% earnings have also been harvested to your wallet!', {
              symbol: earningToken.symbol,
            }),
          );
        } else {
          await onStake(tokenIdsToProcess);
          toastSuccess(
            `${t('Staked')}!`,
            t('Your %symbol% funds have been staked in the pool!', {
              symbol: stakingToken.name,
            }),
          );
        }
      }

      setPendingTx(false);
      onDismiss && onDismiss();
    } catch (error) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'));
      setPendingTx(false);
      onDismiss && onDismiss();
    }
  };

  const onSelectToken = (token: NftItemInfo) => {
    setTokens((prevTokens) =>
      prevTokens.map((item) => (item.tokenId === token.tokenId ? { ...item, selected: !item.selected } : item)),
    );
  };

  const totalSelectedCount = tokens.filter((token) => token.selected).length;

  // Pagination
  const indexOfLastToken = currentPage * itemsPerPage;
  const indexOfFirstToken = indexOfLastToken - itemsPerPage;
  const paginatedTokens = tokens.slice(indexOfFirstToken, indexOfLastToken);

  const currentPageTokenIds = paginatedTokens.map((token) => token.tokenId);

  const imagesToProcess = tokens
    .filter((tokenInfo) => currentPageTokenIds.includes(tokenInfo.tokenId) && !tokenInfo.haveImage);
  
  imagesToProcess.forEach((tokenInfo) => {
    getImageForTokenId(tokenInfo.tokenId, (imageInfo) => {
      const newTokenInfo = { ...tokenInfo, imageURI: imageInfo.imageURI, name: imageInfo.name, haveImage: true };
      setTokens((prevTokens) => prevTokens.map((item) => (item.tokenId === newTokenInfo.tokenId ? newTokenInfo : item)));
    });
  });

  return (
    <Modal
      minWidth="346px"
      title={isRemovingStake ? t('Unstake') : t('Stake in Pool')}
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
      overflow="none"
    >
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
       
        <ButtonMenu
          activeIndex={stakeAll ? 0 : 1}
          scale="sm"
          variant="subtle"
          onItemClick={(index) => {
            setStakeAll(!index);
          }}
        >
          <ButtonMenuItem as="button">{isRemovingStake ? t('Unstake all') : t('Stake All')}</ButtonMenuItem>
          <ButtonMenuItem as="button">{isRemovingStake ? t('Unstake Selected') : t('Stake Selected')}</ButtonMenuItem>
        </ButtonMenu>
      </Flex>

      {stakeAll === true ? (
        <Flex justifyContent="center" alignItems="center" mb="24px">
          {isRemovingStake ? (
            <Text>Unstake all {nftpool.userData?.tokenIds.length} NFTs from the pool?</Text>
          ) : (
            <Text>Stake all {stakingTokenBalance.toString()} NFTs in the pool?</Text>
          )}
        </Flex>
      ) : (
        <>
          {tokens.length > 0 && pendingTx === false ? (
            <>
              <CardsLayout overflow="auto" padding="15px" width="100%">
                {paginatedTokens.map((token) => (
                  <Image
                    key={`main${token.tokenId.toString()}`}
                    src={token.imageURI}
                    width={80}
                    height={80}
                    style={getStyle(token)}
                    onClick={() => {
                      onSelectToken(token);
                    }}
                  />
                ))}
              </CardsLayout>
              {tokens.length > itemsPerPage && (
                <Flex justifyContent="center" mt="16px">
                  <Button
                    variant="text"
                    onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {'<'}
                  </Button>
                  <Text ml="8px" mr="8px">
                    Page {currentPage}
                  </Text>
                  <Button
                    variant="text"
                    onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(tokens.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(tokens.length / itemsPerPage)}
                  >
                    {'>'}
                  </Button>
                </Flex>
              )}
            </>
          ) : (
            <>
              {pendingTx === true ? (
                <Text>
                  {isRemovingStake ? 'Unstaking ' : 'Staking'} {totalSelectedCount} tokens.
                </Text>
              ) : (
                <Text>Loading Token List</Text>
              )}
            </>
          )}
        </>
      )}
      <Button
        isLoading={pendingTx}
        endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
        mt="24px"
        width="100%"
        minHeight="48px"
        onClick={handleConfirm}
        disabled={pendingTx || (stakeAll === false && totalSelectedCount <= 0)}
      >
        {pendingTx
          ? t('Confirming')
          : isRemovingStake
          ? stakeAll
            ? t('Unstake All')
            : t(`Unstake ${totalSelectedCount} tokens`)
          : stakeAll
          ? t('Stake All')
          : t(`Stake ${totalSelectedCount} tokens`)}
      </Button>
    </Modal>
  );
};

export default NftEasyStakeModal;
