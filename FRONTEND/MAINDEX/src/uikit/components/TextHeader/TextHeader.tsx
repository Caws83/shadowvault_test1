import styled, { DefaultTheme } from 'styled-components'
import { space, typography, layout } from 'styled-system'
import getThemeValue from '../../util/getThemeValue'
import { TextHeaderProps } from './types'

interface ThemedProps extends TextHeaderProps {
  theme: DefaultTheme
}

const getColor = ({ color, theme }: ThemedProps) => {
  return getThemeValue(`colors.${color}`, color)(theme)
}

const getFontSize = ({ fontSize, small }: TextHeaderProps) => {
  return small ? '10px' : fontSize || '12px'
}

const TextHeader = styled.div<TextHeaderProps>`
  padding-top: 5px;
  padding-right: 5px;
  color: ${getColor};
  font-size: 12px;
  font-weight: ${({ bold }) => (bold ? 600 : 400)};
  line-height: 1.5;
  ${({ textTransform }) => textTransform && `text-transform: ${textTransform};`}
  ${({ ellipsis }) =>
    ellipsis &&
    `white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;`}

  ${space}
  ${typography}
  ${layout}
`

TextHeader.defaultProps = {
  color: 'text',
  small: false,
  ellipsis: false,
}

export default TextHeader
