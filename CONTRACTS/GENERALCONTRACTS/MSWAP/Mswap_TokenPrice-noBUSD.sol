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

}




contract TokenPriceCheck  {  
    address bnb= 0xC76F4c819D820369Fb2d7C1531aB3Bb18e6fE8d8;
    address oldbnb = 0x6c19A35875217b134e963ca9e61b005b855CAD21;          
   
 
// V1 calls for original code
    function TokenPrice( address token, address factory) public view returns (uint256 num, uint256 den, uint256 usd) {
        
        address pair = Factory(factory).getPair(token, bnb);
        if(pair == address(0)) pair = Factory(factory).getPair(token, oldbnb);
       
        (uint256 r0, uint256 r1,) = LPToken(pair).getReserves();
        address token0 = LPToken(pair).token0();
        
        if(token0 == token) {
            num = r1;
            den = r0;
            usd = 0;
        } else {
            num = r0;
            den = r1;
            usd = 0;
           
        }
    }
     
}
