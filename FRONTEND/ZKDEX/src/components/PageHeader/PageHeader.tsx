import React, { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'
import { Heading, Text } from 'uikit'
import Container from 'components/Layout/Container'

const StyledHero = styled.div`
    background: ${({ theme }) => theme.colors.gradients.cardHeader};
  padding: 10px 50px;
`

const PageHeader: React.FC<{ firstHeading?; secondHeading?; children?: ReactNode }> = ({ firstHeading, secondHeading, children }) => {
  const theme = useTheme()
  return (
    <>
  <StyledHero>
    <Container>
    {firstHeading && (
      <Heading as="h1" scale="xl" mb="8px" color={theme.colors.textSubtle}>
        {firstHeading}
      </Heading>
    )}

      {secondHeading && (
        <Text bold fontSize="16px"color={theme.colors.secondary}>
          {secondHeading}
        </Text>
      )}

      {children}
    </Container>
  </StyledHero>
 
  </>
)
      }

export default PageHeader
