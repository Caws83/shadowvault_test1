import { Button, Flex, Modal, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import React from 'react'
import { BigNumber } from 'bignumber.js'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import useRefresh from 'hooks/useRefresh'
import { Ifo } from 'config/constants/types'
import { useFinalizeRound } from 'views/Ifos/hooks/v3/useIfo'
import { PublicIfoData } from 'views/Ifos/types'

const BorderContainer = styled.div`
  padding: 16px;
  border: 3px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 32px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.background};
`

const ConfirmFinalize: React.FC<{
  onDismiss?: () => void
  account,
  ifo: Ifo,
  publicIfoData: PublicIfoData

 
}> = ({ account, ifo, publicIfoData, onDismiss }) => {
  const { t } = useTranslation()
  const {chain} = useAccount()
  const { onFinalize } = useFinalizeRound(ifo)

  const onClickFinalize = () => {
    onFinalize()
  }

  const chainId = ifo.dex.chainId
  const wbonePrice = useGetWcicPrice(ifo.dex)

    const bnbRaised = new BigNumber(publicIfoData.poolBasic.totalAmountPool)
    const feeToTake = bnbRaised.multipliedBy(publicIfoData.fgFee).dividedBy(1000)
    const bnbForLP = bnbRaised.minus(feeToTake).multipliedBy(publicIfoData.percentToLiquidy).dividedBy(100)
    const tokenForLP = publicIfoData.listingPrice.shiftedBy(-ifo.token.decimals).multipliedBy(bnbForLP)

    const madeSoft = bnbRaised.gte(publicIfoData.softCap)
    const madeHard = bnbRaised.eq(publicIfoData.hardCap)

  const handleDismiss = () => {
    onDismiss()
  }

  return (
    <Modal minWidth="346px" title="Confirm Finalizing Pre-Sale:" onDismiss={handleDismiss} overflow="none">
      <BorderContainer>
        <Flex justifyContent="space-between">
          <Text color="secondary">{t('Token')}:</Text>
          <Text>{`${ifo.name}`}</Text>
        </Flex>
       
                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('Status')}:</Text>
                  <Text>{madeHard ? "Hard Cap Hit" : madeSoft ? "SoftCap Hit" : "Not Enough Raised"}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('AutoLP')}:</Text>
                  <Text>{`${publicIfoData.percentToLiquidy.gt(0) ? "True" : "False"}`}</Text>
                </Flex>

                {publicIfoData.percentToLiquidy.gt(0) &&
<>
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                  <Text color="textSubtle">{t(`Listing Price`)}:</Text>
                  <Text>{`${publicIfoData.listingPrice
                    .shiftedBy(-ifo.token.decimals)
                    .toFixed(9)} ${ifo.token.symbol} / ${chain.nativeCurrency.symbol}`}</Text>
                  <Text>{`${bnbForLP
                    .shiftedBy(-ifo.token.decimals)
                    .dividedBy(tokenForLP.shiftedBy(-18))
                    .multipliedBy(wbonePrice.toString())
                    .toNumber()
                    .toLocaleString('en-US', { maximumFractionDigits: 9 })} USD / ${ifo.token.symbol}`}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('% to LP')}:</Text>
                  <Text>{`${publicIfoData.percentToLiquidy.toFixed(0)} %`}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('BNB to LP')}:</Text>
                  <Text>{`${bnbForLP.shiftedBy(-18).toFixed(5)}`}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('Tokens to LP')}:</Text>
                  <Text>{`${tokenForLP.shiftedBy(-ifo.token.decimals).toFixed(2)}`}</Text>
                </Flex>

                <Flex justifyContent="space-between">
                  <Text color="secondary">{t('Days to Lock')}:</Text>
                  <Text>{`${publicIfoData.lockLength.toFixed(0)} Days`}</Text>
                </Flex>
</>
                
                }

            <Flex justifyContent="center" alignItems="center" m="16px">
            <Button width="75%" variant="secondary" onClick={onClickFinalize}>
              Finalize Sale
            </Button>
            </Flex>

       
      </BorderContainer>

      <BorderContainer>
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
          <Text>Finalzing will do the following:</Text>
        {madeHard ? (
          <>
            <Text>{`Send Your Portion of ${chain.nativeCurrency.symbol} to your wallet.`}</Text>
            {publicIfoData.percentToLiquidy.gt(0) &&
              <>
                <Text>Create LP and List token for Trade.</Text>
                <Text>Create a LP lock for set amount of days.</Text>
              </>
            }
          </>
        ) : madeSoft ? (
          <>
            <Text>{`Send Remaining ${ifo.token.symbol} Token, & ${chain.nativeCurrency.symbol} to your wallet.`}</Text>
            {publicIfoData.percentToLiquidy.gt(0) &&
              <>
                <Text>Create LP and List token for Trade.</Text>
                <Text>Create a LP lock for set amount of days.</Text>
              </>
            }
          </>
        ) : (
          <Text>{`Send All ${ifo.token.symbol} Token back to your wallet.`}</Text>
        )}
      
      <Text> Anyone who entered into your pre-sale will need to claim.</Text>
      </Flex>
      </BorderContainer>

      
    </Modal>
  )
}

export default ConfirmFinalize
