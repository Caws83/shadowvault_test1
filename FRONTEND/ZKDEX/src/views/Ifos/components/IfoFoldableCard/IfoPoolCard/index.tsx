import React from 'react'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { Card, CardHeader, Text, useTooltip, HelpIcon, Flex, Skeleton } from 'uikit'
import { Ifo, PoolIds } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import { TokenImage, TokenImageIFO } from 'components/TokenImage'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import IfoCardTokens from './IfoCardTokens'
import IfoCardActions from './IfoCardActions'
import IfoCardDetails from './IfoCardDetails'
import CopyAddress from './CopyAddress'
import { getAddress } from 'utils/addressHelpers'

interface IfoCardProps {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}


export const StyledCardInner = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
`;

export interface FooterEntryProps {
  label: string
  value: string | number
}



const SmallCard: React.FC<IfoCardProps> = ({ poolId, ifo, publicIfoData, walletIfoData }) => {
  const { t } = useTranslation()
 
  const logo = publicIfoData.logo === "" ? "/default.png" : publicIfoData.logo


  return (
    <>

      <StyledCardInner >
       
          <Flex justifyContent="center" alignItems="center">
            
             
              <TokenImageIFO source={logo} height={28} width={28} mr="16px" />
            

            <Text style={{ textShadow: '3px 3px 1px #474747' }} fontSize="16px" bold color="primary">
              {ifo.name}
            </Text>
            <CopyAddress logoOnly={true} account={getAddress(ifo.token.address)} />
           
          </Flex>
       

          <IfoCardTokens poolId={poolId} ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />
          <IfoCardActions poolId={poolId} ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />
          <IfoCardDetails poolId={poolId} ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />
      </StyledCardInner>
     
    </>
  )
}

export default SmallCard
