import React from 'react'
import { Flex, Modal } from 'uikit'
import styled from 'styled-components'
import { isMobile } from 'components/isMobile'


const BorderContainer = styled.div`
  padding: 5px;
  border-radius: 4px;
    display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  text-wrap: wrap;
`

const TextWrap = styled.div`
  white-space: normal;
  color: white;
  font-size: 22px;
  padding-bottom: 20px;
  text-wrap: wrap;
    display: flex;
  justify-content: center;
  align-items: center;
`

const ImageC = styled.div`
  width: ${isMobile ? '240px' : '330px'};
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 40px;
`


const UpdateSocialModal = ({ onDismiss,  txSuccess, isReady }) => {
  const handleDismiss = onDismiss || (() => {})

  return (
    <Modal minWidth='346px' title='Updating Socials' onDismiss={handleDismiss} overflow='none'>
      <BorderContainer>
        <Flex alignItems="center" justifyContent="space-between" flexDirection={'column'}>
          {!isReady && !txSuccess ? (
            <>
              <ImageC>
                {/*
                <img
                  src='/dog_error.png'
                  alt='Desktop Logo'
                  className='desktop-icon'
                  style={{ width: '225px', borderRadius: '20px' }}
                /> */}
              </ImageC>
              <TextWrap>Transaction Error. Please try again!</TextWrap>
            </>
          ) : !isReady ? (
            <>
              <ImageC>
                {/*
                <img
                  src='/dog_investing.png'
                  alt='Desktop Logo'
                  className='desktop-icon'
                  style={{ width: '225px', borderRadius: '20px' }}
                />
                */}
              </ImageC>
              <TextWrap>Fueling the Media...</TextWrap>
            </>
          ) : (
            <>
              {txSuccess ? (
                <>
                 <ImageC>
                    {/*
                 <img
                   src='/dog_investing.png'
                   alt='Desktop Logo'
                   className='desktop-icon'
                   style={{ width: '225px', borderRadius: '20px' }}
                 />
                 */}
               </ImageC>
               <TextWrap>You have successfully updated the logo and socials.</TextWrap>
             </>
              ) : (
                <>
                  <ImageC>
                    {/*
                    <img
                      src='/dog_error.png'
                      alt='Desktop Logo'
                      className='desktop-icon'
                      style={{ width: '225px', borderRadius: '20px' }}
                    />
                    */}
                  </ImageC>
                  <TextWrap>Error. Please try again2!</TextWrap>
                </>
              )}
            </>
          )}
        </Flex>
      </BorderContainer>
    </Modal>
  )
}

export default UpdateSocialModal