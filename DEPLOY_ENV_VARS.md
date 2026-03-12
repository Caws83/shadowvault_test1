# Environment variables for deploy (Railway + Netlify)

Set these in each platform’s dashboard so the app runs correctly.

---

## Railway (backend – DEX API)

**Where:** Railway project → your service → **Variables** (or **Settings → Environment**).

**Root directory:** Set **Root Directory** to `DEX_API/DEXAPI` so the Node app is detected.

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Railway often sets this automatically) | `3000` |
| `OPENAI_API_KEY` | OpenAI API key for AI Agent | `sk-proj-...` (from OpenAI dashboard) |

### Optional but used by the app

| Variable | Description |
|----------|-------------|
| `ENABLE_DOCS_BOOT` | Set to `true` to enable docs boot | `false` |
| `BSC_TESTNET_RPC_URL` | BSC testnet RPC | e.g. `https://data-seed-prebsc-1-s1.bnbchain.org:8545` |
| `SEPOLIA_RPC_URL` | Sepolia RPC | e.g. `https://ethereum-sepolia-rpc.publicnode.com` |
| `ETHEREUM_RPC_URL` | Ethereum mainnet RPC | e.g. `https://ethereum-rpc.publicnode.com` |
| `BSC_TESTNET_FACTORY` | Factory contract address (BSC testnet) | `0x...` or `0x0000...` |
| `BSC_TESTNET_INFO_GETTER` | Info getter contract (BSC testnet) | `0x...` or `0x0000...` |
| `SEPOLIA_FACTORY` | Factory contract (Sepolia) | `0x...` or `0x0000...` |
| `SEPOLIA_INFO_GETTER` | Info getter (Sepolia) | `0x...` or `0x0000...` |
| `ETHEREUM_FACTORY` | Factory (Ethereum) | `0x...` or `0x0000...` |
| `ETHEREUM_INFO_GETTER` | Info getter (Ethereum) | `0x...` or `0x0000...` |
| `NFT_MARKET_ADDRESS` | NFT market contract | `0x...` or `0x0000...` |
| `NFT_CHAIN_RPC_URL` | RPC for NFT chain | same as BSC testnet if needed |
| `UPSTASH_REDIS_URL` | Upstash Redis URL (rate limiting) | leave empty to disable |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis token | leave empty to disable |
| `PKEY` | Private key for chain operations (if needed) | **keep secret** |

You can copy names from `DEX_API/DEXAPI/.env.example` and paste the values from your local `.env` (except never commit real keys).

---

## Netlify (frontend)

**Where:** Netlify site → **Site configuration** → **Environment variables**.

Build runs from `FRONTEND/MAINDEX` (per `netlify.toml`). Only `VITE_*` variables are available in the app.

### For AI Agent (Bots tab)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ENABLE_AI_AGENT` | Set to `false` to hide the AI panel | omit or `true` to show |
| `VITE_AI_AGENT_API_URL` | Backend API base URL (Railway) | `https://your-app.up.railway.app` |

**Important:** Set `VITE_AI_AGENT_API_URL` to your Railway backend URL (e.g. `https://dexapi-production-xxxx.up.railway.app`) with no trailing slash. The frontend uses this for the Bots / AI Agent requests.

### Other frontend vars (if you use them)

Your app also references: `VITE_TOKEN`, `VITE_CLIENT_ID`, `VITE_CHAIN_ID`, `VITE_GTAG`, `VITE_NODE_1`, `VITE_NODE_2`, `VITE_NODE_3`, `VITE_NODE_PRODUCTION`, `VITE_GRAPH_API_PROFILE`, `VITE_GRAPH_API_PREDICTION`, `VITE_GRAPH_API_LOTTERY`, `VITE_SNAPSHOT_BASE_URL`, `VITE_SNAPSHOT_VOTING_API`, `VITE_API_PROFILE`. Set any of these in Netlify if the app expects them (e.g. from an existing `.env` in `FRONTEND/MAINDEX`).

---

## Checklist

1. **Railway**
   - [ ] Root Directory = `DEX_API/DEXAPI`
   - [ ] `OPENAI_API_KEY` set
   - [ ] `PORT` set or left for Railway to inject
   - [ ] Other vars from `.env.example` if you use them (RPCs, factory addresses, etc.)
2. **Netlify**
   - [ ] `VITE_AI_AGENT_API_URL` = your Railway backend URL
   - [ ] `VITE_ENABLE_AI_AGENT` = `false` only if you want the AI panel hidden
3. Redeploy both after changing variables.
