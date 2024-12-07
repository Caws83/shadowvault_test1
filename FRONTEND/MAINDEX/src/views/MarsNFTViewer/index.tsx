/* eslint-disable no-await-in-loop */
import { Flex, ButtonMenu, ButtonMenuItem } from 'uikit'
import PageHeader from 'components/PageHeader'
import React, { useState } from 'react'
import MarsCollection from './marsErc404'
import VoltInu from './VoltInu'
import ViewERC404 from './ViewERC404'
import ViewERC721 from './ViewERC721'

const TokenMaker: React.FC = () => {
 
  const [changeWhat, setChangeWhat] = useState(0)
  const handleClick = (newIndex: number) => {
    setChangeWhat(newIndex)
  }


 
  return (
    <>
    <PageHeader firstHeading="View" secondHeading={`View NFTs / ERC404s`} />

    <Flex justifyContent="center" alignItems="center" mb="24px">
      <ButtonMenu activeIndex={changeWhat} scale="sm" variant="subtle" onItemClick={handleClick}>
        <ButtonMenuItem as="button">MartIANS</ButtonMenuItem>
        <ButtonMenuItem as="button">Voltron Inu</ButtonMenuItem>
        <ButtonMenuItem as="button">View ERC721</ButtonMenuItem>
        <ButtonMenuItem as="button">View ERC404</ButtonMenuItem>
       
      </ButtonMenu>
    </Flex>
   

    {changeWhat === 0 && <MarsCollection />}
    {changeWhat === 1 && <VoltInu />}
    {changeWhat === 2 && <ViewERC721 />}
    {changeWhat === 3 && <ViewERC404 />}
   
     
   
    </>
  )
}
  
export default TokenMaker
