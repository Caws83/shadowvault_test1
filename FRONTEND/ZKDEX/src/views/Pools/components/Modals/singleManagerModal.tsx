import React, { useState } from 'react'
import { Modal, Text, Flex, Button, BalanceInput } from 'uikit'
import useTheme from 'hooks/useTheme'
import Loading from 'components/Loading'
import { Pool } from 'state/types'
import BigNumber from 'bignumber.js'
import { ActionContainer, ActionContent } from 'views/Pools/components/PoolsTable/ActionPanel/styles'
import { useGetInfo } from './hooks/useSingleManage'

interface ManageModalProps {
  pool: Pool
  onDismiss?: () => void
}

const ManagerModal: React.FC<ManageModalProps> = ({ pool, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }
  const [newAlloc, setNewAlloc] = useState('0')
  const { onInfo, onCAlloc, onUpdate } = useGetInfo(pool)
  const { alloc, outPut } = onInfo()

  const dailyOutput = new BigNumber(outPut).shiftedBy(-pool.host.payoutToken.decimals).multipliedBy(86400).toFixed(4)
  const loaded = alloc !== undefined && outPut !== undefined

  const onClickCAlloc = () => {
    onCAlloc(newAlloc)
  }

  const onClickUpdate = () => {
    onUpdate()
  }

  const onChangeNewAlloc = (value: string) => {
    setNewAlloc(value)
  }

  return (
    <Modal
      minWidth="346px"
      title="Single Manager"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Single Pool Manager</Text>
        <Text color="primary">
          Stake {pool.stakingToken.symbol} / Earn {pool.earningToken.symbol}
        </Text>
      </Flex>

      {loaded ? (
        <>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Current Allocation:</Text>
            <Text>{new BigNumber(alloc).toString()}</Text>
          </Flex>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">Daily OutPut:</Text>
            <Text>{new BigNumber(dailyOutput).toString()}</Text>
          </Flex>

          <Text color="secondary">Change Allocation To:</Text>
          <Flex alignItems="flex-end" justifyContent="space-around">
            <BalanceInput placeholder="0" value={newAlloc} onUserInput={onChangeNewAlloc} />
          </Flex>

          <ActionContainer>
            <ActionContent>
              <Button width="50%" variant="secondary" onClick={onClickCAlloc}>
                Change Allocation
              </Button>
              <Button width="50%" variant="secondary" onClick={onClickUpdate}>
                Update Pool
              </Button>
            </ActionContent>
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
