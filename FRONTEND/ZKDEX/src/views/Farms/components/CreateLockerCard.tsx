import React from 'react'
import { Text, Flex, HelpIcon, Button, useModal, Box, useTooltip } from 'uikit'
import { useTranslation } from 'contexts/Localization'

import CreateModal from './CreateModal'
import { Host } from 'config/constants/types'

interface CreateModalProps {
  host: Host
}

const CreateLocker: React.FC<CreateModalProps> = ({ host }) => {
  const { t } = useTranslation()

  const TooltipComponent = () => (
    <>
      <Text mb="16px">{t('Use this to create a new LP Locker!')}</Text>
      <Text mb="16px">
        {t(
          'Creating an LP Locker will add it to the list below. On the first deposit you will start the Lock Time.  Creator of LP Locker can also extend the Lock Time. All LP deposited is subject to the lock.',
        )}
      </Text>
      <Text style={{ fontWeight: 'bold' }}>{t('There is a cost to Create the Locker, and for initial deposits.')}</Text>
    </>
  )

  const [onPresentCreateModal] = useModal(<CreateModal host={host}/>)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  return (
    <>
      {tooltipVisible && tooltip}
      <Flex flexDirection="column">
        <Flex alignItems="center" mb="12px">
          <Button onClick={onPresentCreateModal} scale="sm" id="clickCreateNewLPLocker">
            {t('Create LP Locker')}
          </Button>
          <Box ref={targetRef}>
            <HelpIcon color="textSubtle" />
          </Box>
        </Flex>
      </Flex>
    </>
  )
}

export default CreateLocker
