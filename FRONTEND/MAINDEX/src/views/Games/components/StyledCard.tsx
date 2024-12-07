import styled from 'styled-components'
import { Card } from 'uikit'

export const StyledCard = styled(Card)`
  max-width: 375px;
  margin: 0 1px 2px;
  display: flex;
  flex-direction: column;
  align-self: baseline;
  position: relative;
  color: ${({ theme }) => theme.colors.secondary};

  ${({ theme }) => theme.mediaQueries.sm} {
    margin: 0 1px 2px;
  }
`

export default StyledCard
