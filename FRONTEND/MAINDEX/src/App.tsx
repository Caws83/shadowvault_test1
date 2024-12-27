import React, { lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { ResetCSS } from 'uikit'
import BigNumber from 'bignumber.js'
import { usePollBlockNumber } from 'state/block/hooks'
import { DatePickerPortal } from 'components/DatePicker'
import GlobalStyle from './style/Global'
import './style/global.css'
import Menu from './components/Menu'
import SuspenseWithChunkError from './components/SuspenseWithChunkError'
import { ToastListener } from './contexts/ToastsContext'
import PageLoader from './components/Loader/PageLoader'
import styled from 'styled-components'
// import { isMobile } from 'components/isMobile'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './views/AddLiquidity/redirects'
import RedirectOldRemoveLiquidityPathStructure from './views/RemoveLiquidity/redirects'
import { RedirectPathToSwapOnly, RedirectToSwap } from './views/Swap/redirects'
import { usePollCoreFarmData } from 'state/farms/hooks'
// import { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

// Route-based code splitting
const Home = lazy(() => import('./views/Home'))
const Stake = lazy(() => import('./views/Farms'));
const Pools = lazy(() => import('./views/Pools'));
// const Lottery = lazy(() => import('./views/Lottery'));
// const PLottery = lazy(() => import('./views/PLottery'));
const NotFound = lazy(() => import('./views/NotFound'))
const AddLiquidity = lazy(() => import('./views/AddLiquidity'))
const Liquidity = lazy(() => import('./views/Pool'))
const PoolFinder = lazy(() => import('./views/PoolFinder'))
const RemoveLiquidity = lazy(() => import('./views/RemoveLiquidity'))
// const NftPools = lazy(() => import('./views/NftPools'));
// const NftLaunch = lazy(() => import('./views/nftlaunch'));
// const Games = lazy(() => import('./views/Games'));
const MARSEND = lazy(() => import('./views/MultiSender'))
const Swap = lazy(() => import('./views/Swap'))
const MARSALE = lazy(() => import('./views/Ifos'))
const MARSCREATE = lazy(() => import('./views/TokenMaker'))
const MARSHOT = lazy(() => import('./views/MarsShot'))
const MARSPIN = lazy(() => import('./views/MarsSpin'))
// const TokenMakerV2 = lazy(() => import('./views/TokenMakerV2'));
// const Analytics = lazy(() => import('./views/Analytics'));
// const Colors = lazy(() => import('./views/Colors/colors'));
// const Market = lazy(() => import('./views/Collections'));
// const CollectionCard = lazy(() => import('./views/Collection'));
// const OldPools = lazy(() => import('./views/OldPools'));
// const Tokens = lazy(() => import('./views/Tokens'));
// const KYC = lazy(() => import('./views/KYC'));
// const Partners = lazy(() => import('./views/Partners'));
// const SAS = lazy(() => import('./views/SAS'))
// const Staking = lazy(() => import('./views/Pools'))
// const NftUp = lazy(() => import('./views/nftuptest'))
// const Deploy = lazy(() => import('./views/deployByte'))
// const ViewNFT = lazy(() => import('./views/MarsNFTViewer'))

// This config is required for number formatting
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const App: React.FC = () => {
  usePollBlockNumber()
  // useFetchProfile();
  usePollCoreFarmData();
  // useGetNftPools();
  // useFetchNftPublicPoolsDataByHost(hosts.farmageddon)

  return (
    <>
      <HashRouter>
        <ResetCSS />
        <GlobalStyle />
        <Menu>
          <SuspenseWithChunkError fallback={<PageLoader />}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/marsale/*' element={<MARSALE />} />
              <Route path='/marscreate/*' element={<MARSCREATE />} />
              <Route path='/marsend' element={<MARSEND />} />
              <Route path="/marshot/*" element={<MARSHOT />} />
              <Route path="/marspin/*" element={<MARSPIN />} />
              <Route path="/marstake/*" element={<Stake isLocker={false} />} />
              <Route path="/marspools/*" element={<Pools />} />
              {/* 
            
            <Route path="/Lockers/*" element={<Farms isLocker={true} />} />
            
            <Route path="/nftpools/*" element={<NftPools />} />
            <Route path="/plottery" element={<PLottery />} />
            <Route path="/tokenMakerOld" element={<TokenMaker />} />
            <Route path="/nftlaunch/*" element={<NftLaunch />} />
            <Route path="/games" element={<Games />} />
            
            <Route path="/Colors" element={<Colors />} />
            <Route path="/Market" element={<Market />} />
            <Route path="/OldPools" element={<OldPools />} />
            <Route path="/Tokens" element={<Tokens />} />
            <Route path="/KYC" element={<KYC />} />
            <Route path="/Partners" element={<Partners />} />
            <Route path="/NftUp" element={<NftUp />} />
            <Route path="/Deploy" element={<Deploy />} />
            <Route path="/ViewNFT" element={<ViewNFT />} />
            <Route path="/lottery" element={<PLottery />} />
            <Route path="/lottery/:lottery" element={<Lottery />} />
            <Route path="/Analytics" element={<Analytics />} />
            <Route path="/Analytics/:pair" element={<Analytics />} />
            <Route path="/Colors" element={<Colors />} />
            <Route path="/Market" element={<Market />} />
            <Route path="/nftCollection/:chain/:collection" element={<CollectionCard />} />
            */}

              <Route path='/swap' element={<Swap />} />
              <Route path='/swap/:outputCurrency' element={<RedirectToSwap />} />
              <Route path='/send' element={<RedirectPathToSwapOnly />} />
              <Route path='/find' element={<PoolFinder />} />
              <Route path='/liquidity' element={<Liquidity />} />
              <Route path='/create' element={<RedirectToAddLiquidity />} />
              <Route path='/add' element={<AddLiquidity />} />
              <Route path='/add/:currencyIdA' element={<RedirectOldAddLiquidityPathStructure />} />
              <Route path='/add/:currencyIdA/:currencyIdB' element={<RedirectDuplicateTokenIds />} />
              <Route path='/create' element={<AddLiquidity />} />
              <Route path='/create/:currencyIdA' element={<RedirectOldAddLiquidityPathStructure />} />
              <Route path='/create/:currencyIdA/:currencyIdB' element={<RedirectDuplicateTokenIds />} />
              <Route path='/remove/:tokens' element={<RedirectOldRemoveLiquidityPathStructure />} />
              <Route path='/remove/:currencyIdA/:currencyIdB' element={<RemoveLiquidity />} />

              {/* 404 */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </SuspenseWithChunkError>
        </Menu>
        <ToastListener />
        <DatePickerPortal />
      </HashRouter>
    </>
  )
}
export default React.memo(App)
