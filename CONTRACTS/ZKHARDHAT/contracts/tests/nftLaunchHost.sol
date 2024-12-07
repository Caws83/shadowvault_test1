
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

interface Token{
     function balanceOf(address account) external view returns (uint256);
     function decimals() external view returns (uint8 decimals);
     function symbol() external view returns (string calldata symbol);
     function name() external view returns (string calldata name);
}
interface NFTCollection {
    function PayToken() external view returns (address);
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
    function pageInfo() external view returns (uint256 _MaxSupply, uint256 _CurrentSupply, uint256 _MaxMint, address _PayToken, uint256 _CostBNB, uint256 _CostToken, bool _goPublic, address _owner, address _subOp);
}


// File: @openzeppelin/contracts/utils/Context.sol
pragma solidity ^0.8.0;
/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// File: @openzeppelin/contracts/access/Ownable.sol
pragma solidity ^0.8.0;
/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _setOwner(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract NFTHost is Ownable { 
    
    struct saleInfo {
        address contractAddress;
        string collectionName;
        address payToken;
        string symbol;
        string name;
        uint256 decimals;
        string projectLink;
    }

    event addedNFTSale(address Sale);

    saleInfo[] public _NFTSales;
    
    
     function removePool(address nftAddress) external onlyOwner  {
        for(uint32 i = 0; i < _NFTSales.length; i++) {
            if(_NFTSales[i].contractAddress == nftAddress){
                _NFTSales[i] = _NFTSales[_NFTSales.length - 1];
                _NFTSales.pop();
            }
        }
    }

   function addPool(address nftAddress, string memory colName, string memory _projectLink) external {
    // Check if the NFT contract address already exists in _NFTSales
    for (uint256 i = 0; i < _NFTSales.length; i++) {
        require(_NFTSales[i].contractAddress != nftAddress, "Error: NFT contract already exists in sales");
    }

    // Check if the provided address is a MARSWAP NFT
    try NFTCollection(nftAddress).pageInfo() {
    } catch {
        revert("Error: Not a MARSWAP NFT");
    }
        
    // Retrieve pay token information
    address payTokenAddress = NFTCollection(nftAddress).PayToken();
    string memory symbol;
    string memory name;
    uint256 decimals;
    
    if (payTokenAddress != address(0)) {
        Token thePayToken = Token(payTokenAddress);
        symbol = thePayToken.symbol();
        decimals = thePayToken.decimals();
        name = thePayToken.name();
    } else {
        symbol = "";
        name = "";
        decimals = 0;
    }
    
    // Create a new saleInfo struct and add it to _NFTSales
    saleInfo memory newSaleInfo;
    newSaleInfo.contractAddress = nftAddress;
    newSaleInfo.collectionName = colName;
    newSaleInfo.payToken = payTokenAddress;
    newSaleInfo.symbol = symbol;
    newSaleInfo.name = name;
    newSaleInfo.decimals = decimals;
    newSaleInfo.projectLink = _projectLink;
    _NFTSales.push(newSaleInfo);
    emit addedNFTSale(nftAddress);
}



    
    function getSale(uint256 number) public view returns (saleInfo memory){
        return _NFTSales[number];
    }
    function getAllSales() public view returns (saleInfo[] memory) {
        return _NFTSales;
    }

function getSales(uint256 from, uint256 to) public view returns (saleInfo[] memory) {
        uint256 length = _NFTSales.length;
    
    if (from >= length) {
        return new saleInfo[](0); // Return an empty array if `from` index is out of bounds
    }
    
    if (to >= length) {
        to = length - 1; // Adjust `to` index to the maximum available index
    }
    
    uint256 sliceLength = to - from + 1;
    saleInfo[] memory salesSlice = new saleInfo[](sliceLength);
    
    for (uint256 i = 0; i < sliceLength; i++) {
        salesSlice[i] = _NFTSales[from + i];
    }
    
    return salesSlice;
}


    function howManySales() public view returns (uint256 PoolCount) {
        return _NFTSales.length;
    }

 
   
}