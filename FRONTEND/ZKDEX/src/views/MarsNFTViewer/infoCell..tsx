import React from 'react'
import { Flex, Text } from 'uikit'


interface InfoCellProps {
  data: any
  isMars?: boolean
  rarities?: any
}

const InfoCell: React.FC<InfoCellProps> = ({ data, isMars, rarities }) => {

  return (
    <>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text fontSize="12px" color="textSubtle">Name:</Text>
        <Text fontSize="12px" color="text">{data.name}</Text>
      </Flex>
    {data.attributes.map((att) => (
  
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text fontSize="12px" color="textSubtle">{att.trait_type}</Text>
        <Text fontSize="12px" color="text">{att.value}</Text>
        {isMars && <Text fontSize="12px" color="text">{`${rarities[att.trait_type][att.value]} %`}</Text>}
      </Flex>
    ))}
 
    </>
  )
}

export default InfoCell
