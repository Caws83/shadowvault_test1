import React from 'react'
import { Link, Text } from 'uikit'
import { getBscScanLink } from 'utils'
import { useTranslation } from 'contexts/Localization'
import truncateHash from 'utils/truncateHash'
import { useChainId } from 'wagmi'

interface DescriptionWithTxProps {
  description?: string
  txHash?: string
  children?: React.ReactNode}

const DescriptionWithTx: React.FC<DescriptionWithTxProps> = ({ txHash, children }) => {
  const chainId = useChainId()
  const { t } = useTranslation()

  return (
    <>
      {typeof children === 'string' ? <Text as="p">{children}</Text> : children}
      {txHash && (
        <Link external href={getBscScanLink(txHash, 'transaction', chainId)}>
          {t('View Transaction')}: {truncateHash(txHash, 8, 0)}
        </Link>
      )}
    </>
  )
}

export default DescriptionWithTx
