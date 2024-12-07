import styled from 'styled-components'
import { space, SpaceProps } from 'styled-system'
import { CardTheme } from './types'

export interface CardHeaderProps extends SpaceProps {
  variant?: keyof CardTheme['cardHeaderBackground']
}
const CardHeader = styled.div<CardHeaderProps>`
min-height: 50px;
  background: ${({ theme, variant = 'default' }) => theme.card.cardHeaderBackground[variant]};
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
  ${space}
`

CardHeader.defaultProps = {
  p: '14px',
}

export default CardHeader
