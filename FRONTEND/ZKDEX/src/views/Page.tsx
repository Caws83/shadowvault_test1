import React from 'react'
import styled from 'styled-components'
import { Flex } from 'uikit'
import { isMobile } from 'components/isMobile'

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top: ${isMobile ? '20px' : '100px'};
  width: 100%;
`

const Page: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return (
    <StyledPage {...props}>
      {children}
      <Flex flexGrow={1} />
    </StyledPage>
  )
}

export default Page
