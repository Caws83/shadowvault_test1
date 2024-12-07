pragma solidity ^0.8.20;

// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRouter {
    function WETH() external pure returns (address);
    function factory() external pure returns (address);    

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function treasury() external view returns (address treasury);
}

contract MainToken is Ownable, ERC20 {
    IRouter public Router;
    IRouter public BurnRouter;
    
    uint256 public devFee;
    uint256 public liqFee;
    uint256 public burnFee;
    uint256 public totalFee;
    uint256 public swapAtAmount;

    address public burnToken;
    address payable public marketingWallet;
    address public swapPair;
    address dead = 0x000000000000000000000000000000000000dEaD;

    mapping (address => bool) public automatedMarketMakerPairs;
    mapping (address => bool) private _isExcludedFromFees;
    
    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _devFee,
        uint256 _burnFee,
        uint256 _liqFee,
        address[2] memory _routers,
        address _MarketingWallet, 
        address _burnToken, 
        uint256 initialSupply, 
        address realOwner,
        bool renounce
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        marketingWallet = payable(_MarketingWallet);
        burnToken = _burnToken;
        BurnRouter = IRouter(_routers[1]);

        setDevFee(_devFee);
        setBurnFee(_burnFee);
        setLiquidityFee(_liqFee);

        setUserExcludedFromFees(address(this), true);
        _mint(realOwner, initialSupply * (10**18));
        swapAtAmount = totalSupply() * 10 / 1000000;  // 0.01% 
        updateSwapRouter(_routers[0]);
        setUserExcludedFromFees(realOwner, true);
       
        if (renounce) {
            renounceOwnership();
        } else {
            transferOwnership(realOwner);
        }
    }
   
    event ExcludeFromFees(address indexed account, bool isExcluded);
    event SetAutomatedMarketMakerPair(address indexed pair, bool indexed value);

    function setDevFee(uint256 _newDevFee) public onlyOwner {
        devFee = _newDevFee;
        totalFee = devFee + burnFee + liqFee;
    }

    function setBurnFee(uint256 _newBurnFee) public onlyOwner {
        burnFee = _newBurnFee;
        totalFee = devFee + burnFee + liqFee;
    }

    function setLiquidityFee(uint256 _newLiqFee) public onlyOwner {
        liqFee = _newLiqFee;
        totalFee = devFee + burnFee + liqFee;
    }

    function setUserExcludedFromFees(address account, bool excluded) public onlyOwner {
        _isExcludedFromFees[account] = excluded;
        emit ExcludeFromFees(account, excluded);
    }

    function updateSwapRouter(address newAddress) public onlyOwner {
        require(newAddress != address(Router), "MainToken: The router already has that address");
        Router = IRouter(newAddress);
        address _swapPair = IFactory(Router.factory()).getPair(address(this), Router.WETH());
        if (_swapPair == address(0)) {
            _swapPair = IFactory(Router.factory()).createPair(address(this), Router.WETH());
        }
        swapPair = _swapPair;
        setAutomatedMarketMakerPair(swapPair, true);
    }

    function setAutomatedMarketMakerPair(address pair, bool value) public onlyOwner {
        require(automatedMarketMakerPairs[pair] != value, "MainToken: Automated market maker pair is already set to that value");
        automatedMarketMakerPairs[pair] = value;
        emit SetAutomatedMarketMakerPair(pair, value);
    }
}
