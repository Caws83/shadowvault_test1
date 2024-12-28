// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import "./standardShotNeon.sol";

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

interface IUniswapV2Router02 {
    function WETH() external view returns (address);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
}

contract PreLaunchManager3 is Ownable, ReentrancyGuard {
    struct Round {
        uint256 roundId;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 totalRaised;
        uint256 endEpoch;
        uint256 softCap;
        bool isFinished;
        bool isGraduated;
        string[4] projectInfo;
        // string website;
        // string telegram;
        // string logo;
        // string description;
        bool sponsored;
        address creator;
        address tokenContract;
    }

    struct RoundUserContribution {
        address user;
        uint256 amount;
        bool collected;
    }

    address public deadAddress = 0x000000000000000000000000000000000000dEaD;
    uint256 public creationFee;
    uint256 public platformFeePercentage;
    uint256 public prizeFeePercentage;
    uint256 public burnFeePercentage;
    address public burnToken;
    uint256 public sponsorshipFee;
    address public treasury;
    address public prizeTreasury;
    IUniswapV2Router02 public router;
    uint256 public finalizeHowMany = 2;

    Round[] public rounds;
    mapping(uint256 => RoundUserContribution[]) public roundContributions;

    event RoundStarted(address tokenContract, string name, string symbol, uint256 endEpoch, address creator);
    event Contributed(uint256 roundId, address indexed user, uint256 amount);
    event TokensDistributed(uint256 roundId, uint256 totalDistributed);
    event LiquidityAdded(uint256 roundId, uint256 tokenAmount, uint256 nativeCoinAmount);
    event TokensCollected(uint256 roundId, address indexed user, uint256 amount);

    constructor(
        uint256 _creationFee,
        uint256 _platformFeePercentage,
        uint256 _prizeFeePercentage,
        uint256 _burnFeePercentage,
        address _burnToken,
        address _treasury,
        address _prizeTreasury,
        address _router,
        uint256 _sponsorshipFee
    ) Ownable(msg.sender) {
        creationFee = _creationFee;
        platformFeePercentage = _platformFeePercentage;
        burnFeePercentage = _burnFeePercentage;
        prizeFeePercentage = _prizeFeePercentage;
        prizeTreasury = _prizeTreasury;
        burnToken = _burnToken;
        treasury = _treasury;
        router = IUniswapV2Router02(_router);
        sponsorshipFee = _sponsorshipFee;
    }

    modifier checkAndFinalizeRounds() {
        uint256 total = 0;
        for (uint256 i = 0; i < rounds.length; i++) {
            if (block.timestamp >= rounds[i].endEpoch && !rounds[i].isFinished) {
                finalizeRound(i);
                total ++;
                if(total >= finalizeHowMany) break;
            }
        }
        _;
    }

    function startRound(
        string memory _name,
        string memory _symbol,
        uint256 initialSupply,
        uint256 _endEpoch,
        uint256 _softCap,
        string[4] memory _projectInfo,  // [_website, _telegram, _logo, _description],
        bool _sponsored
    ) external payable checkAndFinalizeRounds {
        
        uint256 fee = creationFee;
        if(_sponsored) fee += sponsorshipFee;
        require(msg.value >= fee, "Insufficient creation fee");
        (bool success,) = treasury.call{value:fee}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        StandardToken token = new StandardToken(_name, _symbol, initialSupply, address(this));
        
        rounds.push(Round({
            roundId: rounds.length,
            tokenContract: address(token),
            name: _name,
            symbol: _symbol,
            totalSupply: initialSupply,
            totalRaised: 0,
            endEpoch: _endEpoch,
            softCap: _softCap,
            isFinished: false,
            isGraduated: false,
            projectInfo: _projectInfo,  // [_website, _telegram, _logo, _description],
            sponsored: _sponsored,
            creator: msg.sender
        }));
        emit RoundStarted(address(token), _name, _symbol, _endEpoch, msg.sender);
    }

     function editProjectInfo(uint256 roundId,  string memory _website, string memory _telegram, string memory _logo) external {
        require(roundId < rounds.length, "Invalid round ID");
        Round storage round = rounds[roundId];
        require(msg.sender == round.creator, "Only creator can edit the socials.");
        round.projectInfo[0] = _website;
        round.projectInfo[1] = _telegram;
        round.projectInfo[2] = _logo;
    }

    function contribute(uint256 roundId) external payable checkAndFinalizeRounds {
        require(roundId < rounds.length, "Invalid round ID");
        Round storage round = rounds[roundId];
        require(block.timestamp < round.endEpoch, "Round has ended");
        require(msg.value > 0, "Contribution must be greater than zero");

        // Check if user has already contributed in this round
        bool found = false;
        for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
            if (roundContributions[roundId][i].user == msg.sender) {
                roundContributions[roundId][i].amount += msg.value;
                found = true;
                break;
            }
        }
        // If not found, add new contribution entry
        if (!found) {
            roundContributions[roundId].push(RoundUserContribution({
                user: msg.sender,
                amount: msg.value,
                collected: false
            }));
        }

        round.totalRaised += msg.value;

        emit Contributed(roundId, msg.sender, msg.value);
    }

    function finalizeRound(uint256 roundId) public nonReentrant {
        require(roundId < rounds.length, "Invalid round ID");
        Round storage round = rounds[roundId];
        require(block.timestamp >= round.endEpoch, "Round is still active");
        require(!round.isFinished, "Round is already finished");
        
        if (round.totalRaised >= round.softCap) {
            round.isGraduated = true;
            addLiquidity(roundId);
        }

        round.isFinished = true;
    }

    function addLiquidity(uint256 roundId) internal {
        Round storage round = rounds[roundId];

        StandardToken token = StandardToken(round.tokenContract);
        uint256 totalSupply = round.totalSupply;
        uint256 liquidityTokens = (totalSupply * 50) / 100;
        uint256 nativeCoinForLiquidity = round.totalRaised - distributePlatformFee(roundId);

        // Add liquidity using Uniswap V2 router
        token.approve(address(router), liquidityTokens);
        router.addLiquidityETH{value: nativeCoinForLiquidity}(
            address(token),
            liquidityTokens,
            0, // Min token amount
            0, // Min ETH amount
            deadAddress,
            block.timestamp + 3600
        );

        emit LiquidityAdded(roundId, liquidityTokens, nativeCoinForLiquidity);
    }

    function distributePlatformFee(uint256 roundId) internal returns(uint256 amount) {
        Round storage round = rounds[roundId];
        uint256 prizeAmount = (round.totalRaised * prizeFeePercentage) / 100;
        if(prizeAmount > 0) {
            (bool success,) = prizeTreasury.call{value:prizeAmount}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        }
           
        uint256 fee = (round.totalRaised * platformFeePercentage) / 100;
        if(fee> 0) {
            (bool success,) = treasury.call{value:fee}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        }
        uint256 burnFee = (round.totalRaised * burnFeePercentage) / 100;
        if(burnFee > 0){
            address[] memory path = new address[](2);
            path[0] = router.WETH();
            path[1] = burnToken;
            
            router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: burnFee}(
                0, 
                path, 
                deadAddress, 
                block.timestamp + 3600
            );
        }
        return fee + burnFee + prizeAmount;
    }

    function withdrawPlatformFee() external onlyOwner nonReentrant {
        (bool success,) = owner().call{value:address(this).balance}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }

    function setCreationFee(uint256 newCreationFee) external onlyOwner {
        creationFee = newCreationFee;
    }

    function setSponsorshipFee(uint256 newSponsorshipFee) external onlyOwner {
        sponsorshipFee = newSponsorshipFee;
    }
    function setFeePercentages(uint256 newPlatformPercentage, uint256 newBurnPercentage, uint256 newPrizePercentage) external onlyOwner {
    // Check the combined fee percentages do not exceed 6%
    require(newPlatformPercentage + newBurnPercentage + newPrizePercentage <= 6, "Max 6% total Percentage Fees");

    // Check if burn percentage is greater than 0, and if so, ensure burn token is set
    if(newBurnPercentage > 0) {
        require(burnToken != address(0), "Burn Token must be set");
    }

    // Update the fee percentages
    platformFeePercentage = newPlatformPercentage;
    burnFeePercentage = newBurnPercentage;
    prizeFeePercentage = newPrizePercentage;
}
   function setBurnToken(address newBurnToken) external onlyOwner {
       // Check if the address is a valid ERC20 token by calling the `symbol()` function.
    try ERC20(newBurnToken).symbol() returns (string memory) {
        burnToken = newBurnToken;
    } catch {
        revert("Not a valid ERC20 token");
    }
}

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury address cannot be zero address");
        treasury = newTreasury;
    }
     function setRouter(address newRouter) external onlyOwner {
        require(newRouter != address(0), "Router address cannot be zero address");
        router = IUniswapV2Router02(newRouter);
    }

    function getRoundDetails(uint256 roundId) external view returns (Round memory) {
        require(roundId < rounds.length, "Invalid round ID");
        return rounds[roundId];
    }

    function getRoundContributions(uint256 roundId) public view returns (RoundUserContribution[] memory) {
        return roundContributions[roundId];
    }

 

function getLiveRounds(uint256 pageNumber, uint256 pageSize) public view returns (Round[] memory, uint256 total) {
    require(pageSize > 0, "Page size must be greater than zero");

    uint256 liveCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch) {
            liveCount++;
        }
    }

    uint256 startIndex = (pageNumber - 1) * pageSize;
    uint256 endIndex = startIndex + pageSize - 1;

    require(startIndex < liveCount, "Start index out of bounds");

    if (endIndex >= liveCount) {
        endIndex = liveCount - 1;
    }

    Round[] memory liveRounds = new Round[](endIndex - startIndex + 1);
    uint256 index = 0;
    for (uint256 i = 0; i < rounds.length && index <= endIndex; i++) {
        if (block.timestamp < rounds[i].endEpoch) {
            if (startIndex <= index && index <= endIndex) {
                liveRounds[index - startIndex] = rounds[i];
            }
            index++;
        }
    }

    return (liveRounds, liveCount);
}

    function getFinishedRounds(uint256 pageNumber, uint256 pageSize) external view returns (Round[] memory, uint256 total) {
    require(pageSize > 0, "Page size must be greater than zero");

    uint256 finishedCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp > rounds[i].endEpoch) {
            finishedCount++;
        }
    }

    uint256 startIndex = (pageNumber - 1) * pageSize;
    uint256 endIndex = startIndex + pageSize - 1;

    require(startIndex < finishedCount, "Start index out of bounds");

    if (endIndex >= finishedCount) {
        endIndex = finishedCount - 1;
    }

    Round[] memory finishedRounds = new Round[](endIndex - startIndex + 1);
    uint256 index = 0;
    for (uint256 i = 0; i < rounds.length && index <= endIndex; i++) {
        if (block.timestamp > rounds[i].endEpoch) {
            if (startIndex <= index && index <= endIndex) {
                finishedRounds[index - startIndex] = rounds[i];
            }
            index++;
        }
    }

    return (finishedRounds, finishedCount);
}

 function getTop(uint256 howMany) external view returns (Round[] memory, uint256 total) {
    // Create a temporary array to store live rounds
    uint256 liveCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch) {
            liveCount++;
        }
    }

    Round[] memory liveRounds = new Round[](liveCount);
    uint256 liveIndex = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch) {
            liveRounds[liveIndex] = rounds[i];
            liveIndex++;
        }
    }

    // Perform a simple bubble sort to get the top 5 live rounds based on total raised amount
    for (uint256 i = 0; i < liveRounds.length - 1; i++) {
        for (uint256 j = 0; j < liveRounds.length - i - 1; j++) {
            if (liveRounds[j].totalRaised < liveRounds[j + 1].totalRaised) {
                Round memory temp = liveRounds[j];
                liveRounds[j] = liveRounds[j + 1];
                liveRounds[j + 1] = temp;
            }
        }
    }

    // Return only the top 5 live rounds
    uint256 count = liveRounds.length > howMany ? howMany : liveRounds.length;
    Round[] memory top5 = new Round[](count);
    for (uint256 i = 0; i < count; i++) {
        top5[i] = liveRounds[i];
    }
    
    return (top5, count);
}

function getUserContributionAndAllocation(uint256 roundId, address user) public view returns (uint256 contribution, uint256 tokenAllocation, bool collected) {
    require(roundId < rounds.length, "Invalid round ID");
    
    Round storage round = rounds[roundId];
    uint256 totalSupply = round.totalSupply;
    uint256 totalDistributed = (totalSupply * 50) / 100;
    
    contribution = 0;
    tokenAllocation = 0;
    collected = false;
    
    for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
        if (roundContributions[roundId][i].user == user) {
            contribution = roundContributions[roundId][i].amount;
            collected = roundContributions[roundId][i].collected;
            if (round.totalRaised > 0) {
                tokenAllocation = (totalDistributed * contribution) / round.totalRaised;
            }
            break;
        }
    }
    
    return (contribution, tokenAllocation, collected);
}



function getTopLiveWithSponsorship(uint256 howMany) external view returns (Round[] memory, uint256 total) {
    // Create a temporary array to store live sponsored rounds
    uint256 liveSponsoredCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch && rounds[i].sponsored) {
            liveSponsoredCount++;
        }
    }

    Round[] memory liveSponsoredRounds = new Round[](liveSponsoredCount);
    uint256 liveIndex = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch && rounds[i].sponsored) {
            liveSponsoredRounds[liveIndex] = rounds[i];
            liveIndex++;
        }
    }

    // Perform a simple bubble sort to get the top 5 live sponsored rounds based on total raised amount
    for (uint256 i = 0; i < liveSponsoredRounds.length - 1; i++) {
        for (uint256 j = 0; j < liveSponsoredRounds.length - i - 1; j++) {
            if (liveSponsoredRounds[j].totalRaised < liveSponsoredRounds[j + 1].totalRaised) {
                Round memory temp = liveSponsoredRounds[j];
                liveSponsoredRounds[j] = liveSponsoredRounds[j + 1];
                liveSponsoredRounds[j + 1] = temp;
            }
        }
    }

    // Return only the top 5 live sponsored rounds
    uint256 count = liveSponsoredRounds.length > howMany ? howMany : liveSponsoredRounds.length;
    Round[] memory top5 = new Round[](count);
    for (uint256 i = 0; i < count; i++) {
        top5[i] = liveSponsoredRounds[i];
    }
    
    return (top5, count);
}

function collect(uint256 roundId) external nonReentrant {
    require(roundId < rounds.length, "Invalid round ID");
    Round storage round = rounds[roundId];
    require(round.isFinished, "Round is not finished");

    (uint256 contribution, uint256 tokenAllocation, bool collected) = getUserContributionAndAllocation(roundId, msg.sender);
    require(contribution > 0, "No contributions found for user");
    require(!collected, "Tokens already collected");


    // Mark the tokens as collected
    for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
        if (roundContributions[roundId][i].user == msg.sender) {
            roundContributions[roundId][i].collected = true;
            break;
        }
    }
    if(round.isGraduated) {
        // Transfer tokens to the user
        StandardToken token = StandardToken(round.tokenContract);
        token.transfer(msg.sender, tokenAllocation);
        emit TokensCollected(roundId, msg.sender, tokenAllocation);
    } else {
        (bool success,) = msg.sender.call{value:contribution}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        emit TokensCollected(roundId, msg.sender, tokenAllocation);
    }
    
}

   
}
