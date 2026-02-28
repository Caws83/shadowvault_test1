# ShadowVault Protocol - Local Setup Instructions

## Step 1: Install Dependencies

Open a terminal in the `FRONTEND/MAINDEX` directory and run:

```bash
npm install
```

Or if you prefer yarn:
```bash
yarn install
```

## Step 2: Create Environment File

Create a `.env` file in the `FRONTEND/MAINDEX` directory:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Then edit `.env` and add at minimum:
```
VITE_NODE_1=https://eth.llamarpc.com
VITE_NODE_2=https://rpc.ankr.com/eth
VITE_NODE_3=https://ethereum.publicnode.com
```

You can use any public Ethereum RPC endpoints for testing.

## Step 3: Start Development Server

```bash
npm run start
```

Or:
```bash
yarn start
```

The server will start on `http://localhost:5173` (or next available port).

## Step 4: Open in Browser

Navigate to the URL shown in your terminal (usually `http://localhost:5173`)

## What You Should See

1. **Homepage** with:
   - New "Trade in Shadows. Leverage Fearless." tagline
   - Three Pillars section (Privacy, Uniswap Liquidity, AI Agent)
   - Dark red/black theme

2. **Swap Page** (`/swap`) with:
   - Red animated borders
   - Dark theme with red accents
   - Updated styling

## Troubleshooting

### Port Already in Use
Vite will automatically use the next available port. Check terminal for the actual URL.

### Module Not Found Errors
```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors
The project should compile. If you see TypeScript errors, they're likely warnings that won't prevent the app from running.

### Missing .env File
Create `.env` file with at least the three RPC endpoints (VITE_NODE_1, VITE_NODE_2, VITE_NODE_3).

## Next Steps After Running

1. ✅ Verify homepage loads with new branding
2. ✅ Check swap interface styling
3. ✅ Test navigation between pages
4. ✅ Review the new Three Pillars section
5. ✅ Check browser console for any errors (F12)

## Folder Rename (Optional)

After testing, you can rename the root folder:
- Current: `MARSWAP_PLATFORM`
- Suggested: `SHADOWVAULT_PROTOCOL`

This is optional and doesn't affect functionality.

