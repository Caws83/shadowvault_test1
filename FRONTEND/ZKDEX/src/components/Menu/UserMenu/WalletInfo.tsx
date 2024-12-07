import React from 'react'
import { Box, Button, Flex, InjectedModalProps, LinkExternal, Message, Text } from 'uikit'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import { getMSWAPAddress } from 'utils/addressHelpers'
import { useTranslation } from 'contexts/Localization'
import { getBscScanLink } from 'utils'
import { getFullDisplayBalance } from 'utils/formatBalance'
import CopyAddress from './CopyAddress'
import { useAccount, useDisconnect } from 'wagmi'
import BigNumber from 'bignumber.js'

interface WalletInfoProps {
  hasLowBnbBalance: boolean
  onDismiss: InjectedModalProps['onDismiss']
}

const WalletInfo: React.FC<WalletInfoProps> = ({ hasLowBnbBalance, onDismiss }) => {
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const chainId = chain.id
  const { balance: balanceRaw } = useGetBnbBalance(chainId)
  const balance = new BigNumber(balanceRaw.toString());

  const { disconnect } = useDisconnect()

  const handleLogout = () => {
    onDismiss()
    disconnect()
  }

  return (
    <>
      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
        {t('Your Address')}
      </Text>
      <CopyAddress account={account} mb="24px" />
      {hasLowBnbBalance && (
        <Message variant="warning" mb="24px">
          <Box>
            <Text fontWeight="bold">{t('%symbol% Balance Low', {symbol: chain.nativeCurrency.symbol})}</Text>
            <Text as="p">{t('You need %symbol% for transaction fees.', {symbol: chain.nativeCurrency.symbol})}</Text>
          </Box>
        </Message>
      )}
      <Flex alignItems="center" justifyContent="space-between">
        <Text color="textSubtle">{t('%symbol% Balance', {symbol: chain.nativeCurrency.symbol})}</Text>
        <Text>{getFullDisplayBalance(balance, 18, 6)}</Text>
      </Flex>
     

      <Flex alignItems="center" justifyContent="end" mb="24px">
        <LinkExternal href={getBscScanLink(account, 'address', chainId)}>{t('View Transaction')}</LinkExternal>
      </Flex>
      <Button variant="secondary" width="100%" onClick={handleLogout}>
        {t('Disconnect Wallet')}
      </Button>
    </>
  )
}

export default WalletInfo
