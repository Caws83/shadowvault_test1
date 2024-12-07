import React from 'react'
import { Flex, Button, Text } from 'uikit'
import QuestionHelper from 'components/QuestionHelper'
import { useTranslation } from 'contexts/Localization'
import { GAS_PRICE_GWEI } from 'state/user/hooks/helpers'
import { useGasPriceManager } from 'state/user/hooks'

const GasSettings = () => {
  const { t } = useTranslation()
  const [setting, setGasPrice] = useGasPriceManager()
  
  return (
    <Flex flexDirection="column">
      <Flex mb="12px" alignItems="center">
        <Text>{t('Default Transaction Speeds')}</Text>
        <QuestionHelper
          text={t(
            'Adjusts the gas price (transaction fee) for your transaction. Gives a % buffer. Faster = More buffer.',
          )}
          placement="top-start"
          ml="4px"
        />
      </Flex>
      <Flex flexWrap="wrap">
        <Button
          mt="4px"
          mr="4px"
          scale="sm"
          onClick={() => {
            setGasPrice(GAS_PRICE_GWEI.default)
          }}
          variant={setting === GAS_PRICE_GWEI.default ? 'primary' : 'tertiary'}
        >
          {t('Standard')}
        </Button>
        <Button
          mt="4px"
          mr="4px"
          scale="sm"
          onClick={() => {
            setGasPrice(GAS_PRICE_GWEI.fast)
          }}
          variant={setting === GAS_PRICE_GWEI.fast ? 'primary' : 'tertiary'}
        >
          {t('Fast')}
        </Button>
        <Button
          mr="4px"
          mt="4px"
          scale="sm"
          onClick={() => {
            setGasPrice(GAS_PRICE_GWEI.instant)
          }}
          variant={setting === GAS_PRICE_GWEI.instant ? 'primary' : 'tertiary'}
        >
          {t('Instant')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default GasSettings
