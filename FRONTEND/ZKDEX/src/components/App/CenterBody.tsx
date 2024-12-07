import React from 'react'
import styled from 'styled-components'
import { Flex } from 'uikit'
import { isMobile } from 'components/isMobile';


export const BodyWrapper = styled(Flex)`
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
border: 0
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function CenterBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper >{children}</BodyWrapper>
}
