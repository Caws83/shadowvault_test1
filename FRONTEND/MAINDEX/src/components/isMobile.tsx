import React from 'react';
import { isMobile as checkIsMobile } from 'react-device-detect';

export const isMobile = checkIsMobile || window.innerWidth <= 768;


