import React, { useState } from 'react'
import { Modal, Text, Button, Heading, Flex, AutoRenewIcon } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { NFTPool } from 'state/types'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import { Token } from 'config/constants/types'
import { formatNumber } from 'utils/formatBalance'
import useNftHarvest from 'views/NftPools/hooks/useHarvest'

interface NftEasyCollectModalProps {
  pool: NFTPool
  formattedBalance: string
  fullBalance: string
  earningToken: Token
  earningsDollarValue: number
  hasEarnings: boolean
  nftCollectionId: number
  onDismiss?: () => void
}

const NftEasyCollectModal: React.FC<NftEasyCollectModalProps> = ({
  pool,
  formattedBalance,
  earningToken,
  earningsDollarValue,
  hasEarnings,
  onDismiss,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { onNftHarvest } = useNftHarvest(pool)
  const { toastSuccess, toastError } = useToast()

  const [pendingTx, setPendingTx] = useState(false)

  const onConfirm = async () => {
    setPendingTx(true)
    try {
      await onNftHarvest()
      toastSuccess(
        `${t('Unstaked')}!`,
        t('Your %symbol% earnings have been sent to your wallet! As Well as all Other rewards available.', {
          symbol: earningToken.symbol,
        }),
      )
      setPendingTx(false)
      onDismiss()
    } catch {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx(false)
      onDismiss()
    }
  }

  return (
    <Modal
      title={`${earningToken.symbol} ${t('Harvest')}`}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Text>{t('Harvesting')}:</Text>
        <Flex flexDirection="column">
          <Heading>
            {formattedBalance} {earningToken.symbol}
          </Heading>
          {earningsDollarValue > 0 && (
            <Text fontSize="12px" color="textSubtle">{`~${formatNumber(earningsDollarValue)} USD`}</Text>
          )}
        </Flex>
      </Flex>
      <Flex flexDirection="column">
        <Button
          mt="8px"
          disabled={!hasEarnings}
          isLoading={pendingTx}
          onClick={onConfirm}
          endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
        >
          {pendingTx ? t('Confirming') : t('Harvest All')}
        </Button>
      </Flex>

      <Button variant="text" onClick={onDismiss} pb="0px">
        {t('Close Window')}
      </Button>
    </Modal>
  )
}

export default NftEasyCollectModal
