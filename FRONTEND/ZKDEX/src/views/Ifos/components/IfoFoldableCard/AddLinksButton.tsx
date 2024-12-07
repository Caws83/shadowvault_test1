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
import AddLinksModal from './AddLinksModal'

interface Props {
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}
const AddLinksButton: React.FC<Props> = ({ ifo, publicIfoData, walletIfoData }) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const client = usePublicClient({chainId: ifo.dex.chainId})


  // Refetch all the data, and display a message when fetching is done
  const handleAddLinksSuccess = async (txHash: string) => {
    await Promise.all([publicIfoData.fetchIfoData(), walletIfoData.fetchIfoData()])
    toastSuccess(
      t('Success!'),
      <ToastDescriptionWithTx txHash={txHash}>
        {t('You have Succesfully added Logo and Website to the %symbol% Sale!', {
          symbol: client.chain.nativeCurrency.symbol
        })}
      </ToastDescriptionWithTx>,
    )
  }

  const [onPresentAddLinksModal] = useModal(
    <AddLinksModal
      ifo={ifo}
      publicIfoData={publicIfoData}
      onSuccess={handleAddLinksSuccess}
    />,
    false,
  )

  return (
    <Flex justifyContent="center" alignItems="center" m="8px">
    <Button onClick={onPresentAddLinksModal} width="75%" >
      Update Links
    </Button>
    </Flex>
  )
}

export default AddLinksButton
