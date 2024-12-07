pragma solidity ^0.8.20;

// SPDX-License-Identifier: UNLICENSED


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StandardToken is Ownable, ERC20 {
    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 initialSupply, 
        address realOwner,
        bool renounce
        )  ERC20(_name, _symbol) Ownable(msg.sender) {
        
       _mint(realOwner, initialSupply * (10**18));
       if(renounce){
        renounceOwnership();
       } else {
        transferOwnership(realOwner);
       }
       
       
       
    }
}
