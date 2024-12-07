import { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import Text from '../Text/Text';


interface SliderLabelProps {
  progress: string;
}

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isMax: boolean;
}

interface DisabledProp {
  disabled?: boolean;
}

const getCursorStyle = ({ disabled = false }: DisabledProp) => {
  return disabled ? 'not-allowed' : 'pointer';
};

const getBaseThumbStyles = ({ isMax, disabled }: StyledInputProps) => `
  -webkit-appearance: none;
  background-color: transparent;
  border: 0;
  cursor: ${getCursorStyle({ disabled })};
  width: 24px;
  height: 32px;
  filter: ${disabled ? 'grayscale(100%)' : 'none'};
  transform: translate(-2px, -2px);
  transition: 200ms transform;

  &:hover {
    transform: ${disabled ? 'scale(1) translate(-2px, -2px)' : 'scale(1.1) translate(-3px, -3px)'};
  }
`;

export const SliderLabelContainer = styled.div`
  top: 0;
  position: absolute;
  left: 14px;
  width: calc(100% - 30px);
`;

export const SliderLabel = styled(Text)<SliderLabelProps>`
  top: 0;
  font-size: 12px;
  left: ${({ progress }) => progress};
  position: absolute;
  text-align: center;
  min-width: 24px; 
`;

export const BunnySlider = styled.div`
  position: absolute;
  left: 0px;
  width: calc(100%);
`;

export const StyledInput = styled.input.attrs({ type: 'range' })<StyledInputProps>`
  cursor: ${getCursorStyle};
  height: 40px;
  position: relative;
  width: 100%;

  &::-webkit-slider-thumb {
    ${getBaseThumbStyles}
  }

  &::-moz-range-thumb {
    ${getBaseThumbStyles}
  }

  &::-ms-thumb {
    ${getBaseThumbStyles}
  }
`;

export const BarBackground = styled.div<DisabledProp>`
  background-color: ${({ theme, disabled }) => theme.colors[disabled ? 'textDisabled' : 'input']};
  height: 2px;
  position: absolute;
  top: 18px;
  width: 100%;
`;

export const BarProgress = styled.div<DisabledProp & { value: number }>`
  background-color: ${({ theme }) => theme.colors.secondary};
  filter: ${({ disabled }) => (disabled ? 'grayscale(100%)' : 'none')};
  height: 10px;
  position: absolute;
  top: 18px;
  width: ${({ value }) => `calc(${value}% - 12px)`}; /* Adjust for thumb size */
`;