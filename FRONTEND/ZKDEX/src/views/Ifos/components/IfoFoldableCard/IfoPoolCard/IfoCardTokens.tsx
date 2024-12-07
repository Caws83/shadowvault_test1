import React from 'react'
import { Text, Flex, Box, CheckmarkCircleIcon, FlexProps, HelpIcon, useTooltip } from 'uikit'
import { Ifo, PoolIds, Token } from 'config/constants/types'
import tokens from 'config/constants/tokens'
import hosts from 'config/constants/hosts'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { TokenImage, TokenImageIFO } from 'components/TokenImage'
import PercentageOfTotal from './PercentageOfTotal'
import { usePublicClient } from 'wagmi'
import styled from 'styled-components';


const FlexLayout = styled(Flex)`
  justify-content: center;
  align-items: center;
  gap: 35px; /* Adjust the gap value as needed */
`;

interface TokenSectionProps extends FlexProps {
  primaryToken?: Token
  chainId: number
  source?: string
  size?: number
}

const TokenSection: React.FC<TokenSectionProps> = ({ primaryToken, chainId, source, size, children, ...props }) => {
  size = 32 ?? 32
  const renderTokenComponent = () => {
    if(!source){ 
      return <TokenImage token={primaryToken} host={hosts.marswap} chainId={chainId} height={size} width={size} mr="16px" />
    }else {
      return <TokenImageIFO source={source} height={size} width={size} mr="16px" />
    }
  }

  return (
    <Flex {...props}>
      {renderTokenComponent()}
      <div>{children}</div>
    </Flex>
  )
}

const CakeBnbTokenSection: React.FC<TokenSectionProps> = (props) => {
  return <TokenSection primaryToken={tokens.wNative} chainId={props.chainId} {...props} />
}

const Label = (props) => <Text bold fontSize="10px" color="secondary" textTransform="uppercase" {...props} />

const Value = (props) => <Text bold fontSize="12px" style={{ wordBreak: 'break-all' }} {...props} />

interface IfoCardTokensProps {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}

const IfoCardTokens: React.FC<IfoCardTokensProps> = ({ poolId, ifo, publicIfoData, walletIfoData }) => {
  const { t } = useTranslation()
  const client = usePublicClient({chainId: ifo.dex.chainId})

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'Sorry, you didn’t contribute enough %symbol% tokens to meet the minimum threshold. You didn’t buy anything in this sale, but you can still reclaim your %symbol% tokens.',
      {symbol: client.chain.nativeCurrency.symbol}
      ),
    { placement: 'bottom' },
  )

  const logo = publicIfoData.logo === "" ? "/default.png" : publicIfoData.logo
  const publicPoolCharacteristics = publicIfoData[poolId]
  const userPoolCharacteristics = walletIfoData[poolId]
  const { hardCap, softCap } = publicIfoData

  const pool2 = publicIfoData[poolId === 'poolUnlimited' ? 'poolBasic' : 'poolUnlimited']
  const totalStaked = pool2 ? publicPoolCharacteristics.totalAmountPool.plus(pool2.totalAmountPool) : BIG_ZERO

  const { token } = ifo
  const { hasClaimed } = userPoolCharacteristics

  const atSoft = totalStaked.gte(softCap)
  const atHard = totalStaked.eq(hardCap)

  const offerAmount = getBalanceNumber(publicPoolCharacteristics.offeringAmountPool, ifo.token.decimals)

  const renderTokenSection = () => {
    if (publicIfoData.status === 'coming_soon') {
      return (
          <Flex flexDirection="column" justifyContent="center" alignItems="center">
            <Label>{t('On sale')}</Label>
            <Value>{`${offerAmount} ~${ifo.token.symbol}`}</Value>
          </Flex>
      )
    }
    if (publicIfoData.status === 'live') {
      return (
    
        <FlexLayout  flexDirection="row" justifyContent="center" mt="20px" mb="10px" >
          <CakeBnbTokenSection chainId={ifo.dex.chainId} width="30%" >
            <Label>{t(`Spent`)}</Label>
            <Value>{getBalanceNumber(userPoolCharacteristics.amountTokenCommittedInLP, 18)}</Value>
           
          </CakeBnbTokenSection>
          <TokenSection primaryToken={ifo.token} source={logo} chainId={ifo.dex.chainId}  width="40%" >
            <Label>{t('Bought')}</Label>
            <Value>{getBalanceNumber(userPoolCharacteristics.offeringAmountInToken, token.decimals)}</Value>
          </TokenSection>
          </FlexLayout>
         
     
      )
    }
    if (publicIfoData.status === 'finished') {
      return userPoolCharacteristics.amountTokenCommittedInLP.isEqualTo(0) ? (
    
       
          <Flex m="30px" flexDirection="column" justifyContent="center" alignItems="center">
          <Text>{t('You didn’t participate!')}</Text>
          <Text mb="30px" mt="30px">{t(atHard ? 'Hard Cap Reached ' : atSoft ? 'Made Soft Cap!' : 'Not enough Raised.')}</Text>
          </Flex>
     
          
      ) : (
        <>
          {!atSoft && (

            <CakeBnbTokenSection mb="24px" chainId={ifo.dex.chainId}>
              <Label>
                {t(hasClaimed ? '%symbol% RECLAIMED' : '%symbol% TO RECLAIM', { symbol: client.chain.nativeCurrency.symbol})}
              </Label>
              <Flex alignItems="center">
                <Value>{getBalanceNumber(userPoolCharacteristics.amountTokenCommittedInLP, 18)}</Value>
                {hasClaimed && <CheckmarkCircleIcon color="success" ml="8px" />}
              </Flex>
              
            </CakeBnbTokenSection>
          )}

          {atSoft && (
            <Flex flexDirection="row" justifyContent="space-between" mt="10px" mb="10px" >
              <CakeBnbTokenSection mb="24px" chainId={ifo.dex.chainId}>
                <Label>{t('%symbol% Spent', { symbol: client.chain.nativeCurrency.symbol })}</Label>
                <Value>{getBalanceNumber(userPoolCharacteristics.amountTokenCommittedInLP, 18)}</Value>
              </CakeBnbTokenSection>
             
              <TokenSection primaryToken={ifo.token} source={logo} chainId={ifo.dex.chainId}>
                <Label> {t(hasClaimed ? '%symbol% received' : '%symbol% to receive', { symbol: token.symbol })}</Label>
                <Flex alignItems="center">
                  <Value>{getBalanceNumber(userPoolCharacteristics.offeringAmountInToken, token.decimals)}</Value>
                  {!hasClaimed && userPoolCharacteristics.offeringAmountInToken.isEqualTo(0) && (
                    <div ref={targetRef} style={{ display: 'flex', marginLeft: '8px' }}>
                      <HelpIcon />
                    </div>
                  )}
                  {hasClaimed && <CheckmarkCircleIcon color="success" ml="8px" />}
                </Flex>
              </TokenSection>

            </Flex>
          )}

          <Flex flexDirection="column" alignItems="center">
            <Text>{t(atHard ? 'Hard Cap Reached ' : atSoft ? 'Made Soft Cap!' : 'Not enough Raised..')}</Text>
          </Flex>
        </>
      )
    }
    return null
  }
  return (
    <Box >
      {tooltipVisible && tooltip}
      {renderTokenSection()}
    </Box>
  )
}

export default IfoCardTokens
