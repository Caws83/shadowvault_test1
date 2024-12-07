import { Flex, Modal, Text } from 'uikit'
import Loading from 'components/Loading'
import useTheme from 'hooks/useTheme'
import React from 'react'

const Animations = () => {
  const { theme } = useTheme()

  return (
    <Modal
      minWidth="346px"
      title="Minting"
      headerBackground={(theme as any).colors.gradients.cardHeader}
      overflow="none"
    >
      <Flex dir="row" justifyContent="space-evenly">
        <Loading style={{ marginRight: '25px' }} />
        <Text>Minting your new NFTs</Text>
        <Loading style={{ marginLeft: '25px' }} />
      </Flex>
    </Modal>
  )
}

export default Animations
