import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("MarsRouter SPL Integration", function() {
    let router: Contract;
    let factory: Contract;
    let weth: Contract;
    let splToken: Contract;
    let owner: Signer;
    let user1: Signer;
    let user2: Signer;
    
    const MOCK_SPL_MINT = "0x1234567890123456789012345678901234567890123456789012345678901234";

    beforeEach(async function() {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy WETH
        const WETH = await ethers.getContractFactory("WETH9");
        weth = await WETH.deploy();

        // Deploy Factory
        const Factory = await ethers.getContractFactory("MarSwapFactoryV2");
        factory = await Factory.deploy(
            await owner.getAddress(),
            await owner.getAddress(),
            ethers.parseEther("0.001")
        );

        // Deploy Router
        const Router = await ethers.getContractFactory("MarsRouter");
        router = await Router.deploy(factory.address, weth.address);

        // Deploy Mock SPL Token
        const MockSPL = await ethers.getContractFactory("MockSPLToken");
        splToken = await MockSPL.deploy("Mock SPL", "MSPL", 9);
    });

    describe("SPL Swap Functions", function() {
        it("Should swap exact SPL for tokens", async function() {
            // Setup
            const amount = ethers.parseEther("1");
            const path = [splToken.address, weth.address];
            
            await splToken.connect(user1).approve(router.address, amount);
            
            // Execute swap
            await router.connect(user1).swapExactSPLForTokens(
                amount,
                0,
                path,
                await user1.getAddress(),
                ethers.constants.MaxUint256,
                MOCK_SPL_MINT
            );
            
            // Verify
            expect(await weth.balanceOf(await user1.getAddress())).to.be.gt(0);
        });

        // Add more test cases for each new function...
    });

    describe("SPL Amount Validation", function() {
        it("Should reject amounts exceeding SPL maximum", async function() {
            const hugeAmount = ethers.parseEther("18446744073709551616"); // 2^64
            const path = [splToken.address, weth.address];
            
            await expect(
                router.connect(user1).swapExactSPLForTokens(
                    hugeAmount,
                    0,
                    path,
                    await user1.getAddress(),
                    ethers.constants.MaxUint256,
                    MOCK_SPL_MINT
                )
            ).to.be.revertedWith("Amount exceeds SPL maximum");
        });
    });

    // Add more test suites...
}); 