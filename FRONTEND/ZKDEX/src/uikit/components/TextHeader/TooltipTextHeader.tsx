import styled from 'styled-components'
import TextHeader from './TextHeader'

const TooltipTextHeader = styled(TextHeader)`
  text-decoration: ${({ theme }) => `underline dotted ${theme.colors.textSubtle}`};
  text-underline-offset: 0.1em;
`

export default TooltipTextHeader
