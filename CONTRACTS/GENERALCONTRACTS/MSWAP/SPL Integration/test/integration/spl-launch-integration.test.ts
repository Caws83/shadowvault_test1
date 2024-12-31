import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SPL Launch Integration Tests", function() {
    let tokenFactory: Contract;
    let launchManager: Contract;
    let mockNeonFactory: Contract;
    let mockSPLToken: Contract;
    let owner: Signer;
    let creator: Signer;
    let participant1: Signer;
    let participant2: Signer;
    let treasury: Signer;
    let prizeTreasury: Signer;

    const LAUNCH_FEE = ethers.parseEther("0.1");
    const SPONSORSHIP_FEE = ethers.parseEther("0.05");
    const TOKEN_CREATE_FEE = ethers.parseEther("0.1");
    const LAUNCH_AMOUNT = ethers.parseEther("1000000");

    beforeEach(async function() {
        [owner, creator, participant1, participant2, treasury, prizeTreasury] = await ethers.getSigners();

        // Deploy mock Neon Factory
        const MockNeonFactory = await ethers.getContractFactory("MockNeonFactory");
        mockNeonFactory = await MockNeonFactory.deploy();

        // Deploy TokenFactory
        const TokenFactory = await ethers.getContractFactory("TokenFactoryV2");
        tokenFactory = await TokenFactory.deploy(
            await treasury.getAddress(),
            TOKEN_CREATE_FEE
        );

        // Deploy PreLaunchManager
        const LaunchManager = await ethers.getContractFactory("PreLaunchManagerV3");
        launchManager = await LaunchManager.deploy(
            LAUNCH_FEE,
            500, // 5% percent fee
            2000, // 20% prize percent
            1000, // 10% burn percent
            tokenFactory.address,
            await treasury.getAddress(),
            await prizeTreasury.getAddress(),
            await owner.getAddress(), // mock router
            SPONSORSHIP_FEE
        );

        // Create a mock SPL token
        const MockSPLToken = await ethers.getContractFactory("MockSPLToken");
        mockSPLToken = await MockSPLToken.deploy("Test SPL", "TSPL", 9);
        await mockSPLToken.mint(await creator.getAddress(), LAUNCH_AMOUNT);
    });

    describe("SPL Token Launch Flow", function() {
        it("Should create and execute a complete SPL token launch", async function() {
            // 1. Create SPL token through factory
            const createTx = await tokenFactory.connect(creator).createSPLToken(
                "Launch Token",
                "LNCH",
                9,
                { value: TOKEN_CREATE_FEE }
            );
            const receipt = await createTx.wait();
            const tokenAddress = receipt.events?.find(e => e.event === "TokenCreated").args.token;
            const token = await ethers.getContractAt("IERC20", tokenAddress);

            // 2. Setup launch
            const startTime = await time.latest() + 3600; // Start in 1 hour
            const duration = 86400; // 24 hours

            await token.connect(creator).approve(launchManager.address, LAUNCH_AMOUNT);
            await launchManager.connect(creator).createLaunch(
                token.address,
                LAUNCH_AMOUNT,
                startTime,
                duration,
                { value: LAUNCH_FEE }
            );

            // 3. Participants join
            await time.increaseTo(startTime + 1);

            await launchManager.connect(participant1).participateInLaunch(
                0, // First launch
                { value: SPONSORSHIP_FEE }
            );

            await launchManager.connect(participant2).participateInLaunch(
                0,
                { value: SPONSORSHIP_FEE }
            );

            // 4. Launch ends and participants claim
            await time.increaseTo(startTime + duration + 1);

            await launchManager.connect(participant1).claimTokens(0);
            await launchManager.connect(participant2).claimTokens(0);

            // 5. Verify balances
            const p1Balance = await token.balanceOf(await participant1.getAddress());
            const p2Balance = await token.balanceOf(await participant2.getAddress());
            
            expect(p1Balance).to.be.gt(0);
            expect(p2Balance).to.be.gt(0);
            expect(p1Balance).to.equal(p2Balance); // Equal participation = equal tokens
        });

        it("Should handle SPL token amount limitations", async function() {
            const hugeAmount = ethers.parseEther("18446744073709551616"); // 2^64
            
            await expect(
                launchManager.connect(creator).createLaunch(
                    mockSPLToken.address,
                    hugeAmount,
                    await time.latest() + 3600,
                    86400,
                    { value: LAUNCH_FEE }
                )
            ).to.be.revertedWith("Amount exceeds SPL maximum");
        });

        it("Should allow launch cancellation before start", async function() {
            const startTime = await time.latest() + 3600;
            const duration = 86400;

            await mockSPLToken.connect(creator).approve(launchManager.address, LAUNCH_AMOUNT);
            await launchManager.connect(creator).createLaunch(
                mockSPLToken.address,
                LAUNCH_AMOUNT,
                startTime,
                duration,
                { value: LAUNCH_FEE }
            );

            await launchManager.connect(creator).cancelLaunch(0);
            
            const launchInfo = await launchManager.getLaunchInfo(0);
            expect(launchInfo.isActive).to.be.false;
        });

        it("Should handle emergency withdrawal of SPL tokens", async function() {
            await mockSPLToken.connect(creator).transfer(launchManager.address, LAUNCH_AMOUNT);
            
            const withdrawAmount = ethers.parseEther("1000");
            await launchManager.connect(owner).emergencyWithdraw(
                mockSPLToken.address,
                withdrawAmount
            );

            const ownerBalance = await mockSPLToken.balanceOf(await owner.getAddress());
            expect(ownerBalance).to.equal(withdrawAmount);
        });
    });

    describe("Launch Manager Fee Distribution", function() {
        it("Should properly distribute sponsorship fees", async function() {
            // Setup launch
            const startTime = await time.latest() + 3600;
            await mockSPLToken.connect(creator).approve(launchManager.address, LAUNCH_AMOUNT);
            await launchManager.connect(creator).createLaunch(
                mockSPLToken.address,
                LAUNCH_AMOUNT,
                startTime,
                86400,
                { value: LAUNCH_FEE }
            );

            // Record initial balances
            const initialTreasuryBalance = await ethers.provider.getBalance(await treasury.getAddress());
            const initialPrizeTreasuryBalance = await ethers.provider.getBalance(await prizeTreasury.getAddress());

            // Participate
            await time.increaseTo(startTime + 1);
            await launchManager.connect(participant1).participateInLaunch(
                0,
                { value: SPONSORSHIP_FEE }
            );

            // Verify fee distribution
            const finalTreasuryBalance = await ethers.provider.getBalance(await treasury.getAddress());
            const finalPrizeTreasuryBalance = await ethers.provider.getBalance(await prizeTreasury.getAddress());

            expect(finalTreasuryBalance).to.be.gt(initialTreasuryBalance);
            expect(finalPrizeTreasuryBalance).to.be.gt(initialPrizeTreasuryBalance);
        });
    });
}); 