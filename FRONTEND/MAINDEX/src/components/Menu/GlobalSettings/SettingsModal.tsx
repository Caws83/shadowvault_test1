import React from 'react'
import { Text, Toggle, Flex, Modal, InjectedModalProps } from 'uikit'
import { useUserSingleHopOnly } from 'state/user/hooks'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import QuestionHelper from '../../QuestionHelper'
import TransactionSettings from './TransactionSettings'
import { dexs } from 'config/constants/dex'
import GasSettings from './GasSettings'
import { useGasPriceManager, useUserDex } from 'state/user/hooks'
import hosts from 'config/constants/hosts'
import { GAS_PRICE_GWEI } from 'state/user/hooks/helpers'
import { useDispatch } from 'react-redux'
import { updateFarmHost } from 'state/farms'
import { AppDispatch } from 'state'
import PMTokenSelector from '../UserMenu/payMasterSelectButton'


const SettingsModal: React.FC<InjectedModalProps> = ({ onDismiss }) => {

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  const [, setUserDex] = useUserDex()
  const [, setGasPrice] = useGasPriceManager()
  const dispatch = useDispatch<AppDispatch>()

  const { t } = useTranslation()
  const { theme } = useTheme()




  const onResetDexState = () => {
    setUserDex(dexs.marsCZKTest)
    dispatch(updateFarmHost(hosts.marswap))
    setGasPrice(GAS_PRICE_GWEI.default)
    setSingleHopOnly(!singleHopOnly)
  }

  return (
    <Modal
      title={t('Settings')}
      headerBackground="backgroundAlt"
      onDismiss={onDismiss}
      style={{ maxWidth: '420px', overflowY: 'auto' }}
    >
      <Flex flexDirection="column">
        <Flex pb="24px" flexDirection="column">
          <Text bold textTransform="uppercase" fontSize="12px" color="secondary" mb="24px">
            {t('Global')}
          </Text>
          <GasSettings />
        </Flex>
        <Flex pt="24px" flexDirection="column" borderTop={`1px ${theme.colors.cardBorder} solid`}>
          <Text bold textTransform="uppercase" fontSize="12px" color="secondary" mb="24px">
            {t('Swaps & Liquidity')}
          </Text>
          <Flex flexDirection="row" justifyContent="space-between" mb="24px" >
            <Text>Gas Token</Text>
            <PMTokenSelector />
          </Flex>
          <TransactionSettings />
        </Flex>
       
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Flex alignItems="center">
            <Text>{t('Disable Multihops')}</Text>
            <QuestionHelper text={t('Restricts swaps to direct pairs only.')} placement="top-start" ml="4px" />
          </Flex>
          <Toggle
            id="toggle-disable-multihop-button"
            checked={singleHopOnly}
            scale="md"
            onChange={() => {
              setSingleHopOnly(!singleHopOnly)
            }}
          />
        </Flex>



       
      </Flex>
    </Modal>
  )
}

export default SettingsModal
