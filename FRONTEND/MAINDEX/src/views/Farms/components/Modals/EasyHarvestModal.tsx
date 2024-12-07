import React, { useState } from 'react'
import { Box, Button, ButtonMenu, ButtonMenuItem, Flex, Modal, Text } from 'uikit'
import { getETHER } from 'sdk'
import { FarmConfig, Token } from 'config/constants/types'
import { useHarvestFarmFromHost, useHarvestToToken } from 'views/Farms/hooks/useHarvestFarm'
import { ModalActions } from 'components/Modal'
import useToast from 'hooks/useToast'
import { useTranslation } from 'contexts/Localization'
import { EasyTransactionError, EasyTransactionSteps, TransactionSteps } from 'utils/types'
import { fetchFarmUserDataAsync } from 'state/farms'
import { useAppDispatch } from 'state'
import EasySelect from 'components/Select/EasySelect'
import tokens from 'config/constants/tokens'
import EasyProgress from './EasyProgess'
import { useAccount } from 'wagmi'

interface DynamicHarvestModalProps {
  farm: FarmConfig
  onDismiss?: () => void
}

const EasyHarvestModal: React.FC<DynamicHarvestModalProps> = ({ farm, onDismiss }) => {
  const [pendingTx, setPendingTx] = useState(false)
  const ETHER = getETHER(farm.chainId) as Token
  const [outToken, setOutToken] = useState<Token>(ETHER)
  const [stage, setStage] = useState<EasyTransactionSteps>(EasyTransactionSteps.Start)
  const [txMsg, setTxMsg] = useState('')
  const [txError, setTxError] = useState<EasyTransactionError>(EasyTransactionError.None)
  const [useFG, setUseFG] = useState(false)
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()

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
  const onChangeOutToken = (token: Token) => {
    if (outToken !== token) {
      setOutToken(token)
    }
  }

  const steps: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: true,
    [EasyTransactionSteps.CreateLP]: false,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.Unstaking]: false,
    [EasyTransactionSteps.RemoveLiquidity]: false,
    [EasyTransactionSteps.Swap1]: true,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: false,
    [EasyTransactionSteps.Complete]: true,
  }

  const { onReward } = useHarvestFarmFromHost(farm.host, farm.pid)
  const { onRewardToken } = useHarvestToToken(farm, outToken, _setStage, _setError)
  const { isLocker } = farm.host

  return (
    <Modal title="Harvest from farm" onDismiss={onDismiss}>
    
      {!isLocker && (
        <Flex justifyContent="center" alignItems="center" mb="24px">
          <ButtonMenu
            activeIndex={useFG ? 0 : 1}
            scale="sm"
            variant="subtle"
            onItemClick={(index) => {
              setUseFG(!index)
            }}
          >
            <ButtonMenuItem as="button">{t('Harvest to ...')}</ButtonMenuItem>
            <ButtonMenuItem as="button">{t('Standard')}</ButtonMenuItem>
          </ButtonMenu>
        </Flex>
      )}
        
      {useFG && (
        <>
          <Box>
            <Text>Output Currency</Text>
            <EasySelect options={[ETHER, tokens.weth, tokens.zkclmrs]} onChange={onChangeOutToken} />
          </Box>
          <br />
        </>
      )}
      <Text>Press confirm to harvest your {farm.host.payoutToken.symbol} tokens from the farm.</Text>
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
        {txError === EasyTransactionError.None && stage === EasyTransactionSteps.Start && (
          <Button
            width="100%"
            disabled={pendingTx}
            onClick={async () => {
              if (useFG) {
                setPendingTx(true)
                await onRewardToken()
                setPendingTx(false)
                dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
              } else {
                try {
                  setPendingTx(true)
                  await onReward()
                  toastSuccess(
                    `${t('Harvested')}!`,
                    t('Your %symbol% earnings have been harvested to your wallet!', {
                      symbol: farm.host.payoutToken.symbol,
                    }),
                  )
                  setPendingTx(false)
                  onDismiss()
                  dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
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
          >
            {pendingTx
              ? 'Pending Confirmation'
              : useFG
              ? t('Harvest to %token%', { token: outToken.symbol })
              : 'Harvest'}
          </Button>
        )}
      </ModalActions>
      <EasyProgress stage={stage} steps={steps} txError={txError} txMsg={txMsg} />
    </Modal>
  )
}

export default EasyHarvestModal
