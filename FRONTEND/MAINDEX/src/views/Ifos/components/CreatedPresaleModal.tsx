import { Flex, Modal, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import CopyAddress from 'views/Pools/components/Modals/CopyAddress';
import { ToastDescriptionWithTx } from 'components/Toast';

const BorderContainer = styled.div`
  padding: 16px;
  border-radius: 32px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
`;

const CreatedPresaleModal: React.FC<{
  onDismiss?: () => void;
  receipt: string;
}> = ({ onDismiss, receipt }) => {
  const { t } = useTranslation();

  const handleDismiss = onDismiss || (() => {});

  const [recp, setR] = useState(receipt)


  return (
    <Modal minWidth="346px" title={t('Presale Created')} onDismiss={handleDismiss} overflow="none">
    
        <Flex justifyContent="center" alignItems="center">
          <Text>Your Presale was successfully created.</Text>
         
        </Flex>
        <Flex mt="10px" justifyContent="center" alignItems="center">
        <ToastDescriptionWithTx txHash={recp} />
        </Flex>
        

    </Modal>
  );
};

export default CreatedPresaleModal;
