import React, { /* useEffect, */ useState } from 'react'
import styled from 'styled-components'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import { isMobile } from 'components/isMobile'
import { useTranslation } from 'contexts/Localization'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import { BigNumber } from 'bignumber.js'
import Apr, { AprProps } from './Apr'
import Farm, { FarmProps } from './Farm'
import Earned, { EarnedProps } from './Earned'
import LockCell from './LockCell'
import Details from './Details'
import Multiplier, { MultiplierProps } from './Multiplier'
import Liquidity, { LiquidityProps } from './Liquidity'
import ActionPanel from './Actions/ActionPanel'
import CellLayout from './CellLayout'
import { DesktopColumnSchema, MobileColumnSchema } from '../types'

export interface RowProps {
  apr: AprProps
  farm: FarmProps
  earned: EarnedProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
}

interface RowPropsWithLoading extends RowProps {
  userDataReady: boolean
}

const cells = {
  apr: Apr,
  farm: Farm,
  earned: Earned,
  details: Details,
  multiplier: Multiplier,
  liquidity: Liquidity,
}

const CellInner = styled.div`
  padding: 24px 0px;
  display: flex;
  width: 100%;
  align-items: center;
  padding-right: 8px;

  ${({ theme }) => theme.mediaQueries.xl} {
    padding-right: 32px;
  }
`

const StyledTr = styled.tr`
  cursor: pointer;
`

const Row: React.FunctionComponent<RowPropsWithLoading> = (props) => {
  const { userDataReady, farm } = props
  const { isLocker } = farm.host
  const [actionPanelExpanded, setActionPanelExpanded] = useState(false)
  const shouldRenderChild = useDelayedUnmount(actionPanelExpanded, 300)
  const { t } = useTranslation()
  const toggleActionPanel = () => {
    setActionPanelExpanded(!actionPanelExpanded)

  }
  const isSmallerScreen = isMobile
  const tableSchema = isSmallerScreen ? MobileColumnSchema : DesktopColumnSchema
  const columnNames = tableSchema.map((column) => column.name)
  const handleRenderRow = () => {
    return (
      <StyledTr onClick={toggleActionPanel}>
        {Object.keys(props).map((key) => {
          const columnIndex = columnNames.indexOf(key)
          if (columnIndex === -1) {
            return null
          }
          if (key === 'multiplier') {
            return null
          }
          switch (key) {
            case 'details':
              return (
                <td key={key}>
                  <CellInner>
                    <CellLayout>
                      <Details actionPanelToggled={actionPanelExpanded} />
                    </CellLayout>
                  </CellInner>
                </td>
              )
            case 'apr':
              return isLocker ? (
                <td key={key}>
                  <CellInner>
                    <CellLayout
                      label={new BigNumber(farm.unLockTime).gt(Date.now() / 1000) ? t('Locked') : t(`UnLocked Since`)}
                    >
                      <LockCell unLockTime={farm.unLockTime} />
                    </CellLayout>
                  </CellInner>
                </td>
              ) : (
                <td key={key}>
                  <CellInner>
                    <CellLayout label={t('APR')}>
                      <Apr {...props.apr} hideButton={isSmallerScreen} />
                    </CellLayout>
                  </CellInner>
                </td>
              )
            case 'earned':
              return (
                !isLocker && (
                  <td key={key}>
                    <CellInner>
                      <CellLayout label={t('Earned')}>
                        <Earned {...props.earned} userDataReady={userDataReady} />
                      </CellLayout>
                    </CellInner>
                  </td>
                )
              )
            default:
              return (
                <td key={key}>
                  <CellInner>
                    <CellLayout label={t(tableSchema[columnIndex].label)}>
                      {React.createElement(cells[key], { ...props[key], userDataReady })}
                    </CellLayout>
                  </CellInner>
                </td>
              )
          }
        })}
      </StyledTr>
    )
  }

  return (
    <>
      {handleRenderRow()}
      {shouldRenderChild && (
        <tr>
          <td colSpan={6}>
            <ActionPanel {...props} expanded={actionPanelExpanded} isLocker={isLocker} />
          </td>
        </tr>
      )}
    </>
  )
}

export default Row
