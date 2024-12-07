import React from 'react';
import styled, { keyframes } from 'styled-components';
import BigNumber from 'bignumber.js';
import { Modal, Flex, Link } from 'uikit';
import { getBscScanLink } from 'utils'
import { useTranslation } from 'contexts/Localization'
import truncateHash from 'utils/truncateHash'


// Keyframes for the pulsing effect
const pulse = keyframes`
  0% {
    transform: scale(.6);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(.6);
  }
`;


// Styled component for the prize amount text with pulsing effect
const PrizeAmount = styled.span`
  font-size: 1.8rem;
  font-weight: bold;
  color: #f39c12;
  animation: ${pulse} 1s infinite;
`;

const FancyModal: React.FC<{ onDismiss?: () => void; winnings: number; currency: string, chainId: number , txHash: string }> = ({
  onDismiss,
  winnings,
  currency,
  chainId,
  txHash
}) => {
  const { t } = useTranslation()

  const handleDismiss = onDismiss || (() => {});
  const winningDisplay = Number(new BigNumber(winnings).shiftedBy(-18).toFixed(2)).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

  return (
    <Modal title="You WON!" onDismiss={handleDismiss} overflow="hidden">
      <Flex justifyContent="center" alignItems='center' flexDirection="column">
        <PrizeAmount>
          {winningDisplay} {currency}
        </PrizeAmount>
        {txHash && chainId && (
        <Link external href={getBscScanLink(txHash, 'transaction', chainId)}>
          {t('View Transaction')}: {truncateHash(txHash, 8, 0)}
        </Link>
      )}
        </Flex>
      
    </Modal>
  );
};

export default FancyModal;
