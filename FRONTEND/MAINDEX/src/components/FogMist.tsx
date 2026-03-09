import React from "react";
import styled from "styled-components";

const Container = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
`;

const LayerContainer = styled.div<{ height: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ height }) => height};
`;

const GradientWhite = styled.div<{ animation: string, opacityStart: number, opacityMid: number, opacityMid2?: number, opacityEnd: number }>`
  position: absolute;
  inset: 0;
  background: ${({ opacityStart, opacityMid, opacityMid2, opacityEnd }) =>
    opacityMid2 !== undefined
      ? `linear-gradient(to top, rgba(255,255,255,${opacityStart}), rgba(255,255,255,${opacityMid}), rgba(255,255,255,${opacityMid2}), rgba(255,255,255,${opacityEnd}))`
      : `linear-gradient(to top, rgba(255,255,255,${opacityStart}), rgba(255,255,255,${opacityMid}), rgba(255,255,255,${opacityEnd}))`};
  animation: ${({ animation }) => animation};
`;

const GradientRed = styled.div<{ opacityStart: number, opacityMid: number, opacityMid2?: number, opacityEnd: number }>`
  position: absolute;
  inset: 0;
  background: ${({ opacityStart, opacityMid, opacityMid2, opacityEnd }) =>
    opacityMid2 !== undefined
      ? `linear-gradient(to top, rgba(225,29,46,${opacityStart}), rgba(225,29,46,${opacityMid}), rgba(225,29,46,${opacityMid2}), rgba(225,29,46,${opacityEnd}))`
      : `linear-gradient(to top, rgba(225,29,46,${opacityStart}), rgba(225,29,46,${opacityMid}), rgba(225,29,46,${opacityEnd}))`};
  mix-blend-mode: overlay;
`;

const WispyContainer = styled.div<{ left: string, width: string, height: string, delay: string, anim: string }>`
  display: none;
  position: absolute;
  bottom: 0;
  left: ${({ left }) => left};
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  animation-delay: ${({ delay }) => delay};
  animation: ${({ anim }) => anim};
  
  @media (min-width: 640px) {
    display: block;
  }
`;

const WispyWhite = styled.div<{ blur: string, startOp: number, midOp: number }>`
  height: 100%;
  width: 100%;
  background: linear-gradient(to top, rgba(255,255,255,${({ startOp }) => startOp}), rgba(255,255,255,${({ midOp }) => midOp}), transparent);
  border-radius: 50%;
  filter: blur(${({ blur }) => blur});
`;

const WispyRed = styled.div<{ blur: string, startOp: number, midOp: number }>`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(to top, rgba(225,29,46,${({ startOp }) => startOp}), rgba(225,29,46,${({ midOp }) => midOp}), transparent);
  border-radius: 50%;
  filter: blur(${({ blur }) => blur});
  mix-blend-mode: overlay;
`;

export function FogMist() {
  return (
    <Container>
      {/* Base mist layers */}
      <LayerContainer height="75vh">
        <GradientWhite animation="fog-rise-1 8s ease-in-out infinite" opacityStart={0.08} opacityMid={0.04} opacityMid2={0.02} opacityEnd={0} />
        <GradientRed opacityStart={0.15} opacityMid={0.08} opacityMid2={0.03} opacityEnd={0} />
      </LayerContainer>
      <LayerContainer height="65vh">
        <GradientWhite animation="fog-rise-2 12s ease-in-out infinite" opacityStart={0.06} opacityMid={0.03} opacityMid2={0.01} opacityEnd={0} />
        <GradientRed opacityStart={0.12} opacityMid={0.06} opacityMid2={0.02} opacityEnd={0} />
      </LayerContainer>
      <LayerContainer height="55vh">
        <GradientWhite animation="fog-rise-3 16s ease-in-out infinite" opacityStart={0.05} opacityMid={0.02} opacityEnd={0} />
        <GradientRed opacityStart={0.10} opacityMid={0.05} opacityEnd={0} />
      </LayerContainer>

      {/* Wispy fog particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <WispyContainer
          key={i}
          left={`${(i * 8) % 100}%`}
          width={`${350 + (i % 3) * 80}px`}
          height={`${300 + (i % 4) * 60}px`}
          delay={`${i * 0.6}s`}
          anim={`fog-wisp ${18 + i * 2}s ease-in-out infinite`}
        >
          <WispyWhite blur="100px" startOp={0.12} midOp={0.06} />
          <WispyRed blur="80px" startOp={0.20} midOp={0.08} />
        </WispyContainer>
      ))}

      {/* Medium mist clouds */}
      {Array.from({ length: 8 }).map((_, i) => (
        <WispyContainer
          key={`cloud-${i}`}
          left={`${8 + i * 11}%`}
          width={`${280 + (i % 2) * 70}px`}
          height={`${240 + (i % 3) * 50}px`}
          delay={`${i * 1.0}s`}
          anim={`fog-drift ${20 + i * 2.5}s ease-in-out infinite`}
        >
          <WispyWhite blur="90px" startOp={0.10} midOp={0.05} />
          <WispyRed blur="70px" startOp={0.18} midOp={0.07} />
        </WispyContainer>
      ))}
    </Container>
  );
}
