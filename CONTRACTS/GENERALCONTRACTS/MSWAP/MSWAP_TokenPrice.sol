/**
 *Submitted for verification at BscScan.com on 2022-04-25
*/

// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

interface Token{
     function balanceOf(address account) external view returns (uint256);
     function decimals() external view returns (uint8 decimals);
     function symbol() external view returns (string calldata symbol);
     function name() external view returns (string calldata name);
}

interface LPToken {
    function balanceOf(address account) external view returns (uint256);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function totalSupply() external view returns (uint256);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairsLength() external view returns (uint);
}




contract TokenPriceCheck  {  
    address zeroA = 0x0000000000000000000000000000000000000000;
    address bnb = 0xC76F4c819D820369Fb2d7C1531aB3Bb18e6fE8d8;
    address oldbnb = 0x6c19A35875217b134e963ca9e61b005b855CAD21; 
    address usdt = 0xaB082b8ad96c7f47ED70ED971Ce2116469954cFB;      

    address[] public factories = [
        0xBe0223f65813C7c82E195B48F8AAaAcb304FbAe7,
        0xEDedDbde5ffA62545eDF97054edC11013ED72125
    ];

    function addFactory(address newFactory) external {
        try Factory(newFactory).allPairsLength() {
            factories.push(newFactory);
        } catch {revert("Not a factory");}
    }
   
    
    function getBNBPrice(address factory) public view returns (uint256 price) {
        uint256 usPrice = 1000000000000000000;
        address pair = Factory(factory).getPair(bnb, usdt);
        (uint256 r0, uint256 r1,) = LPToken(pair).getReserves();
        if(r0 == 0 || r1 == 0) return 0;
        address token0 = LPToken(pair).token0();
        
        if(token0 == bnb) {
             price = ((r1 * 10**12) * usPrice) / r0;
        } else price = ((r0 * 10**12) * usPrice ) / r1;
        
    }
// V1 calls for original code
    function TokenPrice( address token, address factory) public view returns (uint256 num, uint256 den, uint256 usd) {
        
        address pair = zeroA;
        uint256 usPrice = getBNBPrice(factory);

        pair = Factory(factory).getPair(token, bnb);
                
       if(pair == zeroA) {
            pair = Factory(factory).getPair(token, usdt);
            if(pair != zeroA) usPrice = 1000000000000000000;
       }
       if(pair == address(0)) pair = Factory(factory).getPair(token, oldbnb);

if(pair == zeroA) {
    for(uint i=0; i<factories.length; i++){
        pair = Factory(factories[i]).getPair(token, bnb);
        if(pair != zeroA) usPrice = getBNBPrice(factory);
        
       if(pair == zeroA) {
            pair = Factory(factories[i]).getPair(token, usdt);
            if(pair != zeroA) usPrice = 1000000000000000000;
       }
       if(pair != zeroA) break;
    }
}


        (uint256 r0, uint256 r1,) = LPToken(pair).getReserves();
        address token0 = LPToken(pair).token0();
        address token1 = LPToken(pair).token1();
        
        if(token0 == token) {
            num = token1 == usdt ? r1*10**12 : r1;
            den = r0;
            usd = usPrice;
        } else {
            num = token0 == usdt ? r0*10**12 : r0;
            den = r1;
            usd = usPrice;
           
        }
        return ( num, den, usd);

    }
     
}