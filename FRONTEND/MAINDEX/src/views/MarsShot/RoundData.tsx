import React from 'react'
import styled, { css } from 'styled-components'
import { isMobile } from 'components/isMobile'
import ContributeButton, { userData } from './ContributeButton';
import BigNumber from 'bignumber.js'
import { useModal } from 'uikit'
import RoundInfo from './InfoPopUp';


interface TableRowProps {
  highlighted?: string;
}

const TableRow = styled.tr<TableRowProps>`
  background: radial-gradient(circle, rgba(144, 205, 240, 0.09) 0%, rgb(27, 27, 31) 100%);
  border: 1px solid #3c3f44;
  border-radius: 22px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(129, 192, 231, 0.15);
    transform: translateY(-2px);
  }

  ${({ highlighted }) =>
    highlighted &&
    css`
      background: rgba(129, 192, 231, 0.15);
    `}
`;

const TableCell = styled.td`
  padding: 16px;
  text-align: center;
  color: #dadad2;
  vertical-align: middle;
  font-size: ${isMobile ? '12px' : '14px'};
  overflow-wrap: break-word;
  white-space: normal;
  max-width: 100px;
  background: transparent;
`;

const TableCellImage = styled.td`
  padding: 16px;
  text-align: center;
  min-width: 40px;
  vertical-align: middle;
  background: transparent;
`;

const StyledLink = styled.a`  
  text-decoration: none;
  color: inherit;
`;

const Avatar = styled.img`
  width: 20px;

  border-radius: 50%;
`;

const AvatarLogo = styled.img`
  width: ${isMobile ? '30px' : '50px'};
    height: ${isMobile ? '30px' : '50px'};
  border-radius: 50%;
  cursor: pointer; 
`;

export interface RoundData {
    roundId: bigint;
    tokenContract: string;
    name: string;
    symbol: string;
    totalRaised: bigint;
    endEpoch: bigint;
    softCap: bigint;
    isFinished: boolean;
    isGraduated: boolean;
    projectInfo: readonly [string, string, string, string]; //  website: string  telegram: string; logo: string; description: string;
    sponsored: boolean;
    creator: string;
}
interface info {
    item: RoundData
    userData: userData
    state: number
    account: string
    index: number
    chainId: number
}

const RoundData: React.FC<info> = ({ item, userData, state, account, index, chainId }) => {
  
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
  
  const handleAvatarClick = () => {
      infoModal();
  };
  const decimalsToShow = chainId === 245022926 ? 4 : 0
  const [infoModal] = useModal(<RoundInfo roundData={item} userData={userData} account={account}  />);

  return (
   
              <TableRow highlighted={userData && userData[2] ? 'green' : userData && userData[1] > 0n ? 'blue' : null }>
                {state === 0 && !isMobile && <TableCell>{index + 1}</TableCell>}
                <TableCellImage>
                {!isValidLogoUrl(item.projectInfo[2]) ? (
                    <AvatarLogo src={'/default.png'} alt='Default Logo' onClick={() => handleAvatarClick()} />
                  ) : (
                    <AvatarLogo src={item.projectInfo[2]} onClick={() => handleAvatarClick()} />
                  )}
                </TableCellImage>
                <TableCell>{item.name.toUpperCase()}</TableCell>
                <TableCell>{new BigNumber(item.totalRaised.toString()).shiftedBy(-18).toFixed(decimalsToShow)}</TableCell>
                <TableCell>{new BigNumber(item.softCap.toString()).shiftedBy(-18).toFixed(decimalsToShow)}</TableCell>
                {state !== 2 && <TableCell>{formatTimeLeft(item.endEpoch)}</TableCell> }
                {!isMobile && (
                  <TableCell>
                    <StyledLink href={item.projectInfo[1]}>
                      <Avatar src='/images/home/icons/telegram.png' />
                    </StyledLink>
                  </TableCell>
                )}
                {!isMobile &&  <TableCell>
                  <StyledLink href={item.projectInfo[0]}>
                    <Avatar src='/images/home/icons/web.png' />
                  </StyledLink>
                </TableCell>}
                
                  <TableCell>
                
                    <ContributeButton
                      variantSize='xs'
                      variantType='primary'
                      poolId={Number(item.roundId.toString())}
                      account={account}
                      chainId={chainId}
                      isFinished={item.isFinished}
                      canFinalize={item.endEpoch < Date.now() / 1000}
                      userData={userData}
                      outToken={item.tokenContract}
                    />
                 
                  </TableCell>
               

              </TableRow>
     
  );
};

export default RoundData;
