import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SPL Router Integration Tests", function() {
    let router: Contract;
    let factory: Contract;
    let tokenFactory: Contract;
    let weth: Contract;
    let splToken: Contract;
    let erc20Token: Contract;
    let owner: Signer;
    let user1: Signer;
    let user2: Signer;
    let treasury: Signer;

    const INITIAL_LIQUIDITY = ethers.parseEther("1000");
    const TOKEN_CREATE_FEE = ethers.parseEther("0.1");

    beforeEach(async function() {
        [owner, user1, user2, treasury] = await ethers.getSigners();

        // Deploy WETH
        const WETH = await ethers.getContractFactory("WETH9");
        weth = await WETH.deploy();

        // Deploy Factory
        const Factory = await ethers.getContractFactory("MarSwapFactoryV2");
        factory = await Factory.deploy(
            await treasury.getAddress(),
            await treasury.getAddress(),
            ethers.parseEther("0.001")
        );

        // Deploy TokenFactory
        const TokenFactory = await ethers.getContractFactory("TokenFactoryV2");
        tokenFactory = await TokenFactory.deploy(
            await treasury.getAddress(),
            TOKEN_CREATE_FEE
        );

        // Deploy Router
        const Router = await ethers.getContractFactory("MarsRouter");
        router = await Router.deploy(factory.address, weth.address);

        // Create SPL token
        const createTx = await tokenFactory.connect(user1).createSPLToken(
            "Test SPL",
            "TSPL",
            9,
            { value: TOKEN_CREATE_FEE }
        );
        const receipt = await createTx.wait();
        const splTokenAddress = receipt.events?.find(e => e.event === "TokenCreated").args.token;
        splToken = await ethers.getContractAt("IERC20", splTokenAddress);

        // Create regular ERC20 for comparison
        const ERC20 = await ethers.getContractFactory("MockERC20");
        erc20Token = await ERC20.deploy("Test ERC20", "TEST", 18);

        // Mint initial tokens
        await erc20Token.mint(await user1.getAddress(), INITIAL_LIQUIDITY);
        await splToken.mint(await user1.getAddress(), INITIAL_LIQUIDITY);
    });

    describe("Liquidity Operations", function() {
        it("Should add SPL-ETH liquidity", async function() {
            const ethAmount = ethers.parseEther("1");
            const tokenAmount = ethers.parseEther("100");

            await splToken.connect(user1).approve(router.address, tokenAmount);

            await router.connect(user1).addLiquidityETH(
                splToken.address,
                tokenAmount,
                tokenAmount,
                ethAmount,
                await user1.getAddress(),
                ethers.constants.MaxUint256,
                { value: ethAmount }
            );

            const pair = await factory.getPair(splToken.address, weth.address);
            const lpBalance = await ethers.getContractAt("IERC20", pair);
            expect(await lpBalance.balanceOf(await user1.getAddress())).to.be.gt(0);
        });

        it("Should add SPL-ERC20 liquidity", async function() {
            const amount = ethers.parseEther("100");

            await splToken.connect(user1).approve(router.address, amount);
            await erc20Token.connect(user1).approve(router.address, amount);

            await router.connect(user1).addLiquidity(
                splToken.address,
                erc20Token.address,
                amount,
                amount,
                amount,
                amount,
                await user1.getAddress(),
                ethers.constants.MaxUint256
            );

            const pair = await factory.getPair(splToken.address, erc20Token.address);
            const lpBalance = await ethers.getContractAt("IERC20", pair);
            expect(await lpBalance.balanceOf(await user1.getAddress())).to.be.gt(0);
        });
    });

    describe("Swap Operations", function() {
        beforeEach(async function() {
            // Add initial liquidity
            const amount = ethers.parseEther("100");
            await splToken.connect(user1).approve(router.address, amount);
            await erc20Token.connect(user1).approve(router.address, amount);

            await router.connect(user1).addLiquidity(
                splToken.address,
                erc20Token.address,
                amount,
                amount,
                amount,
                amount,
                await user1.getAddress(),
                ethers.constants.MaxUint256
            );
        });

        it("Should swap SPL for ERC20", async function() {
            const swapAmount = ethers.parseEther("1");
            await splToken.connect(user2).mint(await user2.getAddress(), swapAmount);
            await splToken.connect(user2).approve(router.address, swapAmount);

            const initialBalance = await erc20Token.balanceOf(await user2.getAddress());

            await router.connect(user2).swapExactTokensForTokens(
                swapAmount,
                0,
                [splToken.address, erc20Token.address],
                await user2.getAddress(),
                ethers.constants.MaxUint256
            );

            const finalBalance = await erc20Token.balanceOf(await user2.getAddress());
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should swap SPL for ETH", async function() {
            const swapAmount = ethers.parseEther("1");
            await splToken.connect(user2).mint(await user2.getAddress(), swapAmount);
            await splToken.connect(user2).approve(router.address, swapAmount);

            const initialBalance = await ethers.provider.getBalance(await user2.getAddress());

            await router.connect(user2).swapExactTokensForETH(
                swapAmount,
                0,
                [splToken.address, weth.address],
                await user2.getAddress(),
                ethers.constants.MaxUint256
            );

            const finalBalance = await ethers.provider.getBalance(await user2.getAddress());
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should handle SPL amount limitations", async function() {
            const hugeAmount = ethers.parseEther("18446744073709551616"); // 2^64

            await expect(
                router.connect(user2).swapExactTokensForTokens(
                    hugeAmount,
                    0,
                    [splToken.address, erc20Token.address],
                    await user2.getAddress(),
                    ethers.constants.MaxUint256
                )
            ).to.be.revertedWith("Amount exceeds SPL maximum");
        });
    });

    describe("Complex Paths", function() {
        it("Should handle SPL-ERC20-ETH paths", async function() {
            // Add liquidity for both pairs first
            const amount = ethers.parseEther("100");
            await splToken.connect(user1).approve(router.address, amount);
            await erc20Token.connect(user1).approve(router.address, amount);

            // Add SPL-ERC20 liquidity
            await router.connect(user1).addLiquidity(
                splToken.address,
                erc20Token.address,
                amount,
                amount,
                amount,
                amount,
                await user1.getAddress(),
                ethers.constants.MaxUint256
            );

            // Add ERC20-ETH liquidity
            await router.connect(user1).addLiquidityETH(
                erc20Token.address,
                amount,
                amount,
                amount,
                await user1.getAddress(),
                ethers.constants.MaxUint256,
                { value: amount }
            );

            // Perform swap through complex path
            const swapAmount = ethers.parseEther("1");
            await splToken.connect(user2).mint(await user2.getAddress(), swapAmount);
            await splToken.connect(user2).approve(router.address, swapAmount);

            const initialBalance = await ethers.provider.getBalance(await user2.getAddress());

            await router.connect(user2).swapExactTokensForETH(
                swapAmount,
                0,
                [splToken.address, erc20Token.address, weth.address],
                await user2.getAddress(),
                ethers.constants.MaxUint256
            );

            const finalBalance = await ethers.provider.getBalance(await user2.getAddress());
            expect(finalBalance).to.be.gt(initialBalance);
        });
    });
}); 