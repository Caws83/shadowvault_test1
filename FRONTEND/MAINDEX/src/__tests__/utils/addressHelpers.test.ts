import { getAddress } from 'utils/addressHelpers'

describe('getAddress', () => {
  const address = {
    109: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    719: '0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe',
  }

  it(`get address for mainnet (chainId 1353)`, () => {
    process.env.REACT_APP_CHAIN_ID = '1353'
    const expected = address[1353]
    expect(getAddress(address)).toEqual(expected)
  })
  it(`get address for testnet (chainId 719)`, () => {
    process.env.REACT_APP_CHAIN_ID = '719'
    const expected = address[719]
    expect(getAddress(address)).toEqual(expected)
  })
})
