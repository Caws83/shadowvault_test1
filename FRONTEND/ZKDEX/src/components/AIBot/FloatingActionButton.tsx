import React, { useEffect, useState } from 'react';
import useChatStyles  from './Ai_style';
import styled, { keyframes, css } from 'styled-components';

interface FloatingActionButtonProps {
  onClick: () => void;
}
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
  ${(props) =>
    props.pulse &&
    css`
      animation: ${pulse} 1s infinite;
    `}
`;

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const styles = useChatStyles();

  const [isPulsing, setIsPulsing] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 10000); // Stop pulsing after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <FabWrapper pulse={isPulsing}>
    <button style={styles.fabStyle} onClick={onClick}>
      <img src="/images/home/askian.png" alt="?" style={styles.iconStyle} />
    </button>
    </FabWrapper>
  );
};

export default FloatingActionButton;