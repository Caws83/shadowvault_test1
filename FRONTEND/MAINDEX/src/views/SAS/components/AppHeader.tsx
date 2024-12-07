import React from 'react'
import styled from 'styled-components'
import { ArrowBackIcon, Flex, IconButton, NotificationDot } from 'uikit'
import { Link } from 'react-router-dom'
import { useExpertModeManager } from 'state/user/hooks'
import GlobalSettings from 'components/Menu/GlobalSettings'
import { Dex } from 'config/constants/types'
import DexSelector from 'components/DexSelector/DexSelector'
import UserMenu from './UserMenu'


interface Props {
  currentDex: Dex
  UpdateDex: (dex: Dex) => void
  image?: string
  backTo?: string
  hideDex?: boolean
  color?: string
}

const AppHeaderContainer = styled(Flex)<{ image: string }>`
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: ${({ image }) => `url('/images/dexs/${image}.png')`};
`

const AppHeader: React.FC<Props> = (props) => {
  const { currentDex, image, backTo, UpdateDex, hideDex, color } = props
  const [expertMode] = useExpertModeManager()


  return (
    <AppHeaderContainer image={image}>
      <Flex alignItems="center" mr='16px'>
      {backTo && (
          <IconButton as={Link} to={backTo}>
            <ArrowBackIcon width="32px" />
          </IconButton>
        )}
          
      <DexSelector newDex={currentDex} UpdateDex={UpdateDex} hideDex={hideDex} color={color}/>
     
    
      </Flex>
     
        <Flex alignItems="center">
          <NotificationDot show={expertMode}>
            <GlobalSettings />
          </NotificationDot>
          <UserMenu color={color} />
        </Flex>
      
    </AppHeaderContainer>
  )
}

export default AppHeader
