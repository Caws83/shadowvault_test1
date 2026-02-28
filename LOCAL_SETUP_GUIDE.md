# ShadowVault Protocol - Local Development Setup

## Quick Start

### 1. Navigate to Frontend Directory
```bash
cd FRONTEND/MAINDEX
```

### 2. Install Dependencies
```bash
npm install
# or if using yarn
yarn install
```

### 3. Set Up Environment Variables
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your RPC endpoints
# Minimum required: VITE_NODE_1, VITE_NODE_2, VITE_NODE_3
```

### 4. Run Development Server
```bash
npm run start
# or
yarn start
```

The app will start on `http://localhost:5173` (or the next available port)

### 5. Open in Browser
Navigate to the URL shown in your terminal (usually `http://localhost:5173`)

## Project Structure

```
MARSWAP_PLATFORM/                    # Root (will be renamed to SHADOWVAULT_PROTOCOL)
├── FRONTEND/
│   └── MAINDEX/                     # Main frontend application
│       ├── src/
│       │   ├── features/            # New feature modules
│       │   │   ├── ai-agent/         # AI trading agent
│       │   │   ├── leverage/        # Leverage trading
│       │   │   ├── privacy/         # Privacy layer
│       │   │   ├── shdv-token/      # $SHDV token
│       │   │   └── uniswap-integration/
│       │   ├── views/               # Page components
│       │   ├── components/          # Reusable components
│       │   └── config/             # Configuration
│       ├── package.json
│       ├── vite.config.ts
│       └── .env.example
├── CONTRACTS/                       # Smart contracts
└── DEX_API/                         # Backend API
```

## Required Environment Variables

**Minimum Required:**
- `VITE_NODE_1` - RPC endpoint for blockchain connection
- `VITE_NODE_2` - Backup RPC endpoint
- `VITE_NODE_3` - Additional backup RPC endpoint

**Optional (for full functionality):**
- `VITE_GTAG` - Google Analytics
- `VITE_GRAPH_API_*` - GraphQL API endpoints
- `VITE_SNAPSHOT_*` - Governance endpoints

## Common Issues & Solutions

### Port Already in Use
If port 5173 is taken, Vite will automatically use the next available port. Check the terminal output for the actual URL.

### Missing Dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check TypeScript version
npm list typescript

# If issues persist, try:
npm install --save-dev typescript@latest
```

### Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run start
```

## Development Tips

1. **Hot Reload**: Changes to files will automatically reload in the browser
2. **Console Logs**: Check browser console (F12) for any errors
3. **Network Tab**: Monitor API calls and RPC requests
4. **React DevTools**: Install React DevTools browser extension for debugging

## Next Steps

Once running locally:
1. ✅ Test the homepage with new "Three Pillars" section
2. ✅ Check the swap interface with new red theme
3. ✅ Test AI Agent Panel (mock data for now)
4. ✅ Verify privacy toggle functionality
5. ✅ Review leverage mode selector

## Folder Rename (After Testing)

Once you've verified everything works, you can rename the root folder:
- From: `MARSWAP_PLATFORM`
- To: `SHADOWVAULT_PROTOCOL` (or `SHADOWVAULT_PLATFORM`)

**Note**: The folder name doesn't affect functionality, but it's good for consistency.

## Need Help?

- Check `SHADOWVAULT_REBRAND_SUMMARY.md` for feature overview
- Review `FRONTEND/MAINDEX/README_SHADOWVAULT.md` for frontend details
- Check browser console for specific error messages

