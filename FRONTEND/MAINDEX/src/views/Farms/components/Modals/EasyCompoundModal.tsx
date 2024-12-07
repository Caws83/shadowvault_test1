import React, { useState } from 'react'
import { Button, /* ButtonMenu, ButtonMenuItem, Flex, */ Modal, Text } from 'uikit'
import { useCompoundContract } from 'views/Farms/hooks/useCompound'
import { FarmConfig } from 'config/constants/types'
import { ModalActions } from 'components/Modal'
import { EasyTransactionError, EasyTransactionSteps, TransactionSteps } from 'utils/types'
import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync } from 'state/farms'
// import { useTranslation } from 'contexts/Localization'
import EasyProgress from './EasyProgess'
import { useAccount } from 'wagmi'

interface CompoundModalProps {
  farm: FarmConfig
  onDismiss?: () => void
}

const EasyCompoundModal: React.FC<CompoundModalProps> = ({ farm, onDismiss }) => {
  // const { t } = useTranslation()
  const [pendingTx, setPendingTx] = useState(false)
  const [stage, setStage] = useState(EasyTransactionSteps.Start)
  const [txError, setTxError] = useState(EasyTransactionError.None)
  const [txMsg, setTxMsg] = useState('')

  const dispatch = useAppDispatch()
  const { address: account } = useAccount()

  const easySteps: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: true,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.CreateLP]: true,
    [EasyTransactionSteps.Unstaking]: false,
    [EasyTransactionSteps.RemoveLiquidity]: false,
    [EasyTransactionSteps.Swap1]: false,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: true,
    [EasyTransactionSteps.Complete]: true,
  }

  const _setStage = (step: EasyTransactionSteps) => {
    setStage(step)
  }

  const _setError = (error: EasyTransactionError, msg?: string) => {
    setTxError(error)
    if (msg !== null && msg !== undefined) {
      setTxMsg(msg)
    } else {
      setTxMsg('')
    }
  }

  const { onCompoundContract } = useCompoundContract(farm, _setStage, _setError)

  return (
    <Modal title="Compound Token" onDismiss={onDismiss}>
      <Text>
        Press confirm to reinvest your {farm.host.payoutToken.symbol} tokens back into the {farm.token.symbol}/
        {farm.quoteToken.symbol} farm.
      </Text>
      <Text>
        NOTE: <b>Please ensure you have a sufficient buffer of COIN to cover transaction costs (Gas).</b>
      </Text>
      <ModalActions>
        <Button
          variant="secondary"
          onClick={() => {
            setStage(EasyTransactionSteps.Start)
            setTxError(EasyTransactionError.None)
            onDismiss()
          }}
          width="100%"
        >
          {txError === EasyTransactionError.None && stage !== EasyTransactionSteps.Complete ? 'Cancel' : 'Close'}
        </Button>
        {txError === EasyTransactionError.None && stage !== EasyTransactionSteps.Complete && (
          <Button
            width="100%"
            disabled={pendingTx}
            onClick={async () => {
              setPendingTx(true)
              await onCompoundContract()
              setPendingTx(false)
              dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
            }}
          >
            {pendingTx ? 'Pending Confirmation' : 'Confirm'}
          </Button>
        )}
      </ModalActions>
      <EasyProgress stage={stage} steps={easySteps} txError={txError} txMsg={txMsg} />
    </Modal>
  )
}

export default EasyCompoundModal
