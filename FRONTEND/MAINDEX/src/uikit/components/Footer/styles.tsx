import styled from 'styled-components'
import { darkColors } from '../../theme/colors'
import { Box, Flex } from '../Box'
import SocialLinks from './Components/SocialLinks'

export const StyledFooter = styled(Flex)`
  background: transparent;
  margin-top: 100px;
`

export const StyledList = styled.ul`
  list-style: none;
  margin-bottom: 5px;

`

export const StyledListItem = styled.li`
  font-size: 12px;
  margin-bottom: 2px;
  text-transform: capitalize;

  &:first-child {
    color: ${darkColors.secondary};
    font-weight: 600;
    text-transform: uppercase;
  }
`

export const StyledIconMobileContainer = styled(Box)`
  margin-bottom: 2px;
`

export const StyledToolsContainer = styled(Flex)`
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-style: solid;
  padding: 4px 0;
  margin-bottom: 2px;

  ${({ theme }) => theme.mediaQueries.sm} {
    border-top-width: 0;
    border-bottom-width: 0;
    padding: 0 0;
    margin-bottom: 0;
  }
`

export const StyledSocialLinks = styled(SocialLinks)`
`
