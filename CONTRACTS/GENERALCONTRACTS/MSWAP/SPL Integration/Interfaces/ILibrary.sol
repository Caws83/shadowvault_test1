// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ILibrary {
    function getAmountsOut(
        address factory,
        uint amountIn,
        address[] memory path,
        uint256 lpfee
    ) external view returns (uint[] memory amounts);

    function getAmountsIn(
        address factory,
        uint amountOut,
        address[] memory path,
        uint256 lpfee
    ) external view returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    
    function getReserves(
        address factory,
        address tokenA,
        address tokenB
    ) external view returns (uint reserveA, uint reserveB);

    function pairFor(
        address factory,
        address tokenA,
        address tokenB
    ) external view returns (address pair);

    function sortTokens(
        address tokenA,
        address tokenB
    ) external pure returns (address token0, address token1);
} 