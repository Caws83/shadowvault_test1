import React, { useState } from 'react'
import { Modal, Text, Flex, Button, BalanceInput, ButtonMenu, ButtonMenuItem } from 'uikit'
import BigNumber from 'bignumber.js'
import useTheme from 'hooks/useTheme'
import Loading from 'components/Loading'
import { NFTLaunch } from 'state/types'
import { ActionContainer } from 'views/Pools/components/PoolsTable/ActionPanel/styles'
import { useGetBnbBalanceTarget, useTokenBalanceTarget } from 'hooks/useTokenBalance'
import { getAddress } from 'utils/addressHelpers'
import { useGetInfo } from '../hooks/useNFTManage'
import contracts from 'config/constants/contracts'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { nftLaunchHostAbi } from 'config/abi/nftLaunchHost'
import { ToastDescriptionWithTx } from 'components/Toast'
import useToast from 'hooks/useToast'
import { config } from 'wagmiConfig'




interface ManageModalProps {
  launch: NFTLaunch
  account: string
  onDismiss?: () => void
}

const ManagerModal: React.FC<ManageModalProps> = ({ launch, account, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }
  const launchAddress = getAddress(launch.contractAddress, launch.chainId)

  const [newAlloc, setNewAlloc] = useState('0')
  const { onWithdrawl, onWT, onChangeBNB, onChangeToken, onGoPub } = useGetInfo(launch)
  const { isPublic, owner, subOp } = launch
  const isFarm = account === getAddress(contracts.farmWallet, launch.chainId)

  const { balance: bnbBalance } = useGetBnbBalanceTarget(launchAddress, launch.chainId)
  const { balance: tokenBalance } = useTokenBalanceTarget(getAddress(launch.payToken.address, launch.chainId), launchAddress, launch.chainId)

  const loaded = bnbBalance !== undefined

  const { toastError, toastSuccess } = useToast()

  const isOwner = account === owner.toString() || account === subOp.toString()
  const [changeWhat, setChangeWhat] = useState(0)

  const onClickBNBFee = () => {
    onChangeBNB(new BigNumber(newAlloc).shiftedBy(18).toString())
  }
  const onClickTokenFee = () => {
    onChangeToken(new BigNumber(newAlloc).shiftedBy(18).toString())
  }
  const onClickWithdrawl = () => {
    onWithdrawl()
  }

  const onClickWT = () => {
    onWT()
  }
  const onclickRemove = async() => {
    try {
      
      const { request } = await simulateContract(config, {
        abi: nftLaunchHostAbi,
        address: getAddress(contracts.nftLaunchHost, launch.chainId),
        functionName: 'removePool',
        args: [launchAddress],
        chainId: launch.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(
          'Sale removed',
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            'This NFT Mint card has been removed.'
          </ToastDescriptionWithTx>,
        )
        onDismiss()
      }
    } catch (error) {
      console.log(error)
      toastError('Error', 'Please try again. Confirm the transaction and make sure you are paying enough gas!')
    }
  }

  const onclickGoPublic = () => {
    onGoPub()
  }

  const onChangeNewAlloc = (value: string) => {
    setNewAlloc(value)
  }

  const handleClick = (newIndex: number) => {
    setChangeWhat(newIndex)
  }

  return (
    <Modal
      minWidth="346px"
      title="NFT Manager"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Farm</Text>
        <Text color="primary">{launch.nftCollectionName}</Text>
      </Flex>

      {loaded ? (
        <>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Current Balance:</Text>
            <Text>{new BigNumber(bnbBalance.toString()).shiftedBy(-18).toFixed(4)}</Text>
          </Flex>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">{`Current ${launch.payToken.symbol} Balance:`}</Text>
            <Text>{new BigNumber(tokenBalance.toString()).shiftedBy(-launch.payToken.decimals).toFixed(4)}</Text>
          </Flex>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Cost:</Text>
            <Text>{new BigNumber(launch.costBNB.toString()).shiftedBy(-18).toFixed(4)}</Text>
          </Flex>

          {isOwner && (
            <>
              <Flex justifyContent="center" alignItems="center" mb="24px">
                <ButtonMenu activeIndex={changeWhat} scale="sm" variant="subtle" onItemClick={handleClick}>
                  <ButtonMenuItem as="button">Bone Cost</ButtonMenuItem>
                  <ButtonMenuItem as="button">Token Cost</ButtonMenuItem>
                </ButtonMenu>
              </Flex>

              <Text color="secondary">{changeWhat === 0 ? 'Change Fee To:' : 'Change Token Fee To:'}</Text>

              <Flex alignItems="flex-end" justifyContent="space-around">
                <BalanceInput placeholder="0" value={newAlloc} onUserInput={onChangeNewAlloc} />
              </Flex>
            </>
          )}

          <ActionContainer>
            {isOwner && (
              <>
                <Button width="100%" variant="secondary" onClick={changeWhat === 0 ? onClickBNBFee : onClickTokenFee}>
                  {changeWhat === 0 ? 'edit Bone Fee' : 'edit Token Fee'}
                </Button>

                {!isPublic && (
                  <Button width="100%" variant="secondary" onClick={onclickGoPublic}>
                    Go Public
                  </Button>
                )}

                <Button width="100%" variant="secondary" onClick={onClickWithdrawl}>
                  Get Native Coin
                </Button>
                <Button width="100%" variant="secondary" onClick={onClickWT}>
                  {`Get ${launch.payToken.symbol}`}
                </Button>
              </>
            )}
            {isFarm && 
              <Button width="100%" variant="secondary" onClick={onclickRemove}>
                Remove
              </Button>
            }
          </ActionContainer>
        </>
      ) : (
        <Loading />
      )}
      <Button width="100%" variant="secondary" onClick={handleDismiss}>
        Close
      </Button>
    </Modal>
  )
}

export default ManagerModal
