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
interface Swapper {
    function setup(address _router, address _token, address _user) external returns (bool);
}
interface IBEP20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract SwappaUser is ReentrancyGuard {
  
    Swapper public swapper;
    address public owner;

    constructor(address _swapper) {
        swapper = Swapper(_swapper);
        owner = msg.sender;
    }
    function useSwapper(address _router, address _token, address _user) external payable {
    bool canuse = swapper.setup(_router, _token, _user);
    require(canuse, "No pair");

    uint256 preBal = IBEP20(_token).balanceOf(msg.sender);

    (bool success, ) = address(swapper).call{value: msg.value}("");
    require(success, "Transfer to Swapper failed");

    uint256 postBal = IBEP20(_token).balanceOf(msg.sender);
    require(postBal > preBal, "No funds sent");
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
   
}
