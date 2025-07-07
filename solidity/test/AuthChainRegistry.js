const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuthChainRegistry", function () {
  let authChain, owner, creator, user;
  const TITLE = "Test Work";
  const IPFS_HASH = "QmTestHash123";
  const METADATA = "type: music, genre: classical";
  const PRICE = ethers.parseEther("0.1")
  const DURATION = 86400; // 1 day in seconds
  const USAGE_TYPE = "commercial";

  beforeEach(async function () {
    // Get signers
    [owner, creator, user] = await ethers.getSigners();
    
    // Deploy contract
    const AuthChainRegistry = await ethers.getContractFactory("AuthChainRegistry");
    authChain = await AuthChainRegistry.deploy();
    await authChain.waitForDeployment();
  });

  it("should deploy with correct owner", async function () {
    expect(await authChain.owner()).to.equal(owner.address);
  });

  it("should allow creator to register a work", async function () {
    await authChain.connect(creator).registerWork(TITLE, IPFS_HASH, METADATA);
    const work = await authChain.getWork(1);
    
    expect(work.id).to.equal(1);
    expect(work.creator).to.equal(creator.address);
    expect(work.title).to.equal(TITLE);
    expect(work.ipfsHash).to.equal(IPFS_HASH);
    expect(work.metadata).to.equal(METADATA);
    expect(work.timestamp).to.be.gt(0);

    const creatorWorks = await authChain.getCreatorWorks(creator.address);
    expect(creatorWorks.length).to.equal(1);
    expect(creatorWorks[0]).to.equal(1);
  });

  it("should allow creator to create a license", async function () {
    await authChain.connect(creator).registerWork(TITLE, IPFS_HASH, METADATA);
    await authChain.connect(creator).createLicense(1, PRICE, DURATION, USAGE_TYPE);
    
    const license = await authChain.getLicense(1);
    expect(license.id).to.equal(1);
    expect(license.workId).to.equal(1);
    expect(license.price).to.equal(PRICE);
    expect(license.duration).to.equal(DURATION);
    expect(license.usageType).to.equal(USAGE_TYPE);
    expect(license.active).to.be.false;
    
    const workLicenses = await authChain.getWorkLicenses(1);
    expect(workLicenses.length).to.equal(1);
    expect(workLicenses[0]).to.equal(1);
  });

  it("should allow user to purchase a license and distribute royalty", async function () {
    await authChain.connect(creator).registerWork(TITLE, IPFS_HASH, METADATA);
    await authChain.connect(creator).createLicense(1, PRICE, DURATION, USAGE_TYPE);
    
    const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
    await authChain.connect(user).purchaseLicense(1, { value: PRICE });
    
    const license = await authChain.getLicense(1);
    expect(license.licensee).to.equal(user.address);
    expect(license.active).to.be.true;
    
    const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
    expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(PRICE);
  });

  it("should revert if non-creator tries to create a license", async function () {
    await authChain.connect(creator).registerWork(TITLE, IPFS_HASH, METADATA);
    await expect(
      authChain.connect(user).createLicense(1, PRICE, DURATION, USAGE_TYPE)
    ).to.be.revertedWith("Only creator can create licenses");
  });

  it("should revert if insufficient payment for license", async function () {
    await authChain.connect(creator).registerWork(TITLE, IPFS_HASH, METADATA);
    await authChain.connect(creator).createLicense(1, PRICE, DURATION, USAGE_TYPE);
    await expect(
      authChain.connect(user).purchaseLicense(1, { value: ethers.parseEther("0.05") })
    ).to.be.revertedWith("Insufficient payment");
  });

  

  it("should revert if non-owner tries to withdraw", async function () {
    await expect(authChain.connect(user).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should revert for non-existent work or license", async function () {
    await expect(authChain.getWork(999)).to.be.revertedWith("Work does not exist");
    await expect(authChain.getLicense(999)).to.be.revertedWith("License does not exist");
  });
});