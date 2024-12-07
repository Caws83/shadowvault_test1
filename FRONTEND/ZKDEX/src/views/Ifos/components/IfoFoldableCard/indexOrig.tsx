import React, { useState } from 'react'
import styled from 'styled-components'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardRibbon,
  ExpandableButton,
  Progress,
  Button,
  ChevronUpIcon,
  Text,
  Flex,
  useModal,
} from 'uikit'
import { Ifo, IfoStatus, PoolIds } from 'config/constants/types'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { useFinalizeRound } from 'views/Ifos/hooks/v3/useIfo'
import Timer from 'views/Ifos/components/IfoFoldableCard/Timer'
import LockTimer from 'views/Ifos/components/IfoFoldableCard/LockTimer'
import IfoPoolCard from './IfoPoolCard'
import IfoSteps from '../IfoSteps'
import { useAccount, usePublicClient } from 'wagmi'
import { TokenImage, TokenImageIFO } from 'components/TokenImage'
import hosts from 'config/constants/hosts'
import { isMobile } from 'components/isMobile'
import ConfirmFinalize from './confirmFinalizeModal'
import { BigNumber } from 'bignumber.js'
import AddLinksButton from './AddLinksButton'



interface IfoFoldableCardProps {
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
  isInitiallyVisible: boolean
}

const getRibbonComponent = (ifo: Ifo, status: IfoStatus, t: any) => {
  if (status === 'coming_soon') {
    return <CardRibbon variantColor="textDisabled" ribbonPosition="left" text={t('Coming Soon')} />
  }

  if (status === 'live' || (status === 'finished' && ifo.isActive)) {
    return (
      <CardRibbon
        variantColor="disabled"
        ribbonPosition="left"
        style={{ textTransform: 'uppercase' }}
        text={status === 'live' ? `${t('Live')}!` : `${t('Finished')}!`}
      />
    )
  }

  return null
}

const StyledCard = styled(Card)`
  max-width: 350px;
  min-height: 484px;
  width: 100%;
  margin: auto;
`

const Header = styled.div<{ banner: string }>`
  display: flex;
  align-items: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: ${({ banner }) => `url('${banner}')`};
`

const FoldableContent = styled.div<{ isVisible: boolean; isActive: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  background: ${({ isActive, theme }) => (isActive ? theme.colors.backgroundAlt : theme.colors.backgroundAlt2)};
`

const CardsWrapper = styled.div<{ singleCard: boolean }>`
  display: grid;
  grid-gap: 32px;
  grid-template-columns: 1fr;
  margin-bottom: 32px;
  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: ${({ singleCard }) => (singleCard ? '1fr' : '1fr 1fr')};
    justify-items: ${({ singleCard }) => (singleCard ? 'center' : 'unset')};
  }
`

const StyledCardBody = styled(CardBody)`
  padding: 20px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 20px;
  }
`

const StyledCardFooter = styled(CardFooter)`
  text-align: center;
  padding: 8px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`

const IfoFoldableCard: React.FC<IfoFoldableCardProps> = ({ ifo, publicIfoData, walletIfoData, isInitiallyVisible }) => {
  const [isVisible, setIsVisible] = useState(isInitiallyVisible)
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const Ribbon = getRibbonComponent(ifo, publicIfoData.status, t)
  const isActive = publicIfoData.status !== 'finished' && ifo.isActive
  const { onEnd, onGetLP, onFinalize } = useFinalizeRound(ifo)
  const isAdmin = account === publicIfoData.admin || account === getAddress(contracts.farmWallet, ifo.dex.chainId)
  const canFinalize = isAdmin && !publicIfoData.finalized && !isActive
  const canEnd = isAdmin && isActive && publicIfoData.status === 'live'

  const nowEpoch = new BigNumber(Math.floor(Date.now() / 1000));
  const unlockTime = new BigNumber(publicIfoData.initialLockTime).plus(publicIfoData.lockLength.multipliedBy(86400))
  const isUnlocked = unlockTime.lt(nowEpoch)
  const showLPWithdraw = isAdmin && !isActive && publicIfoData.finalized && new BigNumber(publicIfoData.initialLockTime).gt(0)

  const client = usePublicClient({chainId: ifo.dex.chainId})

  const basicCharacteristic = publicIfoData[PoolIds.poolBasic]
  const hasBasic = basicCharacteristic.offeringAmountPool.gt(0)

  const unlmtCharacteristic = publicIfoData[PoolIds.poolUnlimited]
  const hasUnlmt = unlmtCharacteristic.offeringAmountPool.gt(0)

  const onClickEnd = () => {
    onEnd()
  }

  const onClickWithdrawl = () => {
    onGetLP()
  }

  const [onPresentConfirmModal] = useModal(
    <ConfirmFinalize
      account={account}
      ifo={ifo}
      publicIfoData={publicIfoData}
    />,
  )

  
  return (
    <StyledCard ribbon={Ribbon}>
     
<Header banner={publicIfoData.banner ?? ""}>
  <Flex flexDirection="column"  alignItems="center" width="100%">
    <Flex alignItems="center" justifyContent="flex-end" width="100%" >
      
   
      {publicIfoData.isLocked ? (
        <LockTimer publicIfoData={publicIfoData} ifo={ifo} />  
      ):(
          <Text style={{ textShadow: '0 0 6px black, 0 0 6px black, 0 0 6px black, 0 0 6px black' }} bold>{t(`${isMobile ? ifo.token.symbol : ifo.name}`)}</Text>
      )}
      {publicIfoData.logo ? (
            <TokenImageIFO source={publicIfoData.logo} height={isMobile ? 32 : 64} width={isMobile ? 32 : 64} mr="4px" />
          ):(
            <TokenImage token={ifo.token} host={hosts.marswap} chainId={ifo.dex.chainId} height={isMobile ? 32 : 64} width={isMobile ? 32 : 64} mr="4px" />
          )}
    </Flex>
    
    
    {!isMobile && (
      <Text style={{ textShadow: '0 0 6px black, 0 0 6px black, 0 0 6px black, 0 0 6px black' }}bold mr="8px">{client.chain.name}</Text>
    )}
    
    
  </Flex>
  <ExpandableButton expanded={isVisible} onClick={() => setIsVisible((prev) => !prev)} />
</Header>



      <FoldableContent isVisible={isVisible} isActive={publicIfoData.status !== 'idle' && isActive}>
        {isActive && <Progress variant="flat" primaryStep={publicIfoData.progress} />}
        {isActive && (
          <Timer publicIfoData={publicIfoData} ifo={ifo} />    
        )}
       

        <StyledCardBody>
          <StyledCardFooter>
            <Button variant="text" endIcon={<ChevronUpIcon color="primary" />} onClick={() => setIsVisible(false)}>
              {t('Minimize')}
            </Button>
          </StyledCardFooter>
          <CardsWrapper singleCard={!hasBasic || !hasUnlmt}>
            {hasBasic && (
              <IfoPoolCard
                poolId={PoolIds.poolBasic}
                ifo={ifo}
                publicIfoData={publicIfoData}
                walletIfoData={walletIfoData}
              />
            )}
            {hasUnlmt && (
              <IfoPoolCard
                poolId={PoolIds.poolUnlimited}
                ifo={ifo}
                publicIfoData={publicIfoData}
                walletIfoData={walletIfoData}
              />
            )}
          </CardsWrapper>
          {canFinalize && (
           <Flex justifyContent="center" alignItems="center" mb="16px">
            <Button width="75%" variant="secondary" onClick={onPresentConfirmModal}>
              Finalize Sale
            </Button>
            </Flex>
          )}
          {canEnd && (
            <Flex justifyContent="center" alignItems="center" mb="16px">
            <Button width="75%" variant="secondary" onClick={onClickEnd}>
              End Sale
            </Button>
            </Flex>
          )}
          {showLPWithdraw && (
            <Flex justifyContent="center" alignItems="center" mb="16px">
            <Button  width="75%" variant="secondary" onClick={onClickWithdrawl} disabled={!isUnlocked}>
              Withdrawal LP
            </Button>
            </Flex>
          )}
          {isAdmin && (
            <AddLinksButton ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />
          )}
          <StyledCardFooter>
            <Button variant="text" endIcon={<ChevronUpIcon color="primary" />} onClick={() => setIsVisible(false)}>
              {t('Minimize')}
            </Button>
          </StyledCardFooter>

          {/* {isActive && <IfoSteps ifo={ifo} walletIfoData={walletIfoData} />} */}
        </StyledCardBody>
      </FoldableContent>
    </StyledCard>
  )
}

export default IfoFoldableCard
