import React from 'react'
import styled from 'styled-components'
import { Flex } from 'uikit'

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  hideGraph?: boolean;
}

const StyledPage = styled.div<PageProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: ${({ hideGraph }) => (hideGraph ? '0' : '4%')};
  margin-left: ${({ hideGraph }) => (hideGraph ? '0' : '2%')};
  margin-top: ${({ hideGraph }) => (hideGraph ? '0' : '40px')};
  margin-bottom: ${({ hideGraph }) => (hideGraph ? '0' : '30px')};
`

const Page: React.FC<PageProps> = ({ children, hideGraph = false, ...props }) => {
  return (
    <StyledPage hideGraph={hideGraph} {...props}>
      {children}
    </StyledPage>
  )
}

export default Page

