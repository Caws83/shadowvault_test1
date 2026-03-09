# ShadowVault MVP Wiring – Todo & Route

**Goal:** Wire contracts and backend so the team can test. **No UI changes** – only connect the frontend to the right contracts and backend.

---

## Current state (summary)

| Area | Status |
|------|--------|
| **Frontend** | UI is solid. Swap page uses `dexList` (tBNB, BSC, Ethereum, Sepolia), token list (SVP, WBNB, etc.), and `useSwapCallback` to execute swaps. |
| **Standard DEX swap** | Router/factory for **PancakeSwap V2** on tBNB (97) and BSC (56) are already in `config/constants/dex.ts`. Swap flow uses `dex.router` + `pancakeRouterAbi` when `dex.isMars === true` (Pancake is treated as MarSwap-style). |
| **Factory fee** | `useGetFactoryTxFee` reads `flatFee` from factory; PancakeSwap factory has no `flatFee`, so it catches and returns `0` – OK for MVP. |
| **Backend (DEX_API)** | Node/Express. Serves pair/NFT/jackpot data. **Does not execute swaps.** No BSC/tBNB in its chain config today. |
| **Contracts** | Many MarSwap/Neon routers and factories in `CONTRACTS/GENERALCONTRACTS/MSWAP/`. **No margin/leverage contracts** – only vault-style logic in `Mswap_autoPool.sol`. |

---

## Recommended route (best path to MVP)

1. **Standard DEX swap first (tBNB)**  
   - Confirm swap end-to-end on tBNB with PancakeSwap testnet router/factory (no new contracts).  
   - Fix any small issues (e.g. fee param, deadline, slippage) so “Swap” button works for team testing.

2. **Keep backend optional for swap**  
   - Swaps are on-chain only; DEX_API is for pair/volume data.  
   - Add tBNB/BSC to DEX_API only if you want “top pairs” or volume from the backend; not required for MVP swap.

3. **Margin/leverage as phase 2**  
   - New contracts needed (margin engine, positions, collateral, liquidations).  
   - Then wire existing “Open Long” / “Open Short” buttons to these contracts (same UI, new contract calls).

---

## Todo list (in order)

| # | Task | Notes |
|---|------|------|
| **1** | **Verify standard DEX swap on tBNB** | Connect wallet to tBNB, select SVP/WBNB (or test tokens), execute a swap. Confirm router address and ABI (PancakeSwap V2) work; fix any revert or param issues. |
| **2** | **Fix useGetFactoryTxFee / swap params for Pancake dex** | Ensure `FLAT_FEE` is 0 for Pancake and that `Router.swapCallParameters` (or equivalent) does not pass a fee to the router if it doesn’t support it. No UI change. |
| **3** | **(Optional) DEX_API chainConfig for tBNB/BSC** | If you want pair/volume data from backend, add chain 97 (and optionally 56) to DEX_API `chainConfig` and point to PancakeSwap factory so it can index pairs. |
| **4** | **Design and deploy testnet margin/leverage contracts** | New contracts: e.g. margin pool, open/close position, collateral, PnL, liquidation. Deploy on tBNB (or chosen testnet) for team testing. |
| **5** | **Wire Open Long / Open Short to margin contracts** | In `useSwapCallback` or a new hook, when user clicks “Open Long” or “Open Short”, call the new margin contract instead of (or in addition to) spot swap. No UI change. |

---

## What we are *not* changing

- Any UI/layout/styling.
- Chain list or token list behavior (already set for tBNB, BSC, ETH, Sepolia).
- Menu, Swap page structure, or Home page.

---

## Next step

Start with **Todo #1**: run a test swap on tBNB (SVP ↔ WBNB or test token) and fix any execution issues. Then move to #2 if needed, then #3 (optional), then #4 and #5 for leverage.
