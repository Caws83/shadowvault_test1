import React, { useState } from 'react'
import { AutoRenewIcon, Button, Flex, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { NFTPool } from 'state/types'
import { Token } from 'config/constants/types'
import useNftHarvest from 'views/NftPools/hooks/useHarvest'
import Balance from 'components/Balance'
import BigNumber from 'bignumber.js'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
import { getBalanceNumber } from 'utils/formatBalance'
import { ActionContainer, ActionContent, ActionTitles } from '../NftPoolsTable/ActionPanel/styles'

interface ViewPreviousProps {
  pool: NFTPool
  token: Token
  reward: BigNumber
  index: number
}

const ViewPrevious: React.FC<ViewPreviousProps> = ({ pool, token, reward, index }) => {
  const { t } = useTranslation()
  const { onNftPrevHarvest, onClear } = useNftHarvest(pool)
  const { toastSuccess, toastError } = useToast()

  const [pendingTx, setPendingTx] = useState(false)
  const [pendingTx2, setPendingTx2] = useState(false)
  const hasOld = pool.userData ? pool.userData.hasOld : false
  const hasReward = new BigNumber(reward).gt(0)

  const earningTokenPrice = useGetTokenPrice(pool.dex, token)
  const earningTokenBalance = getBalanceNumber(new BigNumber(reward), token.decimals)
  const earningTokenDollarBalance = getBalanceNumber(
    new BigNumber(reward).multipliedBy(earningTokenPrice),
    token.decimals,
  )

  const onConfirm = async () => {
    setPendingTx(true)
    try {
      await onNftPrevHarvest(index)
      toastSuccess(`${t('Unstaked')}!`, t('Your Previous earnings have been sent to your wallet!'))
      setPendingTx(false)
    } catch {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx(false)
    }
  }

  const onClickClear = async () => {
    setPendingTx2(true)
    try {
      await onClear(index)
      toastSuccess(`${t('Cleared')}!`, t('Your Previous earnings have been Cleared!'))
      setPendingTx2(false)
    } catch {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx2(false)
    }
  }

  return (
    hasReward && (
      <ActionContainer>
        <>
          <ActionContent>
            <ActionTitles>
              <Flex flexDirection="column">
                <Text fontSize="12px" bold color="secondary" as="span" textTransform="uppercase">
                  {token.symbol}{' '}
                </Text>
                <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
                  {t('Earned')}
                </Text>
              </Flex>
            </ActionTitles>

            <Flex flexDirection="column">
              <Balance lineHeight="1" bold fontSize="20px" decimals={3} value={earningTokenBalance} />
              <Balance
                display="inline"
                fontSize="12px"
                color="textSubtle"
                decimals={2}
                prefix="~"
                value={earningTokenDollarBalance}
                unit=" USD"
              />
            </Flex>
          </ActionContent>

          <Flex flexDirection="row">
            <Button
              variant="secondary"
              width="100%"
              style={{ marginRight: '15px' }}
              disabled={!hasOld}
              isLoading={pendingTx}
              onClick={onClickClear}
              endIcon={pendingTx2 ? <AutoRenewIcon spin color="currentColor" /> : null}
            >
              {pendingTx2 ? t('Confirming') : t('Forfeit')}
            </Button>

            <Button
              width="100%"
              style={{ marginRight: '15px' }}
              disabled={!hasOld}
              isLoading={pendingTx}
              onClick={onConfirm}
              endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
            >
              {pendingTx ? t('Confirming') : t('Harvest')}
            </Button>
          </Flex>
        </>
      </ActionContainer>
    )
  )
}

export default ViewPrevious
