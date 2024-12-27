import React from 'react'
import styled, { keyframes } from 'styled-components'
import { SpinnerProps } from './types'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Container = styled.div`
  position: relative;
`

const RotatingSVG = styled.svg`
  top: 0;
  left: 0;
  animation: ${rotate} 2s linear infinite;
  transform-origin: center;
`

const Spinner: React.FC<SpinnerProps> = ({ size = 64 }) => {
  return (
    <Container>
      <RotatingSVG
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <image
          xlinkHref="/images/home/sol-forge-logo.png"
          width={size}
          height={size}
        />
      </RotatingSVG>
    </Container>
  )
}

export default Spinner
