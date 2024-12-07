import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import FancyModal from './FancyModal'; // Import the modal
import { useModal, Text } from 'uikit';
import BigNumber from 'bignumber.js';

// Animation for cycling the number
const cycle = keyframes`
  0% { opacity: 0; transform: translateY(-100%); }
  50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(100%); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: flex-start; /* Align items to the left */
  width: 300px; /* Set width to 100% */
  margin: 10px auto; /* Center the container */
`;

interface DigitContainerProps {
  borderColor: string;
}

const DigitContainer = styled.div<DigitContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  padding: 20px;
  width: 100%; /* Use full width of the parent */
  margin-top: 5px; /* Add space above the digit container */
  font-family: 'Courier New', Courier, monospace; /* Use monospace font */
  border: 3px solid ${({ borderColor }) => borderColor}; /* Dynamic border color */

`;

interface DigitProps {
  isMatch: boolean;
  isCycling: boolean;
  animationDuration: string;
}

// Styled component for each digit with fixed width
const Digit = styled.span<DigitProps>`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ isMatch }) => (isMatch ? '#f06920' : '#fff')};
  text-shadow: 0px 6px 3px rgba(0, 128, 128, 0.2);
  margin: 0 2px;
  width: 2rem; /* Fixed width for each digit */
  text-align: center; /* Center-align the text */
  ${({ isCycling, animationDuration }) =>
    isCycling &&
    css`
      animation: ${cycle} ${animationDuration} infinite;
    `}
`;

interface FancyCyclingDigitsProps {
  originalNumber?: number;
  setIsSpinning: (isSpinning: boolean) => void;
  matches: number;
  winnings: number;
  chainId: number;
  txHash: string;
}

const FancyCyclingDigits: React.FC<FancyCyclingDigitsProps> = ({ originalNumber, setIsSpinning, matches, winnings, chainId, txHash }) => {
  const [digits, setDigits] = useState(Array(11).fill('-'));
  const [isCycling, setIsCycling] = useState(false); // Track cycling state for all digits
  const [borderColor, setBorderColor] = useState('transparent'); // Border color state

  const [winModal] = useModal(<FancyModal winnings={winnings} currency="zkCLMRS" chainId={chainId} txHash={txHash}/>);

  useEffect(() => {
    // Reset border color at the start of a new spin
    setBorderColor('transparent');

    // If originalNumber is not defined, keep showing dashes
    if (!originalNumber) {
      setDigits(Array(11).fill('-'));
      return;
    }

    // Set cycling state
    setIsCycling(true);

    const intervalId = setInterval(() => {
      // Assign random digits
      const randomDigits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10).toString());
      setDigits(randomDigits);
    }, 200); // Faster interval for random number generation

    // Stop cycling after 4 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setIsCycling(false); // Stop cycling

      // Show the original number and highlight matched digits
      const originalDigits = originalNumber.toString().padStart(11, '0').split('');
      const updatedDigits = originalDigits.map((digit, index) => {
        // Highlight matched digits based on matches
        return index >= 11 - matches ? { digit, isMatch: true } : { digit, isMatch: false };
      });

      setDigits(updatedDigits.map(item => item.digit)); // Set the displayed digits
      setIsSpinning(false); // Call the callback when done

      // Set border color based on matches
      if (matches === 999) {
        setBorderColor('orange');
      } else if (matches > 0) {
        setBorderColor('green');
      } else {
        setBorderColor('red');
      }

      if (new BigNumber(winnings).gt(0)) {
        winModal();
      }
    }, 4000); // Stop after 4 seconds

    return () => {
      clearInterval(intervalId); // Cleanup interval on component unmount
      clearTimeout(timeoutId); // Cleanup timeout on component unmount
    };
  }, [originalNumber, setIsSpinning, matches]);

  return (
    <Container>
      <Text fontSize="12px" textAlign="left">Your Spin</Text>
      <DigitContainer borderColor={borderColor}>
        {digits.map((digit, index) => {
          const isMatch = index >= 11 - matches; // Highlight matched digits
          return (
            <Digit
              key={index}
              isCycling={isCycling} // Use a single cycling state
              isMatch={!isCycling && isMatch} // Determine color based on matches
              animationDuration={`${0.2 + index * 0.05}s`} // Faster animation speed for each digit
            >
              {digit}
            </Digit>
          );
        })}
      </DigitContainer>
    </Container>
  );
};

export default FancyCyclingDigits;
