// SPDX-License-Identifier: MIT

//| $$      /$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$      /$$  /$$$$$$  /$$$$$$$ 
//| $$$    /$$$ /$$__  $$| $$__  $$ /$$__  $$| $$  /$ | $$ /$$__  $$| $$__  $$
//| $$$$  /$$$$| $$  \ $$| $$  \ $$| $$  \__/| $$ /$$$| $$| $$  \ $$| $$  \ $$
//| $$ $$/$$ $$| $$$$$$$$| $$$$$$$/|  $$$$$$ | $$/$$ $$ $$| $$$$$$$$| $$$$$$$/
//| $$  $$$| $$| $$__  $$| $$__  $$ \____  $$| $$$$_  $$$$| $$__  $$| $$____/ 
//| $$\  $ | $$| $$  | $$| $$  \ $$ /$$  \ $$| $$$/ \  $$$| $$  | $$| $$      
//| $$ \/  | $$| $$  | $$| $$  | $$|  $$$$$$/| $$/   \  $$| $$  | $$| $$      
//|/       |/    |/  |/  |/    |/   \______/ |/        \/ |/    |/  |__/


pragma solidity ^0.8.0;


/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
 
    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

}

// helper methods for interacting with ERC20 tokens and sending ETH that do not consistently return true/false
library TransferHelper {
 
    function safeTransferFrom(address token, address from, address to, uint value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }

}

interface IWETH {
    function withdraw(uint) external;
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

interface IFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

library MarsLibrary {
   
    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'MarsLibrary: IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'MarsLibrary: ZERO_ADDRESS');
    }

    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        pair = IFactory(factory).getPair(tokenA,tokenB);
    }
}

interface IRouter {
    function WETH() external pure returns (address);
    function factory() external pure returns (address);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
}

interface IMarsPair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);  
}


contract MSWAPSwapper  {
    address public owner;
    address public currentToken;
    IRouter public currentRouter;
    address public currentUser;
    address public WETH;
    uint256 public fee;
    address public treasury;

    event TransferOwnership(address oldOwner,address newOwner);
    event TokenBought(address buyer);

    constructor (address _WETH, uint256 _fee, address _treasury) {
        owner = msg.sender;
        WETH = _WETH;
        fee = _fee;
        treasury = _treasury;
    }

    receive() external payable {
        buyTokens(msg.value, currentUser);
    }

    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
        require(_fee <= 200, "must be <= 200 ( 2% )");
    }

    function setTrteasury(address _newTreasury) external onlyOwner {
        treasury = _newTreasury;
    }

     modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function setup(address _router, address _token) public {
        currentRouter = IRouter(_router);
        currentToken = _token;
        currentUser = msg.sender;
    }

    function transferOwnership(address newOwner) public onlyOwner{
        address oldOwner=owner;
        owner=newOwner;
        emit TransferOwnership(oldOwner,owner);
    }

    function getPath(address token0, address token1) internal pure returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = token0;
        path[1] = token1;
        return path;
    }

    function buyTokens(uint amountIn, address to) internal {
        address pair = MarsLibrary.pairFor(currentRouter.factory(),WETH, currentToken);
        require(pair != address(0), "no pair");

        amountIn = takeFee(amountIn);
        address factory = currentRouter.factory();
        IWETH(WETH).deposit{value: amountIn}();
        address[] memory path = new address[](2);
        path = getPath(WETH, currentToken);
        assert(IWETH(WETH).transfer(pair, amountIn));
        _swapSupportingFeeOnTransferTokens(path, to, currentRouter, factory);
        
        emit TokenBought(to);
    }

   

    function takeFee(uint256 amt) internal returns (uint256) {
        uint256 feeToTake = (amt * fee) / 10000;
        TransferHelper.safeTransferETH(treasury, feeToTake);
        return amt - feeToTake;
    }

    function _swapSupportingFeeOnTransferTokens(address[] memory path, address _to, IRouter router, address factory) internal virtual {
            (address input, address output) = (path[0], path[1]);
            (address token0,) = MarsLibrary.sortTokens(input, output);
            IMarsPair pair = IMarsPair(MarsLibrary.pairFor(factory, input, output));
            (uint amount0Out, uint amount1Out) = getinfo(pair, input, token0, router);
            pair.swap(amount0Out, amount1Out, _to, new bytes(0));
    }

    function getinfo(IMarsPair pair, address input, address token0, IRouter router) internal view returns (uint amount0Out, uint amount1Out){
        (uint reserve0, uint reserve1,) = pair.getReserves();
        (uint reserveInput, uint reserveOutput) = input == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
        uint amountInput = IERC20(input).balanceOf(address(pair)) - (reserveInput);
        uint amountOutput = router.getAmountOut(amountInput, reserveInput, reserveOutput);
        (amount0Out, amount1Out) = input == token0 ? (uint(0), amountOutput) : (amountOutput, uint(0));
    }

}