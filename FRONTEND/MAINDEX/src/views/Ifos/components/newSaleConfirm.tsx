import { Button, Flex, Modal, Text, useModal } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import { ToastDescriptionWithTx } from 'components/Toast'
import contracts from 'config/constants/contracts'
import useToast from 'hooks/useToast'
import { getAddress } from 'utils/addressHelpers'
import { BigNumber } from 'bignumber.js'
import styled from 'styled-components'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { Dex } from 'config/constants/types'
import { IFOFactoryAbiV3 } from 'config/abi/IFOFactoryV3'
import useRefresh from 'hooks/useRefresh'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { Address, TransactionReceipt } from 'viem'
import CreatedPresaleModal from './CreatedPresaleModal'

const BorderContainer = styled.div`
  padding: 16px;
  border: 3px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.background};
`

interface createInfo {
  tokenAddress: Address
  cBalance: BigNumber
  cSym: string
  cDec: number
  cName: string
  tokenAmount: BigNumber
  tokenAmountBasic: BigNumber
  tokenGoalBasic: BigNumber
  tokenLimitBasic: BigNumber
  devWallet: string
  startDate: Date
  endDate: Date
  softCap: BigNumber
  hardCap: BigNumber
  fee: BigNumber
  feeOfSales: BigNumber
  LPPercent: number
  listingPrice: BigNumber
  salePrice: BigNumber
  lockDays: number
  router: Address
  burnLP: boolean
  socials: string[]
}

const ConfirmCreate: React.FC<{
  onDismiss?: () => void
  account
  info: createInfo
  bonePrice: BigNumber
  boneBalance: BigNumber
  dex: Dex
  resetTokenAddress?: () => void;
}> = ({ account, info, bonePrice, boneBalance, dex, onDismiss, resetTokenAddress }) => {
  const { t } = useTranslation()
  const { chain } = useAccount()

  const chainId = dex.chainId

  const {
    tokenAddress,
    cBalance,
    cDec,
    cSym,
    cName,
    tokenAmount,
    tokenAmountBasic,
    tokenGoalBasic,
    tokenLimitBasic,
    devWallet,
    startDate,
    endDate,
    softCap,
    hardCap,
    fee,
    feeOfSales,
    LPPercent,
    listingPrice,
    salePrice,
    lockDays,
    router,
    burnLP,
    socials,
  } = info
  const { toastSuccess, toastError } = useToast()
  const { fastRefresh } = useRefresh()
  const spender = getAddress(contracts.ifoFactoryV3, chainId)
  const [isApproved, setIsApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [hash, setHash] = useState<string>()

  useEffect(() => {
    async function go () {
      const data = await readContract(config, {
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: 'allowance',
        args: [account, spender],
        chainId,
      })
      const currentAllowance = new BigNumber(data.toString())
      setIsApproved(currentAllowance.gte(tokenAmount))
      if (currentAllowance.gte(tokenAmount)) setIsApproving(false)
    }
    go()
  }, [fastRefresh, tokenAmount])
 
  const handleDismiss = () => {
    onDismiss()
  }

  const handleClick = async () => {
    if (resetTokenAddress) {
      resetTokenAddress();
    }
    if (!isApproved) {
      setIsApproving(true)
      console.log('approving')
      setIsApproving(true)
      try {
      const approveAmount = tokenAmount.multipliedBy(1.01).toFixed(0)
      const { request } = await simulateContract(config, {
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: 'approve',
        args: [spender, approveAmount],
        chainId,
      })
      const hash = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, { hash }) as TransactionReceipt
      if(receipt.status) {
        toastSuccess(
          t('Contract enabled - Now Creating Presale'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      } else {
        toastError(t('Approval Failed'))
      }
    } catch {
      toastError(t('Approval Failed'))
    }
      setIsApproving(false)
    }
    console.log('confirming')
      const cost = fee.toFixed(0)
      const basicAmount = tokenAmountBasic.toFixed(0)
      const basicGoal = tokenGoalBasic.toFixed(0)
      const basicLimit = tokenLimitBasic.toFixed(0)
      const start = Math.floor(startDate.getTime() / 1000)
      const end = Math.floor(endDate.getTime() / 1000)
      const soft = softCap.toFixed(0)
      const LPPercentRaw = LPPercent.toFixed(0)
      const listingPriceRaw = listingPrice.toFixed(0)
      const lockDaysRaw = lockDays.toFixed(0)

    try {
      const { request } = await simulateContract(config, {
        abi: IFOFactoryAbiV3,
        address: getAddress(contracts.ifoFactoryV3, chainId),
        functionName: 'createSale',
        args: [
          tokenAddress,
          [basicAmount, basicGoal, basicLimit, soft, LPPercentRaw, listingPriceRaw, lockDaysRaw, start, end],
          [devWallet, router],
          burnLP,
          socials,
        ],
        value: cost,
        chainId,
      })
      const hash = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, { hash }) as TransactionReceipt
      if(receipt.status) {
        onDismiss()
        //toastSuccess(t('Pre Sale Created!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
        setHash(receipt.transactionHash)
        onPresentCreatedPresaleModal()

      } else {
        toastError(t('Creation Failed'))
      }
    } catch {
      toastError(t('Creation Failed'))
    }
      
  };

  function formatDateToDDMMHHMM(date: Date): string {

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${day}/${month} ${hours}:${minutes}`;
  }

  const [onPresentCreatedPresaleModal] = useModal(
    <CreatedPresaleModal receipt={hash} />
  );

  const capitalizeFirstLetter = string => {
    if (!string) return string
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const feeToTake = tokenGoalBasic.multipliedBy(feeOfSales).dividedBy(1000)
  const bnbForLiquidityBIG = tokenGoalBasic.minus(feeToTake).multipliedBy(LPPercent).dividedBy(100)
  const tokensForLP = listingPrice.shiftedBy(-cDec).multipliedBy(bnbForLiquidityBIG)

  return (
    <Modal minWidth='330px' title='Approve Presale Creation' onDismiss={handleDismiss} overflow='none'>
      <BorderContainer>
    {LPPercent > 0 &&
      <Text color="red" fontSize="10px" style={{  paddingTop: 0, paddingBottom: 20 }}>
        If your token has Taxes. Please ensure you exclude the Newly Created PreSale Contract from Taxes. Or the Auto LP will be charged the taxes on LP Creation.    
      </Text>
    }

        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Token')}:</Text>
          <Text>{`${cName}`}</Text>
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t(`Total Tokens Needed (${cSym})`)}:</Text>
          <Text>{`${tokenAmount
            .shiftedBy(-cDec)
            .toNumber()
            .toLocaleString('en-US', { maximumFractionDigits: 0 })}`}</Text>
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('SoftCap')}:</Text>
          <Text>
            {softCap.shiftedBy(-18).toNumber() < 1
              ? `${softCap.shiftedBy(-18).toNumber().toLocaleString('en-US', { maximumFractionDigits: 2 })}`
              : `${softCap.shiftedBy(-18).toNumber().toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          </Text>{' '}
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('HardCap')}:</Text>
          <Text>
            {hardCap.shiftedBy(-18).toNumber() < 1
              ? `${hardCap.shiftedBy(-18).toNumber().toLocaleString('en-US', { maximumFractionDigits: 2 })}`
              : `${hardCap.shiftedBy(-18).toNumber().toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          </Text>{' '}
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Start')}:</Text>
          <Text>
            {formatDateToDDMMHHMM(startDate)}
          </Text>{' '}
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('End')}:</Text>
          <Text>
          {formatDateToDDMMHHMM(endDate)}
          </Text>{' '}
        </Flex>

        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Dex')}:</Text>
          <Text>{dex.info.name}</Text>
        </Flex>
        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('Router')}:</Text>
          <Text>{`${router.slice(0, 4)}...${router.slice(-4)}`}</Text>
        </Flex>

        <Flex justifyContent='space-between'>
          <Text color='secondary'>{t('AutoLP')}:</Text>
          <Text>{`${LPPercent > 0 ? 'True' : 'False'}`}</Text>
        </Flex>

        {LPPercent > 0 && (
          <>
            <Flex justifyContent='space-between'>
              <Text color='secondary'>{t('% to LP')}:</Text>
              <Text>{`${LPPercent.toLocaleString('en-US', { maximumFractionDigits: 9 })} %`}</Text>
            </Flex>

            <Flex justifyContent='space-between'>
              <Text color='secondary'>{t('Days to Lock')}:</Text>
              <Text>{`${lockDays.toLocaleString('en-US', { maximumFractionDigits: 9 })}`}</Text>
            </Flex>

            <Flex justifyContent='space-between'>
              <Text color='secondary'>{t('Burn LP')}:</Text>
              <Text>{capitalizeFirstLetter(burnLP.toString())} </Text>
            </Flex>
          </>
        )}

        <Flex flexDirection='column' justifyContent='space-between'>
          <Text style={{ paddingTop: 10, paddingBottom: 10 }} color='secondary'>
            {t(`Sale Price`)}:
          </Text>
          <Text>{`${salePrice
            .shiftedBy(-18)
            .toNumber()
            .toLocaleString('en-US', { maximumFractionDigits: 9 })} ${cSym}/${chain.nativeCurrency.symbol}`}</Text>
          <Text>{`${salePrice
            .shiftedBy(-18)
            .dividedBy(tokensForLP)
            .multipliedBy(bonePrice.toString())
            .toNumber()
            .toLocaleString('en-US', { maximumFractionDigits: 9 })} ~USD/${cSym}`}</Text>
        </Flex>

        <Flex flexDirection='column' justifyContent='space-between'>
          <Text style={{ paddingTop: 10, paddingBottom: 10 }} color='secondary'>
            {t(`Listing Price`)}:
          </Text>
          <Text>{`${listingPrice
            .shiftedBy(-18)
            .toNumber()
            .toLocaleString('en-US', { maximumFractionDigits: 9 })} ${cSym}/${chain.nativeCurrency.symbol}`}</Text>
          <Text>{`${salePrice
            .shiftedBy(-18)
            .dividedBy(tokensForLP)
            .multipliedBy(bonePrice.toString())
            .toNumber()
            .toLocaleString('en-US', { maximumFractionDigits: 9 })} ~USD/${cSym}`}</Text>
        </Flex>

        <Text style={{  paddingTop: 20, paddingBottom: 0 }}>
          {t('There is a cost of %fee% %symbol% for creating a presale. A %feeOfSales%% commission is taken on the amount raised.', {
            fee: fee.shiftedBy(-18).toFixed(0),
            feeOfSales: feeOfSales.dividedBy(10).toNumber(),
            symbol: chain.nativeCurrency.symbol,
          })}
        </Text>
      </BorderContainer>

      <Flex justifyContent="center" mt="10px" mb="20px">
        <Flex justifyContent="center" mt="10px" mb="20px">
          <Button onClick={handleClick} disabled={isApproving}>
            {isApproving ? "Approving" : t('Create PreSale')}
          </Button>
        </Flex>
      </Flex>
{/*
      <ApproveConfirmButtons
        isApproveDisabled={isApproved}
        isApproving={isApproving}
        isConfirmDisabled={disableBuying}
        isConfirming={isConfirming}
        onApprove={handleApprove}
        onConfirm={handleConfirm}
        buttonArrangement={ButtonArrangement.SEQUENTIAL}
        confirmLabel={t('Create PreSale')}
        confirmId='presaleCreation'
      />
      */}
    </Modal>
  )
}

export default ConfirmCreate
