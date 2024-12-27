import React from 'react'
import { Flex, IconButton, CogIcon, useModal } from 'uikit'
import SettingsModal from './SettingsModal'

const GlobalSettings = () => {
  const [onPresentSettingsModal] = useModal(<SettingsModal />)

  return (
    <Flex>
      <IconButton onClick={onPresentSettingsModal} variant="text" scale="sm" mr="8px">
        <CogIcon height={22} width={22} color="#41d1ff" />
      </IconButton>
    </Flex>
  )
}

export default GlobalSettings
