import { useReadContract, useReadContracts } from "wagmi"
import { LOTTERY, LOTTERYNFT } from "../config/marketPlace"
import { lotteryAbi } from "../config/abi/lottery"
import { useEffect, useState } from "react"
import { Flex, Text } from "../uikit"
import { nftLotteryAbi } from "../config/abi/nftLottery"
import { Address } from "viem"


const LotteryCard: React.FC<React.PropsWithChildren<{
    collectionAddress: Address, 
    nftId: bigint, 
    chainId: number,
}>> = ({
    collectionAddress,
    nftId,
    chainId
}) => {

    const [ howMany, setHM ] = useState(0n)
    const [ used, setUsed ] = useState(0n)
    const [ rarity, setRarity ] = useState(0n)

 
const {data, isLoading } = useReadContracts({
    contracts: [
      {
        address: LOTTERY,
        abi: lotteryAbi,
        functionName: "claimedByTokenId",
        args: [collectionAddress, nftId],
        chainId: chainId,
      },
      {
        address: LOTTERYNFT,
        abi: nftLotteryAbi,
        functionName: "getTokenRarity",
        args: [nftId],
        chainId: chainId
      },
      {
        address: LOTTERY,
        abi: lotteryAbi,
        functionName: "howMany",
        args: [collectionAddress, rarity],
        chainId: chainId,
      }
      
    ],
  })



  useEffect(() => {
    if(!isLoading){
      setHM(data[2].result ?? 0n)
      setUsed(data[0].result ?? 0n)
      setRarity(data[1].result ?? 0n)
    }
  },[data])

  return (
    <Flex justifyContent="space-between" >
    <Flex>
        <Text>
            {(howMany - used).toString()}
        </Text>

        <Text>
            /
        </Text>
        <Text>
            {howMany.toString()}
        </Text>
    </Flex>
        <Text fontSize="12px" color="textSubtle" maxWidth="120px" ellipsis title={'Asking price'}>
            Remaining Tickets
        </Text>
    </Flex>

  )

}

export default LotteryCard