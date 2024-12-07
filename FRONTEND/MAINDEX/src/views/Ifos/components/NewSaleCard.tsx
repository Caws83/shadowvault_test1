import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Card, CardBody, Text, Flex, HelpIcon, Button, useModal, Box, useTooltip } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import SearchInput from 'components/SearchInput/SearchInput'
import CreateModal from './NewSaleModal'
import { useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { isMobile } from 'components/isMobile'


const Tile = styled.div`
  width: ${isMobile ? '300px' : '350px'};
  display: flex;
  flex-direction: column;
`;

const CreateSale = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const {chain} = useAccount()

  const TooltipComponent = () => (
    <>
      <Text mb="8px">{t('Create A New PreSale for your Token!')}</Text>
      <Text mb="8px">{t('You can create a PreSale for your Token. See below for more details.')}</Text>
      <Text style={{ fontWeight: 'bold' }}>{t('There is a cost for Creating Sale, and a % of sales as a fee.')}</Text>
    </>
  )

  const [tokenAddress, setToken] = useState<`0x${string}`>('0x0')
  const handleChangeQueryToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value as `0x${string}`)
  }

  const [onPresentCreateModal] = useModal(<CreateModal tokenAddress={tokenAddress} chainId={chain?.id}/>)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  const [isToken, setIsToken ] = useState(false)
  useEffect(() => {
    async function go(){
      try{
        const check = await readContract(config, {abi: ERC20_ABI, address: tokenAddress, functionName: 'symbol', chainId: chain?.id})
        setIsToken(true)
      } catch{
        setIsToken(false)
      } 
    }
    go()
  },[tokenAddress])

  return (
    <>
      {tooltipVisible && tooltip}
      <Tile>
          <Text style={{paddingTop: 20, paddingBottom: 20}}>{t('New Token Address:')}</Text>

          <SearchInput onChange={handleChangeQueryToken} placeholder="Enter Token Address:"  />

          <Flex mt="20px" mb="0px">
            <Button
              onClick={onPresentCreateModal}
              disabled={!account || !isToken}
              scale="sm"
              id="clickCreateNewPreSale"
            >
              {t('Create New PreSale')}
            </Button>
           
          </Flex>
      </Tile>
    </>
  )
}

export default CreateSale
