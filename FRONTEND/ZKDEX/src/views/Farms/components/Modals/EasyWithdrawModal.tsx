import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Box, Button, ButtonMenu, ButtonMenuItem, Flex, Modal, Text } from 'uikit'
import { getETHER } from 'sdk'
import { ModalActions, ModalInput } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { useUnstakeFarmsFromHost, useUnstakeFarmsToken } from 'views/Farms/hooks/useUnstakeFarms'
import { FarmConfig, Token } from 'config/constants/types'
import useToast from 'hooks/useToast'
import { EasyTransactionError, EasyTransactionSteps, TransactionSteps } from 'utils/types'
import { fetchFarmUserDataAsync } from 'state/farms'
import { useAppDispatch } from 'state'
import EasySelect from 'components/Select/EasySelect'
import tokens from 'config/constants/tokens'
import EasyProgress from './EasyProgess'
import { useAccount } from 'wagmi'

interface EasyWithdrawModalProps {
  farm: FarmConfig
  max: BigNumber
  onDismiss?: () => void
  tokenName?: string
}

const EasyWithdrawModal: React.FC<EasyWithdrawModalProps> = ({ onDismiss, farm, max, tokenName = '' }) => {
  const [val, setVal] = useState('')
  const ETHER = getETHER(farm.chainId) as Token
  const [outToken, setOutToken] = useState<Token>(ETHER)
  const [pendingTx, setPendingTx] = useState(false)
  const [stage, setStage] = useState<EasyTransactionSteps>(EasyTransactionSteps.Start)
  const [txError, setTxError] = useState<EasyTransactionError>(EasyTransactionError.None)
  const [txMsg, setTxMsg] = useState<string>('')
  const [isFg, setIsFG] = useState(false)
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const valNumber = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)

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

  const steps: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: false,
    [EasyTransactionSteps.CreateLP]: false,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.Unstaking]: true,
    [EasyTransactionSteps.RemoveLiquidity]: true,
    [EasyTransactionSteps.Swap1]: false,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: false,
    [EasyTransactionSteps.Complete]: true,
  }

  const { onUnstake } = useUnstakeFarmsFromHost(farm.host, farm.pid, 18)
  const { onUnstakeToken } = useUnstakeFarmsToken(farm, outToken.symbol === ETHER.symbol ? tokens.wNative : outToken, _setStage, _setError)

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )

  const onChangeOutToken = (token: Token) => {
    if (outToken !== token) {
      setOutToken(token)
    }
  }

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  return (
    <Modal title={t('Unstake LP tokens')} onDismiss={onDismiss}>
      
      <Flex justifyContent="center" alignItems="center" mb="24px">
        <ButtonMenu
          activeIndex={isFg ? 0 : 1}
          scale="sm"
          variant="subtle"
          onItemClick={(index) => {
            setIsFG(!index)
          }}
        >
          <ButtonMenuItem as="button">{t('Unstake to...')}</ButtonMenuItem>
          <ButtonMenuItem as="button">{t('Standard')}</ButtonMenuItem>
        </ButtonMenu>
      </Flex>
      
      <ModalInput
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        value={val}
        max={fullBalance}
        symbol={tokenName}
        inputTitle={t('Unstake')}
      />
      {isFg && (
        <>
          <Box>
            <Text>Output Currency</Text>
            <EasySelect options={[ETHER, tokens.weth, tokens.zkclmrs]} onChange={onChangeOutToken} />
          </Box>
          <br />
        </>
      )}
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
          {stage !== EasyTransactionSteps.Complete ? t('Cancel') : 'Close'}
        </Button>
        {stage !== EasyTransactionSteps.Complete && (
          <Button
            disabled={
              pendingTx ||
              !valNumber.isFinite() ||
              valNumber.eq(0) ||
              valNumber.gt(fullBalanceNumber) ||
              txError !== EasyTransactionError.None ||
              (isFg && outToken === undefined)
            }
            onClick={async () => {
              if (isFg) {
                setPendingTx(true)
                await onUnstakeToken(val)
                setPendingTx(false)
                dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
              } else {
                setPendingTx(true)
                try {
                  await onUnstake(val)
                  toastSuccess(
                    `${t('Unstaked')}!`,
                    t('Your %symbol% earnings have also been harvested to your wallet!', {
                      symbol: farm.host.payoutToken.symbol,
                    }),
                  )
                  setPendingTx(false)
                  onDismiss()
                } catch (e) {
                  toastError(
                    t('Error'),
                    t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
                  )
                  setPendingTx(false)
                  onDismiss()
                  dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
                }
              }
            }}
            width="100%"
          >
            {pendingTx ? t('Confirming') : isFg ? t('Unstake to %token%', { token: outToken.symbol }) : t('Unstake')}
          </Button>
        )}
      </ModalActions>
      {isFg && <EasyProgress stage={stage} steps={steps} txError={txError} txMsg={txMsg} />}
    </Modal>
  )
}

export default EasyWithdrawModal
