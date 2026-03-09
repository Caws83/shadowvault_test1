import React from "react";
import styled from "styled-components";

const BackgroundContainer = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
`;

const GlowOne = styled.div`
  position: absolute;
  top: -160px;
  left: 50%;
  height: 520px;
  width: 900px;
  transform: translateX(-50%);
  border-radius: 50%;
  background-color: rgba(225, 29, 46, 0.2);
  filter: blur(130px);
`;

const GlowTwo = styled.div`
  position: absolute;
  bottom: -200px;
  left: -200px;
  height: 520px;
  width: 520px;
  border-radius: 50%;
  background-color: rgba(225, 29, 46, 0.1);
  filter: blur(130px);
`;

const GlowThree = styled.div`
  position: absolute;
  top: 80px;
  right: -220px;
  height: 480px;
  width: 480px;
  border-radius: 50%;
  background-color: rgba(225, 29, 46, 0.1);
  filter: blur(140px);
`;

const GrainOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="120" height="120" filter="url(%23n)" opacity="0.6"/%3E%3C/svg%3E');
`;

export function GlowBackground() {
  return (
    <BackgroundContainer>
      <GlowOne />
      <GlowTwo />
      <GlowThree />
      <GrainOverlay />
    </BackgroundContainer>
  );
}
