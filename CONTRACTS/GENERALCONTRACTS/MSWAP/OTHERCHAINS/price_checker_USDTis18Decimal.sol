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
    address bnb;
    address usdt;      

    address[] public factories;

    function addFactory(address newFactory) external {
        try Factory(newFactory).allPairsLength() {
            factories.push(newFactory);
        } catch {revert("Not a factory");}
    }

    constructor(address _eth, address _usdt, address[] memory _factories) {
        bnb = _eth;
        usdt = _usdt;
        factories = _factories;
    }
   
function getBNBPrice(address startFactory) public view returns (uint256 price) {
    uint256 usPrice = 1000000000000000000;

    // Attempt to retrieve the pair from the startFactory
    try Factory(startFactory).getPair(bnb, usdt) {
        address pair = Factory(startFactory).getPair(bnb, usdt);
        (uint256 r0, uint256 r1,) = LPToken(pair).getReserves();
        address token0 = LPToken(pair).token0();
        
        // If reserves are non-zero, calculate the price
        if (r0 != 0 && r1 != 0) {
            if (token0 == bnb) {
                price = ((r1 * 10**12) * usPrice) / r0;
            } else {
                price = ((r0 * 10**12) * usPrice) / r1;
            }
            // If price is valid, return it immediately
            if (price > 0) {
                return price;
            }
        }
    } catch {
        // Ignore errors for the initial factory
    }

    // If the initial factory fails or returns a zero price, cycle through other factories
    for (uint256 i = 0; i < factories.length; i++) {
        if (factories[i] == startFactory) continue; // Skip the initial factory

        try Factory(factories[i]).getPair(bnb, usdt) {
            address pair = Factory(factories[i]).getPair(bnb, usdt);
            (uint256 r0, uint256 r1,) = LPToken(pair).getReserves();
            address token0 = LPToken(pair).token0();
            
            if (r0 != 0 && r1 != 0) {
                if (token0 == bnb) {
                    price = ((r1 * 10**12) * usPrice) / r0;
                } else {
                    price = ((r0 * 10**12) * usPrice) / r1;
                }
                // If price is valid, return it immediately
                if (price > 0) {
                    return price;
                }
            }
        } catch {
            // Ignore errors for other factories
        }
    }

    // If no valid price is found, return 0
    return 0;
}


// V1 calls for original code
    function TokenPrice( address token, address factory) public view returns (uint256 num, uint256 den, uint256 usd) {
        
        address pair = zeroA;
        uint256 usPrice = getBNBPrice(factory);
        try Factory(factory).getPair(token, bnb){
            pair = Factory(factory).getPair(token, bnb);
       
       if(pair == zeroA) {
            pair = Factory(factory).getPair(token, usdt);
            if(pair != zeroA) usPrice = 1000000000000000000;
       }
        } catch{}

if(pair == zeroA) {
    for(uint i=0; i<factories.length; i++){
        try Factory(factories[i]).getPair(token, bnb) {
        pair = Factory(factories[i]).getPair(token, bnb);
        
       if(pair == zeroA) {
            pair = Factory(factories[i]).getPair(token, usdt);
            if(pair != zeroA) usPrice = 1000000000000000000;
       }
       if(pair != zeroA) break;
        }catch{}
    }
}

    try LPToken(pair).getReserves() {
        (uint256 r0, uint256 r1,) = LPToken(pair).getReserves();
        address token0 = LPToken(pair).token0();
        
        if(token0 == token) {
            num = r1;
            den = r0;
            usd = usPrice;
        } else {
            num = r0;
            den = r1;
            usd = usPrice;
           
        }
        return ( num, den, usd);
    }catch{
        return (0,0,0);
    }

    }
     
}