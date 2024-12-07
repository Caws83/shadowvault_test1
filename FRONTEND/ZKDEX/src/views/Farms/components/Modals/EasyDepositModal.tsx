import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import {
  Flex,
  Text,
  Button,
  Modal,
  LinkExternal,
  CalculateIcon,
  IconButton,
  WarningIcon,
  ButtonMenu,
  ButtonMenuItem,
  Box,
} from 'uikit'
import { getETHER } from 'sdk'
import { ModalActions, ModalInput } from 'components/Modal'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance, formatNumber } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
import { getInterestBreakdown } from 'utils/compoundApyHelpers'
import { Token } from 'config/constants/types'
import { EasyTransactionError, EasyTransactionSteps, TransactionSteps } from 'utils/types'
import { fetchFarmUserDataAsync } from 'state/farms'
import { useAppDispatch } from 'state'
import EasySelect from 'components/Select/EasySelect'
import { fetchTokenBalances, useFarmUser, useHostPricesBusd, usePriceBnbBusd } from 'state/farms/hooks'
import tokens from 'config/constants/tokens'
import { Farm } from 'state/types'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
// mport { useGetLockInfo } from '../../hooks/useFarmManage'
import { useStakeFarmsFromHost, useStakeFromToken } from '../../hooks/useStakeFarms'
import EasyProgress from './EasyProgess'
import { useAccount } from 'wagmi'
import { BIG_ZERO } from 'utils/bigNumber'
import { useApproveFarmFromHost } from 'views/Farms/hooks/useApproveFarm'
import { usePaymaster } from 'hooks/usePaymaster'
import { useGasTokenManager } from 'state/user/hooks'
import PayMasterPreview from 'components/Menu/UserMenu/payMasterPreview'

const AnnualRoiContainer = styled(Flex)`
  cursor: pointer;
`

const AnnualRoiDisplay = styled(Text)`
  width: 72px;
  max-width: 72px;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
`

interface EasyDepositModalProps {
  max: BigNumber
  stakedBalance: BigNumber
  multiplier?: string
  lpPrice: BigNumber
  lpLabel?: string
  onDismiss?: () => void
  tokenName?: string
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
  cakePrice?: BigNumber
  fgPrice?: number
  farm: Farm
}

const EasyDepositModal: React.FC<EasyDepositModalProps> = ({
  max,
  stakedBalance,
  onDismiss,
  tokenName = '',
  multiplier,
  displayApr,
  lpPrice,
  lpLabel,
  apr,
  addLiquidityUrl,
  farm,
  cakePrice,
}) => {
  const { isLocked, lockFee, host, chainId } = farm
  const { isLocker } = host
  const { address: account } = useAccount()
  // const publicClient = usePublicClient({chainId})
  const [val, setVal] = useState('0')
  const ETHER = getETHER(chainId) as Token
  const [inToken, setInToken] = useState<Token>(ETHER)
  const [tokenBalance, setTokenBalance] = useState(new BigNumber(0))
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [useFG, setUseFG] = useState(false)
  const [txMsg, setTxMsg] = useState('')
  const [txError, setTxError] = useState(EasyTransactionError.None)
  const [stage, setStage] = useState(EasyTransactionSteps.Start)
  const [showRoiCalculator, setShowRoiCalculator] = useState(false)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { onApprove } = useApproveFarmFromHost(farm.host, farm.lpAddresses)
  const { balance } = useGetBnbBalance(chainId)
  const { fetchPaymaster } = usePaymaster()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()



  const _setStage = (step: EasyTransactionSteps) => {
    setStage(step)
  }

  useEffect(() => {
    const fetchToken = async () => {
      let priceBN = new BigNumber(0)
      if(inToken.symbol === ETHER.symbol){
        // const walletBalance = await publicClient.getBalance({ address: account })
        // balanceBN = new BigNumber(walletBalance.toString())
        priceBN = balance ?? new BigNumber(0)
      } else {
        const price = await fetchTokenBalances(account, inToken, chainId)
        priceBN = new BigNumber(price)
      }
      setTokenBalance(priceBN)
    }
    fetchToken()
  }, [account, inToken, balance])


  const _setError = (error: EasyTransactionError, msg?: string) => {
    setTxError(error)
    if (msg !== null && msg !== undefined) {
      setTxMsg(msg)
    }
  }

  const steps: TransactionSteps = {
    [EasyTransactionSteps.Start]: true,
    [EasyTransactionSteps.Initializing]: true,
    [EasyTransactionSteps.Harvest]: false,
    [EasyTransactionSteps.CreateLP]: true,
    [EasyTransactionSteps.Approval]: true,
    [EasyTransactionSteps.Unstaking]: false,
    [EasyTransactionSteps.RemoveLiquidity]: false,
    [EasyTransactionSteps.Swap1]: false,
    [EasyTransactionSteps.Swap2]: false,
    [EasyTransactionSteps.Swap3]: false,
    [EasyTransactionSteps.Liquidity]: false,
    [EasyTransactionSteps.Deposit]: true,
    [EasyTransactionSteps.Complete]: true,
  }

  const { onStakeToken } = useStakeFromToken(
    farm,
    inToken.symbol === ETHER.symbol ? tokens.wNative : inToken,
    _setStage,
    _setError,
  )

  const { onStake } = useStakeFarmsFromHost(farm.host, farm.pid, 18)
  const hostPrices = useHostPricesBusd()
  const bnbPrice = usePriceBnbBusd(farm.dex)

  const fullFGBalance = useMemo(() => {
    return getFullDisplayBalance(tokenBalance, inToken.decimals)
  }, [tokenBalance, inToken])

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const lpTokensToStake = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)
  const fullFGBalanceNumber = new BigNumber(fullFGBalance)

  let usdToStake = BIG_ZERO
  if (useFG) {
    usdToStake = lpTokensToStake.times(
      inToken.symbol === ETHER.symbol ? bnbPrice : hostPrices[inToken.symbol],
    )
  } else {
    usdToStake = lpTokensToStake.times(lpPrice)
  }

  const interestBreakdown = getInterestBreakdown({
    principalInUSD: !lpTokensToStake.isNaN() ? usdToStake.toNumber() : 0,
    apr,
    earningTokenPrice: cakePrice.toNumber(),
  })

  const annualRoi =
    inToken.symbol === ETHER.symbol
      ? new BigNumber(bnbPrice.toString()).times(interestBreakdown[3])
      : new BigNumber(hostPrices[inToken.symbol]).times(interestBreakdown[3])
  const formattedAnnualRoi = formatNumber(
    annualRoi.toNumber(),
    annualRoi.gt(10000) ? 0 : 2,
    annualRoi.gt(10000) ? 0 : 2,
  )

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  const handleSelectMaxFG = useCallback(() => {
    setVal(fullFGBalance)
  }, [fullFGBalance, setVal])

  const onChangeOutToken = (token: Token) => {
    if (inToken !== token) {
      setInToken(token)
    }
  }

  const fgCost: string = useMemo<string>(() => {
    const tokenCount = new BigNumber(val)
    const tokenValue = tokenCount.times(inToken.symbol === ETHER.symbol ? bnbPrice : hostPrices[inToken.symbol])
    if (tokenValue.lt(0.001)) {
      return '< 0.001'
    }
    return tokenValue.toFixed(2)
  }, [hostPrices, val, inToken, bnbPrice])

  if (showRoiCalculator) {
    return (
      <RoiCalculatorModal
        linkLabel={t('Get %symbol%', { symbol: lpLabel })}
        stakingTokenBalance={stakedBalance.plus(max)}
        stakingTokenSymbol={tokenName}
        stakingTokenPrice={lpPrice.toNumber()}
        earningTokenPrice={cakePrice.toNumber()}
        earningTokenSymbol={farm.host.payoutToken.symbol}
        apr={apr}
        multiplier={multiplier}
        displayApr={displayApr}
        linkHref={addLiquidityUrl}
        isFarm
        initialValue={usdToStake.dividedBy(lpPrice).toString()}
        onBack={() => setShowRoiCalculator(false)}
      />
    )
  }

  const { allowance } = useFarmUser(farm.id)
  const [requestedApproval, setRequestedApproval] = useState(false)
  const [ isApproved, setIsApproved ] = useState(false)

    useEffect(() => {
      if(!useFG){
        const isApprovedLPToken = account && allowance && new BigNumber(allowance).gte(new BigNumber(val).shiftedBy(18))
        setIsApproved(isApprovedLPToken)
      } else if(inToken.symbol === ETHER.symbol) {
        setIsApproved(true)
      } else {
        setIsApproved(true)
      }
    })

    const handleApprove = useCallback(async () => {
      try {
        setRequestedApproval(true)
        console.log('calling onapprove')
        await onApprove()
        dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
  
        setRequestedApproval(false)
      } catch (e) {
        console.error(e)
      }
    }, [onApprove, dispatch, account, farm.id])
    
    const [paymasterInfo, setPaymasterInfo] = useState<any | null>(null)
    const [ entireError, setEntireError ] = useState<string>(null)


  useEffect(() => {
    setEntireError(undefined)
    
    const fetchRequest = async () => {
      try {
        if (isApproved && account && payWithPM && payToken) {
          const result = await onStake(val, true)
          const info = await fetchPaymaster(result)
          setPaymasterInfo(info)
        } else {
          setPaymasterInfo(undefined)
        }

      } catch (e: any) {
        console.error('Error fetching swap request:', e);
        setEntireError(e.message)
        setPaymasterInfo(undefined)
      }
    };

    fetchRequest();
  }, [ account, payWithPM, payToken, val]); // Dependencies for the effect

  const realLockFee = new BigNumber(lockFee).shiftedBy(-18).toFixed(4)
  const renderBasic = (
    <>
      {!isLocked && isLocker && (
        <>
          <Text>
            <WarningIcon />
            Will also Pay the Lock Fee of <b>{realLockFee}</b> zkCRO.
          </Text>
          <Text>Only for first lock. This will also start the lock time.</Text>
          <br />
        </>
      )}
      <ModalInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
        addLiquidityUrl={addLiquidityUrl}
        inputTitle={t('Deposit')}
      />
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text fontSize="8px" mr="8px" color="textSubtle">
          {t('Annual ROI at current rates')}:
        </Text>
        <AnnualRoiContainer alignItems="center" >
          <AnnualRoiDisplay>${formattedAnnualRoi}</AnnualRoiDisplay>
        </AnnualRoiContainer>
      </Flex>
      <ModalActions>
        <Button
          variant="secondary"
          onClick={() => {
            setStage(EasyTransactionSteps.Start)
            setTxError(EasyTransactionError.None)
            onDismiss()
          }}
          width="100%"
        >
          {txError === EasyTransactionError.None && stage !== EasyTransactionSteps.Complete ? 'Cancel' : 'Close'}
        </Button>
        {stage !== EasyTransactionSteps.Complete && txError === EasyTransactionError.None &&  isApproved ? (
          <Button
            width="100%"
            disabled={
              pendingTx ||
              !lpTokensToStake.isFinite() ||
              lpTokensToStake.eq(0) ||
              lpTokensToStake.gt(fullBalanceNumber) ||
              stage !== EasyTransactionSteps.Start
            }
            onClick={async () => {
              setPendingTx(true)
              try {
                await onStake(val)
                toastSuccess(t('Deposited!'), t('Your funds have been Deposited in the farm'))
              } catch (e) {
                toastError(
                  t('Error'),
                  t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
                )
                console.error(e)
              } finally {
                setPendingTx(false)
                onDismiss()
                dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
              }
            }}
          >
            {pendingTx ? t('Confirming') : t('Confirm')}
          </Button>
        ) : stage !== EasyTransactionSteps.Complete && txError === EasyTransactionError.None && (
          <Button 
              width="100%" 
              disabled={requestedApproval || new BigNumber(val).eq(0)} 
              onClick={handleApprove} 
              variant="secondary">
            {t('Enable')}
          </Button>
        )}
      </ModalActions>
      <LinkExternal href={addLiquidityUrl} style={{ alignSelf: 'center' }}>
        {t('Get %symbol%', { symbol: tokenName })}
      </LinkExternal>
    </>
  )

  const renderFG = (
    <>
      <br />
      {!isLocked && isLocker && (
        <>
          <Text>
            <WarningIcon />
            Will also Pay the Lock Fee of <b>{realLockFee}</b> zkCRO.
          </Text>
          <Text>Only for first lock. This will also start the lock time.</Text>
          <br />
        </>
      )}
      <ModalInput
        value={val}
        onSelectMax={handleSelectMaxFG}
        onChange={handleChange}
        max={fullFGBalance}
        symbol={inToken.symbol}
        addLiquidityUrl={addLiquidityUrl}
        inputTitle={`Deposit $(${fgCost})`}
      />
      <>
        <Box>
          <Text>Input Currency</Text>
          <EasySelect options={[ETHER, tokens.vusd, tokens.zkclmrs, tokens.veth]} onChange={onChangeOutToken} />
        </Box>
        <br />
      </>
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          {t('Annual ROI at current rates')}:
        </Text>
        <AnnualRoiContainer alignItems="center" onClick={() => setShowRoiCalculator(true)}>
          <AnnualRoiDisplay>${formattedAnnualRoi}</AnnualRoiDisplay>
          <IconButton variant="text" scale="sm">
            <CalculateIcon color="textSubtle" width="18px" />
          </IconButton>
        </AnnualRoiContainer>
      </Flex>
      <ModalActions>
        <Button
          variant="secondary"
          onClick={() => {
            setStage(EasyTransactionSteps.Start)
            setTxError(EasyTransactionError.None)
            onDismiss()
            dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
          }}
          width="100%"
        >
          {txError === EasyTransactionError.None && stage !== EasyTransactionSteps.Complete ? 'Cancel' : 'Close'}
        </Button>
        {stage !== EasyTransactionSteps.Complete && txError === EasyTransactionError.None && isApproved ? (
          <Button
            width="100%"
            disabled={
              pendingTx ||
              fullFGBalance === '0' ||
              val === '0' ||
              val === '' ||
              stage !== EasyTransactionSteps.Start ||
              lpTokensToStake.lt(0) ||
              lpTokensToStake.gt(fullFGBalanceNumber)
            }
            onClick={async () => {
              setPendingTx(true)
              await onStakeToken(val)
              setPendingTx(false)
              dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
            }}
          >
            {pendingTx ? t('Confirming') : t('Confirm')}
          </Button>
       ) : stage !== EasyTransactionSteps.Complete && txError === EasyTransactionError.None && (
        <Button width="100%" disabled={requestedApproval} onClick={handleApprove} variant="secondary">
          {t('Enable')}
        </Button>
      )}
      </ModalActions>
      <Text>
        <WarningIcon />
        This will take multiple transactions.
      </Text>
      <br />
      <Text>
        On submitting we will swap your {inToken.symbol} tokens for LP tokens and deposit them in chosen farm.
      </Text>
      <LinkExternal href={addLiquidityUrl} style={{ alignSelf: 'center' }}>
        {t('Get %symbol%', { symbol: tokenName })}
      </LinkExternal>
      <EasyProgress stage={stage} steps={steps} txError={txError} txMsg={txMsg} />
    </>
  )
  return (
    <Modal title={t('Deposit To Farm')} onDismiss={onDismiss} hideCloseButton>
      
      {!isLocker && (
        <Flex justifyContent="center" alignItems="center" mb="24px">
          <ButtonMenu
            activeIndex={useFG ? 0 : 1}
            scale="sm"
            variant="subtle"
            onItemClick={(index) => {
              setVal('0')
              setStage(EasyTransactionSteps.Start)
              setTxError(EasyTransactionError.None)
              setUseFG(!index)
              dispatch(fetchFarmUserDataAsync({ account, ids: [farm.id] }))
            }}
          >
            <ButtonMenuItem as="button">{t('Deposit From...')}</ButtonMenuItem>
            <ButtonMenuItem as="button">{t('Standard')}</ButtonMenuItem>
          </ButtonMenu>
        </Flex>
      )}
        
      {useFG ? renderFG : renderBasic}
      
      <PayMasterPreview paymasterInfo={paymasterInfo} dex={farm.dex} error={entireError}/>
    </Modal>
  )
}

export default EasyDepositModal
