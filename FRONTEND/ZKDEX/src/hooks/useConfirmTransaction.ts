import { useReducer } from 'react'
import { noop } from 'lodash'
import useToast from 'hooks/useToast'
import { useTranslation } from 'contexts/Localization'
import { TransactionReceipt } from 'viem'

type LoadingState = 'idle' | 'loading' | 'success' | 'fail'

type Action =
  | { type: 'approve_sending' }
  | { type: 'approve_receipt' }
  | { type: 'approve_error' }
  | { type: 'confirm_sending' }
  | { type: 'confirm_receipt' }
  | { type: 'confirm_error' }

interface State {
  approvalState: LoadingState
  confirmState: LoadingState
}

const initialState: State = {
  approvalState: 'idle',
  confirmState: 'idle',
}

const reducer = (state: State, actions: Action): State => {
  switch (actions.type) {
    case 'approve_sending':
      return {
        ...state,
        approvalState: 'loading',
      }
    case 'approve_receipt':
      return {
        ...state,
        approvalState: 'success',
      }
    case 'approve_error':
      return {
        ...state,
        approvalState: 'fail',
      }
    case 'confirm_sending':
      return {
        ...state,
        confirmState: 'loading',
      }
    case 'confirm_receipt':
      return {
        ...state,
        confirmState: 'success',
      }
    case 'confirm_error':
      return {
        ...state,
        confirmState: 'fail',
      }
    default:
      return state
  }
}

interface OnSuccessProps {
  state: State
  receipt: TransactionReceipt
}

interface ConfirmTransaction {
  onConfirm: () => Promise<TransactionReceipt>
  onSuccess: ({ state, receipt }: OnSuccessProps) => void
}

const useConfirmTransaction = ({ onConfirm, onSuccess = noop }: ConfirmTransaction) => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { toastError } = useToast()

  return {
    isConfirming: state.confirmState === 'loading',
    isConfirmed: state.confirmState === 'success',
    handleConfirm: async () => {
      dispatch({ type: 'confirm_sending' })
      try {
        const receipt = await onConfirm()
        if (receipt.status) {
          dispatch({ type: 'confirm_receipt' })
          onSuccess({ state, receipt })
        }
      } catch (error) {
        dispatch({ type: 'confirm_error' })
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
  }
}

export default useConfirmTransaction
