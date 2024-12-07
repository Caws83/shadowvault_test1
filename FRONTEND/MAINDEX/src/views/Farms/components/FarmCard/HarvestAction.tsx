import React from 'react'
import BigNumber from 'bignumber.js'
import { AutoRenewIcon, Button, Flex, Heading, IconButton, useModal } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { getBalanceAmount } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { FarmConfig, Host } from 'config/constants/types'
import { useHostPrice } from 'state/farms/hooks'
import EasyHarvestModal from '../Modals/EasyHarvestModal'
import { useAccount } from 'wagmi'
import { styled } from 'styled-components'
import { MINIMUM_COMPOST } from 'config'
import EasyCompoundModal from '../Modals/EasyCompoundModal'

interface FarmCardActionsProps {
  earnings?: BigNumber
  host: Host
  farm: FarmConfig
}

const IconButtonWrapper = styled.div`
  display: flex;  
`

const HarvestAction: React.FC<FarmCardActionsProps> = ({ earnings, host, farm }) => {
  const { address: account } = useAccount()
  const rawEarningsBalance = account ? getBalanceAmount(earnings) : new BigNumber(0)
  const displayBalance = rawEarningsBalance.toFixed(3, BigNumber.ROUND_DOWN)
  const getHostPrice = useHostPrice()

  const earningsBusd = rawEarningsBalance ? rawEarningsBalance.multipliedBy(getHostPrice(host)).toNumber() : 0
  const isApproved = new BigNumber(MINIMUM_COMPOST).lt(earningsBusd)
  const [onPresentHarvest] = useModal(<EasyHarvestModal farm={farm} />, false)
  const [onPresentCompoundModal] = useModal(<EasyCompoundModal farm={farm} />)
  
  return (
    <Flex mb="8px" justifyContent="space-between" alignItems="center">
      <Flex flexDirection="row" alignItems="flex-start">
        <Heading mr="4px" color={rawEarningsBalance.eq(0) ? 'textDisabled' : 'text'}>{displayBalance}</Heading>
        {earningsBusd > 0 && (
          <Balance fontSize="8px" color="textSubtle" decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
        )}
      </Flex>
     

      <IconButtonWrapper>
        <IconButton disabled={!isApproved} onClick={onPresentCompoundModal} mr="6px" variant="secondary">
          <AutoRenewIcon color="textSubtle" />
        </IconButton>
        <Button ml="5px" disabled={rawEarningsBalance.eq(0)} onClick={onPresentHarvest}>
          Claim
        </Button>
      </IconButtonWrapper>
    </Flex>
      
  )
}

export default HarvestAction
