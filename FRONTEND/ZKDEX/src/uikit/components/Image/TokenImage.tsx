import styled from 'styled-components';
import Image from './Image';

const TokenImage = styled(Image)`
  position: relative; /* Ensure that the :before pseudo-element is positioned relative to this element */
  overflow: hidden; /* Clip the image to fit within the circular border */
  border-radius: 50%; /* Ensure the image itself is also circular */

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%; /* Create circular shape */
    box-sizing: border-box; /* Ensure border is included in dimensions */
    z-index: 1; /* Place behind the image */
  }
`;

export default TokenImage;

