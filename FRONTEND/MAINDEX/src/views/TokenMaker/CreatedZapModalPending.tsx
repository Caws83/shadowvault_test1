import { Flex, Modal, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import CopyAddress from 'views/Pools/components/Modals/CopyAddress';
import {Spinner} from 'uikit';

const BorderContainer = styled.div`
  padding: 16px;
  border-radius: 32px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
`;

const CreatedTokenModalPending: React.FC<{
  onDismiss?: () => void;

}> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const handleDismiss = onDismiss || (() => {});

  return (
    <Modal title={t('Zapped Liquidity Created')} onDismiss={handleDismiss} overflow="none">
      <>
    <Flex justifyContent="center" alignItems="center" mt="20px" mb="20px">
          <Spinner/>
         
        </Flex>
        <Flex justifyContent="center" alignItems="center" mt="20px" mb="20px">
          <Text>Your token creation transaction is pending.</Text>
         
        </Flex>
        </>

    </Modal>
  );
};

export default CreatedTokenModalPending;
