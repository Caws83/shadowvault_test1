// SPDX-License-Identifier: MIT

//| $$      /$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$      /$$  /$$$$$$  /$$$$$$$ 
//| $$$    /$$$ /$$__  $$| $$__  $$ /$$__  $$| $$  /$ | $$ /$$__  $$| $$__  $$
//| $$$$  /$$$$| $$  \ $$| $$  \ $$| $$  \__/| $$ /$$$| $$| $$  \ $$| $$  \ $$
//| $$ $$/$$ $$| $$$$$$$$| $$$$$$$/|  $$$$$$ | $$/$$ $$ $$| $$$$$$$$| $$$$$$$/
//| $$  $$$| $$| $$__  $$| $$__  $$ \____  $$| $$$$_  $$$$| $$__  $$| $$____/ 
//| $$\  $ | $$| $$  | $$| $$  \ $$ /$$  \ $$| $$$/ \  $$$| $$  | $$| $$      
//| $$ \/  | $$| $$  | $$| $$  | $$|  $$$$$$/| $$/   \  $$| $$  | $$| $$      
//|/       |/    |/  |/  |/    |/   \______/ |/        \/ |/    |/  |__/



pragma solidity ^0.8.4;

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    constructor () {
        _status = _NOT_ENTERED;
    }
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

interface IPancakeRouter02  {
    function factory() external pure returns (address);
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
  
}
interface IBEP20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}
interface IFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}
library MarsLibrary {
    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        pair = IFactory(factory).getPair(tokenA,tokenB);
    }
}

contract supaSwappa is ReentrancyGuard {
    bool public swapperEnabled = true;
    address public owner;
    address public currentUser;
    address public currentToken;
    IPancakeRouter02 public currentRouter;
    address public WETH;
    uint256 public fee = 3000000000000000;
    
    
    event TransferOwnership(address oldOwner,address newOwner);
    event BoughtWithBnb(address);

    constructor (address _WETH) {
        owner = msg.sender;
        WETH = _WETH;
    }
    receive() external payable {
        require(swapperEnabled);
        buyTokens(msg.value, currentUser);
    }
    function setup(address _router, address _token, address _user) public returns (bool) {
        currentRouter = IPancakeRouter02(_router);
        currentToken = _token;
        currentUser = _user;

        address pair = MarsLibrary.pairFor(currentRouter.factory(),WETH, _token);
        return pair != address(0);
    }
    function transferOwnership(address newOwner) public {
        require(msg.sender==owner);
        address oldOwner=owner;
        owner=newOwner;
        emit TransferOwnership(oldOwner,owner);
    }
    function enableSwapper(bool enabled) public {
        require(msg.sender==owner);
        swapperEnabled=enabled;
    }
    function setFee(uint256 _fee) external {
        require(msg.sender==owner);
        fee = _fee;
    }
    function TeamWithdrawStrandedToken(address strandedToken) public {
        require(msg.sender==owner);
        IBEP20 token=IBEP20(strandedToken);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
     function removeETH() external {
            require(msg.sender==owner);
            payable(msg.sender).transfer(address(this).balance);
        }
    function getPath(address token0, address token1) internal pure returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = token0;
        path[1] = token1;
        return path;
    }
    function buyTokens(uint amt, address to) internal {
    uint amtAfterFee = amt - fee;
    currentRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amtAfterFee}(
        0,
        getPath(WETH, currentToken),
        to,
        block.timestamp
    );
    payable(owner).transfer(address(this).balance);
    emit BoughtWithBnb(to);
}

   
}
