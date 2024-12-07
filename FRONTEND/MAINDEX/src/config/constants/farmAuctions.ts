import { Token as SDKToken, Pair, ChainId } from 'sdk'
import tokens from './tokens'
import { FarmAuctionBidderConfig, Token, Dex } from './types'
import { dexs } from './dex'

const getLpAddress = (token: string, quoteToken: Token, dex: Dex) => {
  const tokenAsToken = new SDKToken(ChainId.SHIBNET, token, 18)
  const quoteTokenAsToken = new SDKToken(ChainId.SHIBNET, quoteToken.address[56], 18)
  return Pair.getAddress(tokenAsToken, quoteTokenAsToken, dex.info)
}

export const whitelistedBidders: FarmAuctionBidderConfig[] = [
  {
    account: '0x9Ed5a62535A5Dd2dB2d9bB21bAc42035Af47F630',
    farmName: 'NAV-BNB',
    tokenAddress: '0xbfef6ccfc830d3baca4f6766a0d4aaa242ca9f3d',
    quoteToken: tokens.wbone,
    tokenName: 'Navcoin',
    projectSite: 'https://navcoin.org/en',
  },
  {
    account: '0x33723811B0FCa2a751f3912B80603Fe11499D894',
    farmName: 'WSG-BNB',
    tokenAddress: '0xa58950f05fea2277d2608748412bf9f802ea4901',
    quoteToken: tokens.wbone,
    tokenName: 'Wall Street Games',
    projectSite: 'https://wsg.gg/',
  },
  {
    account: '0xD1C35C3F5D9d373A3F7c0668Fbe75801886e060f',
    farmName: 'SWIRGE-BNB',
    tokenAddress: '0xe792f64C582698b8572AAF765bDC426AC3aEfb6B',
    quoteToken: tokens.wbone,
    tokenName: 'Swirge Network',
    projectSite: 'https://swirge.com/',
  },
  {
    account: '0xfAd3B5FeAC1aAF86B3f66D105F2fa9607164D86b',
    farmName: 'FEED-BNB',
    tokenAddress: '0x67d66e8Ec1Fd25d98B3Ccd3B19B7dc4b4b7fC493',
    quoteToken: tokens.wbone,
    tokenName: 'Feeder Finance',
    projectSite: 'https://www.feeder.finance/',
  },
  {
    account: '0x6a2d41c87c3F28C2C0b466424DE8e08FC2E23eDc',
    farmName: 'BBT-BNB',
    tokenAddress: '0xd48474e7444727bf500a32d5abe01943f3a59a64',
    quoteToken: tokens.wbone,
    tokenName: 'BitBook',
    projectSite: 'https://www.bitbook.network/',
  },
  {
    account: '0x88F0A6cb89909838d69E4E6e76eC21e2a7bdcA66',
    farmName: 'BREW-BNB',
    tokenAddress: '0x790be81c3ca0e53974be2688cdb954732c9862e1',
    quoteToken: tokens.wbone,
    tokenName: 'CafeSwap Finance',
    projectSite: 'https://app.cafeswap.finance/',
  },
  {
    account: '0x0Cf86283ad1a1B7D04669696eD13BAE3d5925a0a',
    farmName: 'SAKE-BNB',
    tokenAddress: '0x8bd778b12b15416359a227f0533ce2d91844e1ed',
    quoteToken: tokens.wbone,
    tokenName: 'SakeSwap',
    projectSite: 'https://bsc.sakeswap.finance/',
  },
  {
    account: '0xCe059E8af96a654d4afe630Fa325FBF70043Ab11',
    farmName: 'XBLZD-BNB',
    tokenAddress: '0x9a946c3cb16c08334b69ae249690c236ebd5583e',
    quoteToken: tokens.wbone,
    tokenName: 'Blizzard',
    projectSite: 'https://www.blizzard.money/',
  },
  {
    account: '0x7A4BAE68836f486e2c99dca0fBda1845d4532194',
    farmName: 'HERO-BNB',
    tokenAddress: '0xD40bEDb44C081D2935eebA6eF5a3c8A31A1bBE13',
    quoteToken: tokens.wbone,
    tokenName: 'Metahero',
    projectSite: 'https://metahero.io/',
  },
  {
    account: '0x46D8e47b9A6487FDAB0a700b269A452cFeED49Aa',
    farmName: 'MCRN-BNB',
    tokenAddress: '0xacb2d47827c9813ae26de80965845d80935afd0b',
    quoteToken: tokens.wbone,
    tokenName: 'MacaronSwap',
    projectSite: 'https://www.macaronswap.finance/',
  },
  {
    account: '0x1bA962acab22Be9e49C4cEBE7710c9201A72dFcc',
    farmName: 'BABYCAKE-BNB',
    tokenAddress: '0xdb8d30b74bf098af214e862c90e647bbb1fcc58c',
    quoteToken: tokens.wbone,
    tokenName: 'Babycake',
    projectSite: 'https://babycake.app/',
  },
  {
    account: '0xCCcC0b22799E82A79007814Dbc6A194410DCcEA5',
    farmName: 'BMON-BNB',
    tokenAddress: '0x08ba0619b1e7A582E0BCe5BBE9843322C954C340',
    quoteToken: tokens.wbone,
    tokenName: 'Binamon',
    projectSite: 'https://binamon.org/',
  },
  {
    account: '0x6cfA3ff4e96abe93a290dc3d7A911A483C194758',
    farmName: 'ANY-BNB',
    tokenAddress: '0xf68c9df95a18b2a5a5fa1124d79eeeffbad0b6fa',
    quoteToken: tokens.wbone,
    tokenName: 'Anyswap',
    projectSite: 'https://anyswap.exchange/',
  },
  {
    account: '0xe596470D291Cb2D32ec111afC314B07006690c72',
    farmName: 'PHX-BNB',
    tokenAddress: '0xac86e5f9bA48d680516df50C72928c2ec50F3025',
    quoteToken: tokens.wbone,
    tokenName: 'Phoenix Finance',
    projectSite: 'https://www.phoenixprotocol.net/',
  },
  {
    account: '0x8f8c77987C0ea9dd2400383b623d9cbcBbAf98CF',
    farmName: 'GMR-BNB',
    tokenAddress: '0x0523215dcafbf4e4aa92117d13c6985a3bef27d7',
    quoteToken: tokens.wbone,
    tokenName: 'GMR Finance',
    projectSite: 'https://www.gmr.finance/',
  },
  {
    account: '0x786B313b01A25eddbF7f7461b48D60AF680d758C',
    farmName: 'BP-BNB',
    tokenAddress: '0xacb8f52dc63bb752a51186d1c55868adbffee9c1',
    quoteToken: tokens.wbone,
    tokenName: 'BunnyPark',
    projectSite: 'https://www.bunnypark.com/',
  },
  {
    account: '0x70d7eCEE276Ad5fDFc91B3C30d2c1cDb9dD442Fb',
    farmName: 'DPET-BNB',
    tokenAddress: '0xfb62ae373aca027177d1c18ee0862817f9080d08',
    quoteToken: tokens.wbone,
    tokenName: 'MyDefiPet',
    projectSite: 'https://mydefipet.com/',
  },
  {
    account: '0xd27E57Ff5dD3d78B03c85e2A2bB8dc37E67c5140',
    farmName: 'POOLZ-BNB',
    tokenAddress: '0x77018282fd033daf370337a5367e62d8811bc885',
    quoteToken: tokens.wbone,
    tokenName: 'Poolz Finance',
    projectSite: 'https://poolz.finance/',
  },
  {
    account: '0x0767a2f9c644b364Bc88Eea5a535afE506Ba6802',
    farmName: 'ODDZ-BNB',
    tokenAddress: '0xcd40f2670cf58720b694968698a5514e924f742d',
    quoteToken: tokens.wbone,
    tokenName: 'Oddz Finance',
    projectSite: 'https://oddz.fi',
  },
  {
    account: '0xb7d303BbaE2573513801C5F94aE0B61Fa5b3426F',
    farmName: 'ZOON-BNB',
    tokenAddress: '0x9d173e6c594f479b4d47001f8e6a95a7adda42bc',
    quoteToken: tokens.wbone,
    tokenName: 'CryptoZoon',
    projectSite: 'https://cryptozoon.io/',
  },

  {
    account: '0x027D50F36fe3b64630170B3ba82FC64BfC9bc088',
    farmName: 'FAN-BNB',
    tokenAddress: '0xFAc3A1ED2480Da8F5c34576C0Da13F245239717d',
    quoteToken: tokens.wbone,
    tokenName: 'Fanadise',
    projectSite: 'https://fanadise.com/',
  },

  {
    account: '0x88Dba2cF8911A80cc50A1B392b5fF6b47B930330',
    farmName: 'SFUND-BNB',
    tokenAddress: '0x477bc8d23c634c154061869478bce96be6045d12',
    quoteToken: tokens.wbone,
    tokenName: 'Seedify',
    projectSite: 'https://launchpad.seedify.fund/',
  },
  {
    account: '0xf1dD352EF3a94F60b3047B607C2Bd976401F538c',
    farmName: 'GNT-BNB',
    tokenAddress: '0xf750a26eb0acf95556e8529e72ed530f3b60f348',
    quoteToken: tokens.wbone,
    tokenName: 'GreenTrust',
    projectSite: 'https://www.greentrusttoken.com/',
  },
].map((bidderConfig) => ({
  ...bidderConfig,
  lpAddress: getLpAddress(bidderConfig.tokenAddress, bidderConfig.quoteToken, dexs.marswap),
}))

const UNKNOWN_BIDDER: FarmAuctionBidderConfig = {
  account: '',
  tokenAddress: '',
  quoteToken: tokens.wbone,
  farmName: 'Unknown',
  tokenName: 'Unknown',
}

export const getBidderInfo = (account: string): FarmAuctionBidderConfig => {
  const matchingBidder = whitelistedBidders.find((bidder) => bidder.account.toLowerCase() === account.toLowerCase())
  if (matchingBidder) {
    return matchingBidder
  }
  return { ...UNKNOWN_BIDDER, account }
}
