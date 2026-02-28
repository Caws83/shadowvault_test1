# ShadowVault Protocol Frontend

## Overview
Privacy-centric DEX with AI-driven leverage trading, zero-knowledge privacy, and Uniswap liquidity integration.

## Features

### 1. Zero-Knowledge Privacy
- Complete transaction anonymity
- No visible wallet traces, positions, or history
- Shielded pool routing
- Zero-knowledge proof integration

### 2. Uniswap Liquidity Integration
- Deep liquidity from Uniswap V3 pools
- Optimal routing for best execution
- Minimal slippage trades

### 3. AI Trading Agent
- **Safe Mode**: 5-10x leverage with automated stop-loss and risk controls
- **Full Psycho Mode**: Up to 100x leverage for high-risk/high-reward plays
- Market analysis based on on-chain data
- Sentiment analysis integration
- Automated trade signals

### 4. $SHDV Token Integration
- Staking for AI agent access
- Fee discounts (0.05-0.3% swaps)
- Governance voting
- Premium features unlock

## Development

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Run Development Server
```bash
npm run start
# or
yarn start
```

### Build for Production
```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── features/              # Feature modules
│   ├── ai-agent/         # AI trading agent
│   ├── leverage/         # Leverage trading
│   ├── privacy/          # Privacy layer
│   ├── shdv-token/       # $SHDV token integration
│   └── uniswap-integration/ # Uniswap V3 integration
├── views/                # Page components
│   ├── Home/             # Homepage with three pillars
│   └── Swap/             # Swap interface with AI & privacy
├── components/           # Reusable components
├── config/               # Configuration files
└── uikit/                # UI component library
```

## Theme

Dark red/black Sith Lord aesthetic:
- Primary color: `#DC143C` (Crimson red)
- Background: Pure black with red accents
- Glowing red borders and effects

## Key Components

- `LeverageModeSelector` - Safe vs Psycho mode selection
- `AIAgentPanel` - AI trading agent interface
- `PrivacyToggle` - Zero-knowledge privacy controls
- `ThreePillars` - Homepage feature showcase

## Environment Variables

Create a `.env` file with:
```
VITE_NODE_1=your_rpc_endpoint
VITE_NODE_2=your_rpc_endpoint
VITE_NODE_3=your_rpc_endpoint
```

## License

See LICENSE file for details.

