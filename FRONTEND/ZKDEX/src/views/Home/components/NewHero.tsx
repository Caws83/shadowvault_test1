import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Flex, Link, Button, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { useAccount } from 'wagmi';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { isMobile } from 'components/isMobile';

const floatVertical = keyframes`
  0% {
    transform: translateY(0) rotate(11deg);
  }
  50% {
    transform: translateY(15px) rotate(12deg);
  }
  100% {
    transform: translateY(0) rotate(11deg);
  }
`;

const StyledImage = styled.img`
  width: 10vw;
  max-width: 90%;
  transform: rotate(12deg);
  animation: ${floatVertical} 5s ease-in-out infinite;
  @media (max-width: 768px) {
    width: 120px;
  }
`;

const LogoImage = styled.img`
  max-width: 90%;
  width: ${isMobile ? '90%' : '50%'}
  padding: ${isMobile ? '6px' : '6px'}
`;

const HeroContainer = styled(Flex)`
  height:70vh;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${isMobile ? '10px' : '50px'};
  z-index: 1;
  text-align: center;
  @media (min-width: 769px) {
   
  }
`;

const TextContainer = styled(Flex)`
  flex-direction: column;
  align-items: left;
  justify-content: left;
`;

const ActionsContainer = styled(Flex)`
  flex-direction: row;
  align-items: left;
  justify-content: left;
  margin-top: 30px;
`;

const ParticleBackground = () => {
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  return (
    <Particles
      id="tsparticles"
      options={{
        fpsLimit: 120,
        interactivity: {
          detect_on: "canvas",
          events: {
            onHover: {
              enable: true,
              mode: "bubble",
              parallax: {
                enable: false,
                force: 30,
                smooth: 600,
              },
            },
            onClick: {
              enable: true,
              mode: "repulse",
            },
          },
          modes: {
            grab: {
              distance: 400,
              lineLinked: {
                opacity: 1,
              },
            },
            bubble: {
              distance: 100,
              size: 150,
              duration: 2,
              opacity: 1,
              speed: 2,
            },
            repulse: {
              distance: 200,
            },
            push: {
              particles_nb: 4,
            },
            remove: {
              particles_nb: 2,
            },
          },
        },
        backgroundMask: {
          enable: true,
          cover: {
            color: {
              value: {
                r: 0,
                g: 0,
                b: 0,
              },
            },
          },
        },
        particles: {
          line_linked: {
            enable: true,
            distance: 100,
            color: "#0577DA",
            opacity: 1,
            width: 2,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 0.5,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              width: 800,
            },
            value: (isMobile ? 100: 30),
          },
          opacity: {
            value: 0.4,
          },
          shape: {
            type: "polygon",
            options: {
              polygon: {
                sides: 6,
              },
            },
          },
          size: {
            value: { min: 5, max: 50 },
          },
        },
        detectRetina: true,
        fullScreen: { enable: true, zIndex: 0 },
        background: {
          image:  "url('/mars_bkg.png')",
          position:  "cover"

        },
      }}
    />
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const { address: account } = useAccount();
  const [init, setInit] = useState(false);

  // Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <>
      {init && <ParticleBackground />}
      <HeroContainer>
        <TextContainer>
          <LogoImage src="/images/home/marswap.png" alt="Marswap Logo" />
          <Flex flexDirection="row" justifyContent="left" alignItems="center">
            <Text fontSize={isMobile ? '18px' : '1.4vw'} bold color="primary" mr="8px">
              Passive
            </Text>
            <Text fontSize={isMobile ? '18px' : '1.4vw'} color="secondary" mr="8px">
              income
            </Text>
            <Text fontSize={isMobile ? '18px' : '1.4vw'} bold color="primary" mr="8px">
              made easy!
            </Text>
          </Flex>
          <Flex flexDirection="row" justifyContent="left" alignItems="center">
            <Text fontSize={isMobile ? '12px' : '1.4vw'} color="primary" mr="8px">
              Earn up to
            </Text>
            <Text fontSize={isMobile ? '12px' : '1.4vw'} bold color="secondary" mr="8px">
              50%
            </Text>
            <Text fontSize={isMobile ? '12px' : '1.4vw'} color="primary" mr="8px">
              of trading fees
            </Text>
          </Flex>
          <ActionsContainer>
          <Link href="/#/swap" p="4px">
              <Button variant={!account ? 'secondary' : 'primary'} width="100%" pl="32px" pr="32px">
                {t('Trade')}
              </Button>
            </Link>
            <Link href="/#/add/?zap=true" p="4px">
              <Button style={{textDecoration: "none"}} variant={!account ? 'secondary' : 'primary'} width="100%">
                {t('Provide')}
              </Button>
            </Link>
          </ActionsContainer>
        </TextContainer>
        {isMobile ? null :
        <Flex style={{paddingLeft: "10vw"}} flexDirection="row" justifyContent="right" alignItems="center">
          <StyledImage src="/images/home/phone3.png" alt="Phone" />
          </Flex>}
      </HeroContainer>
    </>
  );
};

export default Hero;
