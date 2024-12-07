import React from 'react'
import { Text, Flex, HelpIcon, Button, useModal, Box, useTooltip } from '../uikit'

import CreateModal from './AddCollectionModal'

const AddCollectionCard = () => {

  const TooltipComponent = () => (
    <>
      <Text mb="16px">{'Using this will Add a NFT Collection'}</Text>
      <Text mb="16px">
        
          Adding a collection will add it to the list to allow listing of NFTs for sale.
        
      </Text>
      <Text style={{ fontWeight: 'bold' }}>{'There is no Charge to adding a collection.'}</Text>
    </>
  )

  const [onPresentCreateModal] = useModal(<CreateModal />)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  return (
    <>
      {tooltipVisible && tooltip}
      <Flex flexDirection="column">
        <Flex alignItems="center" mb="12px">
          <Button onClick={onPresentCreateModal} scale="sm" id="clickAddCollection">
            {'Add New Collection'}
          </Button>
          <Box ref={targetRef}>
            <HelpIcon color="textSubtle" />
          </Box>
        </Flex>
      </Flex>
    </>
  )
}

export default AddCollectionCard
