import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("SPL Token Integration Tests", function() {
  let tokenFactory: Contract;
  let launchManager: Contract;
  let mockNeonFactory: Contract;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let treasury: Signer;

  const MOCK_SPL_MINT = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const TOKEN_CREATE_FEE = ethers.parseEther("0.01");
  const LAUNCH_FEE = ethers.parseEther("0.01");
  const SPONSORSHIP_FEE = ethers.parseEther("0.1");

  beforeEach(async function() {
    // Get signers
    [owner, user1, user2, treasury] = await ethers.getSigners();

    // Deploy mock Neon Factory
    const MockNeonFactory = await ethers.getContractFactory("MockNeonFactory");
    mockNeonFactory = await MockNeonFactory.deploy();

    // Deploy TokenFactory
    const TokenFactory = await ethers.getContractFactory("TokenFactoryV2");
    tokenFactory = await TokenFactory.deploy(
      await treasury.getAddress(),
      TOKEN_CREATE_FEE
    );

    // Deploy LaunchManager
    const LaunchManager = await ethers.getContractFactory("PreLaunchManagerV3");
    launchManager = await LaunchManager.deploy(
      LAUNCH_FEE,
      500, // 5% percent fee
      500, // 5% prize percent
      500, // 5% burn percent
      tokenFactory.address,
      await treasury.getAddress(),
      await treasury.getAddress(),
      await owner.getAddress(), // mock router address
      SPONSORSHIP_FEE
    );
  });

  describe("TokenFactory SPL Tests", function() {
    it("Should create new SPL token", async function() {
      const createTx = await tokenFactory.connect(user1).createSPLToken(
        "Test SPL Token",
        "TST",
        9,
        { value: TOKEN_CREATE_FEE }
      );

      const receipt = await createTx.wait();
      const event = receipt.events?.find(e => e.event === "TokenCreated");
      expect(event).to.not.be.undefined;
      expect(event.args.isSPL).to.be.true;
    });

    it("Should fail creating SPL token with more than 9 decimals", async function() {
      await expect(
        tokenFactory.connect(user1).createSPLToken(
          "Invalid SPL Token",
          "INVALID",
          10,
          { value: TOKEN_CREATE_FEE }
        )
      ).to.be.revertedWith("SPL tokens max 9 decimals");
    });

    it("Should wrap existing SPL token", async function() {
      const wrapTx = await tokenFactory.connect(user1).wrapExistingSPLToken(MOCK_SPL_MINT);
      const receipt = await wrapTx.wait();
      const event = receipt.events?.find(e => e.event === "SPLTokenWrapped");
      expect(event).to.not.be.undefined;
      expect(event.args.splMint).to.equal(MOCK_SPL_MINT);
    });

    it("Should prevent wrapping already wrapped SPL token", async function() {
      await tokenFactory.connect(user1).wrapExistingSPLToken(MOCK_SPL_MINT);
      await expect(
        tokenFactory.connect(user2).wrapExistingSPLToken(MOCK_SPL_MINT)
      ).to.be.revertedWith("Token already wrapped");
    });
  });

  describe("LaunchManager SPL Tests", function() {
    let splToken: Contract;
    const LAUNCH_AMOUNT = ethers.parseEther("1000");

    beforeEach(async function() {
      // Create a mock SPL token for testing
      const createTx = await tokenFactory.connect(user1).createSPLToken(
        "Test SPL Token",
        "TST",
        9,
        { value: TOKEN_CREATE_FEE }
      );
      const receipt = await createTx.wait();
      const event = receipt.events?.find(e => e.event === "TokenCreated");
      splToken = await ethers.getContractAt("IERC20", event.args.token);
    });

    it("Should create launch with SPL token", async function() {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const duration = 86400; // 1 day

      await splToken.connect(user1).approve(launchManager.address, LAUNCH_AMOUNT);
      
      const createLaunchTx = await launchManager.connect(user1).createLaunch(
        splToken.address,
        LAUNCH_AMOUNT,
        startTime,
        duration,
        { value: LAUNCH_FEE }
      );

      const receipt = await createLaunchTx.wait();
      const event = receipt.events?.find(e => e.event === "LaunchCreated");
      expect(event).to.not.be.undefined;
      expect(event.args.isSPL).to.be.true;
    });

    it("Should fail launch with SPL amount exceeding uint64", async function() {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const duration = 86400;
      const HUGE_AMOUNT = ethers.parseEther("18446744073709551616"); // 2^64

      await splToken.connect(user1).approve(launchManager.address, HUGE_AMOUNT);
      
      await expect(
        launchManager.connect(user1).createLaunch(
          splToken.address,
          HUGE_AMOUNT,
          startTime,
          duration,
          { value: LAUNCH_FEE }
        )
      ).to.be.revertedWith("Amount exceeds SPL maximum");
    });

    it("Should allow participation in SPL token launch", async function() {
      const startTime = Math.floor(Date.now() / 1000) + 100;
      const duration = 86400;

      await splToken.connect(user1).approve(launchManager.address, LAUNCH_AMOUNT);
      await launchManager.connect(user1).createLaunch(
        splToken.address,
        LAUNCH_AMOUNT,
        startTime,
        duration,
        { value: LAUNCH_FEE }
      );

      // Advance time to start
      await ethers.provider.send("evm_increaseTime", [101]);
      await ethers.provider.send("evm_mine", []);

      await launchManager.connect(user2).participateInLaunch(0, {
        value: SPONSORSHIP_FEE
      });

      const userBalance = await splToken.balanceOf(await user2.getAddress());
      expect(userBalance).to.be.gt(0);
    });

    it("Should handle emergency withdrawal of SPL tokens", async function() {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const duration = 86400;

      await splToken.connect(user1).approve(launchManager.address, LAUNCH_AMOUNT);
      await launchManager.connect(user1).createLaunch(
        splToken.address,
        LAUNCH_AMOUNT,
        startTime,
        duration,
        { value: LAUNCH_FEE }
      );

      const withdrawAmount = ethers.parseEther("100");
      await launchManager.connect(owner).emergencyWithdraw(
        splToken.address,
        withdrawAmount
      );

      const ownerBalance = await splToken.balanceOf(await owner.getAddress());
      expect(ownerBalance).to.equal(withdrawAmount);
    });
  });

  describe("Integration Tests", function() {
    it("Should handle full SPL token lifecycle", async function() {
      // 1. Create SPL token
      const createTx = await tokenFactory.connect(user1).createSPLToken(
        "Lifecycle Token",
        "LIFE",
        9,
        { value: TOKEN_CREATE_FEE }
      );
      const receipt = await createTx.wait();
      const tokenAddress = receipt.events?.find(e => e.event === "TokenCreated").args.token;

      // 2. Create launch
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const duration = 86400;
      const launchAmount = ethers.parseEther("1000");

      const token = await ethers.getContractAt("IERC20", tokenAddress);
      await token.connect(user1).approve(launchManager.address, launchAmount);
      
      await launchManager.connect(user1).createLaunch(
        tokenAddress,
        launchAmount,
        startTime,
        duration,
        { value: LAUNCH_FEE }
      );

      // 3. Multiple users participate
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);

      await launchManager.connect(user2).participateInLaunch(0, {
        value: SPONSORSHIP_FEE
      });

      // 4. Verify final states
      const user2Balance = await token.balanceOf(await user2.getAddress());
      expect(user2Balance).to.be.gt(0);
    });
  });
}); 