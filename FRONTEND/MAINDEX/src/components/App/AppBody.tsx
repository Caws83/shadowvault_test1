import React from 'react'
import styled from 'styled-components'
import { Card } from 'uikit'
import { isMobile } from 'components/isMobile';

export const BodyWrapper = styled(Card)`
  width: ${isMobile ? '370px' : '570px'};
  z-index: 1;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 20px;

`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper >{children}</BodyWrapper>
}
