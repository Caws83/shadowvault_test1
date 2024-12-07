
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./taxToken.sol";
import "./standard.sol";

contract TokenFactoryV2 is Ownable {

    constructor(address _treasury, uint256 _createFee) Ownable(msg.sender) {
        Controller = msg.sender;
        treasury = _treasury;
        createFee = _createFee;
    }
    
    event CreatedToken(address Token);


    address[] private _MainTokens;
    mapping (address => address[]) private myTokens;
    address public Controller;
    address public treasury;
    uint256 public createFee;


    function createToken(
        string memory _name, 
        string memory _symbol,
        uint256 _devFee,
        uint256 _burnFee,
        uint256 _liqFee,
        address _router,
        address _MarketingWallet, 
        address _burnToken, 
        address _burnRouter, 
        uint256 initialSupply, 
        address realOwner
    ) external payable {

        (bool success,) = treasury.call{value:createFee}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        address tokenReceiver = realOwner == address(0) ? msg.sender : realOwner;

         MainToken token = new MainToken(
            _name, 
            _symbol,
            _devFee,
            _burnFee,
            _liqFee,
            [_router, _burnRouter],
            _MarketingWallet, 
            _burnToken,
            initialSupply, 
            tokenReceiver,
            realOwner == address(0)
         );
        _MainTokens.push(address(token));
        myTokens[msg.sender].push(address(token));
        emit CreatedToken(address(token));
    }

     function createStandardToken(
        string memory _name, 
        string memory _symbol,
        uint256 initialSupply, 
        address realOwner
    ) external {
        address tokenReceiver = realOwner == address(0) ? msg.sender : realOwner;
         StandardToken token = new StandardToken(
            _name, 
            _symbol, 
            initialSupply, 
            tokenReceiver,
            realOwner == address(0)
         );
        _MainTokens.push(address(token));
        myTokens[msg.sender].push(address(token));
        emit CreatedToken(address(token));
    }

 
    function getMyTokens() public view returns (address[] memory myCreatedTokens) {
        return myTokens[msg.sender];
    }
    
    function getToken(uint256 number) public view returns (address){
        return _MainTokens[number];
    }

    function howManyTokens() public view returns (uint256 PoolCount) {
        return _MainTokens.length;
    }

    function changeController(address newController) external {
        require(msg.sender == Controller,"Must be changed by current controler");
        Controller = newController;
    }

    function changeCreateFee(uint256 _newCreateFee) external onlyOwner {
        createFee = _newCreateFee;
    }

}
