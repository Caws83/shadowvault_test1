import React from 'react'
import styled from 'styled-components'
import { Card, CardBody, CardRibbon, Progress, Flex } from 'uikit'
import { Ifo, IfoStatus, PoolIds } from 'config/constants/types'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import Timer from 'views/Ifos/components/IfoFoldableCard/Timer'
import LockTimer from 'views/Ifos/components/IfoFoldableCard/LockTimer'
import IfoPoolCard from './IfoPoolCard'

interface IfoFoldableCardProps {
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
  isInitiallyVisible: boolean
}

const getRibbonComponent = (ifo: Ifo, status: IfoStatus, t: any) => {
  if (status === 'coming_soon') {
    return <CardRibbon variantColor='textDisabled' ribbonPosition='left' text={t('Coming Soon')} />
  }

  if (status === 'live' || (status === 'finished' && ifo.isActive)) {
    return (
      <CardRibbon
        variantColor='disabled'
        ribbonPosition='left'
        style={{ textTransform: 'uppercase' }}
        text={status === 'live' ? `${t('Live')}!` : `${t('Finished')}!`}
      />
    )
  }

  return null
}

const StyledCard = styled(Card)`
  max-width: 350px;
  width: 100%;
  margin: 2.5px;
  border-radius: 20px;
`

const Header = styled.div<{ banner: string }>`
  display: flex;
  align-items: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: ${({ banner }) => `url('${banner}')`};
  height: 75px;
`

const CardsWrapper = styled.div<{ singleCard: boolean }>`
  display: grid;
  grid-gap: 32px;
  grid-template-columns: 1fr;
  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: '1fr';
    justify-items: 'center';
  }
`

const StyledCardBody = styled(CardBody)`
  padding: 12px 8px;
  
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 12px 8px;
  }
  background: ${({ theme }) => theme.colors.backgroundAlt};

`

const IfoFoldableCard: React.FC<IfoFoldableCardProps> = ({ ifo, publicIfoData, walletIfoData }) => {
  const { t } = useTranslation()
  const Ribbon = getRibbonComponent(ifo, publicIfoData.status, t)
  const isActive = publicIfoData.status !== 'finished' && ifo.isActive
  const basicCharacteristic = publicIfoData[PoolIds.poolBasic]
  const hasBasic = basicCharacteristic.offeringAmountPool.gt(0)
  const banner = publicIfoData.banner === "" ? `/images/ifos/default2-bg.png` : publicIfoData.banner

  return (
    <StyledCard ribbon={Ribbon}>
      <Header banner={banner}>
        <Flex flexDirection='column' alignItems='center' width='100%' height='100%'>
          {isActive ? (
            <Timer publicIfoData={publicIfoData} ifo={ifo} />
          ) : (
            publicIfoData.isLocked && <LockTimer publicIfoData={publicIfoData} ifo={ifo} />
          )}
        </Flex>
      </Header>
<Flex mb="20px"></Flex>
      <Progress variant='flat' primaryStep={publicIfoData.progress} />

      <StyledCardBody>
        <CardsWrapper singleCard={true}>
          {hasBasic && (
            <IfoPoolCard
              poolId={PoolIds.poolBasic}
              ifo={ifo}
              publicIfoData={publicIfoData}
              walletIfoData={walletIfoData}
            />
          )}
        </CardsWrapper>
      </StyledCardBody>
    </StyledCard>
  )
}

export default IfoFoldableCard
