
// SPDX-License-Identifier: UNLICENSED


pragma solidity ^0.8.0;

interface IERC20 {

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

pragma solidity ^0.8.0;

interface IERC20Metadata is IERC20 {

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);
}

pragma solidity ^0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

pragma solidity ^0.8.0;

contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

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

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

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

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}

pragma solidity ^0.8.0;

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


pragma solidity ^0.8.0;

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
    address payable public  marketingWallet;
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
        )  ERC20(_name, _symbol) {
        
        marketingWallet = payable(_MarketingWallet);
        burnToken = _burnToken;
        BurnRouter = IRouter(_routers[1]);

        setDevFee(_devFee);
        setBurnFee(_burnFee);
        setLiquidityFee(_liqFee);

        setUserExcludedFromFees(address(this), true);
       _mint(realOwner, initialSupply * (10**18));
       swapAtAmount = totalSupply() * 10 / 1000000;  // .01% 
       updateSwapRouter(_routers[0]);
       setUserExcludedFromFees(realOwner, true);
       
       if(renounce){
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
      if(devFee > 0) require(marketingWallet != address(0),"Set Marketing Wallet First");
      require(totalFee <= 1000, "TotalFee cannot exceed 1000");
    }
    
    function setLiquidityFee(uint256 _newLiqFee) public onlyOwner {
      liqFee = _newLiqFee;
      totalFee = devFee + burnFee + liqFee;
      require(totalFee <= 1000, "TotalFee cannot exceed 1000");
    }

    function setMarketingWallet(address payable newMarketingWallet) public onlyOwner {
         if (_isExcludedFromFees[marketingWallet] = true)
            setUserExcludedFromFees(marketingWallet, false);

        marketingWallet = newMarketingWallet;

         if (_isExcludedFromFees[marketingWallet] = false)
            setUserExcludedFromFees(marketingWallet, true);
    }

    function setBurnToken(address _newBurnToken) external onlyOwner {
        burnToken = _newBurnToken;
    }
    function setBurnFee(uint256 _newBurnFee) public onlyOwner {
      burnFee = _newBurnFee;
      totalFee = devFee + burnFee + liqFee;
      require(totalFee <= 1000, "TotalFee cannot exceed 1000");
      if(burnFee > 0){
        require(burnToken != address(0), "BurnToken not Set");
        require(BurnRouter != IRouter(address(0)), "Burn Router not Set");
      }
    }
    function setBurnRouter(address _newBurnRouter) external onlyOwner {
        BurnRouter = IRouter(_newBurnRouter); 
    }
    
    function setUserExcludedFromFees(address account, bool excluded) public onlyOwner {
        require(_isExcludedFromFees[account] != excluded, "Account is already the value of 'excluded'");
        _isExcludedFromFees[account] = excluded;

        emit ExcludeFromFees(account, excluded);
    }
    
    function _setAutomatedMarketMakerPair(address pair, bool value) public onlyOwner {
        require(automatedMarketMakerPairs[pair] != value, "Automated market maker pair is already set to that value");
        automatedMarketMakerPairs[pair] = value;
        emit SetAutomatedMarketMakerPair(pair, value);
    }
   
    function updateSwapRouter(address newAddress) public onlyOwner {
        require(newAddress != address(Router), "The router already has that address");
        Router = IRouter(newAddress);
        address bnbPair = IFactory(Router.factory())
            .getPair(address(this), Router.WETH());

        if(bnbPair == address(0))
            bnbPair = IFactory(Router.factory()).createPair(address(this), Router.WETH());

        if (automatedMarketMakerPairs[bnbPair] != true && bnbPair != address(0) ){
            _setAutomatedMarketMakerPair(bnbPair, true);
        }
          _approve(address(this), address(Router), ~uint256(0));
            
        swapPair = bnbPair;
    }
    
    function isUserExcludedFromFees(address account) public view returns(bool) {
        return _isExcludedFromFees[account];
    }

    function setSwapAtAmount(uint256 _newSwapAtAmount) external onlyOwner {
        swapAtAmount = _newSwapAtAmount;
    }

    bool private inSwapAndLiquify;
    modifier lockTheSwap {
        inSwapAndLiquify = true;
        _;
        inSwapAndLiquify = false;
    }
    
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
          
        // if any account belongs to _isExcludedFromFee account then remove the fee
        if(!_isExcludedFromFees[from] && !_isExcludedFromFees[to]) {
            if(automatedMarketMakerPairs[to] || automatedMarketMakerPairs[from]) {
                if(devFee >0 || burnFee >0 || liqFee >0) {
                    uint256 extraFee =(amount * totalFee)/10000;
                    if (balanceOf(address(this)) > swapAtAmount && !inSwapAndLiquify && automatedMarketMakerPairs[to]) SwapFees();
                    if (extraFee > 0) {
                        super._transfer(from, address(this), extraFee);
                        amount = amount - extraFee;
                    }
                } 
            }     
        }
      super._transfer(from, to, amount);     
   }

    function SwapFees() private lockTheSwap {
        uint256 tokensToAddLiquidityWith = 0;
        uint256 contractTokenBalance = balanceOf(address(this));
        if(liqFee > 0) tokensToAddLiquidityWith = (contractTokenBalance / (totalFee *2)) * liqFee;
        uint256 toSwap = contractTokenBalance-tokensToAddLiquidityWith;
      
        uint256 initialBalance = address(this).balance;

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = Router.WETH();

        try Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            toSwap,
            0,
            path,
            address(this),
            block.timestamp
        ) {} catch { revert("Failed to swap to eth");}

        if(liqFee > 0) {
            uint256 deltaBalance = address(this).balance-initialBalance;
            uint256 bnbToAddLiquidityWith = (deltaBalance * liqFee) / ((totalFee *2) - liqFee);
            addLiquidity(tokensToAddLiquidityWith, bnbToAddLiquidityWith);
        }

        if(burnFee > 0) {
            uint256 burnAmount = address(this).balance * burnFee / (burnFee + devFee);
            address[] memory path1 = new address[](2);
            path1[0] = BurnRouter.WETH();
            path1[1] = burnToken;
            try BurnRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{value: burnAmount} (
                0,
                path1,
                dead,
                block.timestamp
            ) {} catch { revert("Failed to swap for BurnToken"); }         
        }

        if(devFee > 0) payable(marketingWallet).transfer(address(this).balance);
                    
    }

    function manualSwapAndBurn() external onlyOwner {
        uint256 tokensToAddLiquidityWith = 0;
        uint256 contractTokenBalance = balanceOf(address(this));
        if(liqFee > 0) tokensToAddLiquidityWith = (contractTokenBalance / (totalFee *2)) * liqFee;
        uint256 toSwap = contractTokenBalance-tokensToAddLiquidityWith;
      
        uint256 initialBalance = address(this).balance;

        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = Router.WETH();

        try Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            toSwap,
            0,
            path,
            address(this),
            block.timestamp
        ) {} catch { revert("Failed to swap to eth");}

        if(liqFee > 0) {
            uint256 deltaBalance = address(this).balance-initialBalance;
            uint256 bnbToAddLiquidityWith = (deltaBalance * liqFee) / ((totalFee *2) - liqFee);
            addLiquidity(tokensToAddLiquidityWith, bnbToAddLiquidityWith);
        }

        if(burnFee > 0) {
            uint256 burnAmount = address(this).balance * burnFee / (burnFee + devFee);
            address[] memory path1 = new address[](2);
            path1[0] = BurnRouter.WETH();
            path1[1] = burnToken;
            try BurnRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{value: burnAmount} (
                0,
                path1,
                dead,
                block.timestamp
            ) {} catch { revert("Failed to swap for BurnToken"); }         
        }

        if(devFee > 0) payable(marketingWallet).transfer(address(this).balance);
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
        // add the liquidity
        try Router.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            dead,
            block.timestamp
        ) {} catch {revert("Failed to add liquidity");}
        
    }

        function withdrawBNB() external onlyOwner {
            (bool success,) = msg.sender.call{value:address(this).balance}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        }

        function withdrawToken(address _tokenAddress) external onlyOwner {
            ERC20(_tokenAddress).transfer(msg.sender, ERC20(_tokenAddress).balanceOf(address(this)));
        }   
 

    // to receive Eth From Router when Swapping
    receive() external payable {}
    
}

contract StandardToken is Ownable, ERC20 {
    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 initialSupply, 
        address realOwner,
        bool renounce
        )  ERC20(_name, _symbol) {
        
       _mint(realOwner, initialSupply * (10**18));
       if(renounce){
        renounceOwnership();
       } else {
        transferOwnership(realOwner);
       }
       
       
       
    }
}


pragma solidity ^0.8.0;

contract MainTokenFactory is Ownable {

    constructor(address _treasury, uint256 _createFee) {
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
