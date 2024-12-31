import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Flex, ButtonMenu, ButtonMenuItem, useModal, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import styled from 'styled-components';
import { isMobile } from 'components/isMobile';
import { useAccount, useReadContract } from 'wagmi';
import { lanchManagerAbi } from 'config/abi/launchManager';
import { getAddress } from 'utils/addressHelpers';
import contracts from 'config/constants/contracts';
import HowItWorks from './HowItWorks';
import CurrentIfo from './CurrentIfo';
import CreateRocket from './CreateRocket';
import BigNumber from 'bignumber.js';
import SearchInput from 'components/SearchInput';
import ContributeButton from './ContributeButton';
import { defaultChainId } from 'config/constants/chains';
import { GiThorHammer } from 'react-icons/gi';
import { FaInfoCircle } from 'react-icons/fa';
import { RiMedal2Fill } from "react-icons/ri";
import { IoShieldCheckmark } from "react-icons/io5";
import { GiStopwatch } from "react-icons/gi";
import { MdLockClock } from "react-icons/md";



const StyledPage = styled.div`
  padding-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  @media (max-width: 768px) {
    padding-top: 10px;
    width: 90%; /* Adjust width as needed for mobile */
    margin: 0 auto; /* Center the content */
  }
`;

const LinkSocial = styled.div`
  margin-right: 5px;
`


const CardHeader = styled.div`
  display: grid;
  background: rgba(20, 20, 22, 0.95);
  border-radius: 8px 8px 0 0;
  padding: 5px;
  border-bottom: 1px solid #3c3f44;
`
const CardHeader2 = styled.div`
  display: grid;
  background: rgba(20, 20, 22, 0.95);
  border-radius: 8px 8px 0 0;
  padding: 5px;
  border-bottom: 1px solid #3c3f44;
`

const GridCol = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 30px; /* Adjust gap as needed */
   
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
   display: flex;
    grid-template-columns: 1fr; /* Single column on smaller screens */
  }
`
const GridColSpon = styled.div`
padding: 2px;
  display: grid;

`

const GridColButtons = styled.div`
  padding-top: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
`;

const GridTR = styled.div`
  display: flex;
flex-direction: row;
  

`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 170px;
      padding-top: ${isMobile ? '15px' : '15px'};


`;

const LogoTextContainer = styled.div`
  display: flex;
  flex-direction: row;



`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  
  justify-content: center;
`;

const PageLayout = styled.div`
  display: ${isMobile ? 'null' : 'flex'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top:  ${isMobile ? '20px;' : '40px;'};

  width: 100%;
`;

const TextTB = styled.div`
  color: white;
   font-size: ${isMobile ? '12px' : '14px'};
  width: 80%; /* Adjust width as per your design */
  padding-bottom: 2px;
  overflow-wrap: break-word; /* Use overflow-wrap for word wrapping */
  white-space: normal;
`;

const TextTBName = styled.div`
  color: white;
   font-size: ${isMobile ? '12px' : '14px'};
  width: 80%; /* Adjust width as per your design */
  padding-bottom: 10px;
  overflow-wrap: break-word; /* Use overflow-wrap for word wrapping */
  white-space: normal;
`;

const Tooltip = styled.div`
  visibility: hidden;
  width: auto;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
`;

const TextT = styled.div`
  color: white;
   font-size: ${isMobile ? '12px' : '14px'};
  width: 100%;
  padding-bottom: 2px;
`

const TextNo = styled.div`
   display: flex;
    align-items: center;
  justify-content: center;
   color: white;
   padding-top: 45px;
   font-size: ${isMobile ? '12px' : '14px'};
`
const ButtonCon = styled.div`
      display: flex;
       align-items: center;
  justify-content: center;
`


const CustomBodyWrapper3 = styled.div`
  padding:10px;
  margin-left: 10px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  & > .first {
    flex: 2; /* First column takes 2/3 of the space */
  }

  & > .last {
    flex: 1; /* Last column takes 1/3 of the space */
  }

  
`;

const Image = styled.div`
  width: ${isMobile ? '30px' : '40px'};
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageBox = styled.div`
  width: ${isMobile ? '30px' : '30px'};
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageTop = styled.div`
  width: ${isMobile ? '45px' : '60px'};

      padding-top: ${isMobile ? '15px' : '15px'};

  overflow: hidden;
  margin-right: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

`;

const Item = styled.div`
  display: flex;
  align-items: center;
  margin-left: 4px;
  font-size: 14px;
  gap: 12px;
`;

const ButtonItem = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  font-size: 16px;
  cursor: pointer;
    padding-bottom: 5px;
`

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 16px;
  }
    
  padding-top: ${isMobile ? '20px' : '0px'};
  padding-bottom: ${isMobile ? '10px' : '0px'};
`;
const Body = styled.div`
  border-radius: 4px;
  width: ${isMobile ? '330px' : '400px'};
  height: ${isMobile ? '120px' : '150px'};
  z-index: 1;
  background: rgba(129, 192, 231, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(129, 192, 231, 0.15);
    transform: translateY(-2px);
  }
`;

const FeatureRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
`

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dadad2;
  font-size: 17px;

  svg {
    color: #dadad2;
    font-size: 30px;
  }
`

// MarsShot component
const MarsShot: React.FC = () => {
  const { t } = useTranslation();
  const { chain, address: account } = useAccount();
  const [showSearch, setShowSearch] = useState(false);
  const [fee, setFee] = useState('0');
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();

  const chainId = chain?.id ?? defaultChainId
  const decimalsToShow = chainId === 282 ? 4 : 0

  const hashParams = new URL(window.location.href).hash.split('?')[1]
  const urlParams = new URLSearchParams(hashParams)
  const filter = urlParams.get('filter')

  useEffect(() => {
  if (filter) {
    setSearchQuery(filter)
  }
  },[filter])

  const { data } = useReadContract({
    abi: lanchManagerAbi,
    address: getAddress(contracts.launchManager, chainId),
    functionName: 'creationFee',
    chainId: chainId,
  });


  useEffect(() => {
    if (data) setFee(data.toString());
  }, [data]);

  useEffect(() => {
    switch (location.pathname) {
      case '/marshot/hot5':
        setActiveIndex(0);
        break;
      case '/marshot/allLive':
        setActiveIndex(1);
        break;
      case '/marshot/history':
        setActiveIndex(2);
        break;
      default:
        setActiveIndex(0);
        break;
    }
  }, [location.pathname])

  const [topLiveIfo, setTopLiveIfo] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [ sponsorIndex, setSponsorIndex ] = useState(0)

  const [searchQuery, setSearchQuery] = useState('');
  const handleChangeSearchQuery = (event) => {
    setSearchQuery(event.target.value);
};

useEffect(() => {
  const interval = setInterval(() => {
    setSponsorIndex(sponsorIndex+1 >= sponsors.length ? 0 : sponsorIndex+1);
  }, 8000); 

  return () => clearInterval(interval);
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



  const openHowItWorks = () => {
    howItWorks()
  }

  const [howItWorks] = useModal(<HowItWorks  />);

  const openCreateRocket = () => {
    createRocket()
  }

  const [createRocket] = useModal(<CreateRocket  />);

  const searchClick = () => {
    setShowSearch(prevState => !prevState);
  };

  const isValidLogoUrl = (logo) => {
    const urlPattern = /^https?:\/\/.*\.(jpg|jpeg|png)$/i;
    return urlPattern.test(logo);
  };

  const [haveContract, setHaveContract] = useState(false)
  useEffect(() => {
    setHaveContract(false)
    if (chain && chain?.id in contracts.tokenFactory) {
      setHaveContract(true)
    }
  }, [chain])

  
  
  return (
    <StyledPage >
      <div className="forge-heading">
        <h3>Create your own token with Flash Forge!</h3>
        <FeatureRow>
          <FeatureItem>
            <IoShieldCheckmark />
            No team tokens
          </FeatureItem>
          <FeatureItem>
            <GiStopwatch />
            1 hour to raise funds
          </FeatureItem>
          <FeatureItem>
            <MdLockClock />
            No selling until launch
          </FeatureItem>
        </FeatureRow>
      </div>
      <GridColButtons>
        { haveContract &&
          <button className="create-button" onClick={openCreateRocket}>
            <GiThorHammer size={30} />
            Create Token
          </button>
        }
        <button className="how-it-works-button" onClick={openHowItWorks}>
          <FaInfoCircle size={20} />
          How it Works
        </button>

        {activeIndex !== 0 ? (
          <>
            {isMobile ? (
              <img
                src={`/search.png`}
                alt={`search`}
                onClick={searchClick}
                className="desktop-icon"
                style={{ width: `25px` }}
              />
            ) : (
              <LabelWrapper>
                <SearchInput
                  onChange={handleChangeSearchQuery}
                  starting={searchQuery}
                  placeholder="Search by Name"
                />
              </LabelWrapper>
            )}
          </>
        ) : null}
      </GridColButtons>
      {showSearch && activeIndex !== 0 ? (
        <LabelWrapper>
          <SearchInput
            onChange={handleChangeSearchQuery}
            starting={searchQuery}
            placeholder="Search by Name"
          />
        </LabelWrapper>
      ) : null}

      <PageLayout>
        <GridCol>
          <Body>
            <CardHeader className="CardHeader">
              <Item>
                <GiThorHammer size={30} color="#41d1ff" />
                <TextT className="top-tokens-title">Top Tokens</TextT>
              </Item>
            </CardHeader>
            {!topLiveIfo ? <TextNo>There is currently no active tokens.</TextNo> :
              <CustomBodyWrapper3>
                <LogoTextContainer  className="first">
                  <ImageContainer>
                    <ImageTop>
                      {isValidLogoUrl(topLiveIfo.logo) ? (
                        <img src={topLiveIfo.logo} alt='Sponsor Logo' />
                      ) : (
                        <img src={'/default.png'} alt='Default Logo' />
                      )}
                    </ImageTop>
                  </ImageContainer>
                  <TextContainer>
                    <Item>
                      <TextTBName>{`${topLiveIfo?.name}`}</TextTBName>
                    </Item>
                    <Item>
                      <TextTB>{`Raised: ${Number(new BigNumber(topLiveIfo?.totalRaised.toString()).shiftedBy(-18).toFixed(decimalsToShow))}`}</TextTB>
                    </Item>
                    <Item>
                      <TextTB>{`Minimum: ${Number(new BigNumber(topLiveIfo?.softCap.toString()).shiftedBy(-18).toFixed(decimalsToShow))}`}</TextTB>
                    </Item>
                    <Item>
                      <TextTB>{`Time Left: ${formatTimeLeft(topLiveIfo?.endEpoch)}`}</TextTB>
                    </Item>
                  </TextContainer>
                </LogoTextContainer>
                <GridColSpon  className="last">
                  <Flex mt='5px' mb='5px'flexDirection='row' justifyContent='center' alignItems='center'>
                    <LinkSocial>
                      <a href={topLiveIfo.telegram}>
                        <img src="/images/home/icons/telegram.png" alt="Telegram" className="desktop-icon" style={{ width: '25px' }} />
                      </a>
                    </LinkSocial>
                    <LinkSocial >
                      <a href={topLiveIfo.website}>
                        <img src={`/images/home/icons/web.png`} alt={`Web`} className="desktop-icon" style={{ width: `25px` }} />
                      </a>
                    </LinkSocial>
                  </Flex>
                  <ButtonCon>
                    <ContributeButton  variantType={'primary'} variantSize={'xs'} poolId={Number(topLiveIfo.roundId.toString())} outToken={topLiveIfo.tokenContract} account={account} chainId={chain?.id} isFinished={topLiveIfo.isFinished} canFinalize={parseInt(formatTimeLeft(topLiveIfo.endEpoch), 10) < 0} />
                  </ButtonCon>
                </GridColSpon>
              </CustomBodyWrapper3>
            }
          </Body>

          <Body>
            <CardHeader2 className="CardHeader">
              <Item>
                <RiMedal2Fill size={30} color="#41d1ff" />
                <TextT className="top-tokens-title">Sponsored Tokens</TextT>
              </Item>
            </CardHeader2>
            {sponsors.length > 0 && sponsorIndex <= sponsors.length ? 
              <CustomBodyWrapper3>
                <LogoTextContainer  className="first">
                  <ImageContainer>
                    <ImageTop>
                      { 
                        !isValidLogoUrl(sponsors[sponsorIndex].logo) ? (
                          <img src={'/default.png'} alt='Default Logo' />
                        ) : (
                          <img src={sponsors[sponsorIndex].logo} alt='Sponsor Logo' />
                        )
                      }
                    </ImageTop>
                  </ImageContainer>
                  <TextContainer className="bigger">
                    <Item>
                      <TextTBName>{`${sponsors[sponsorIndex].name}`}</TextTBName>
                    </Item>
                    <Item>
                      <TextTB>{`Raised: ${new BigNumber(sponsors[sponsorIndex].totalRaised.toString()).shiftedBy(-18).toFixed(decimalsToShow)}`}</TextTB>
                    </Item>
                    <Item>
                      <TextTB>{`Minimum: ${new BigNumber(sponsors[sponsorIndex].softCap.toString()).shiftedBy(-18).toFixed(decimalsToShow)}`}</TextTB>
                    </Item>
                    <Item>
                      <TextTB>{`Time Left: ${formatTimeLeft(sponsors[sponsorIndex].endEpoch)}`}</TextTB>
                    </Item>
                  </TextContainer>
                </LogoTextContainer>
                <GridColSpon className="last">
                  <Flex mt='10px' flexDirection='row' justifyContent='center' alignItems='center'>
                    <LinkSocial>
                      <a href={sponsors[sponsorIndex].telegram} target="_blank" rel="noopener noreferrer">
                        <img src="/images/home/icons/telegram.png" alt="Telegram" className="desktop-icon" style={{ width: '20px' }} />
                      </a>
                    </LinkSocial>
                    <LinkSocial >
                      <a href={sponsors[sponsorIndex].website} target="_blank" rel="noopener noreferrer">
                        <img src={`/images/home/icons/web.png`} alt={`Web`} className="desktop-icon" style={{ width: `20px` }} />
                      </a>
                    </LinkSocial>
                  </Flex>
                  <ButtonCon>
                    <ContributeButton variantType={'primary'} variantSize={'xs'} poolId={Number(sponsors[sponsorIndex].roundId.toString())} outToken={sponsors[sponsorIndex].tokenContract} account={account} chainId={chain?.id} isFinished={sponsors[sponsorIndex].isFinished} canFinalize={parseInt(formatTimeLeft(sponsors[sponsorIndex].endEpoch), 10) < 0} />
                  </ButtonCon>
                </GridColSpon>
              </CustomBodyWrapper3> : <TextNo>There is currently no active sponsored tokens.</TextNo>
            }
          </Body>
        </GridCol>
      </PageLayout>

      <Flex justifyContent='center' alignItems='center' mt='30px'mb='30px'>
        <ButtonMenu activeIndex={activeIndex} scale='sm' variant='subtle'>
          <ButtonMenuItem as={Link} to='/marshot/hot5'>
            {t('Hot 5')}
          </ButtonMenuItem>
          <ButtonMenuItem as={Link} to='/marshot/allLive'>
            {t('All Live')}
          </ButtonMenuItem>
          <ButtonMenuItem as={Link} to='/marshot/history'>
            {t('Finalized')}
          </ButtonMenuItem>
        </ButtonMenu>
      </Flex>

      <Routes>
        <Route path='/' element={<CurrentIfo account={account} state={activeIndex} setTopLiveIfo={setTopLiveIfo} setSponsors={setSponsors} searchQuery={searchQuery} />} />
        <Route path='hot5' element={<CurrentIfo account={account} state={activeIndex} setTopLiveIfo={setTopLiveIfo} setSponsors={setSponsors} searchQuery={null} />} />
        <Route path='alllive' element={<CurrentIfo account={account} state={activeIndex} setTopLiveIfo={setTopLiveIfo} setSponsors={setSponsors} searchQuery={searchQuery} />} />
        <Route path='history' element={<CurrentIfo account={account} state={activeIndex} setTopLiveIfo={setTopLiveIfo} setSponsors={setSponsors} searchQuery={searchQuery} />} />
      </Routes>
    </StyledPage>
  )
}

export default MarsShot;
