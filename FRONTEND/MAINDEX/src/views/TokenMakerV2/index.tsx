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
  defaultChainId: "https://api-testnet.bscscan.com/api"
}
export const keys = {
  defaultChainId: ""
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
