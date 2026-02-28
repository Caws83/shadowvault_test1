import { isMobile as checkIsMobile } from 'react-device-detect';

export const isMobile = (): boolean => {
  if (typeof window !== 'undefined') {
    return checkIsMobile || window.innerWidth <= 768;
  }
  return false;
};

