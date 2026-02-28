# 🚀 ShadowVault Protocol - Quick Start

## Get Running in 3 Steps

### 1️⃣ Navigate to Frontend
```bash
cd FRONTEND/MAINDEX
```

### 2️⃣ Install & Setup
```bash
# Install dependencies
npm install

# Create .env file (copy from example)
# Windows:
Copy-Item .env.example .env

# Mac/Linux:
# cp .env.example .env

# Edit .env and add at least these:
# VITE_NODE_1=https://eth.llamarpc.com
# VITE_NODE_2=https://rpc.ankr.com/eth  
# VITE_NODE_3=https://ethereum.publicnode.com
```

### 3️⃣ Start Development Server
```bash
npm run start
```

Open browser to: **http://localhost:5173**

---

## ✅ What's New

- **Dark Red/Black Theme** - Sith Lord aesthetic
- **Three Pillars Section** - Privacy, Uniswap, AI Agent
- **Updated Branding** - ShadowVault Protocol throughout
- **New Routes** - Cleaner URLs (removed "mars" prefixes)

## 📁 Folder Rename (After Testing)

Once you verify everything works, rename the root folder:

**Current:** `MARSWAP_PLATFORM`  
**New:** `SHADOWVAULT_PROTOCOL` (or `SHADOWVAULT_PLATFORM`)

This is optional - the folder name doesn't affect functionality.

## 🐛 Issues?

- **Port in use?** Vite will auto-use next port
- **Module errors?** Run `rm -rf node_modules && npm install`
- **Need help?** Check `LOCAL_SETUP_GUIDE.md` for detailed instructions

## 📚 More Info

- `LOCAL_SETUP_GUIDE.md` - Detailed setup instructions
- `SHADOWVAULT_REBRAND_SUMMARY.md` - Complete feature list
- `FRONTEND/MAINDEX/README_SHADOWVAULT.md` - Frontend documentation

