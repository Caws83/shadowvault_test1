import React from 'react'
import styled from 'styled-components'
import { Flex, Text, TicketFillIcon /* , PredictionsIcon */ } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import tokens from 'config/constants/tokens'
import PurpleWordHeading from '../PurpleWordHeading'
import IconCard, { IconCardData } from '../IconCard'
import LotteryCardContent from './LotteryCardContent'
import CompositeImage from '../CompositeImage'

const TransparentFrame = styled.div<{ isDark: boolean }>`
  background: ${({ theme }) => (theme.isDark ? 'rgba(8, 6, 11, 0.05)' : ' rgba(255, 255, 255, 0.05)')};
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-sizing: border-box;
  backdrop-filter: blur(5px);
  border-radius: 4px;
  width: 85%;
  align-items: center;
  justify-content: center;
  margin: auto;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 40px;
  }
`

const BgWrapper = styled.div`
  z-index: -1;
  overflow: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
`

const BottomLeftImgWrapper = styled(Flex)`
  position: absolute;
  left: 0;
  bottom: 130px;
  max-width: 192px;

  ${({ theme }) => theme.mediaQueries.md} {
    max-width: 100%;
  }
`

const TopRightImgWrapper = styled(Flex)`
  position: absolute;
  right: 0;
  top: 30px;

  max-width: 192px;

  ${({ theme }) => theme.mediaQueries.md} {
    max-width: 100%;
  }
`
const FRTLotteryCardData: IconCardData = {
  icon: <TicketFillIcon color="white" width="36px" />,
  background: ' linear-gradient(180deg, #000000 0%, #ffffff 100%);',
  borderColor: '#ffffff',
  rotation: '1.43deg',
}

const bottomLeftImage = {
  path: '/images/home/prediction-cards/',
  attributes: [
    { src: 'bottom-left', alt: 'CAKE card' },
    { src: 'green', alt: 'Green CAKE card with up arrow' },
    { src: 'red', alt: 'Red Cake card with down arrow' },
    { src: 'top-right', alt: 'CAKE card' },
  ],
}

const topRightImage = {
  path: '/images/home/lottery-balls/',
  attributes: [
    { src: '7', alt: 'Lottery ball number 7' },
    { src: '4', alt: 'Lottery ball number 4' },
    { src: '2', alt: 'Lottery ball number 2' },
    { src: '6', alt: 'Lottery ball number 6' },
    { src: '9', alt: 'Lottery ball number 9' },
  ],
}

const WinSection = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <>
      <BgWrapper>
        
        <BottomLeftImgWrapper>
          <CompositeImage {...topRightImage} />
        </BottomLeftImgWrapper>

        <TopRightImgWrapper>
          <CompositeImage {...bottomLeftImage} />
        </TopRightImgWrapper>

      </BgWrapper>
      <TransparentFrame isDark={(theme as any).isDark}>
        <Flex flexDirection="column" alignItems="center" justifyContent="center">
          <PurpleWordHeading textAlign="center" text={t('Win with MARSWAP')} />
          <Text color="secondary">{t('Join the Fun.')}</Text>
          <Text mb="40px" color="secondary">
            {t('MARSWAP, Games for everyone')}
          </Text>
          <Flex m="0 auto" flexDirection={['column', null, null, 'row']} maxWidth="600px">
            <Flex flex="1" maxWidth={['275px', null, null, '100%']}>
              <IconCard {...FRTLotteryCardData}>
                <LotteryCardContent lotteryToken={tokens.mswap} />
              </IconCard>
            </Flex>
          </Flex>
        </Flex>
      </TransparentFrame>
    </>
  )
}

export default WinSection
