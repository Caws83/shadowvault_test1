import React, { useState } from 'react'
import { Flex, Button, Text, AutoRenewIcon, PresentWonIcon } from 'uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { LotteryTicket, LotteryTicketClaimData, Token } from 'config/constants/types'
import { getBalanceAmount } from 'utils/formatBalance'
import { useLottery } from 'state/lottery/hooks'
import { fetchUserLotteries } from 'state/lottery'
import { useAppDispatch } from 'state'
import Balance from 'components/Balance'
import { ToastDescriptionWithTx } from 'components/Toast'
import useToast from 'hooks/useToast'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { lotteryV3Abi } from 'config/abi/lotteryV3'
import { getAddress } from 'utils/addressHelpers'
import { getLotteryAddress } from 'state/lottery/helpers'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

interface ClaimInnerProps {
  lotteryToken: Token
  roundsToClaim: LotteryTicketClaimData[]
  lottoPrice: BigNumber
  onSuccess?: () => void
}

const ClaimInnerContainer: React.FC<ClaimInnerProps> = ({ lotteryToken, onSuccess, roundsToClaim, lottoPrice }) => {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { maxNumberTicketsPerBuyOrClaim, currentLotteryId, chainId } = useLottery(lotteryToken)
  const { toastSuccess, toastError } = useToast()
  const [activeClaimIndex, setActiveClaimIndex] = useState(0)
  const [pendingTx, setPendingTx] = useState(false)
  const maxNumberTicketsPerBuyOrClaimBIG = new BigNumber(maxNumberTicketsPerBuyOrClaim)
  const [pendingBatchClaims, setPendingBatchClaims] = useState(
    Math.ceil(
      roundsToClaim[activeClaimIndex].ticketsWithUnclaimedRewards.length / maxNumberTicketsPerBuyOrClaimBIG.toNumber(),
    ),
  )
  const activeClaimData = roundsToClaim[activeClaimIndex]

  // const dex = useLotteryDex(lotteryToken)
  // const lottoPrice = useLottoPrice( lotteryToken, dex)
  const cakeReward = new BigNumber(activeClaimData.cakeTotal.toString())
  const dollarReward = cakeReward.times(lottoPrice)
  const rewardAsBalance = getBalanceAmount(cakeReward, lotteryToken.decimals).toNumber()
  const dollarRewardAsBalance = getBalanceAmount(dollarReward, lotteryToken.decimals).toNumber()

  const parseUnclaimedTicketDataForClaimCall = (ticketsWithUnclaimedRewards: LotteryTicket[], lotteryId: string) => {
    const ticketIds = ticketsWithUnclaimedRewards.map((ticket) => {
      return ticket.id
    })
    const brackets = ticketsWithUnclaimedRewards.map((ticket) => {
      return ticket.rewardBracket
    })
    return { lotteryId, ticketIds, brackets }
  }

  const claimTicketsCallData = parseUnclaimedTicketDataForClaimCall(
    activeClaimData.ticketsWithUnclaimedRewards,
    activeClaimData.roundId,
  )

  const shouldBatchRequest = maxNumberTicketsPerBuyOrClaimBIG.lt(claimTicketsCallData.ticketIds.length)

  const handleProgressToNextClaim = () => {
    if (roundsToClaim.length > activeClaimIndex + 1) {
      // If there are still rounds to claim, move onto the next claim
      setActiveClaimIndex(activeClaimIndex + 1)
      dispatch(fetchUserLotteries({ account, currentLotteryId, lotteryToken, chainId }))
    } else {
      onSuccess()
    }
  }

  const getTicketBatches = (ticketIds: string[], brackets: number[]): { ticketIds: string[]; brackets: number[] }[] => {
    const requests = []
    const maxAsNumber = maxNumberTicketsPerBuyOrClaimBIG.toNumber()

    for (let i = 0; i < ticketIds.length; i += maxAsNumber) {
      const ticketIdsSlice = ticketIds.slice(i, maxAsNumber + i)
      const bracketsSlice = brackets.slice(i, maxAsNumber + i)
      requests.push({ ticketIds: ticketIdsSlice, brackets: bracketsSlice })
    }

    return requests
  }

  const handleClaim = async () => {
    const { lotteryId, ticketIds, brackets } = claimTicketsCallData
    setPendingTx(true)
    try {
      const { request } = await simulateContract(config, {
        abi: lotteryV3Abi,
        address: getAddress(getLotteryAddress(lotteryToken.symbol), chainId),
        functionName: 'claimTickets',
        args: [lotteryId, ticketIds, brackets],
        chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt
      if (receipt.status === 'success') {
        toastSuccess(
          t('Prizes Collected!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Your %symbol% prizes for round %lotteryId% have been sent to your wallet', {
              symbol: lotteryToken.symbol,
              lotteryId,
            })}
          </ToastDescriptionWithTx>,
        )
        setPendingTx(false)
        handleProgressToNextClaim()
      }
    } catch (error) {
      console.error(error)
      toastError(t('Error'), t('%error% - Please try again.', { error: (error as Error).message }))
      setPendingTx(false)
    }
  }

  const handleBatchClaim = async () => {
    const { lotteryId, ticketIds, brackets } = claimTicketsCallData
    const ticketBatches = getTicketBatches(ticketIds, brackets)
    const transactionsToFire = ticketBatches.length
    const receipts = []
    setPendingTx(true)
    // eslint-disable-next-line no-restricted-syntax
    for (const ticketBatch of ticketBatches) {
      try {
        /* eslint-disable no-await-in-loop */
        const { request } = await simulateContract(config, {
          abi: lotteryV3Abi,
          address: getAddress(getLotteryAddress(lotteryToken.symbol), chainId),
          functionName: 'claimTickets',
          args: [lotteryId, ticketBatch.ticketIds, ticketBatch.brackets],
          chainId
        })
        const data = await writeContract(config, request)
        const receipt = await waitForTransactionReceipt(config, {hash: data})
        /* eslint-enable no-await-in-loop */
        if (receipt.status === 'success') {
          // One transaction within batch has succeeded
          receipts.push(receipt)
          setPendingBatchClaims(transactionsToFire - receipts.length)

          // More transactions are to be done within the batch. Issue toast to give user feedback.
          if (receipts.length !== transactionsToFire) {
            toastSuccess(
              t('Prizes Collected!'),
              <ToastDescriptionWithTx txHash={receipt.transactionHash}>
                {t(
                  'Claim %claimNum% of %claimTotal% for round %lotteryId% was successful. Please confirm the next transaction',
                  {
                    claimNum: receipts.length,
                    claimTotal: transactionsToFire,
                    lotteryId,
                  },
                )}
              </ToastDescriptionWithTx>,
            )
          }
        }
      } catch (error) {
        console.error(error)
        setPendingTx(false)
        toastError(t('Error'), t('%error% - Please try again.', { error: (error as Error).message }))
        break
      }
    }

    // Batch is finished
    if (receipts.length === transactionsToFire) {
      setPendingTx(false)
      toastSuccess(
        t('Prizes Collected!'),
        t('Your %symbol% prizes for round %lotteryId% have been sent to your wallet', {
          symbol: lotteryToken.symbol,
          lotteryId,
        }),
      )
      handleProgressToNextClaim()
    }
  }

  return (
    <>
      <Flex flexDirection="column">
        <Text mb="4px" textAlign={['center', null, 'left']}>
          {t('You won')}
        </Text>
        <Flex
          alignItems={['flex-start', null, 'center']}
          justifyContent={['flex-start', null, 'space-between']}
          flexDirection={['column', null, 'row']}
        >
          <Balance
            textAlign={['center', null, 'left']}
            lineHeight="1.1"
            value={rewardAsBalance}
            fontSize="44px"
            bold
            color="secondary"
            unit={` ${lotteryToken.symbol}!`}
          />
          <PresentWonIcon ml={['0', null, '12px']} width="64px" />
        </Flex>
        <Balance
          mt={['12px', null, '0']}
          textAlign={['center', null, 'left']}
          value={dollarRewardAsBalance}
          fontSize="12px"
          color="textSubtle"
          unit=" USD"
          prefix="~"
        />
      </Flex>

      <Flex alignItems="center" justifyContent="center">
        <Text mt="8px" fontSize="12px" color="textSubtle">
          {t('Round')} #{activeClaimData.roundId}
        </Text>
      </Flex>
      <Flex alignItems="center" justifyContent="center">
        <Button
          isLoading={pendingTx}
          endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
          mt="20px"
          width="100%"
          onClick={() => (shouldBatchRequest ? handleBatchClaim() : handleClaim())}
        >
          {pendingTx ? t('Claiming') : t('Claim')} {pendingBatchClaims > 1 ? `(${pendingBatchClaims})` : ''}
        </Button>
      </Flex>
    </>
  )
}

export default ClaimInnerContainer
