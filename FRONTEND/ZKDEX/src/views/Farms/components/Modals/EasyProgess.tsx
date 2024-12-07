import { ErrorIcon, TimerIcon, VerifiedIcon, WaitIcon, Text, Flex } from 'uikit'
import Spacer from 'components/Modal/Spacer'
import React from 'react'
import { EasyTransactionError, EasyTransactionSteps, EasyTransactionString, TransactionSteps } from 'utils/types'
import Divider from '../Divider'
import FarmSpinner from './FarmSpinner.gif'

interface CompoundModalProps {
  stage: EasyTransactionSteps
  steps: TransactionSteps
  txError: EasyTransactionError
  txMsg?: string
}

const EasyProgress: React.FC<CompoundModalProps> = ({ stage, steps, txError, txMsg }) => {
  const renderStepIcon = (index: number) => {
    if (index === stage.valueOf()) {
      return <TimerIcon />
    }
    if (index < stage.valueOf()) {
      return <VerifiedIcon color="green" />
    }
    return <WaitIcon color="orange" />
  }

  return (
    <>
      {txError !== EasyTransactionError.None && (
        <>
          {txError === EasyTransactionError.Gas ? (
            <>
              <ErrorIcon color="red" />
              <Text>Insufficient tokens to cover gas costs.</Text>
            </>
          ) : (
            <>
              <ErrorIcon color="red" />
              <Text>Transaction failed. {txMsg}</Text>
            </>
          )}
        </>
      )}
      {stage > EasyTransactionSteps.Start && (
        <>
          <Divider />
          <div>
            {Object.keys(steps)
              .filter((element) => {
                return (
                  steps[element] === true &&
                  EasyTransactionSteps[element] !== 'Complete' &&
                  EasyTransactionSteps[element] !== 'Start'
                )
              })
              .map((key) => {
                const index = Number(key)
                return (
                  <Flex key={index}>
                    {renderStepIcon(index)}
                    <Spacer />
                    <Text> {EasyTransactionString[index]}</Text>
                    {stage === EasyTransactionSteps.Initializing && (
                      <>
                        <Spacer /> <img src={FarmSpinner} height={25} width={25} alt="loading" />
                      </>
                    )}
                  </Flex>
                )
              })}
          </div>
        </>
      )}
    </>
  )
}

export default EasyProgress
