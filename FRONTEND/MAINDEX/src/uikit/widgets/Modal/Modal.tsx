import React from 'react'
import { useTheme } from 'styled-components'
import Heading from '../../components/Heading/Heading'
import getThemeValue from '../../util/getThemeValue'
import { ModalBody, ModalHeader, ModalTitle, ModalContainer, ModalCloseButton, ModalBackButton } from './styles'
import { ModalProps } from './types'

interface ModalProps {
  title?: string;
  onDismiss: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  bodyPadding?: string;
  headerBackground?: string;
  minWidth?: string;
  headerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  title,
  onDismiss,
  onBack,
  children,
  hideCloseButton = false,
  bodyPadding = '24px',
  headerBackground = 'transparent',
  minWidth = '320px',
  headerClassName = '',
  ...props
}) => {
  const theme = useTheme()
  return (
    <ModalContainer minWidth={minWidth} {...props}>
      <ModalHeader 
        className={headerClassName}
        background={getThemeValue(`colors.${headerBackground}`, headerBackground)(theme)}
      >
        <ModalTitle>
          {onBack && <ModalBackButton onBack={onBack} />}
          <Heading>{title}</Heading>
        </ModalTitle>
        {!hideCloseButton && <ModalCloseButton onDismiss={onDismiss} />}
      </ModalHeader>
      <ModalBody p={bodyPadding}>{children}</ModalBody>
    </ModalContainer>
  )
}

export default Modal
