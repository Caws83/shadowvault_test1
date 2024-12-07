// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

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
        _transferOwnership(_msgSender());
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
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface Token{
     function balanceOf(address account) external view returns (uint256);
     function decimals() external view returns (uint8 decimals);
     function symbol() external view returns (string calldata symbol);
     function name() external view returns (string calldata name);
     function transfer(address recipient, uint256 amount) external returns (bool);
     function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract BridgeReceiver is Ownable {

    struct WithdrawInfo {
        address user;
        address token;
        uint256 amount;
        uint256 chainId;
        uint256 id;
        uint256 gasCharge;
        bool taken;
    }

    struct DepositInfo {
        address user;
        address token;
        uint256 amount;
        uint chainId;
        address tokenOnOtherChain;
        uint256 id;
    }
  
    DepositInfo[] public depositHistory;
    WithdrawInfo[] public withdrawHistory;
    mapping (address => uint256[]) public userWithdrawIds;
    address[] public tokenList;
    mapping (address => mapping( uint256 => address)) public BridgedTokenByChain;
    mapping (address => mapping( uint256 => uint256)) public BridgeableAmountToChain;
    mapping(address => mapping(uint => uint256)) public totalBridgedAmountPerChain;
    mapping(uint => mapping(uint256 => bool)) public processedWithdrawalIds;
    mapping (address => bool) public isToken;
    uint256 currentId = 0;
    uint256 public fee;
    address public controller;

    constructor(uint256 _fee) {
        fee = _fee;
    }
    modifier onlyController() {
        require(msg.sender == controller, "Only controller can call this function");
        _;
    }
    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }


    event deposit (address indexed user, address token, uint256 amount, uint chainId, address tokenOnOtherChain, uint256 id);
    event Withdraw(address indexed user, address token, uint256 amount, uint256 id);
    event TokenRemoved(address indexed mainToken, uint otherChainId, address tokenOnOtherChain);
    event TokenWithdrawn(address indexed mainToken, uint256 amount);

    function changeFee ( uint256 _newFee) public onlyOwner {
        fee = _newFee;
    }

    function setToken( address mainToken, address tokenOnOtherChain, uint otherChainId, uint256 _balanceOnOtherChain) public onlyController  {
        require(!isToken[mainToken], "Already set");
        tokenList.push(mainToken);
        BridgedTokenByChain[mainToken][otherChainId] = tokenOnOtherChain;
        BridgeableAmountToChain[mainToken][otherChainId] = _balanceOnOtherChain;
        isToken[mainToken] = true;
    }

    function removeToken(address mainToken, uint[] memory otherChainIds) public onlyOwner {
        require(isToken[mainToken], "Token not found");
    
        // Iterate through each otherChainId and remove the token from the list if it exists
        for (uint i = 0; i < otherChainIds.length; i++) {
            uint otherChainId = otherChainIds[i];
            address tokenOnOtherChain = BridgedTokenByChain[mainToken][otherChainId];
        
            // Check if the token exists on the specified chain before removing it
            if (tokenOnOtherChain != address(0)) {
                // Remove the token from the list for the current chainId
                delete BridgedTokenByChain[mainToken][otherChainId];
                delete BridgeableAmountToChain[mainToken][otherChainId];
            
                // Emit an event for each chainId removal
                emit TokenRemoved(mainToken, otherChainId, tokenOnOtherChain);
            }
        }
    
        // Update the status of the main token
        isToken[mainToken] = false;
    }



    function bridgeOut(address token, uint256 amount, uint toChain) public {
   
        // Check if the total bridged amount for this token and chain will exceed the limit after this bridgeOut
        require(totalBridgedAmountPerChain[token][toChain] + amount <= BridgeableAmountToChain[token][toChain], "Exceeds total bridgeable amount to this chain");

        // Update the total bridged amount for this token and chain
        totalBridgedAmountPerChain[token][toChain] += amount;

        // Proceed with the token transfer
        Token(token).transferFrom(msg.sender, address(this), amount);   
        address tokenOnOtherChain = BridgedTokenByChain[token][toChain];
        emit deposit(msg.sender, token, amount, toChain, tokenOnOtherChain, currentId); 
        depositHistory.push(DepositInfo(msg.sender, token, amount, toChain, tokenOnOtherChain, currentId));
        currentId++;
    }

    function getDepositInfo(uint index) public view returns (DepositInfo memory) {
        require(index < depositHistory.length, "Index out of bounds");
        return depositHistory[index];
    }
    function depositLength()public view returns ( uint256 length) {
        return depositHistory.length;
    }

    function enableWithdraw(address user, address token, uint256 incomingId, uint256 amount, uint incomingChain, uint256 gasCharge ) public onlyController  {
        // Check if the incoming ID for the specified chain has already been processed
        require(!processedWithdrawalIds[incomingChain][incomingId], "Withdrawal ID already processed for this chain");
        // Check if the contract has enough balance of the specified token to cover the withdrawal amount
        require(Token(token).balanceOf(address(this)) >= amount, "Insufficient token balance in the contract");
         // Check if the gas charge is reasonable
        require(gasCharge > 0, "Gas charge must be greater than zero");
        // Update the status of the incoming ID to processed
        processedWithdrawalIds[incomingChain][incomingId] = true;

        withdrawHistory.push(WithdrawInfo(user, token, amount, incomingChain, incomingId, gasCharge, false));
        userWithdrawIds[msg.sender].push(incomingId);
    }

    function enableCancel(uint256 depositId, uint256 gasCharge) public onlyController {
        require(depositId < depositHistory.length, "Invalid deposit ID");

        DepositInfo storage depositToCancel = depositHistory[depositId];
            
        // Record the cancellation details
        withdrawHistory.push(WithdrawInfo(depositToCancel.user, depositToCancel.token, depositToCancel.amount, depositToCancel.chainId, 0, gasCharge, false));
        userWithdrawIds[depositToCancel.user].push(depositId);
    }
    


    function withdraw(uint index) public payable {
        address user = msg.sender;
    
        require(index < withdrawHistory.length, "Invalid index");
    
        WithdrawInfo storage withdrawal = withdrawHistory[index];
        require(msg.value >= withdrawal.gasCharge, "Need to pay gasCharge");
        require(withdrawal.user == user, "Withdrawal does not belong to the caller");
        require(!withdrawal.taken, "Withdrawal already taken");

        // Retrieve withdrawal details
        address token = withdrawal.token;
        uint256 amount = withdrawal.amount;
        uint256 id = withdrawal.id;
        uint256 incomingChain = withdrawal.chainId;

        // Transfer the tokens to the user
        require(Token(token).transfer(user, amount), "Token transfer failed");
        totalBridgedAmountPerChain[token][incomingChain] -= amount;

        // Transfer the gas charge to the controller's wallet
        (bool success,) = controller.call{value: withdrawal.gasCharge}("");
        require(success, "Failed to transfer gasCharge to controller");

        // Mark the withdrawal as taken
        withdrawal.taken = true;

        // Emit an event to log the withdrawal
        emit Withdraw(user, token, amount, id);
    }


    // Function to get all transaction IDs associated with a user
    function getUserTransactionIds(address user) public view returns (uint256[] memory) {
        return userWithdrawIds[user];
    }
    
    function getUnprocessedWithdrawalIds(uint chainId, uint256[] memory withdrawalIds) public view returns (uint256[] memory) {
        uint256[] memory unprocessedIds;
        uint256 count = 0;
        for (uint i = 0; i < withdrawalIds.length; i++) {
            if (!processedWithdrawalIds[chainId][withdrawalIds[i]]) {
                unprocessedIds[count] = withdrawalIds[i];
                count++;
            }
        }
        return unprocessedIds;
    }

    function withdrawToken(address mainToken) public onlyOwner {
        require(!isToken[mainToken], "Token still bridged to another chain");

        // Transfer the tokens to the owner
        uint256 balance = Token(mainToken).balanceOf(address(this));
        require(Token(mainToken).transfer(owner(), balance), "Token transfer failed");

        // Emit an event
        emit TokenWithdrawn(mainToken, balance);
    }
    
    function withdawlBNB() external onlyOwner {
        (bool success,) = msg.sender.call{value:address(this).balance}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }


    receive() external payable {}

}
