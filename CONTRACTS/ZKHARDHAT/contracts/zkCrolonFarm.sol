// SPDX-License-Identifier: MIT
// $MSWAP TEAM BUILDING FOR YEARS IN BLOCKCHAIN AND GAME DEV MODE 

// WANT YOUR OWN SWAPPER CONTACT US AT MARSWAP.EXCHANGE.COM

/**


 sdSSSSSSSbs   .S    S.     sSSs  S.       .S_SsS_S.    .S_sSSs      sSSs  
 YSSSSSSSS%S  .SS    SS.   d%%SP  SS.     .SS~S*S~SS.  .SS~YS%%b    d%%SP  
        S%S   S%S    S&S  d%S'    S%S     S%S `Y' S%S  S%S   `S%b  d%S'    
       S&S    S%S    d*S  S%S     S%S     S%S     S%S  S%S    S%S  S%|     
      S&S     S&S   .S*S  S&S     S&S     S%S     S%S  S%S    d*S  S&S     
      S&S     S&S_sdSSS   S&S     S&S     S&S     S&S  S&S   .S*S  Y&Ss    
     S&S      S&S~YSSY%b  S&S     S&S     S&S     S&S  S&S_sdSSS   `S&&S   
    S*S       S&S    `S%  S&S     S&S     S&S     S&S  S&S~YSY%b     `S*S  
   S*S        S*S     S%  S*b     S*b     S*S     S*S  S*S   `S%b     l*S  
 .s*S         S*S     S&  S*S.    S*S.    S*S     S*S  S*S    S%S    .S*P  
 sY*SSSSSSSP  S*S     S&   SSSbs   SSSbs  S*S     S*S  S*S    S&S  sSS*S   
sY*SSSSSSSSP  S*S     SS    YSSP    YSSP  SSS     S*S  S*S    SSS  YSS'    
              SP                                  SP   SP                  
              Y                                   Y    Y                   
                                                                    
 */

pragma solidity ^0.8.0;

interface IWETH {
    function withdraw(uint) external;
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}
// helper methods for interacting with ERC20 tokens and sending ETH that do not consistently return true/false
library TransferHelper {
 
    function safeTransferFrom(address token, address from, address to, uint value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }

}
interface IFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

library MarsLibrary {
   
    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'MarsLibrary: IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'MarsLibrary: ZERO_ADDRESS');
    }

    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        pair = IFactory(factory).getPair(tokenA,tokenB);
    }
}

interface IMarsPair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);  
}
interface IMarswap {
    function Router() external view returns (address);
    function marketingWallet() external view returns(address);
    function getSwapperInfo() external view returns (address _router, address _ETH, address _factory, uint256 _FEE, bool enabled);

}


contract MSWAPSwapper {
    address public owner;
    address public MSWAP;

    event TransferOwnership(address oldOwner,address newOwner);
    event TokenBought(address buyer);
    event TokenSold(address seller, uint256 amount);

    constructor (address _token, address _owner) {
        owner = _owner;
        MSWAP = _token;
    }

    receive() external payable {
        buyTokens(msg.value, msg.sender);
    }

     modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner{
        address oldOwner=owner;
        owner=newOwner;
        emit TransferOwnership(oldOwner,owner);
    }


    // contract should never accumulate any tokens of any kind. So if somehow there is tokens this can aquire them
    function TeamWithdrawStrandedToken(address strandedToken) public onlyOwner {
        require(strandedToken != MSWAP,"Cannot withdrawl MSWAP");
        IERC20 token=IERC20(strandedToken);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    function getPath(address token0, address token1) internal pure returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = token0;
        path[1] = token1;
        return path;
    }

    function buyTokens(uint amountIn, address to) internal {
        (address _router, address _ETH, address _factory, uint256 _FEE, bool enabled) = IMarswap(MSWAP).getSwapperInfo();
        if(_FEE > 0)  amountIn = takeFee(amountIn, _FEE);
        require(enabled, "Not enabled on token");
        IRouter router = IRouter(_router);
        address ETH = _ETH;
        address factory = _factory;


        IWETH(ETH).deposit{value: amountIn}();
        address[] memory path = new address[](2);
        path = getPath(ETH, MSWAP);
        assert(IWETH(ETH).transfer(MarsLibrary.pairFor(factory, path[0], path[1]), amountIn));
        _swapSupportingFeeOnTransferTokens(path, to, router, factory);
        
        emit TokenBought(to);
    }

    function sellTokensForETH(uint amountIn, address to) external {
        require(msg.sender == MSWAP, "Only Callable by token");
        (address _router, address _ETH, address _factory, uint256 _FEE, bool enabled) = IMarswap(MSWAP).getSwapperInfo();
        require(enabled, "Not enabled on token");
        IRouter router = IRouter(_router);
        address ETH = _ETH;
        address factory = _factory;
    
            TransferHelper.safeTransferFrom(
                MSWAP, to, MarsLibrary.pairFor(factory, MSWAP, ETH), amountIn
            );
            address[] memory path = new address[](2);
            path = getPath(MSWAP, ETH);
            _swapSupportingFeeOnTransferTokens(path, address(this), router, factory);
            uint amountOut = IERC20(ETH).balanceOf(address(this));
            IWETH(ETH).withdraw(amountOut);
            if(_FEE > 0) takeFee(address(this).balance, _FEE);
            TransferHelper.safeTransferETH(to, address(this).balance);
        }

    function takeFee(uint256 amt, uint256 fee) internal returns (uint256) {
        address treasury =  IMarswap(MSWAP).marketingWallet();
        uint256 feeToTake = (amt * fee) / 10000;
        TransferHelper.safeTransferETH(treasury, feeToTake);
        return amt - feeToTake;
    }

    function _swapSupportingFeeOnTransferTokens(address[] memory path, address _to, IRouter router, address factory) internal virtual {
            (address input, address output) = (path[0], path[1]);
            (address token0,) = MarsLibrary.sortTokens(input, output);
            IMarsPair pair = IMarsPair(MarsLibrary.pairFor(factory, input, output));
            (uint amount0Out, uint amount1Out) = getinfo(pair, input, token0, router);
            pair.swap(amount0Out, amount1Out, _to, new bytes(0));
    }

    function getinfo(IMarsPair pair, address input, address token0, IRouter router) internal view returns (uint amount0Out, uint amount1Out){
        (uint reserve0, uint reserve1,) = pair.getReserves();
        (uint reserveInput, uint reserveOutput) = input == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
        uint amountInput = IERC20(input).balanceOf(address(pair)) - (reserveInput);
        uint amountOutput = router.getAmountOut(amountInput, reserveInput, reserveOutput);
        (amount0Out, amount1Out) = input == token0 ? (uint(0), amountOutput) : (amountOutput, uint(0));
    }

}

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

// File: @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.0;


/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}

// File: @openzeppelin/contracts/utils/Context.sol


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

// File: @openzeppelin/contracts/token/ERC20/ERC20.sol


// OpenZeppelin Contracts (last updated v4.7.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;




/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless this function is
     * overridden;
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
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
interface IMasterChef {
    function cake() external view returns (address cakeToken);
}


// allow for multiple Operators. THAT ARE NOT the owner.
contract masterChef is Ownable {
    mapping (address => bool) public isMasterChef;
    mapping (address => bool) public isOperator;

    event OperatorAdded(address indexed newOperator);
    event OperatorRemoved(address indexed oldOperator);
    event MasterChefAdded(address indexed newMC);
    event MasterChefRemoved(address indexed oldMC);
    
    modifier onlyChef() {
        require(isMasterChef[msg.sender], "Operators: caller is not MasterChef");
        _;
    }
    modifier onlyOp() {
        require(isOperator[msg.sender], "Operators: caller is not Operator");
        _;
    }

    function addMasterChef(address newMasterChef) public virtual onlyOp {
        require(!isMasterChef[newMasterChef], "Already Added");
        require(IMasterChef(newMasterChef).cake() == address(this), "Must be a MC Contract for this token.");
        isMasterChef[newMasterChef] = true;
        emit MasterChefAdded(newMasterChef);
    }
    function removemasterChef(address oldMasterChef) public virtual onlyOp {
        require(isMasterChef[oldMasterChef], "Not added");
        isMasterChef[oldMasterChef] = false;
        emit MasterChefAdded(oldMasterChef);
    }

    function addOperator(address newOperator) public virtual onlyOp {
        require(!isOperator[newOperator], "Active Op");
        isOperator[newOperator] = true;
        emit OperatorAdded(newOperator);
    }
    function removeOperator(address oldOperator) public virtual onlyOp {
        require(isOperator[oldOperator], "Not Active Op");
        isOperator[oldOperator] = false;
        emit OperatorAdded(oldOperator);
    }
    
    
}

pragma solidity ^0.8.0;

interface IRouter {
    function WETH() external pure returns (address);
    function factory() external pure returns (address);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);

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
}

interface IMSWAPSwapper {
    function sellTokensForETH(uint256 amt, address to) external;
}


contract zkCrolonMars is masterChef, ERC20('zk Crolon Mars', 'zkCLMRS') {
       
    IRouter public Router;
    IRouter public BurnRouter;
    
    uint256 public devFee;
    uint256 public swapperFee;
    uint256 public swapAtAmount;
    address payable public  marketingWallet;
    address public swapPair;
    address public swapper;
    mapping (address => bool) public automatedMarketMakerPairs;
    mapping (address => bool) private _isExcludedFromFees;
    address ETH;
    address factory;    
    bool public swapperEnabled = false;

    
    constructor(address _router, address _MarketingWallet, uint256 initialSupply, address realOwner)  {
       devFee = 400;  // 100 = 1%
       swapperFee = 10; // 100 = 1%
       marketingWallet = payable(_MarketingWallet);
       excludeFromFees(realOwner, true);
       excludeFromFees(address(this), true);
       _mint(realOwner, initialSupply * (10**18));
       swapAtAmount = totalSupply() * 10 / 1000000;  // .01%
       ETH = IRouter(_router).WETH();
       updateSwapRouter(_router);
       swapper = address(new MSWAPSwapper(address(this), marketingWallet));
       isOperator[realOwner] = true;   
       transferOwnership(realOwner); 
    }

     function mint(address _to, uint256 _amount) public onlyChef {
        _mint(_to, _amount);      
    }
     function burn(uint256 _amount) public {
         _burn(msg.sender, _amount);
     }
   
     event ExcludeFromFees(address indexed account, bool isExcluded);
     event SetAutomatedMarketMakerPair(address indexed pair, bool indexed value);

    function getSwapperInfo() external view returns (address _router, address _ETH, address _factory, uint256 _FEE, bool enabled) {
        return (address(Router), ETH, factory, swapperFee, swapperEnabled); 
    }
       
    function setDevFee(uint256 _newDevFee) public onlyOwner {
      require(_newDevFee <= 1000, "Cannot exceed 1000");
      devFee = _newDevFee;
    }

    function setSwapperFee(uint256 newSwapperFee) external onlyOwner {
        require(newSwapperFee <= 500, "Cannot exceed 500");
        swapperFee = newSwapperFee;
    }
    function setSwappAddress(address newSwapper) external onlyOwner {
        swapper = newSwapper;
    }

    function switchSwapperEnabled() external onlyOwner {
        swapperEnabled = !swapperEnabled;
    }
 
    function setMarketingWallet(address payable newMarketingWallet) public onlyOwner {
         if (_isExcludedFromFees[marketingWallet] == true) excludeFromFees(marketingWallet, false);
        marketingWallet = newMarketingWallet;
         if (_isExcludedFromFees[marketingWallet] == false) excludeFromFees(marketingWallet, true);
    }

    function excludeFromFees(address account, bool excluded) public onlyOwner {
        require(_isExcludedFromFees[account] != excluded, "Account is already the value of 'excluded'");
        _isExcludedFromFees[account] = excluded;

        emit ExcludeFromFees(account, excluded);
    }
    
    function _setAutomatedMarketMakerPair(address pair, bool value) public onlyOwner {
        require(automatedMarketMakerPairs[pair] != value, "Automated market maker pair is already set to that value");
        automatedMarketMakerPairs[pair] = value;
        emit SetAutomatedMarketMakerPair(pair, value);
    }

    function setWrappedCoin(address _newWrappedAddress) external onlyOwner {
        ETH = _newWrappedAddress;
    }
   
    function updateSwapRouter(address newAddress) public onlyOwner {
        require(newAddress != address(Router), "The router already has that address");
        Router = IRouter(newAddress);
        factory = Router.factory();
        address bnbPair = IFactory(factory)
            .getPair(address(this), ETH);
        if(bnbPair == address(0)) bnbPair = IFactory(factory).createPair(address(this), ETH);
        if (automatedMarketMakerPairs[bnbPair] != true && bnbPair != address(0) ){
            _setAutomatedMarketMakerPair(bnbPair, true);
        }
          _approve(address(this), address(Router), ~uint256(0));
        
        swapPair = bnbPair;
    }
    
    function isExcludedFromFees(address account) public view returns(bool) {
        return _isExcludedFromFees[account];
    }

    function setSwapAtAmount(uint256 _newSwapAtAmount) external onlyOwner {
        uint256 one = totalSupply() * 10 / 10000;
        require(_newSwapAtAmount > 0 && _newSwapAtAmount <= one, "Must be less than 1% of supply");
        swapAtAmount = _newSwapAtAmount;
    }

    bool private inSwapAndLiquify;
    modifier lockTheSwap {
        inSwapAndLiquify = true;
        _;
        inSwapAndLiquify = false;
    }

    bool private inSwapper;
    modifier lockSwapper {
        inSwapper = true;
        _;
        inSwapper = false;
    }
    
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
           
        // if any account belongs to _isExcludedFromFee account then remove the fee
        if(!_isExcludedFromFees[from] && !_isExcludedFromFees[to]) {

            if(automatedMarketMakerPairs[to] || automatedMarketMakerPairs[from]) {
                uint256 extraFee;
                if(devFee >0 ) extraFee = (amount * devFee) / 10000;
                
                if (balanceOf(address(this)) > swapAtAmount && !inSwapAndLiquify && automatedMarketMakerPairs[to]) SwapFees();
                
                if (extraFee > 0) {
                  super._transfer(from, address(this), extraFee);
                  amount = amount - extraFee;
                }  
            }     
        }

      if(to == swapper && !inSwapper) {
        useSwapper(amount);
      } else super._transfer(from, to, amount);
        
   }

   function useSwapper(uint256 amount) private lockSwapper {
       require(swapperEnabled, "Swapper Not enabled");
        _approve(msg.sender, swapper, amount);
        IMSWAPSwapper(swapper).sellTokensForETH(amount, msg.sender);
   }

    function SwapFees() private lockTheSwap {
       
          address[] memory path = new address[](2);
            path[0] = address(this);
            path[1] = ETH;

                Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                    balanceOf(address(this)),
                    0,
                    path,
                    address(this),
                    block.timestamp
                );

            (bool success,) = marketingWallet.call{value:address(this).balance}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED in SwapFees ');                    
    }

        function manualSwapAndBurn() external onlyOwner {
            address[] memory path = new address[](2);
            path[0] = address(this);
            path[1] = ETH;

                Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                    balanceOf(address(this)),
                    0,
                    path,
                    address(this),
                    block.timestamp
                );
            
            (bool success,) = marketingWallet.call{value:address(this).balance}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED in SwapFees ');      
        }

        function removeNative() external onlyOwner {
            (bool success,) = msg.sender.call{value:address(this).balance}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED in SwapFees ');      
        }

        function removeTokens(address _tokenAddress) external onlyOwner {
            require(_tokenAddress != address(this), "Cannot withdrawl this token");
            ERC20(_tokenAddress).transfer(msg.sender, ERC20(_tokenAddress).balanceOf(address(this)));
        }   
      

    // to receive Eth From Router when Swapping
    receive() external payable {}
    
    
}