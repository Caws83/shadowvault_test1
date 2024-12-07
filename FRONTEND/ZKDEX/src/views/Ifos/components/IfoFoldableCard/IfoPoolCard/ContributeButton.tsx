import React from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, useModal } from 'uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { Ifo, PoolIds } from 'config/constants/types'
import { WalletIfoData, PublicIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import ContributeModal from './ContributeModal'
import { usePublicClient } from 'wagmi'

interface Props {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}
const ContributeButton: React.FC<Props> = ({ poolId, ifo, publicIfoData, walletIfoData }) => {
  const publicPoolCharacteristics = publicIfoData[poolId]
  const userPoolCharacteristics = walletIfoData[poolId]
  const { isPendingTx, amountTokenCommittedInLP } = userPoolCharacteristics
  const { limitPerUserInLP } = publicPoolCharacteristics
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { balance: userCurrencyBalanceRaw } = useGetBnbBalance(ifo.dex.chainId)
  const userCurrencyBalance = new BigNumber(userCurrencyBalanceRaw.toString())
  const client = usePublicClient({chainId: ifo.dex.chainId})

  // const { balance: userCurrencyBalance } = useTokenBalance(getAddress(ifo.currency.address))

  // Refetch all the data, and display a message when fetching is done
  const handleContributeSuccess = async (amount: BigNumber, txHash: string) => {
    await Promise.all([publicIfoData.fetchIfoData(), walletIfoData.fetchIfoData()])
    toastSuccess(
      t('Success!'),
      <ToastDescriptionWithTx txHash={txHash}>
        {t('You have contributed2 %amount% %symbol% tokens to this Sale!', {
          amount: getBalanceNumber(amount),
          symbol: client.chain.nativeCurrency.symbol
        })}
      </ToastDescriptionWithTx>,
    )
  }

  const [onPresentContributeModal] = useModal(
    <ContributeModal
      poolId={poolId}
      ifo={ifo}
      publicIfoData={publicIfoData}
      walletIfoData={walletIfoData}
      onSuccess={handleContributeSuccess}
      userCurrencyBalance={userCurrencyBalance}
    />,
    false,
  )

  // const [onPresentGetLpModal] = useModal(<GetLpModal currency={ifo.currency} />, false)

  const isDisabled =
    isPendingTx ||
    publicIfoData.hardCap.eq(publicIfoData.poolBasic.totalAmountPool.plus(publicIfoData.poolUnlimited.totalAmountPool)) ||
    (limitPerUserInLP.isGreaterThan(0) &&
      amountTokenCommittedInLP.isGreaterThanOrEqualTo(limitPerUserInLP)) ||
    userCurrencyBalance.isEqualTo(0)

  return (
    <Flex justifyContent="center" alignItems="center" mt="10px" mb="10px">
    <Button onClick={onPresentContributeModal} width="100%" disabled={isDisabled}>
      {isDisabled ? t('Max. Bought') : t('Buy Tokens')}
    </Button>
    </Flex>
  )
}

export default ContributeButton
