import styled from 'styled-components'
import TextSwitchLabel from './TextSwitchLabel'

const TooltipTextSwitchLabel = styled(TextSwitchLabel)`
  text-decoration: ${({ theme }) => `underline dotted ${theme.colors.textSubtle}`};
  text-underline-offset: 0.1em;
`

export default TooltipTextSwitchLabel
