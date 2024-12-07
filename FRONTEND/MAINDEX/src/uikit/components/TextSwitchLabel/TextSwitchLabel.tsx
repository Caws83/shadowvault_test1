import styled, { DefaultTheme } from 'styled-components'
import { space, typography, layout } from 'styled-system'
import getThemeValue from '../../util/getThemeValue'
import { TextSwitchLabelProps } from './types'

interface ThemedProps extends TextSwitchLabelProps {
  theme: DefaultTheme
}

const getColor = ({ color, theme }: ThemedProps) => {
  return getThemeValue(`colors.${color}`, color)(theme)
}

const getFontSize = ({ fontSize, small }: TextSwitchLabelProps) => {
  return small ? '10px' : fontSize || '12px'
}

const TextSwitchLabel = styled.div<TextSwitchLabelProps>`
  padding-left: 20px;
  color: ${getColor};
  font-size: ${getFontSize};
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

TextSwitchLabel.defaultProps = {
  color: 'text',
  small: false,
  ellipsis: false,
}

export default TextSwitchLabel
