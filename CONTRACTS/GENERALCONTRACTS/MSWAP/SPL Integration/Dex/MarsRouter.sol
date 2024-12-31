// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MarSwapFactoryV2.sol";
import "../Libraries/TransferHelper.sol";
import "../Interfaces/IMarSwapPair.sol";
import "../Interfaces/IWETH.sol";
import "../Libraries/MarSwapLibrary.sol";
import "../Interfaces/INeonERC20Factory.sol";

contract MarsRouter is Ownable {
    address public immutable factory;
    address public immutable WETH;
    
    // SPL specific constants
    uint256 private constant SPL_MAX_UINT = (1 << 64) - 1;
    address public constant NEON_FACTORY_DEVNET = 0xF6b17787154C418d5773Ea22Afc87A95CAA3e957;
    address public constant NEON_FACTORY_MAINNET = 0x6B226a13F5FE3A5cC488084C08bB905533804720;
    address public currentNeonFactory;

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'MARS_Router: EXPIRED');
        _;
    }

    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
        currentNeonFactory = NEON_FACTORY_DEVNET;
    }

    receive() external payable {
        assert(msg.sender == WETH);
    }

    function getFee() public view returns (uint256) {
        return MarSwapFactoryV2(factory).lpFee();
    }

    function flatFee() public view returns (uint256) {
        return MarSwapFactoryV2(factory).flatFee();
    }

    // Add liquidity functions with SPL support
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        // Validate SPL amounts if applicable
        bool isSPLA = INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(tokenA)))) != address(0);
        bool isSPLB = INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(tokenB)))) != address(0);
        
        if (isSPLA) require(amountADesired <= SPL_MAX_UINT, "Amount A exceeds SPL maximum");
        if (isSPLB) require(amountBDesired <= SPL_MAX_UINT, "Amount B exceeds SPL maximum");

        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = ILibrary.pairFor(factory, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IMarSwapPair(pair).mint(to);
    }

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
        bool isSPL = INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(token)))) != address(0);
        if (isSPL) require(amountTokenDesired <= SPL_MAX_UINT, "Token amount exceeds SPL maximum");

        (amountToken, amountETH) = _addLiquidity(
            token,
            WETH,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountETHMin
        );
        address pair = ILibrary.pairFor(factory, token, WETH);
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
        IWETH(WETH).deposit{value: amountETH}();
        assert(IWETH(WETH).transfer(pair, amountETH));
        liquidity = IMarSwapPair(pair).mint(to);
        if (msg.value > amountETH) TransferHelper.safeTransferETH(msg.sender, msg.value - amountETH);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public virtual ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = ILibrary.pairFor(factory, tokenA, tokenB);
        IMarSwapPair(pair).transferFrom(msg.sender, pair, liquidity);
        (uint amount0, uint amount1) = IMarSwapPair(pair).burn(to);
        (address token0,) = ILibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, 'MARS_Router: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'MARS_Router: INSUFFICIENT_B_AMOUNT');
    }

    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public virtual ensure(deadline) returns (uint amountToken, uint amountETH) {
        (amountToken, amountETH) = removeLiquidity(
            token,
            WETH,
            liquidity,
            amountTokenMin,
            amountETHMin,
            address(this),
            deadline
        );
        TransferHelper.safeTransfer(token, to, amountToken);
        IWETH(WETH).withdraw(amountETH);
        TransferHelper.safeTransferETH(to, amountETH);
    }

    // Swap functions with SPL support
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint[] memory amounts) {
        bool isSPLPath = false;
        for (uint i = 0; i < path.length; i++) {
            if (INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(path[i])))) != address(0)) {
                isSPLPath = true;
                break;
            }
        }
        
        if (isSPLPath) require(amountIn <= SPL_MAX_UINT, "Amount exceeds SPL maximum");

        amounts = ILibrary.getAmountsOut(factory, amountIn, path, getFee());
        require(amounts[amounts.length - 1] >= amountOutMin, 'MARS_Router: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, ILibrary.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to, getFee());
    }

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint[] memory amounts) {
        bool isSPLPath = false;
        for (uint i = 0; i < path.length; i++) {
            if (INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(path[i])))) != address(0)) {
                isSPLPath = true;
                break;
            }
        }
        
        if (isSPLPath) {
            require(amountOut <= SPL_MAX_UINT, "Output amount exceeds SPL maximum");
            require(amountInMax <= SPL_MAX_UINT, "Input amount exceeds SPL maximum");
        }

        amounts = ILibrary.getAmountsIn(factory, amountOut, path, getFee());
        require(amounts[0] <= amountInMax, 'MARS_Router: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, ILibrary.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to, getFee());
    }

    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint[] memory amounts) {
        require(path[0] == WETH, 'MARS_Router: INVALID_PATH');
        
        bool isSPLOutput = INeonERC20Factory(currentNeonFactory).tokenList(
            bytes32(uint256(uint160(path[path.length-1])))
        ) != address(0);
        
        amounts = ILibrary.getAmountsOut(factory, msg.value, path, getFee());
        if (isSPLOutput) require(amounts[amounts.length - 1] <= SPL_MAX_UINT, "Output exceeds SPL maximum");
        
        require(amounts[amounts.length - 1] >= amountOutMin, 'MARS_Router: INSUFFICIENT_OUTPUT_AMOUNT');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(ILibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to, getFee());
    }

    function swapTokensForExactETH(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint[] memory amounts) {
        require(path[path.length - 1] == WETH, 'MARS_Router: INVALID_PATH');
        
        bool isSPLInput = INeonERC20Factory(currentNeonFactory).tokenList(
            bytes32(uint256(uint160(path[0])))
        ) != address(0);
        
        if (isSPLInput) require(amountInMax <= SPL_MAX_UINT, "Input exceeds SPL maximum");
        
        amounts = ILibrary.getAmountsIn(factory, amountOut, path, getFee());
        require(amounts[0] <= amountInMax, 'MARS_Router: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, ILibrary.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, address(this), getFee());
        IWETH(WETH).withdraw(amounts[amounts.length-1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length-1]);
    }

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint[] memory amounts) {
        require(path[path.length - 1] == WETH, 'MARS_Router: INVALID_PATH');
        
        bool isSPLInput = INeonERC20Factory(currentNeonFactory).tokenList(
            bytes32(uint256(uint160(path[0])))
        ) != address(0);
        
        if (isSPLInput) require(amountIn <= SPL_MAX_UINT, "Input exceeds SPL maximum");
        
        amounts = ILibrary.getAmountsOut(factory, amountIn, path, getFee());
        require(amounts[amounts.length - 1] >= amountOutMin, 'MARS_Router: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, ILibrary.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, address(this), getFee());
        IWETH(WETH).withdraw(amounts[amounts.length-1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length-1]);
    }

    function swapETHForExactTokens(
        uint amountOut,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable virtual ensure(deadline) returns (uint[] memory amounts) {
        require(path[0] == WETH, 'MARS_Router: INVALID_PATH');
        
        bool isSPLOutput = INeonERC20Factory(currentNeonFactory).tokenList(
            bytes32(uint256(uint160(path[path.length-1])))
        ) != address(0);
        
        if (isSPLOutput) require(amountOut <= SPL_MAX_UINT, "Output exceeds SPL maximum");
        
        amounts = ILibrary.getAmountsIn(factory, amountOut, path, getFee());
        require(amounts[0] <= msg.value, 'MARS_Router: EXCESSIVE_INPUT_AMOUNT');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(ILibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to, getFee());
        if (msg.value > amounts[0]) TransferHelper.safeTransferETH(msg.sender, msg.value - amounts[0]);
    }

    // Internal functions
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {
        if (IMarSwapPair(ILibrary.pairFor(factory, tokenA, tokenB)).totalSupply() == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint reserveA;
            uint reserveB;
            (reserveA, reserveB) = ILibrary.getReserves(factory, tokenA, tokenB);
            if (reserveA == 0 && reserveB == 0) {
                (amountA, amountB) = (amountADesired, amountBDesired);
            } else {
                uint amountBOptimal = ILibrary.quote(amountADesired, reserveA, reserveB);
                if (amountBOptimal <= amountBDesired) {
                    require(amountBOptimal >= amountBMin, 'MARS_Router: INSUFFICIENT_B_AMOUNT');
                    (amountA, amountB) = (amountADesired, amountBOptimal);
                } else {
                    uint amountAOptimal = ILibrary.quote(amountBDesired, reserveB, reserveA);
                    assert(amountAOptimal <= amountADesired);
                    require(amountAOptimal >= amountAMin, 'MARS_Router: INSUFFICIENT_A_AMOUNT');
                    (amountA, amountB) = (amountAOptimal, amountBDesired);
                }
            }
        }
    }

    function _swap(uint[] memory amounts, address[] memory path, address _to, uint256 lpfee) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = ILibrary.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? ILibrary.pairFor(factory, output, path[i + 2]) : _to;
            uint256 fee = lpfee == 0 ? flatFee() : 0;
            IMarSwapPair(ILibrary.pairFor(factory, input, output)).swap{value: fee}(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }

    // SPL specific helper functions
    function isSPLToken(address token) public view returns (bool) {
        return INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(token)))) != address(0);
    }

    function validateSPLAmount(uint256 amount) internal pure returns (bool) {
        return amount <= SPL_MAX_UINT;
    }

    // Admin functions
    function setNeonFactory(address newFactory) external onlyOwner {
        require(newFactory != address(0), "Invalid factory address");
        currentNeonFactory = newFactory;
    }

    function switchToMainnet() external onlyOwner {
        currentNeonFactory = NEON_FACTORY_MAINNET;
    }

    function switchToDevnet() external onlyOwner {
        currentNeonFactory = NEON_FACTORY_DEVNET;
    }
} 