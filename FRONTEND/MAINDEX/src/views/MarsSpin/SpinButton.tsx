import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// Define spin animations using the keyframes helper
const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
`;


// Define the ButtonWrapper styled component
const ButtonWrapper = styled.a<{ disabled: boolean }>`
  margin: 20px;
  display: inline-block;
  position: relative;
  width: 7rem;
  height: 7rem;
  font: 400 1rem 'Josefin Sans'; 
  word-spacing: 0.375em;
  color: ${({ disabled }) => (disabled ? '#a0a0a0' : 'white')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  & .button__svg {
    width: 100%;
    height: auto;
    transform-box: fill-box;
    fill: ${({ disabled }) => (disabled ? '#a0a0a0' : 'white')};
    stroke: ${({ disabled }) => (disabled ? '#a0a0a0' : 'white')};
  }

  & .button__text {
    animation: ${css`${spinAnimation} 20s linear infinite`};
    transform-origin: 50% 50%;
    fill: ${({ disabled }) => (disabled ? '#a0a0a0' : 'white')};

    &:hover {
      animation-play-state: paused;
    }
  }

  & .button__arrow {
    width: 60%; 
    height: auto; 
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;

interface CustomButtonProps {
  onClick: () => void;
  disabled: boolean;
  text: string;
}

// Define the SpinButton component
const SpinButton: React.FC<CustomButtonProps> = ({ onClick, disabled, text }) => (
  <ButtonWrapper
    href="#"
    onClick={(e) => {
      e.preventDefault();
      if (!disabled) {
        onClick();
      }
    }}
    disabled={disabled}
    className="link"
  >
    <svg viewBox="0 0 160 160" width="150" height="150" xmlns="http://www.w3.org/2000/svg" className="button__svg" aria-labelledby="button-title button-desc">
      <title id="button-title">{text}</title>
      <desc id="button-desc">A rotating link with text placed around a circle with an arrow inside</desc>
      <path id="button-circle" className="button__path" d="M 80,80 m -60,0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" stroke="none" fill="none" />
      <text className="button__text">
        <textPath href="#button-circle" stroke="none">
          {text}
        </textPath>
      </text>
    </svg>
    <img src={disabled ? "/images/marshot/disable.png" : "/images/marshot/active.png"} alt="Arrow" className="button__arrow" />
  </ButtonWrapper>
);

export default SpinButton;
