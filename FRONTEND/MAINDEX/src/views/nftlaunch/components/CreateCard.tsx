import React from 'react'
import { Text, Flex, HelpIcon, Button, useModal, Box, useTooltip } from 'uikit'
import { useTranslation } from 'contexts/Localization'

import CreateModal from './CreateModal'

const AddSale = () => {
  const { t } = useTranslation()

  const TooltipComponent = () => (
    <>
      <Text mb="16px">{t('This will add your Collection to the Minting Page')}</Text>
      <Text mb="16px">
        {t(
          'Adding your collection to the minting page will allow others to MINT your NFT Collection. Being a MARSWAP Contract is required.',
        )}
      </Text>
      
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
          <Button onClick={onPresentCreateModal} scale="sm" id="clickCreateNewSale">
            {t('Add NFT To Sales')}
          </Button>
          <Box ref={targetRef}>
            <HelpIcon color="textSubtle" />
          </Box>
        </Flex>
      </Flex>
    </>
  )
}

export default AddSale
