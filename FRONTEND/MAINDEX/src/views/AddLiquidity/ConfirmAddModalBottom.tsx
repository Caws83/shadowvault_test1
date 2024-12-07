import { Currency, CurrencyAmount, Fraction, Percent } from 'sdk'
import React, { useState } from 'react'
import { Button, Text, Flex } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { RowBetween, RowFixed } from '../../components/Layout/Row'
import { CurrencyLogo } from '../../components/Logo'
import { Field } from '../../state/mint/actions'
import PayMasterPreview from 'components/Menu/UserMenu/payMasterPreview'


function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  chainId,
  onAdd,
  paymasterInfo
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  chainId: number
  paymasterInfo: any[]
  onAdd: () => void
}) {
  const { t } = useTranslation()
  const [ disabled, setDisabled] = useState(true)
  const handleDisableStatusChange = (disabled: boolean) => {
    setDisabled(disabled)
  }
  return (
    <>
     <RowBetween>
     <Flex justifyContent={'center'} alignItems={'center'}>
      <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} chainId={chainId} />
        <Text>{t('%asset% ', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Text>
        
      </Flex>
      <RowFixed>
          <Text>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Text>
        </RowFixed>
      </RowBetween>
      <RowBetween>
    
      <Flex justifyContent={'center'} alignItems={'center'}>
      <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} chainId={chainId} />
          <Text>{t('%asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Text>
      
      </Flex>
      <RowFixed>
          <Text>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Text>
        </RowFixed>
        </RowBetween>
        <Flex mt="20px" mb="10px">
        <Text>{t('Rates:')}</Text>
        </Flex>
      <RowBetween>
        <Text>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${currencies[Field.CURRENCY_B]
            ?.symbol}`}
        </Text>
      </RowBetween>
      <RowBetween>
        <Text>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${currencies[
            Field.CURRENCY_A
          ]?.symbol}`}
        </Text>
      </RowBetween>      
      <RowBetween mt="20px">
        <Text>{t('Share of Pool')}:</Text>
        <Text>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</Text>
      </RowBetween>
      {paymasterInfo && paymasterInfo?.length === 3 &&
        <PayMasterPreview paymasterInfo={paymasterInfo[0]} dex={paymasterInfo[1]} error={paymasterInfo[2]} onDisableStatusChange={handleDisableStatusChange}/>
      }
      <Flex mt="10px" mb="10px" justifyContent={'center'}>
      <Button onClick={onAdd} mt="20px" disabled={ disabled}>
        {noLiquidity ? t('Create Pool & Supply') : t('Confirm Supply')}
      </Button>
      </Flex>
    </>
  )
}

export default ConfirmAddModalBottom
