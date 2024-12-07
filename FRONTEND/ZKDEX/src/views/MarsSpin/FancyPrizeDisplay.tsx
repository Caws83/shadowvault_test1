import React from 'react';
import styled from 'styled-components';
import { Text } from 'uikit';
import BigNumber from 'bignumber.js'


// Styled container for the main content
const Container = styled.div`
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: flex-start; /* Align items to the left */
  width: 300px; /* Set width to 100% */
  margin: 10px auto; /* Center the container */
`;

// Styled container for digits
const DigitContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 100%; /* Use full width of the parent */
  margin-top: 5px; /* Add space above the digit container */
  font-family: 'Courier New', Courier, monospace; /* Use monospace font */
`;

// Styled component for each digit with fixed width
const Digit = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  text-shadow: 6px 6px 6px rgba(0, 128, 128, 0.5); /* Grey shadow */
  margin: 0 2px;
  width: 2rem; /* Fixed width for each digit */
  text-align: center; /* Center-align the text */
`;

const FancyPrizeDisplay = ({ amount, value }) => {
  const digits = amount.toString().padStart(11, '0').split('');
  const prizeValue = new BigNumber(amount.toString()).multipliedBy(value).toFixed(2)
  return (
    <Container>
      <Text fontSize="12px" textAlign="left">{`Current Pot: $${prizeValue}`}</Text>
      <DigitContainer>
        {digits.map((digit, index) => (
          <Digit key={index}>
            {digit}
          </Digit>
        ))}
      </DigitContainer>
    </Container>
  );
};

export default FancyPrizeDisplay;
