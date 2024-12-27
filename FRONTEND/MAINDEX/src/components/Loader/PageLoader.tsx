import React from 'react'
import styled, { keyframes } from 'styled-components'
import Page from 'views/Page';
import { Box } from 'uikit';
import CenterBody from 'components/App/CenterBody';

// Define a keyframe animation to scale the SVG
const scaleAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

// Styled component for the Wrapper with animation
const Wrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%

  /* Apply the animation */
  animation: ${scaleAnimation} 2s infinite; /* Adjust duration and iteration as needed */
`

const PageLoader: React.FC = () => {
  return (
    <CenterBody>
    <Wrapper>
      {/* SVG image */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Use the image element to load an external SVG */}
        <image
          xlinkHref="/images/home/sol-forge-logo.png" // Path to your SVG image
          width="100"
          height="100"
        />
      </svg>
    </Wrapper>
    </CenterBody>
  )
}

export default PageLoader
