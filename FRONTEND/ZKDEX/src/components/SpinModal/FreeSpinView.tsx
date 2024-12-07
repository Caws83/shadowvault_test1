import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAccount } from 'wagmi';
import { useNavigate  } from 'react-router-dom'; // Import useHistory for navigation
import { defaultChainId } from 'config/constants/chains';
import useRefresh from 'hooks/useRefresh';
import { API_URL } from 'config';

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const FabWrapper = styled.div<{ pulse: boolean }>`
  display: flex;
  flex-direction: column; /* Align children vertically */
  align-items: center; /* Center children horizontally */
  justify-content: center; /* Center children vertically */
  margin-right: 12px;
  cursor: pointer; /* Add a cursor to indicate it's clickable */
  ${(props) =>
    props.pulse &&
    css`
      animation: ${pulse} 1s infinite;
    `}
`;

const TimerText = styled.span`
  font-size: 0.75rem;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;
const MiniText = styled.span`
  font-size: 0.40rem;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

interface UserData {
  spins: number;
  lastFreeSpinEpoch: number;
}

const FreeSpinView: React.FC<{isActive: boolean}> = ({isActive}) => {
  const { chain, address } = useAccount();
  const chainId = chain ? chain.id : defaultChainId;
  const baseAPI = API_URL
  const { fastRefresh } = useRefresh();
  const [userData, setUD] = useState<UserData | undefined>(undefined);
  const navigate = useNavigate();

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
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    } else {
      setUD(undefined);
    }
  }, [fastRefresh, address, chain]);

  const currentEpoch = Math.floor(Date.now() / 1000);
  const freeSpinAvailable = userData && (currentEpoch - userData.lastFreeSpinEpoch) > 24 * 60 * 60;

  function formatTimeLeft(lastEpoch: number) {
    const secondsIn24Hours = 24 * 60 * 60;
    const currentUnixTimeInSeconds = Math.floor(Date.now() / 1000);
    const elapsedTimeInSeconds = currentUnixTimeInSeconds - Number(lastEpoch.toString());
    const timeLeftInSeconds = secondsIn24Hours - elapsedTimeInSeconds;

    if (timeLeftInSeconds <= 0) {
      return 'Use Free Spin!';
    }
    const hoursLeft = Math.floor(timeLeftInSeconds / 3600);
    const minutesLeft = Math.floor((timeLeftInSeconds % 3600) / 60);
    const secondsLeft = timeLeftInSeconds % 60;

    return `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
  }

  const [isPulsing, setIsPulsing] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 10000); // Stop pulsing after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    navigate('/marspin'); // Navigate to "/#/marspin"
  };

if(!address) return null

return (
  <FabWrapper pulse={isPulsing} onClick={handleClick}>
    {isActive ? (
      <>
        {!freeSpinAvailable && <MiniText>Free Spin In</MiniText>}
        {userData && <TimerText>{formatTimeLeft(userData.lastFreeSpinEpoch)}</TimerText>}
        {userData && userData.spins > 0 && (
          <TimerText>{`( ${userData.spins} )`}</TimerText>
        )}
      </>
    ) : (
      <MiniText>SPIN OFFLINE</MiniText>
    )}
  </FabWrapper>
);
};

export default FreeSpinView;
