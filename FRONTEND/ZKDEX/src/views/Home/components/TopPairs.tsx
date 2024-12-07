import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Link, Flex } from 'uikit';
import Page from '../../Page';
import tokens from 'config/constants/tokens';
import { getAddress } from 'utils/addressHelpers';
import BigNumber from 'bignumber.js';
import { isMobile } from 'components/isMobile';
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import { defaultDex } from 'config/constants/dex'
import { defaultChainId } from 'config/constants/chains';

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

const TableContainer = styled.div`

`;

const TableHeader = styled.div`
  display: table-row;
  background: #0577DA;
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



export interface PairData {
  pair: string;
  token0: string;
  volume0: BigInt;
  token1: string;
  volume1: BigInt;
  txCount: BigInt;
  totalDiv: BigInt;
  pairName: string;
}

interface PairSectionProps {
  data: PairData[];
}

const toDisplay = 4;

const PairSection: React.FC<PairSectionProps> = ({ data }) => {
  const wrapped = getAddress(tokens.wcro.address, defaultChainId);
  const usdt = getAddress(tokens.vusd.address, defaultChainId)
  const [currentIndex, setCurrentIndex] = useState(0);
  const nativeValue = useGetWcicPrice(defaultDex)

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextClick();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  
  const handleNextClick = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex + toDisplay >= data.length) {
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

  const getVolume = (info: PairData): string => {
    let dollarValue = nativeValue;
    let volumeToUse = info.volume0;
  
    if (info.token1 === wrapped) {
      volumeToUse = info.volume1;
    } else if (info.token0 !== wrapped) {
      if (info.token0 === usdt || info.token1 === usdt) {
        dollarValue = new BigNumber(1);
        volumeToUse = info.token0 === usdt ? info.volume0 : info.volume1;
      }
    }
  
    const volumeInDollars = new BigNumber(volumeToUse.toString())
      .shiftedBy(-18)
      .multipliedBy(dollarValue)
      .toFixed(3);
  
    return `$${Number(volumeInDollars).toLocaleString('en-US', { maximumFractionDigits: 3 })}`;
  };
  

  return (
    <Page>
      <Wrapper>
        <TableContainer>
        <Table>
          <TableHeader>
            <TableCellArrow><Button style={{ textDecoration: "none", padding: "5px" }} variant="text" onClick={handlePrevClick}>&lt;</Button></TableCellArrow>
            <TableCell>Pair</TableCell>
            <TableCell>24h TXs</TableCell>
            <TableCell>24h Vol.</TableCell>
            <TableCell>Div Paid</TableCell>
            <TableCell>Action</TableCell>
            <TableCellArrow><Button style={{ textDecoration: "none", padding: "5px" }} variant="text" onClick={handleNextClick}>&gt;</Button></TableCellArrow>
             </TableHeader>
            {data.slice(currentIndex, currentIndex + toDisplay).map(info => (
          
              <TableRow key={info.pair}>
                    <TableCellArrow></TableCellArrow>
                <TableCell>{info.pairName}</TableCell>
                <TableCell>{`${info.txCount.toString()}`}</TableCell>
             
                  <TableCell>
                    {getVolume(info)}
                  </TableCell>
              
              
                  <TableCell>{`$${Number(new BigNumber(info?.totalDiv?.toString()).shiftedBy(-18).multipliedBy(nativeValue).toFixed(3)).toLocaleString('en-US', { maximumFractionDigits: 3 })}`}</TableCell>
         
                <TableCell>
                  <Flex justifyContent="center" alignItems="center">
                  <Link href={`/#/add/zkCRO/${info.token0 === wrapped ? info.token1 : info.token0}?zap=true`}>
                   {isMobile ? (
                   <Button scale="xs" style={{ textDecoration: "none", borderRadius: 20 }} variant='primary'>
                   Provide
                 </Button>)
                   : (<Button scale="sm" style={{ fontSize: "0.6rem", textDecoration: "none" }} variant='primary'>
                      Provide
                    </Button>)
}
                  </Link>
                  </Flex>
                </TableCell>
                <TableCellArrow></TableCellArrow>
              </TableRow>
            ))}
        </Table>
        </TableContainer>
      </Wrapper>
    </Page>
  );
}

export default PairSection;
