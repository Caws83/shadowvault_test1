import React from 'react'
import { Text, Flex, HelpIcon, Button, useModal, Box, useTooltip } from 'uikit'
import { useTranslation } from 'contexts/Localization'

import CreateModal from './CreateModal'

const CreateNFTPool = () => {
  const { t } = useTranslation()

  const TooltipComponent = () => (
    <>
      <Text mb="16px">{t('Use this to create a New NFT staking pool!')}</Text>
      <Text mb="16px">{t('Creating a NFT staking pool will add it to the list below.')}</Text>
      <Text style={{ fontWeight: 'bold' }}>
        {t('There is a cost to create the pool, and to keep it going. ( 30 Day Subs )')}
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
          <Button onClick={onPresentCreateModal} scale="sm" id="clickCreateNewPool">
            {t('Create NFT Staking Pool')}
          </Button>
          <Box ref={targetRef}>
            <HelpIcon color="textSubtle" />
          </Box>
        </Flex>
      </Flex>
    </>
  )
}

export default CreateNFTPool
