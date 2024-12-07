/* eslint-disable no-await-in-loop */
import { Flex, ButtonMenu, ButtonMenuItem } from 'uikit'
import PageHeader from 'components/PageHeader'
import React, { useState } from 'react'
import Ultimate from './ultimate'
import Dividend from './dividend'
import OldVersion from './old'
import Erc404 from './erc404'
import Nft from './NFT'
import NftR from './NFTRandom'


export const apis = {
  97: 'https://api-testnet.bscscan.com/api',
  282: 'https://explorer.zkevm.cronos.org/testnet/api',
  56: 'https://api.bscscan.com/api',
  109: 'https://www.shibariumscan.io/api',
  1: 'https://api.etherscan.io/api',
  25: "https://explorer-api.cronos.org/mainnet/api/v1",
  8453: "https://api.basescan.org/api",
}
export const keys = {
  97: 'J6JA2Z7XRGWT24Z3ZF9J3H2AUGEAEAH9FG',
  56: 'J6JA2Z7XRGWT24Z3ZF9J3H2AUGEAEAH9FG',
  109: '48b7254b-37c2-41cd-993a-ed912771c8e3',
  1: 'N9SXTYRYIA4JHEFGERJVBAF3EU3817GE9D',
  8453: "29MYWZ472YRSEM4MRGKYPDT3EF9EM4KJ1E",
  25: "pUTlJeZjtZm7E4dUDDshzJMQKjdJZvJp",
  282: "",
}

const TokenMaker: React.FC = () => {
 
  const [changeWhat, setChangeWhat] = useState(0)
  const handleClick = (newIndex: number) => {
    setChangeWhat(newIndex)
  }
  const handleClick2 = (newIndex: number) => {
    setChangeWhat(newIndex+3)
  }

 
  return (
    <>
    <PageHeader firstHeading="Create" secondHeading={`Deploy Without Experience. `} />

    <Flex justifyContent="center" alignItems="center" mb="24px">
      <ButtonMenu activeIndex={changeWhat} scale="sm" variant="subtle" onItemClick={handleClick}>
        <ButtonMenuItem as="button">Ultimate Token</ButtonMenuItem>
        <ButtonMenuItem as="button">Dividend Token</ButtonMenuItem>
        <ButtonMenuItem as="button">Erc404</ButtonMenuItem>
      </ButtonMenu>
    </Flex>
    <Flex justifyContent="center" alignItems="center" mb="24px">
      <ButtonMenu activeIndex={changeWhat-3} scale="sm" variant="subtle" onItemClick={handleClick2}>
        <ButtonMenuItem as="button">Token: V1</ButtonMenuItem>
        <ButtonMenuItem as="button">NFT Collection</ButtonMenuItem>
        <ButtonMenuItem as="button">NFT Random</ButtonMenuItem>
      </ButtonMenu>
    </Flex>

    {changeWhat === 0 && <Ultimate />}
    {changeWhat === 1 && <Dividend />}
    {changeWhat === 2 && <Erc404 />}
    {changeWhat === 3 && <OldVersion />}
    {changeWhat === 4 && <Nft />}
    {changeWhat === 5 && <NftR />}
     
   
    </>
  )
}
  
export default TokenMaker
