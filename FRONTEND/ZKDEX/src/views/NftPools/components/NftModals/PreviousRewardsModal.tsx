import React from 'react'
import { Modal, Button } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import { NFTPool } from 'state/types'
import ViewPrevious from './viewPreviousCell'
import BigNumber from 'bignumber.js'

interface PreviousCollectModalProps {
  pool: NFTPool
  onDismiss?: () => void
}

const PreviousCollectModal: React.FC<PreviousCollectModalProps> = ({ pool, onDismiss }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const rewards = pool.userData ? pool.userData.prevRewards : []

  return (
    <Modal
      title={t('View All Rewards')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {rewards.map((p, index) => (
        <ViewPrevious key={index} pool={pool} token={pool.earningToken[index]} reward={new BigNumber(p)} index={index} />
      ))}

      <Button variant="text" onClick={onDismiss} pb="0px">
        {t('Close Window')}
      </Button>
    </Modal>
  )
}

export default PreviousCollectModal
