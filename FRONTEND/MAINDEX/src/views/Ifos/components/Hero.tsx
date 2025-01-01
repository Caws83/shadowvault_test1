import React from 'react'
import styled from 'styled-components'
import { Box, Heading, Text, Flex } from 'uikit'
import Container from 'components/Layout/Container'
import { useTranslation } from 'contexts/Localization'
import CreateSale from './NewSaleCard'

const StyledHero = styled.div`
  background-repeat: repeat-x;
`

const Hero = () => {
  const { t } = useTranslation()

  return (
    <Box mb="32px">
      <StyledHero>
        <Container>
          <Heading as="h1" scale="xl" mb="24px">
            {t('MARSWAP PreSales')}
          </Heading>
          <Text bold fontSize="20px">
            {t('A Simplified Pre Sale Model.')}
          </Text>
        </Container>

        <Flex flex="1" height="fit-content" justifyContent="center" alignItems="center" mt={['24px', null, '0']}>
          <CreateSale />
        </Flex>
      </StyledHero>
    </Box>
  )
}

export default Hero
