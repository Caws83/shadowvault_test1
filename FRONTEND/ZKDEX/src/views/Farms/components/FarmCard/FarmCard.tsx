import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Card, Flex, Text, Skeleton } from 'uikit'
import { Farm } from 'state/types'
import { getBscScanLink } from 'utils'
import { useTranslation } from 'contexts/Localization'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { getAddress } from 'utils/addressHelpers'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import DetailsSection from './DetailsSection'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'
import CellLayout from '../FarmTable/CellLayout'
import LockCell from '../FarmTable/LockCell'

export interface FarmWithStakedValue extends Farm {
  apr?: number
  lpRewardsApr?: number
  liquidity?: BigNumber
  pricePerToken?: BigNumber
}

const StyledCard = styled(Card)`
  align-self: baseline;
`

const FarmCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
`

const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

interface FarmCardProps {
  farm: FarmWithStakedValue
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: `0x${string}`
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, displayApr, removed, cakePrice, account }) => {
  const { t } = useTranslation()

  const [showExpandableSection, setShowExpandableSection] = useState(false)

  const totalValueFormatted =
    farm.liquidity && farm.liquidity.gt(0)
      ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 3 })}`
      : ''

  const pricePerFormatted =
    farm.pricePerToken && farm.pricePerToken.gt(0)
      ? `$${farm.pricePerToken.toNumber().toLocaleString(undefined, { maximumFractionDigits: 3 })}`
      : ''

  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const earnLabel = farm.dual ? farm.dual.earnLabel : t(`${farm.host.payoutToken.symbol} + Fees`)

  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: farm.quoteToken.address,
    tokenAddress: farm.token.address,
  })
  const addLiquidityUrl = `/#/add/${liquidityUrlPathParts}`
  const removeLiquidityUrl = `/#/remove/${liquidityUrlPathParts}`
  const lpAddress = getAddress(farm.lpAddresses, farm.chainId)
  const isPromotedFarm = farm.token.symbol === 'ZKCLMRS'
  const { isLocker } = farm.host


  return (
    <StyledCard isActive={isPromotedFarm} style={{width: 360}}>
     
        <CardHeading
          lpLabel={lpLabel}
          multiplier={farm.multiplier}
          isCommunityFarm={farm.isCommunity}
          token={farm.token}
          quoteToken={farm.quoteToken}
          host={farm.host}
        />
         <FarmCardInnerContainer>
        { isLocker ? (
        <CellLayout
        label={new BigNumber(farm.unLockTime).gt(Date.now() / 1000) ? t('Locked') : t(`UnLocked Since`)}
      >
        <LockCell unLockTime={farm.unLockTime} />
      </CellLayout>
      ) : !removed && (
          <Flex justifyContent="space-between" alignItems="center">
            <Text>{t('APR')}:</Text>
            <Text bold style={{ display: 'flex', alignItems: 'center' }}>
              {farm.apr ? (
                <ApyButton
                  variant="text-and-button"
                  id={farm.id}
                  pid={farm.pid}
                  lpSymbol={farm.lpSymbol}
                  multiplier={farm.multiplier}
                  earningToken={farm.host.payoutToken}
                  lpLabel={lpLabel}
                  addLiquidityUrl={addLiquidityUrl}
                  cakePrice={cakePrice}
                  apr={farm.apr}
                  displayApr={displayApr}
                />
              ) : (
                <Skeleton height={24} width={80} />
              )}
            </Text>
          </Flex>
        )}
        {!isLocker &&
        <Flex justifyContent="space-between" >
          <Text>{t('Earn')}:</Text>
          <Text bold>{earnLabel}</Text>
        </Flex>
        }
        <CardActionsContainer
          farm={farm}
          lpLabel={lpLabel}
          cakePrice={cakePrice}
          addLiquidityUrl={addLiquidityUrl}
          pricePerToken={farm.pricePerToken}
        />
      </FarmCardInnerContainer>

      <ExpandingWrapper>
        <ExpandableSectionButton
          onClick={() => setShowExpandableSection(!showExpandableSection)}
          expanded={showExpandableSection}
        />
        {showExpandableSection && (
          <DetailsSection
            removed={removed}
            bscScanAddress={getBscScanLink(lpAddress, 'address', farm.chainId)}
            totalValueFormatted={totalValueFormatted}
            lpLabel={lpLabel}
            addLiquidityUrl={addLiquidityUrl}
            removeLiquidityUrl={removeLiquidityUrl}
            pricePerToken={pricePerFormatted}
            farm={farm}
            account={account}
          />
        )}
      </ExpandingWrapper>
    </StyledCard>
  )
}

export default FarmCard
