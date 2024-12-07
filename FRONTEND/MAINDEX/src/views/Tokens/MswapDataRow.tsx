import React from 'react'
import styled from 'styled-components'
import { useTotalSupplyTarget, useBurnedBalance } from 'hooks/useTokenBalance'
import { getAddress } from 'utils/addressHelpers'
import { getBalanceNumber, formatLocalisedCompactNumber } from 'utils/formatBalance'
import { Flex, Text, Heading, Skeleton } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import BigNumber from 'bignumber.js'
import tokens from 'config/constants/tokens'
import { dexs } from 'config/constants/dex'
import RowHeading from './RowHeading'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'



const StyledColumn = styled(Flex)<{ noMobileBorder?: boolean }>`
  flex-direction: column;
  ${({ noMobileBorder, theme }) =>
    noMobileBorder
      ? `${theme.mediaQueries.md} {
           padding: 0 16px;
           border-left: 1px ${theme.colors.textSubtle} solid;
         }
       `
      : `border-left: 1px ${theme.colors.textSubtle} solid;
         padding: 0 8px;
         ${theme.mediaQueries.sm} {
           padding: 0 16px;
         }
       `}
`

const Grid = styled.div`
  display: grid;
  grid-gap: 16px 8px;
  margin-top: 24px;
  grid-template-columns: repeat(2, auto);

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-gap: 16px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-gap: 32px;
    grid-template-columns: repeat(4, auto);
  }
`

const MSWAPDataRow = () => {
  const { t } = useTranslation()
  const MSWAPAddress = getAddress(tokens.mswap.address, 1)
  const totalSupply = new BigNumber(useTotalSupplyTarget(1, MSWAPAddress))
  const burnedBalance = getBalanceNumber(useBurnedBalance(MSWAPAddress, 1))
  const cakeSupply = totalSupply ? getBalanceNumber(totalSupply) - burnedBalance : 0
  const frtprice = useGetTokenPrice(dexs.shibSwap, tokens.mswap)
  const mcap = new BigNumber(frtprice).times(cakeSupply)
  const mcapString = formatLocalisedCompactNumber(mcap.toNumber())
  
  return (
    <>
    <RowHeading text={t('MSWAP-ETH Token Info')} />
    <Grid>
      <Flex flexDirection="column">
        <Text color="textSubtle">{t('Total supply')}</Text>
        {cakeSupply ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px" bold value={cakeSupply} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </Flex>
      <StyledColumn noMobileBorder>
        <Text color="textSubtle">{t('Market cap')}</Text>
        {mcap?.gt(0) && mcapString ? (
          <Heading scale="lg">{t('$%marketCap%', { marketCap: mcapString })}</Heading>
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      
      <StyledColumn noMobileBorder>
        <Text color="textSubtle">{t('MSWAP ETH Value')}</Text>
        {frtprice ? (
          <Balance decimals={9} lineHeight="1.1" fontSize="24px" bold value={frtprice} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      
    </Grid>
    </>
  )
}

export default MSWAPDataRow