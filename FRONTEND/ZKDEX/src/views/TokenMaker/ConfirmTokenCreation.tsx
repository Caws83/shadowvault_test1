import { Flex, Modal, Text, Button } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import React from 'react'
import styled from 'styled-components'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import { isMobile } from 'components/isMobile'
import { BigNumber } from 'bignumber.js'

const BorderContainer = styled.div`
  padding: 16px;
  border: 3px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.background};
`


interface CreateInfo {
  name: string
  symbol: string
  taxesEnabled: boolean
  useDevFee: boolean
  devFee: string
  useBurn: boolean
  burnFee: string
  burnToken: string
  useLiqFee: boolean
  liqFee: string
  useDifDex: boolean
  initialSupply: string
  presale: boolean 
  renounced: boolean
  marketingWallet: string
}

const ConfirmTokenCreation: React.FC<{
  onDismiss?: () => void
  onConfirm: (confirmed: boolean) => void;
  account: string
  info: CreateInfo
}> = ({ onDismiss, account, info, onConfirm }) => {
  const { t } = useTranslation()

  const {
    name,
    symbol,
    initialSupply,
    taxesEnabled,
    useDevFee,
    devFee,
    useBurn,
    burnFee,
    burnToken,
    useLiqFee,
    liqFee,
    useDifDex,
    marketingWallet,
    presale, 
    renounced
  } = info

  const handleDismiss = onDismiss || (() => {}) 

  const handleConfirm = () => {
    onConfirm(true);
    handleDismiss();
  }

  return (
    <Modal minWidth='346px' title='Approve Token Creation' onDismiss={handleDismiss} overflow='none'>
      <BorderContainer>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Token')}:</Text>
          <Text>{name}</Text>
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Symbol')}:</Text>
          <Text>{symbol}</Text>
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Total Supply')}:</Text>
          <Text>{initialSupply}</Text>
        </Flex>

        {!taxesEnabled ?    <Flex justifyContent='space-between'>
                <Text color='secondary'>{t('Tax')}:</Text>
                <Text>0%</Text>
              </Flex>  : (
          <>
            <Flex justifyContent='space-between'>
              <Text color='secondary'>{t('Use Different Dex')}:</Text>
              <Text>{useDifDex ? t('Yes') : t('No')}</Text>
            </Flex>
            <Flex justifyContent='space-between'>
              <Text color='secondary'>{t('Marketing Wallet')}:</Text>
              
                   <Text>{marketingWallet.slice(0, 4)}...{marketingWallet.slice(-4)}</Text>
            </Flex>
            {useDevFee && (
              <Flex justifyContent='space-between'>
                <Text color='secondary'>{t('Marketing Fee')}:</Text>
                <Text>{devFee}%</Text>
              </Flex>
            )}
            {useBurn && (
              <Flex justifyContent='space-between'>
                <Text color='secondary'>{t('Burn Fee')}:</Text>
                <Text>{burnFee}%</Text>
              </Flex>
            )}
            {useBurn && (
              <Flex justifyContent='space-between'>
                <Text color='secondary'>{t('Burn Token')}:</Text>
                     <Text>${burnToken.slice(0, 4)}...${burnToken.slice(-4)}</Text>
              </Flex>
            )}
            {useLiqFee && (
              <Flex justifyContent='space-between'>
                <Text color='secondary'>{t('Liquidity Fee')}:</Text>
                <Text>{liqFee}%</Text>
              </Flex>
            )}
             
         
          </>
        )}
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Presale')}:</Text>
          <Text>{presale ? t('Yes') : t('No')}</Text>
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Renounced')}:</Text>
          <Text>{!renounced ? t('Yes') : t('No')}</Text>
        </Flex>
      </BorderContainer>

      <Flex justifyContent='center' mt='30px' mb='20px'>
        <Button onClick={handleConfirm}>{t('Confirm')}</Button>
      </Flex>
    </Modal>
  )
}

export default ConfirmTokenCreation