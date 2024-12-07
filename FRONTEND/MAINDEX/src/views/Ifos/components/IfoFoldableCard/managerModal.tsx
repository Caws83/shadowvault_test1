import { Button, Flex, Modal, Text, useModal } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import React from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { Ifo } from 'config/constants/types'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import { useFinalizeRound } from 'views/Ifos/hooks/v3/useIfo'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import BigNumber from 'bignumber.js'
import { simulateContract, writeContract } from '@wagmi/core'
import { config } from 'wagmiConfig'
import { IFOFactoryAbiV3 } from 'config/abi/IFOFactoryV3'
import ConfirmFinalize from './confirmFinalizeModal'
import AddLinksButton from './AddLinksButton'
import ConnectWalletButton from 'components/ConnectWalletButton'


const ManagerModal: React.FC<{
  onDismiss?: () => void
  account,
  ifo: Ifo,
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData

 
}> = ({ account, ifo, publicIfoData, walletIfoData, onDismiss }) => {
  const { t } = useTranslation()
  const {chainId} = useAccount()

  const properChain = chainId === ifo.dex.chainId
  const isActive = publicIfoData.status !== 'finished' && ifo.isActive
  const { onEnd, onGetLP } = useFinalizeRound(ifo)
  const nowEpoch = new BigNumber(Math.floor(Date.now() / 1000));
  const unlockTime = new BigNumber(publicIfoData.initialLockTime).plus(publicIfoData.lockLength.multipliedBy(86400))
  const isAdmin = account === publicIfoData.admin || account === getAddress(contracts.farmWallet, ifo.dex.chainId) && properChain
  const canRemove = account === getAddress(contracts.farmWallet, ifo.dex.chainId) && properChain && publicIfoData.finalized
  const canFinalize = isAdmin && !publicIfoData.finalized && !isActive && properChain
  const canEnd = isAdmin && isActive && publicIfoData.status === 'live' && properChain
  const showLPWithdraw = isAdmin && !isActive && publicIfoData.finalized && new BigNumber(publicIfoData.initialLockTime).gt(0) && properChain
  const isUnlocked = unlockTime.lt(nowEpoch)
  const showConnectButton = !account || chainId !== ifo.dex.chainId


  const handleDismiss = () => {
    onDismiss()
  }
  const onClickEnd = () => {
    onEnd()
  }
  const onClickRemove = async () => {
    const {request} = await simulateContract(config, {
      abi: IFOFactoryAbiV3,
      address: getAddress(contracts.ifoFactoryV2, ifo.dex.chainId),
      functionName: 'removeSale',
      args: [getAddress(ifo.address, ifo.dex.chainId)],
      chainId: ifo.dex.chainId
    })
    const hash = await writeContract(config, request)
  }

  const onClickWithdrawl = () => {
    onGetLP()
  }

  const [onPresentConfirmModal] = useModal(
    <ConfirmFinalize
      account={account}
      ifo={ifo}
      publicIfoData={publicIfoData}
    />,
  )
  
  if (showConnectButton) {
    return (
      <Modal minWidth="346px" title="Manager Menu" onDismiss={handleDismiss} overflow="none">
      <Flex justifyContent="center" mb="6px">
        <ConnectWalletButton  chain={ifo.dex.chainId}/>
      </Flex>
      </Modal>
    )
  }

  return (
    <Modal minWidth="346px" title="Manager Menu" onDismiss={handleDismiss} overflow="none">
       {canFinalize && (
           <Flex justifyContent="center" alignItems="center" mb="16px">
            <Button width="75%" variant="secondary" onClick={onPresentConfirmModal}>
              Finalize Sale
            </Button>
            </Flex>
          )}

          {canEnd && (
            <Flex justifyContent="center" alignItems="center" mb="16px">
            <Button width="75%" variant="secondary" onClick={onClickEnd}>
              End Sale
            </Button>
            </Flex>
          )}

          {showLPWithdraw && (
            <Flex justifyContent="center" alignItems="center" mb="16px">
            <Button  width="75%" variant="secondary" onClick={onClickWithdrawl} disabled={!isUnlocked}>
              Withdrawal LP
            </Button>
            </Flex>
          )}

          {isAdmin && (
            <AddLinksButton ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />
          )}

          {canRemove && (
            <Flex justifyContent="center" alignItems="center" mb="16px">
            <Button width="75%" variant="secondary" onClick={onClickRemove}>
              REMOVE
            </Button>
            </Flex>
          )}
    </Modal>
  )
}

export default ManagerModal
