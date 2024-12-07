import React from 'react'
import { AutoRenewIcon, Button, Flex, Heading, IconButton, Skeleton, Text, useModal } from 'uikit'
import BigNumber from 'bignumber.js'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import Balance from 'components/Balance'
import { MINIMUM_COMPOST } from 'config'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import { useTranslation } from 'contexts/Localization'
import { useHostPrice } from 'state/farms/hooks'
import { FarmConfig } from 'config/constants/types'
import { ActionContainer, ActionContent, ActionTitles } from './styles'
import EasyHarvestModal from '../../Modals/EasyHarvestModal'
import EasyCompoundModal from '../../Modals/EasyCompoundModal'
import styled from 'styled-components'

interface HarvestActionProps extends FarmWithStakedValue {
  userDataReady: boolean
  farm: FarmConfig
}

const CustomActionContainer = styled.div`
  width: 100%;
  border: 2px solid ${({ theme }) => theme.colors.input};
  border-radius: 4px;
`;


const HarvestAction: React.FunctionComponent<HarvestActionProps> = ({ host, userData, userDataReady, farm }) => {
  const earningsBigNumber = new BigNumber(userData.earnings.toString())
  let earnings = BIG_ZERO
  let earningsBusd = 0
  let displayBalance = userDataReady ? earnings.toLocaleString() : <Skeleton width={60} />

  const getHostPrice = useHostPrice()
  // If user didn't connect wallet default balance will be 0
  if (!earningsBigNumber.isZero()) {
    earnings = getBalanceAmount(earningsBigNumber)
    earningsBusd = earnings.multipliedBy(getHostPrice(host)).toNumber()
    displayBalance = earnings.toFixed(3, BigNumber.ROUND_DOWN)
  }

  const isApproved = new BigNumber(MINIMUM_COMPOST).lt(earningsBusd)

  const { t } = useTranslation()

  const [onPresentHarvest] = useModal(<EasyHarvestModal farm={farm} />, false)
  const [onPresentCompoundModal] = useModal(<EasyCompoundModal farm={farm} />)

  return (
    <CustomActionContainer>
    <ActionContainer>

      <ActionTitles>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          {host.payoutToken.symbol}
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Earned')}
        </Text>
      </ActionTitles>

      <Flex justifyContent="space-between">
        <Flex flexDirection="column" alignItems="flex-start">
          <Heading>{displayBalance}</Heading>
          {earningsBusd > 0 && (
            <Balance fontSize="12px" color="textSubtle" decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
          )}
        </Flex>

        <Flex justifyContent="flex-end">
            <IconButton disabled={!isApproved} onClick={onPresentCompoundModal} variant="secondary">
              <AutoRenewIcon color="textSubtle" />
            </IconButton>
          
          <Button ml="5px" width="50%" disabled={earnings.eq(0) || !userDataReady} onClick={onPresentHarvest} >
            Claim
          </Button>
        </Flex>

       
     </Flex>
    </ActionContainer>
    </CustomActionContainer>
  )
}

export default HarvestAction
