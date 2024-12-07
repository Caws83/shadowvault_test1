// SPDX-License-Identifier: UNLICENCED
// File: @openzeppelin/contracts/token/ERC20/IERC20.sol


// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

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


// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

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
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
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

interface NFT {
    function subOperator() external view returns(address _subOperator);
    function addFreeWhitelistUserOrAddMoreSpots(address _user, uint256 _howMany) external;

}


interface Random {
    function getRandomNumber() external returns (uint256 number);
}

pragma solidity ^0.8.0;

interface Router{

    function WETH() external pure returns (address);
    function factory() external returns (address);
    
// Token Swaps
   
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
        external
        payable;
}


interface IFactory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    function treasury() external view returns (address treasury);
}

pragma solidity ^0.8.7;

contract Scratchers is Ownable {

    // settings
    address marsFactory;
    Router router;
    Random random;

        // cost per scrtcher
        uint256 minBet = 500000000000000000;           // .5 bone
        uint256 maxBet = 250000000000000000000;         // 250 bone
        // jackpot chance
        uint256 public jackPotCostBNB = 5000000000000000000;                          // 5 bone
        // amount to dev automatically
        uint256 public devFee = 500;                                               // 5%
        // jackpot Fee
        uint256 public jackPotFee = 500;
        // jackPot Chance
        uint256 public jackPotChance = 200;
        // multiplier of ticket cost  - 3 is Freeplay 5 is FreeWhitelist
        uint256[] public multiplier = [0, 1, 2, 3, 4, 5, 6, 10, 20, 50, 100];
        // odds - divided by total
        uint256[] public odds = [700, 100, 30, 100, 15, 30, 10, 7, 4, 3, 1];
        // total
        uint256 public chancePer = 1000;
        uint256 public safetyMultiplier = 6;
        // jackPot Size
        uint256 public jackPot = 0;
        uint256 public ticketNumber = 0;
        uint256 public jackPotTicketNumber = 0;

        address public currentNFT;

        address [] public blackList;

    event ticketPurchase(uint256 ticketNumber, address player, uint256 addToPot, address token, uint256 amount, uint256 _multiplier);
    event JackPotPurchase(uint256 ticketNumber, address player, uint256 addToPot, bool isWinner, uint256 _amount);

    constructor(address _router, address _rng, address _marsFactory) {
        scratchHistory[0] = History(block.timestamp, 1, address(0x0), 0, address(0x0), 0, 0);
        jackPotHistory[0] = HistoryJ(block.timestamp, 1, address(0x0), 0, false, 0);
        router = Router(_router);
        random = Random(_rng);
        addPayToken(router.WETH());
        marsFactory = _marsFactory;
    }
        
        
        function info() external view returns (uint256 _minBet, uint256 _maxBet, uint256 _avlFunds,uint256 _sm, uint256 _jackPotCostBNB, uint256[] memory _chances, uint256 _totalChance, uint256[] memory _multipliers, uint256 _jackPot, uint256 _jackPotChance) {
            _chances = new uint256[](odds.length);
            _chances = odds;
            _multipliers = new uint256[](multiplier.length);
            _multipliers = multiplier;
            _avlFunds = address(this).balance - jackPot;
            _sm = safetyMultiplier;
            return (minBet, maxBet, _avlFunds, _sm, jackPotCostBNB, _chances, chancePer, _multipliers, jackPot, jackPotChance);
        }

        function setSafetyMultiplier(uint256 newSafety) external onlyOwner {
            require(newSafety >= 2 && newSafety <= 10, "between 2 and 10");
            safetyMultiplier = newSafety;
        }
        
        function setNFT(address newNFTContract) external onlyOwner {
            currentNFT = newNFTContract;
            NFT nftContract = NFT(currentNFT);
            require(nftContract.subOperator() == address(this), "Must be subOp for the NFT contract");
        }
        function setJackPotChance(uint256 newJackPotChance) external onlyOwner {
            jackPotChance = newJackPotChance;
        }
        function setJackPotFee(uint256 newjackPotFee) external onlyOwner {
            require(newjackPotFee < 2000, "Less than 2000");
            jackPotFee = newjackPotFee;
        }
        function setDevFee(uint256 newDevFee) external onlyOwner {
            require(newDevFee < 2000, "Less than 2000");
            devFee = newDevFee;
        }
        function setjackpotCost(uint256 newJackPotCost) external onlyOwner {
            jackPotCostBNB = newJackPotCost;
        }

        function injectJackPot() public payable {
            jackPot += msg.value;
        }
        function reducejackPot(uint256 _amount) external onlyOwner {
            address treasury = IFactory(marsFactory).treasury();
            require(_amount <= jackPot,"TooMuch");
            require(payable(treasury).send(_amount));
            jackPot -= _amount;
        }

        function setupPerThousand(uint256[] memory _multiplier, uint256[] memory _odds ) external onlyOwner {
            uint256 total = 0;
            for(uint j=1; j < _multiplier.length; j++) {
                require(_multiplier[j] > _multiplier[j-1], "add lowest to highest");
            }
            for(uint i=0; i < _odds.length; i++) {
                total += _odds[i];
            }

            multiplier = _multiplier;
            chancePer = total;
            odds = _odds;

        }

        function changeRouter(address _router) external onlyOwner {
            router = Router(_router);
        }

    // paytoken stuff
    address[] public payTokens;
    mapping(address => bool) isPayToken;

     function addPayToken(address _payToken) public onlyOwner {
         require(!isPayToken[_payToken],"Already a PayToken");
         payTokens.push(_payToken);
         isPayToken[_payToken] = true;
     }

     function removePayToken(address _payToken) external onlyOwner {
        require(isPayToken[_payToken], "Not A PayToken");
        for(uint i=0; i < payTokens.length; i++) {
            if(payTokens[i] == _payToken) {
                payTokens[i] = payTokens[payTokens.length -1];
                payTokens.pop();
                isPayToken[_payToken] = false;
            }
        }
    }

    // Randomizer
    
    function rng(uint256 mod) public returns(uint256 value) {
        uint256 seed = random.getRandomNumber();
        value = uint256(keccak256(abi.encodePacked(seed))) % mod;
    }

    function changeRNG(address RNG) external onlyOwner {
        random = Random(RNG);
    }

    // Pauser
    bool public isPaused = false;
    
    modifier pausable() {
        require(!isPaused, "games are paused");
        _;
    }
    function pauseGames(bool _isPaused) external onlyOwner {
        isPaused = _isPaused;
    }

    // Setup Functions
    function setRNG(address newRNG) external onlyOwner {
        random = Random(newRNG);
    }

    function setBets(uint256 _newMin, uint256 _newMax) public onlyOwner {
        minBet = _newMin;
        maxBet = _newMax;
    }

    // Withdrawl functions

    // to receive Eth From Router when Swapping
    receive() external payable {}

  function withdrawALL_BNB() external onlyOwner {
    require(payable(msg.sender).send(address(this).balance));
    jackPot = 0;
  }
  function withdrawBNB(uint256 _amount) external onlyOwner {
      require(_amount <= address(this).balance - jackPot, "Remove jackpot funds with other methods");
    require(payable(msg.sender).send(_amount));

  }

  function withdrawlToken(address _tokenAddress, uint256 _amount) external onlyOwner {
    IERC20(_tokenAddress).transfer(address(msg.sender), _amount);
  }

    function getMaxWinSize(uint256 bet) public view returns(uint256 av_Winners, uint256 newChancePer) {
        uint256 balance = address(this).balance - jackPot;
        av_Winners=0;
        newChancePer = 0;
        for(uint i=0; i < multiplier.length; i++) {
            if(balance >= bet * multiplier[i] * safetyMultiplier) {
                av_Winners += 1;
                newChancePer += odds[i];
            }
        }
    }

  // randomly pick a image
  function pickTicket(uint256 _bet) public returns (uint256 ticketPicked, bool isToken) {    
        (uint256 avWinners, uint256 newChancePer) = getMaxWinSize(_bet);
        uint256 value = rng(newChancePer * 10);
        uint256 setting = newChancePer * 10;
        require(avWinners > 0,"Pot Empty");
        isToken = false;

        uint256 tokenChoice = uint256(value % 3);
        if(tokenChoice != 0) isToken = true;

        for(uint i = avWinners -1; i >= 0; i--){

            setting -= odds[i] * 10;
            if(value >= setting) {
                return (i, isToken);
            }
        }
        
   }

   struct History {
       uint256 time;
       uint256 ticket;
       address player; 
       uint256 addToPot; 
       address token; 
       uint256 amount; 
       uint256 ticketValue;
   }
   mapping(uint256 => History) public scratchHistory;

   struct HistoryJ {
       uint256 time;
       uint256 ticket;
       address player; 
       uint256 addToPot; 
       bool isWinner;
       uint256 _amount;
   }
   mapping(uint256 => HistoryJ) public jackPotHistory;
   mapping(address => uint256[]) public freePlay;
   mapping(address => uint256) public howManyFP;

   function addFreePlay(address _user, uint256 bet) external onlyOwner {
        freePlay[_user].push(bet);
        howManyFP[_user] += 1;
   }
  
   function viewScratcherHistory(uint256 timeToCheckTo) external view returns (History[] memory sHistory) {
      
       // find how many we are pulling
        uint256 howMany = 0;
        for(uint i=0; i <= ticketNumber; i++) {
           if(scratchHistory[i].time > timeToCheckTo) howMany++;
        }

        uint256 ticketNumberToGoto = (ticketNumber + 1) - howMany;
        uint256 index = 0;
        History[] memory tmpHistory = new History[](howMany);
        for(uint j=ticketNumberToGoto; j <= ticketNumber; j++) {
            tmpHistory[index] = scratchHistory[j];
            index++;
        }
        return tmpHistory;
   }

   function viewJackPotHistory(uint256 timeToCheckTo) external view returns (HistoryJ[] memory jHistory) {
       // find how many we are pulling
        uint256 howMany = 0;
        for(uint i=0; i <= ticketNumber; i++) {
           if(scratchHistory[i].time > timeToCheckTo) howMany++;
        }
        uint256 ticketNumberToGoto = (ticketNumber + 1) - howMany;
        uint256 index = 0;
        HistoryJ[] memory tmpHistory = new HistoryJ[](howMany);
        for(uint j=ticketNumberToGoto; j <= ticketNumber; j++) {
            tmpHistory[index] = jackPotHistory[j];
            index++;
        }
        return tmpHistory;
   }

  
// scratcher functions
    function buyScratcher(address _payToken) public payable pausable returns (uint256 ticket, address player, uint256 addToPot, address token, uint256 amount, uint256 _multiplier) {
        uint256 bet = msg.value;
        if(msg.value > 0){
            address treasury = IFactory(marsFactory).treasury();
            require(msg.value >= minBet && msg.value <= maxBet,"Bet out of Range");
            uint256 fee = msg.value * devFee / 10000;
            require(payable(treasury).send(fee));

            uint256 addToJackPot = msg.value * jackPotFee / 10000;
            jackPot += addToJackPot;

            addToPot = msg.value - fee - addToJackPot;
        } else {
            uint256 fp = howManyFP[msg.sender];
            require(fp > 0, "No FreePlays");
            bet = freePlay[msg.sender][fp-1];
            freePlay[msg.sender].pop();
            howManyFP[msg.sender] -= 1;
        }


        ticketNumber += 1;

        require(isPayToken[_payToken], "Not a Paytoken");

        (uint256 ticketPicked, bool isToken ) = pickTicket(bet);
        // is loss
        if(multiplier[ticketPicked] == 0) {
            emit ticketPurchase(ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
            scratchHistory[ticketNumber] = History(block.timestamp, ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
            return (ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
        }
        // is freeplay
        if(multiplier[ticketPicked] == 3 || ( multiplier[ticketPicked] == 5 && currentNFT == address(0) ) ) {
            freePlay[msg.sender].push(bet);
            howManyFP[msg.sender] += 1;
            emit ticketPurchase(ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
            scratchHistory[ticketNumber] = History(block.timestamp, ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
            return (ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
        }
        // is Free whitelist
        if(multiplier[ticketPicked] == 5) {
            NFT nftContract = NFT(currentNFT);
            nftContract.addFreeWhitelistUserOrAddMoreSpots(msg.sender, 1);
            emit ticketPurchase(ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
            scratchHistory[ticketNumber] = History(block.timestamp, ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
            return (ticketNumber, msg.sender, addToPot, token, 0, multiplier[ticketPicked]);
        }


        isToken ? token = _payToken : token = address(0x0);
        amount = multiplier[ticketPicked] * bet;

        // bnb payout
        if(!isToken || _payToken == router.WETH()) {
            require(payable(msg.sender).send(amount));
        } else {
            uint256 preSwap = IERC20(_payToken).balanceOf(msg.sender);
            address[] memory path = new address[](2);
                    path[0] = router.WETH();
                    path[1] = _payToken;
            router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(
                0,
                path,
                msg.sender,
                block.timestamp
            );

            uint256 postSwap = IERC20(_payToken).balanceOf(msg.sender);
            amount = postSwap - preSwap;   
        }

        // set history
        scratchHistory[ticketNumber] = History(block.timestamp, ticketNumber, msg.sender, addToPot, token, amount, multiplier[ticketPicked]);

        emit ticketPurchase(ticketNumber, msg.sender, addToPot, token, amount, multiplier[ticketPicked]);
        return (ticketNumber, msg.sender, addToPot, token, amount, multiplier[ticketPicked]);
        
    }

        function JackPot() public payable pausable returns (uint256 ticket, address player, uint256 addToJackPot, bool isWinner, uint256 _amount) {
            require(msg.value >= jackPotCostBNB,"not enough BNB");
            uint256 fee = msg.value * devFee / 10000;
            address treasury = IFactory(marsFactory).treasury();
            require(payable(treasury).send(fee));

            addToJackPot = msg.value - (fee * 2);
            jackPot += addToJackPot;
            jackPotTicketNumber += 1;

            uint256 value = rng(jackPotChance);
            value == jackPotChance - 5 ? isWinner = true : isWinner = false;
            isWinner ? _amount = jackPot : _amount = 0;

            if(isWinner) {
                require(payable(msg.sender).send(_amount));
                jackPot = 0;
            }

             jackPotHistory[jackPotTicketNumber] = HistoryJ(block.timestamp, jackPotTicketNumber, msg.sender, addToJackPot, isWinner, _amount);

            emit JackPotPurchase(jackPotTicketNumber, msg.sender, addToJackPot, isWinner, _amount);
            return ( jackPotTicketNumber, msg.sender, addToJackPot, isWinner, _amount);
        }
}
