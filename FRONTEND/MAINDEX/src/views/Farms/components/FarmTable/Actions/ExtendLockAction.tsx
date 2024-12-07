import React, { useState } from 'react'
import { AddIcon, Button, Flex, IconButton, MinusIcon, Text } from 'uikit'
import { FarmConfig } from 'config/constants/types'
import { ActionContainer, ActionTitles } from './styles'
import { useGetInfo } from '../../../hooks/useFarmManage'

interface FarmCardActionsProps {
  farm: FarmConfig
}

const ExtendAction: React.FC<FarmCardActionsProps> = ({ farm }) => {
  const [howLong, setHowLong] = useState(90)
  const { onExtend } = useGetInfo(farm)

  const onClickAdd = () => {
    const newStartIn = howLong + 1
    setHowLong(newStartIn)
  }

  const onClickMinus = () => {
    let newStartIn = howLong - 1
    if (newStartIn < 0) {
      newStartIn = 0
    }
    setHowLong(newStartIn)
  }

  const onClickStart = () => {
    onExtend(howLong * 86400)
  }

  return (
    <ActionContainer>
      <ActionTitles>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          Extend for How long?
        </Text>
      </ActionTitles>
      <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
        <IconButton variant="secondary" onClick={onClickMinus}>
          <MinusIcon color="primary" width="24px" height="24px" />
        </IconButton>
        <Text fontSize="24px">{howLong} Days</Text>
        <IconButton variant="secondary" onClick={onClickAdd}>
          <AddIcon color="primary" width="24px" height="24px" />
        </IconButton>
      </Flex>

      <Button variant="tertiary" mt="8px" width="100%" onClick={onClickStart}>
        Extend
      </Button>
    </ActionContainer>
  )
}

export default ExtendAction
