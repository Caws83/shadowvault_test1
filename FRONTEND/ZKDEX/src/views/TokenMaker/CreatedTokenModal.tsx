import { Flex, Modal, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import CopyAddress from 'views/Pools/components/Modals/CopyAddress';

const BorderContainer = styled.div`
  padding: 16px;
  border-radius: 32px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
`;

const CreatedTokenModal: React.FC<{
  onDismiss?: () => void;
  address: string;
}> = ({ onDismiss, address }) => {
  const { t } = useTranslation();

  const handleDismiss = onDismiss || (() => {});

  const [addr, setAddr] = useState(address)
  const truncatedAddr = `${addr.slice(0, 12)}...${addr.slice(-8)}`;

  return (
    <Modal title={t('Token Created')} onDismiss={handleDismiss} overflow="none">
    
        <Flex justifyContent="center" alignItems="center">
          <Text>Your token was successfully created.</Text>
         
        </Flex>
        <Flex mt="10px" justifyContent="center" alignItems="center">
          <Text>{truncatedAddr}</Text>
          <CopyAddress account={addr} mb="0px" logoOnly={true} />
        </Flex>
        

    </Modal>
  );
};

export default CreatedTokenModal;
