import React, { useState } from 'react';
import { Button, Flex, Modal, Text, useModal } from 'uikit';
import styled from 'styled-components';
import { isMobile } from 'components/isMobile'
import ContributeButton, { userData } from './ContributeButton';
import BigNumber from 'bignumber.js';
import { useAccount, useChainId, useReadContracts } from 'wagmi';
import { lanchManagerAbi } from 'config/abi/launchManager';
import { getAddress } from 'utils/addressHelpers';
import contracts from 'config/constants/contracts';
import CopyAddress from 'views/Pools/components/Modals/CopyAddress';
import { defaultChainId } from 'config/constants/chains';
import UpdateSocials from './UpdateSocials'
import { RoundData } from './RoundData';

const Container = styled.div`
  max-width: 600px;
  font-size: ${isMobile ? '12px' : '12px'};
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

const TextContainer = styled.div`
  color: white;
  justify-content: center;
  align-items: center;
  line-height: 20px;
  padding-top: 20px;
`;

const BorderContainer = styled.div`
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
`;


const ImageTop = styled.div`
  width: ${isMobile ? '30px' : '40px'};
  overflow: hidden;
`;

const TextT = styled.div`
  color: white;
  font-size: ${isMobile ? '12px' : '12px'};
  width: 100%;
  padding-bottom: 2px;
`;

const TextTop = styled.div`
  color: white;
  font-size: ${isMobile ? '16px' : '20px'};
  width: 80%;
  padding-bottom: 2px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
`;

const GridColSpon = styled.div`
  display: grid;
  align-item: center;
  width: 100%;
`;

const LinkSocial = styled.div`
  margin-right: 5px;
`;

const GridCol = styled.div`
  
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
`

const LinkSocialContainer = styled.div``;


const RoundInfo: React.FC<{ onDismiss?: () => void, roundData: RoundData, userData: userData, account: string }> = ({ onDismiss, roundData, userData, account }) => {
  const handleDismiss = onDismiss || (() => {});
  const { chain } = useAccount()
const chainId = chain?.id ?? defaultChainId
  const [showContributors, setShowContributors] = useState(false);

  const toggleContributors = () => {
    setShowContributors(!showContributors);
  };

  const handleClick = () => {
    openSocialModal()
  }
  const [openSocialModal] = useModal(
    <UpdateSocials chainId={chainId} roundData={roundData} />,
  )

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'getRoundContributions',
        args: [roundData.roundId],
        chainId: chainId,
      }
    ],
  });

  function formatTimeLeft(endEpoch) {
    const adjustedUnixTimeInSeconds = Number(endEpoch.toString());
    const currentUnixTimeInSeconds = Math.floor(Date.now() / 1000);
    const differenceInSeconds = adjustedUnixTimeInSeconds - currentUnixTimeInSeconds;
  
    if (differenceInSeconds < 0) {
      return `0 sec`;
    }
  
    const minutesLeft = Math.floor(differenceInSeconds / 60);
    const secondsLeft = differenceInSeconds % 60;
  
    if (minutesLeft > 0) {
      return `${minutesLeft} min`;
    }
  
    return `${secondsLeft} sec`;
  }

  const isValidLogoUrl = (logo) => {
    const urlPattern = /^https?:\/\/.*\.(jpg|jpeg|png)$/i;
    return urlPattern.test(logo);
  };

  const decimalsToShow = chainId === 282 ? 4 : 0

  return (
    <Modal minWidth="370px" style={{ fontSize: "14px" }} title="Token Info" onDismiss={handleDismiss} >
      <BorderContainer>
        <Container>      
          <GridCol>
    
            <ImageTop>
              {isValidLogoUrl(roundData?.projectInfo[2]) ? (
                <img src={roundData?.projectInfo[2]} alt='Logo' />
              ) : (
                <img src={'/default.png'} alt='Default Logo' />
              )}
            </ImageTop>
            <TextTop>{`${roundData?.name}`}</TextTop>
            <CopyAddress account={roundData.tokenContract} logoOnly={isMobile}/>
    
          </GridCol>
          <TextContainer className="bigger">
          <Item>
              <TextT>{`${roundData?.projectInfo[3]}`}</TextT>
            </Item>
            <Item>
              <TextT></TextT>
            </Item>

            <Item>
              <TextT>{`Total Raised: ${new BigNumber(roundData?.totalRaised.toString()).shiftedBy(-18).toFixed(decimalsToShow)} zkCRO`}</TextT>
            </Item>
            <Item>
              <TextT>{`Minimum: ${new BigNumber(roundData?.softCap.toString()).shiftedBy(-18).toFixed(decimalsToShow)} zkCRO`}</TextT>
            </Item>
            {!roundData.isFinished &&
              <Item>
                <TextT>{`Time Left: ${formatTimeLeft(roundData?.endEpoch)}`}</TextT>
              </Item>
            }
            
            
            {userData && account && (
              <>
                <Item>
                  <TextT>{`Your Contribution: ${new BigNumber(userData[0].toString()).shiftedBy(-18).toFixed(decimalsToShow)}`}</TextT>
                </Item>
                <Item>
                  <TextT>{`Your Tokens: ${new BigNumber(userData[1].toString()).shiftedBy(-18).toFixed(decimalsToShow)} ${roundData.symbol}`}</TextT>
                </Item>
              </>
            )}
          </TextContainer>
          <GridColSpon>
            <LinkSocialContainer>
              <Flex mt='10px' flexDirection='row' justifyContent='center' alignItems='center'>
                <LinkSocial>
                  <a href={roundData?.projectInfo[1]}>
                    <img src="/images/home/icons/telegram.png" alt="Telegram" className="desktop-icon" style={{ width: '30px' }} />
                  </a>
                </LinkSocial>
                <LinkSocial >
                  <a href={roundData?.projectInfo[0]}>
                    <img src={`/images/home/icons/web.png`} alt={`Web`} className="desktop-icon" style={{ width: `30px` }} />
                  </a>
                </LinkSocial>
              </Flex>
            </LinkSocialContainer>
            <Flex mt='20px' mb='20px' justifyContent='center'>
             <ContributeButton variantType={'primary'}  variantSize={'sm'} poolId={Number(roundData?.roundId.toString())} outToken={roundData.tokenContract} account={account} chainId={chainId} isFinished={roundData?.isFinished} canFinalize={parseInt(formatTimeLeft(roundData?.endEpoch), 10) < 0} />
             </Flex>
          </GridColSpon>

          {roundData.creator == account &&
              <Flex mt='30px' alignItems='center' justifyContent='center'>
                <Button onClick={handleClick}>Update Socials</Button>
              </Flex> 
            }

          <Flex  flexDirection='column' justifyContent='center' alignItems='center'>
          <Button mb="20px" variant="text" onClick={toggleContributors}>{showContributors ? '< Hide Contributors >' : '< Show Contributors >'}</Button>
          </Flex>
         
          {showContributors && data && data[0].result.length > 0 && data[0].result.map((item, index) => (
            
         
            <Flex key={index}  justifyContent='space-between' alignItems='center' width="100%">
              <Text>{`${item.user.slice(0, 4)}...${item.user.slice(item.user.length - 5)}`}</Text>
              <Text>{` ${new BigNumber(item.amount.toString()).shiftedBy(-18).toFixed(2)} zkCRO`}</Text>
            </Flex>
           
          ))}
           
        </Container>
      </BorderContainer>
    </Modal>
  );
};

export default RoundInfo;
