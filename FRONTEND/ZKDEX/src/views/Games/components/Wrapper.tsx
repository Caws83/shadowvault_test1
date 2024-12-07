import { CardHeader } from 'uikit'
import styled from 'styled-components'

const Wrapper = styled(CardHeader)<{ background?: string }>`
  background: ${({ background, theme }) => theme.colors.gradients[background]};
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
  cursor: pointer;
`

export default Wrapper
