import useTheme from 'hooks/useTheme';
import { CSSProperties } from 'react';
import { isMobile } from 'components/isMobile';

const useChatStyles = () => {
  const { isDark, theme } = useTheme();
  const topValue = isMobile ? '180px' : '240px';
  const rightValue = isMobile ? '40px' : '45px';

  const modalContainerStyle: CSSProperties = {
    position: 'fixed',
    top: topValue,
    right: rightValue,
    transform: 'translateY(-50%)',
    backgroundColor: theme.colors.backgroundAlt,
    border: `1px solid ${theme.colors.cardBorder}`,
    borderRadius: '10px',  
    maxWidth: '550px',
    minHeight: '20vh',
    maxHeight: '120vh',
    overflowY: 'auto',
    display: 'none',
    fontFamily: 'Roboto, Arial, sans-serif', // Updated font family
    zIndex: 1000, 
  };

  const modalContentStyle: CSSProperties = {
    width: '100%',
    height: '100%',
  };

  const modalHeaderStyle: CSSProperties = {
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: theme.colors.secondary,
    color: theme.colors.primary,
    fontFamily: 'Roboto, Arial, sans-serif', // Updated font family
  };

  const closeButtonStyle: CSSProperties = {
    backgroundColor: theme.colors.secondary,
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: theme.colors.primary,
  };

  const modalBodyStyle: CSSProperties = {
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '20px',
    fontFamily: 'Roboto, Arial, sans-serif', // Updated font family
  };

  const inputContainerStyle: CSSProperties = {
    display: 'flex',
    marginTop: '20px',
    marginBottom: '20px',
    flexDirection: 'column',
    fontFamily: 'Roboto, Arial, sans-serif', // Updated font family
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    padding: '8px',
    border: `1px solid ${theme.colors.cardBorder}`,
    borderRadius: '5px',
    fontSize: '12px',
    fontFamily: 'Roboto, Arial, sans-serif', // Updated font family
  };

  const openModalButtonStyle: CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: theme.colors.secondary,
    color: theme.colors.primary,
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    cursor: 'pointer',
  };

  const fabStyle: CSSProperties = {
    backgroundColor: 'transparent',
    color: theme.colors.background,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 999,
    paddingRight: '20px',
  };

  const iconStyle: CSSProperties = {
    width: '32px',
    height: 'auto',
  };

  const messageStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '6px 0',
    padding: '6px',
    fontFamily: 'Roboto, Arial, sans-serif', // Updated font family
  };

  const userBubbleStyle: CSSProperties = {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    fontSize: '12px',
    padding: '12px',
    borderRadius: '12px',
    marginRight: 'auto',
    fontFamily: 'Roboto, Arial, sans-serif', // Updated font family
    lineHeight: '1.5',
    whiteSpace: 'pre-line',
  };

  const botBubbleStyle: CSSProperties = {
    backgroundColor: 'rgba(129, 192, 231, 0.1)',
    color: '#dadad2',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '10px',
    marginLeft: 'auto',
    fontFamily: 'Roboto, Arial, sans-serif',
    lineHeight: '1.5',
    whiteSpace: 'pre-line',
    maxWidth: '80%',
  };

  return { 
    userBubbleStyle, 
    botBubbleStyle, 
    messageStyle, 
    iconStyle, 
    fabStyle, 
    inputStyle, 
    openModalButtonStyle, 
    modalContainerStyle, 
    modalContentStyle, 
    modalHeaderStyle, 
    closeButtonStyle, 
    modalBodyStyle, 
    inputContainerStyle 
  };
}

export default useChatStyles;
