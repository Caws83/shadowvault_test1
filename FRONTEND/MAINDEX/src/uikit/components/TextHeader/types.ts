import { LayoutProps, SpaceProps, TypographyProps } from 'styled-system'

export interface TextHeaderProps extends SpaceProps, TypographyProps, LayoutProps {
  color?: string
  fontSize?: string
  bold?: boolean
  small?: boolean
  ellipsis?: boolean
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize'
}
