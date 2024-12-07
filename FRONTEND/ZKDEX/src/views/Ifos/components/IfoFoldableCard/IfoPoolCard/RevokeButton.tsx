import React from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, useModal } from 'uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { Ifo, PoolIds } from 'config/constants/types'
import { WalletIfoData, PublicIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import { usePublicClient } from 'wagmi'
import RevokeModal from './RevokeModal'

interface Props {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}
const RevokeButton: React.FC<Props> = ({ poolId, ifo, publicIfoData, walletIfoData }) => {
  const userPoolCharacteristics = walletIfoData[poolId]
  const { isPendingTx, amountTokenCommittedInLP } = userPoolCharacteristics
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const client = usePublicClient({chainId: ifo.dex.chainId})


  // Refetch all the data, and display a message when fetching is done
  const handleRevokeSuccess = async (amount: BigNumber, txHash: string) => {
    await Promise.all([publicIfoData.fetchIfoData(), walletIfoData.fetchIfoData()])
    toastSuccess(
      t('Success!'),
      <ToastDescriptionWithTx txHash={txHash}>
        {t('You have Revoked %amount% %symbol% tokens from this Sale!', {
          amount: getBalanceNumber(amount),
          symbol: client.chain.nativeCurrency.symbol
        })}
      </ToastDescriptionWithTx>,
    )
  }

  const [onPresentRevokeModal] = useModal(
    <RevokeModal
      poolId={poolId}
      ifo={ifo}
      publicIfoData={publicIfoData}
      walletIfoData={walletIfoData}
      onSuccess={handleRevokeSuccess}
    />,
    false,
  )


  const isDisabled =
    isPendingTx ||
    amountTokenCommittedInLP.eq(0)


  return (
    <Flex justifyContent="center" alignItems="center" mt="10px" mb="10px">
      {amountTokenCommittedInLP.eq(0) ? null :
    <Button onClick={onPresentRevokeModal} width="100%" disabled={isDisabled}>
      Revoke
    </Button>}
    </Flex>
  )
}

export default RevokeButton
