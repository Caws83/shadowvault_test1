import { Flex, CardHeader, TextHeader, Button, Text, Toggle, useModal } from 'uikit'
import Page from 'views/Page'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AppBody } from '../../components/App'
import { defaultChainId } from 'config/constants/chains'
import { useAccount } from 'wagmi'
import { isMobile } from 'components/isMobile'
import BigNumber from 'bignumber.js'
import useRefresh from 'hooks/useRefresh'
import FancyPrizeDisplay from './FancyPrizeDisplay';
import FancyCyclingDigits from './FancyCyclingDigits';
import { useTokenBalanceTarget } from 'hooks/useTokenBalance'
import contracts from 'config/constants/contracts'
import { getAddress } from 'utils/addressHelpers'
import SpinButton from './SpinButton'
import { API_URL } from 'config'
import HowItWorks from './HowItWorks'
import tokens from 'config/constants/tokens'
import { useGetTokenPrice } from '../../hooks/useBUSDPrice'
import { dexs } from 'config/constants/dex'

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  margin-top: 20px;

  ${Text} {
    margin-left: 8px;
  }
`

const CustomBodyWrapper = styled.div`
  padding: 10px;
  margin-left: 20px;
  margin-right: 20px;
`
const Wrapper = styled.div`
  position: relative;
  padding: 1.0rem;
  width: 100%;
  min-height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Table = styled.div`
  display: table;
  width: 100%;
  max-width: 1000px;
  border-spacing: 0 5px; /* Add space between rows */
`;

const TableContainer = styled.div``;

const TableHeader = styled.div`
  display: table-row;
  background: #41d1ff;
  opacity: 0.9;
`;

const TableRow = styled.div`
  display: table-row;
  padding: 0.8rem;
`;

const TableCell = styled.div`
  display: table-cell;
  text-align: center;
  padding: 0.3rem;
  color: white;
  min-width: 4rem;
  font-size: ${isMobile ? "0.6rem" : "0.8rem"};
`;

const TableCellArrow = styled.div`
  display: table-cell;
  text-align: center;
  padding: 0.3rem;
  color: white;
  max-width: 1.5rem;
`;

interface UserData {
  spins: number;
  lastFreeSpinEpoch: number;
}

interface SpinData {
  user: string;
  chainId: number;
  balance: number;
  spin: number;
  matches: number;
  winnings: number;
  txHash: string;
}
const getDex = (chainToGet) => {
  for (const key in dexs) {
    if (dexs[key].chainId === chainToGet) {
      return dexs[key]
    }
  }
}

const MarSpin: React.FC = () => {
  const { chain, address } = useAccount();
  const chainId = chain ? chain.id : defaultChainId;
  const [ mySpins, setMySpins ] = useState(true)
  const [historyData, setHD] = useState<any[]>([]);
  const [spinData, setSD] = useState<SpinData | undefined>(undefined);
  const [userData, setUD] = useState<UserData | undefined>(undefined);
  const { fastRefresh } = useRefresh();
  const prizeBalance = useTokenBalanceTarget(getAddress(tokens.zkclmrs.address, chainId), getAddress(contracts.prizeWallet, chainId))
  const tokenValue = useGetTokenPrice(getDex(chainId), tokens.zkclmrs, chainId)
  
  const [isSpinning, setIsSpinning] = useState(false);
  const baseAPI = API_URL
  // const baseAPI = 'http://localhost:3000'

  const spin = () => {
    setIsSpinning(true);
    setSD(undefined);
    const API_URL = `${baseAPI}/api/spin?user=${address}&chainId=${chainId}`;

    fetch(API_URL)
      .then((response) => response.json())
      .then((jsonData) => {
        if (jsonData.spinResult) {
          setSD(jsonData.spinResult);
        } else {
          console.error('spinInfo is missing from the API response.');
          setSD(undefined)
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setSD(undefined)
      });
  };

  useEffect(() => {
    if (address) {
      const API_URL = `${baseAPI}/api/userData?user=${address}&&chainId=${chainId}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((jsonData) => {
          if (jsonData.userSpinData) {
            setUD(jsonData.userSpinData);
          } else {
            console.error('userData is missing from the API response.');
            setUD(undefined)
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setUD(undefined)
        });
    } else {
      setUD(undefined);
    }
  }, [fastRefresh, address, chain, spinData]);

  useEffect(() => {
    const API_URL = `${baseAPI}/api/history?chainId=${chainId}`;
    fetch(API_URL)
      .then((response) => response.json())
      .then((jsonData) => {
        if (Array.isArray(jsonData.historyData)) {
          setHD(jsonData.historyData);
        } else {
          console.error('API response is not an array.');
          setHD([])
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setHD([])
      });
  }, [chain, fastRefresh]);

  let historyToShow = []
  if(mySpins && address) historyToShow = historyData.filter((c) => c.user === address)
  else historyToShow = historyData

  const toDisplay = 20;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextClick = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex + toDisplay >= historyToShow.length) {
        return 0;
      }
      return prevIndex + toDisplay;
    });
  };

  const handlePrevClick = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex - toDisplay < 0) {
        return 0;
      }
      return prevIndex - toDisplay;
    });
  };

  const currentEpoch = Math.floor(Date.now() / 1000);
  const freeSpinAvailable = userData && (currentEpoch - userData.lastFreeSpinEpoch) > 24 * 60 * 60;

  function formatTimeLeft(lastEpoch: number) {
    const secondsIn24Hours = 24 * 60 * 60;
    const currentUnixTimeInSeconds = Math.floor(Date.now() / 1000);
    const elapsedTimeInSeconds = currentUnixTimeInSeconds - Number(lastEpoch.toString());
    const timeLeftInSeconds = secondsIn24Hours - elapsedTimeInSeconds;

    if (timeLeftInSeconds <= 0) {
      return '0h 0m 0s';
    }

    const hoursLeft = Math.floor(timeLeftInSeconds / 3600);
    const minutesLeft = Math.floor((timeLeftInSeconds % 3600) / 60);
    const secondsLeft = timeLeftInSeconds % 60;

    return `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
  }
  const openHowItWorks = () => {
    howItWorksModal()
  }
  const [howItWorksModal] = useModal(<HowItWorks chainId={chainId} pot={prizeBalance.balance}  />);
  const buttonDisabled = !address || (userData?.spins === 0 && !freeSpinAvailable) || isSpinning

  return (
    <Page>
      <AppBody>
        <CardHeader>
          <Flex flexDirection="row" alignItems="center" justifyContent="space-between" mr="8px">
            {userData && (
              <TextHeader>{`Next Free Spin In: ${formatTimeLeft(userData.lastFreeSpinEpoch)}`}</TextHeader>
            )}
            <TextHeader>MARSPIN</TextHeader>
          </Flex>
        </CardHeader>

        <Wrapper>
          <CustomBodyWrapper>
            <Flex flexDirection="column" justifyContent="center" alignItems="center" >

              

              <FancyCyclingDigits 
                originalNumber={spinData?.spin} 
                matches={spinData?.matches} 
                setIsSpinning={setIsSpinning} 
                winnings={spinData?.winnings} 
                chainId={chainId}
                txHash={spinData?.txHash}
              />

              <FancyPrizeDisplay
                amount={Math.round(Number(new BigNumber(prizeBalance.balance).shiftedBy(-18).toFixed(2)))}
                value={tokenValue}
              />

              <SpinButton 
                onClick={spin} 
                disabled={buttonDisabled}
                text={
                  !address ?          'PLEASE CONNECT WALLET. DISCONNECTED.' :
                  isSpinning ?        'SPINNING TO WIN. GOOD LUCK!! WAITING.' :
                  buttonDisabled ?    'NO SPINS AVAILABLE. INTERACT FOR MORE.' :
                  freeSpinAvailable ? 'CLICK TO USE FREE SPIN. FREE SPIN AVL.'      
                  :                   `CLICK TO SPIN. MATCH AND WIN. (${userData?.spins})`
                }
              />
           
              
              
            </Flex>
           
          </CustomBodyWrapper>
        </Wrapper>
        <Flex justifyContent="flex-end" alignItems="flex-end" style={{ height: '100%' }}>
              <Button onClick={openHowItWorks} variant="text" size="sm">How It Works</Button>
            </Flex>
      </AppBody>

            <ToggleWrapper>
              <Toggle checked={mySpins} onChange={() => setMySpins(!mySpins)} scale="sm" />
              <Text> My Spins</Text>
            </ToggleWrapper>

      <Wrapper>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableCellArrow>
                <Button style={{ textDecoration: 'none', padding: '5px' }} variant="text" onClick={handlePrevClick}>
                  &lt;
                </Button>
              </TableCellArrow>
              <TableCell>User</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Spin</TableCell>
              <TableCell>Matches</TableCell>
              <TableCell>Winnings</TableCell>
              <TableCellArrow>
                <Button style={{ textDecoration: 'none', padding: '5px' }} variant="text" onClick={handleNextClick}>
                  &gt;
                </Button>
              </TableCellArrow>
            </TableHeader>
            {historyToShow.slice(currentIndex, currentIndex + toDisplay).map((info) => (
              <TableRow key={info.balance + info.spin}>
                <TableCellArrow></TableCellArrow>
                <TableCell>
                  {info.user.length > 8 ? `${info.user.slice(0, 4)}...${info.user.slice(-4)}` : info.user}
                </TableCell>
                <TableCell>{info.balance}</TableCell>
                <TableCell>{info.spin}</TableCell>
                <TableCell>{info.matches === 9999 ? 'JackPot' : info.matches.toString()}</TableCell>
                <TableCell>
                  {`${Number(new BigNumber(info?.winnings?.toString()).shiftedBy(-18).toFixed(2)).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })} zkCLMRS`}
                </TableCell>
                <TableCellArrow></TableCellArrow>
              </TableRow>
            ))}
          </Table>
        </TableContainer>
      </Wrapper>
    </Page>
  );
};

export default MarSpin;
