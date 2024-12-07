import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Modal } from 'uikit';
import { API_URL } from 'config';
import styled from 'styled-components';

interface PublicData {
  jackpot: number;
  winnings: number[][];
}

const ModalContent = styled.div`
  color: white;
  background: #333;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-height: 400px;
  overflow-y: auto; /* Enable vertical scrolling */
`;

const Title = styled.h4`
  color: #f06920;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

const TableHead = styled.th`
  background: #444;
  color: #f06920;
  padding: 10px;
  text-align: center;
  border-bottom: 2px solid #555;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #444;
  }
  &:nth-child(odd) {
    background: #555;
  }
`;

const TableCell1 = styled.td`
  padding: 10px;
  text-align: left;
  color: #fff;
  border-bottom: 1px solid #666;
`;

const TableCell = styled.td`
  padding: 10px;
  text-align: center;
  color: #fff;
  border-bottom: 1px solid #666;
`;

const HowItWorks: React.FC<{ onDismiss?: () => void; chainId: number; pot: BigNumber }> = ({
  onDismiss,
  chainId,
  pot,
}) => {
  const handleDismiss = onDismiss || (() => {});
  const totalPot = Number(new BigNumber(pot).shiftedBy(-18).toFixed(2)).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
  const baseAPI = API_URL;
  const [publicData, setPD] = useState<PublicData | undefined>(undefined);

  useEffect(() => {
    const API_URL = `${baseAPI}/api/publicData?chainId=${chainId}`;
    fetch(API_URL)
      .then((response) => response.json())
      .then((jsonData) => {
        if (jsonData.publicData) {
          setPD(jsonData.publicData);
        } else {
          console.error('API response is not in the expected format.');
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [chainId]);

  const calculateWinnings = (percentage: number): string => {
    const winningAmount = new BigNumber(pot).multipliedBy(percentage / 10000).shiftedBy(-18).toFixed(2);
    return Number(winningAmount).toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const calculateWinningsWithMax = (info: number[]): string => {
    const winnings = new BigNumber(pot).multipliedBy(info[0] / 10000)
    const max = new BigNumber(info[1]).shiftedBy(18)
    return winnings.gt(max) ? info[1] : Number(winnings.shiftedBy(-18).toFixed(2)).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  return (
    <Modal minWidth="380px" bodyPadding="0px" title="How It Works" onDismiss={handleDismiss} >
      {publicData ? (
        <ModalContent>
          <Title>Ways to Earn Spins</Title>
          <Table>
            <thead>
              <tr>
                <TableHead>Action</TableHead>
                <TableHead>Spins Earned</TableHead>
              </tr>
            </thead>
            <tbody>
              <TableRow>
                <TableCell1>Flat Fee Swap</TableCell1>
                <TableCell>1 spin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell1>Add Liquidity</TableCell1>
                <TableCell>1 spins</TableCell>
              </TableRow>
              <TableRow>
                <TableCell1>MarsShot Contribution</TableCell1>
                <TableCell>2 spins</TableCell>
              </TableRow>
              <TableRow>
                <TableCell1>Create MarsShot</TableCell1>
                <TableCell>5 spins</TableCell>
              </TableRow>
            </tbody>
          </Table>

          <Title>Total Pot: {totalPot} zkCLMRS</Title>
          <Table>
            <thead>
              <tr>
                <TableHead>Match</TableHead>
                <TableHead>%/Max zkCLMRS</TableHead>
                <TableHead>zkCLMRS</TableHead>
              </tr>
            </thead>
            <tbody>
              <TableRow>
                <TableCell>Jackpot</TableCell>
                <TableCell>{publicData.jackpot / 100}%</TableCell>
                <TableCell>{calculateWinnings(publicData.jackpot)}</TableCell>
              </TableRow>
              {publicData.winnings.map((winning, index) => (
                index !== 0 && (
                <TableRow key={index}>
                  <TableCell>{index}</TableCell>
                  <TableCell>{winning[0] / 100}% / {winning[1]}</TableCell>
                  <TableCell>{calculateWinningsWithMax(winning)}</TableCell>
                </TableRow>
                )
              ))}
            </tbody>
          </Table>
          <p>To win, participate in the game and match the required criteria. Winnings are percentage based up to a max per match.</p>
        </ModalContent>
      ) : (
        <p>Loading...</p>
      )}
    </Modal>
  );
};

export default HowItWorks;
