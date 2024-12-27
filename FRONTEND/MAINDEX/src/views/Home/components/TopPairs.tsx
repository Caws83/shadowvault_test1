import React, { useState } from 'react';
import { Flex, Text, Button } from 'uikit';
import { FaTelegramPlane, FaTwitter, FaGlobe } from 'react-icons/fa';

interface TokenData {
  name: string;
  symbol: string;
  marketCap: string;
  volume: string;
  transactions: number;
  holders: number;
  progress: number;
  age: string;
  image?: string;
  socials?: {
    website?: string;
    twitter?: string;
    telegram?: string;
  };
  kyc: boolean;
  devHoldings: string;
  description: string;
}

const DUMMY_TOKENS: TokenData[] = [
  {
    name: 'PEPE SOL',
    symbol: 'PSOL',
    marketCap: '15K',
    volume: '11K',
    transactions: 232,
    holders: 11,
    progress: 89,
    age: '1h 23m',
    image: 'https://cdn.dexscreener.com/cms/images/svjWT2Y79HbxOu-y?width=160&height=160&fit=crop&quality=95&format=auto',
    socials: {
      website: 'https://example.com',
      twitter: 'https://twitter.com/example',
      telegram: 'https://t.me/example'
    },
    kyc: true,
    devHoldings: '9%',
    description: "This project is the new Lorem Ipsum for crypto memes. Lorem ipsum dolor sit amet.",
  },
  {
    name: 'Mars Doge',
    symbol: 'MDOGE',
    marketCap: '15K',
    volume: '11K',
    transactions: 232,
    holders: 11,
    progress: 55,
    age: '1h 23m',
    image: 'https://cdn.dexscreener.com/cms/images/svjWT2Y79HbxOu-y?width=160&height=160&fit=crop&quality=95&format=auto',
    socials: {
      website: 'https://example.com',
      twitter: 'https://twitter.com/example',
      telegram: 'https://t.me/example'
    },
    kyc: true,
    devHoldings: '11%',
    description: "This project is the new Lorem Ipsum for crypto memes. Lorem ipsum dolor sit amet.",
  },
  {
    name: 'AI Token',
    symbol: 'AIT',
    marketCap: '15K',
    volume: '11K',
    transactions: 232,
    holders: 11,
    progress: 55,
    age: '1h 23m',
    image: 'https://cdn.dexscreener.com/cms/images/svjWT2Y79HbxOu-y?width=160&height=160&fit=crop&quality=95&format=auto',
    socials: {
      website: 'https://example.com',
      twitter: 'https://twitter.com/example',
      telegram: 'https://t.me/example'
    },
    kyc: false,
    devHoldings: '11%',
    description: "This project is the new Lorem Ipsum for crypto memes. Lorem ipsum dolor sit amet.",
  },
  {
    name: 'Solana Meme',
    symbol: 'SMEME',
    marketCap: '15K',
    volume: '11K',
    transactions: 232,
    holders: 11,
    progress: 55,
    age: '1h 23m',
    image: 'https://cdn.dexscreener.com/cms/images/svjWT2Y79HbxOu-y?width=160&height=160&fit=crop&quality=95&format=auto',
    socials: {
      website: 'https://example.com',
      twitter: 'https://twitter.com/example',
      telegram: 'https://t.me/example'
    },
    kyc: false,
    devHoldings: '11%',
    description: "This project is the new Lorem Ipsum for crypto memes. Lorem ipsum dolor sit amet.",
  }
];

const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
  </svg>
);

const PlantIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#81c0e7" opacity="0.8">
    <path d="M12 22c4.4 0 8-3.6 8-8c0-2.2-1.3-5.3-3.2-7.7c-1-1.3-2-2.3-2.8-3c-.6-.5-1.2-.9-1.5-1.1c-.1-.1-.3-.2-.4-.2c-.1 0-.3 .1-.4 .2c-.3 .2-.9 .6-1.5 1.1c-.8 .7-1.8 1.7-2.8 3C5.3 8.7 4 11.8 4 14C4 18.4 7.6 22 12 22zM12 4.8c.1 0 .2 .1 .4 .2c.5 .4 1.2 1 2 1.8c.8 .8 1.6 1.7 2.4 2.8C18.3 11.6 19 13.4 19 14c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-.6 .7-2.4 2.2-4.4c.8-1.1 1.6-2 2.4-2.8c.8-.8 1.5-1.4 2-1.8c.2-.1 .3-.2 .4-.2z"/>
  </svg>
);

const WrenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
  </svg>
);

const MemeScope: React.FC = () => {
  const [newlyCreated, setNewlyCreated] = useState<TokenData[]>(DUMMY_TOKENS);
  const [aboutToGraduate, setAboutToGraduate] = useState<TokenData[]>(DUMMY_TOKENS);
  const [graduated, setGraduated] = useState<TokenData[]>(DUMMY_TOKENS);

  const renderTokenCard = (token: TokenData) => {
    const devPercentage = parseFloat(token.devHoldings);
    const isHighDev = devPercentage >= 10;
    
    return (
      <div className="token-card">
        <div className="token-info">
          <div className="progress-info">
            <img src={token.image} alt={token.name} className="token-image" />
            {token.kyc && (
              <div className={`kyc-tag ${token.kyc ? 'active' : 'inactive'}`}>
                <ShieldIcon />
                KYC
              </div>
            )}
            <div className="social-icons">
              {token.socials?.website && (
                <a href={token.socials.website} className="social-icon" target="_blank" rel="noopener noreferrer">
                  <FaGlobe />
                </a>
              )}
              {token.socials?.twitter && (
                <a href={token.socials.twitter} className="social-icon" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              )}
              {token.socials?.telegram && (
                <a href={token.socials.telegram} className="social-icon" target="_blank" rel="noopener noreferrer">
                  <FaTelegramPlane />
                </a>
              )}
            </div>
          </div>
          <div className="token-details">
            <div className="token-header">
              <Text className="token-name">{token.name}</Text>
              <Text className="token-symbol">{token.symbol}</Text>
            </div>
            <Text className="token-description">{token.description}</Text>
            
            <div className="stats-container">
              <div className="stat-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z"/>
                </svg>
                V ${token.volume}
                <span className="custom-tooltip">Trading Volume</span>
              </div>
              <div className="stat-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                {token.holders}
                <span className="custom-tooltip">Number of Holders</span>
              </div>
              <div className="stat-item">
                MC ${token.marketCap}
                <span className="custom-tooltip">Market Cap</span>
              </div>
              <div className={`stat-item dev-holdings ${isHighDev ? 'warning' : 'safe'}`}>
                <WrenchIcon />
                <Text fontSize="12px">
                  {token.devHoldings}
                  <span className="custom-tooltip">Developer wallet holdings</span>
                </Text>
              </div>
            </div>

            <div className="progress-wrapper">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${token.progress}%` }} />
              </div>
              <Text className="progress-percentage">{token.progress}%</Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="meme-container">
      <div className="meme-column">
        <div className="column-header">
          <Text color="#dadad2" bold>NEWLY CREATED</Text>
          <button className="filter-button">Filter 8</button>
        </div>
        {newlyCreated.map(token => renderTokenCard(token))}
      </div>

      <div className="meme-column">
        <div className="column-header">
          <Text color="#dadad2" bold>ALMOST FUNDED</Text>
          <button className="filter-button">Filter 6</button>
        </div>
        {aboutToGraduate.map(token => renderTokenCard(token))}
      </div>

      <div className="meme-column">
        <div className="column-header">
          <Text color="#dadad2" bold>FULLY FUNDED</Text>
          <button className="filter-button">Filter 4</button>
        </div>
        {graduated.map(token => renderTokenCard(token))}
      </div>
    </div>
  );
};

export default MemeScope;
