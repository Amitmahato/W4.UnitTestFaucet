const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const [owner, notOwner] = await ethers.getSigners();
    let withdrawAmount = ethers.utils.parseUnits("1", "ether");
    let depositAmount = ethers.utils.parseUnits("10", "ether");

    console.log("Signer 1 address: ", owner.address);
    console.log("Signer 2 address: ", notOwner.address);

    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy({
      value: depositAmount,
    });

    return { faucet, owner, notOwner, withdrawAmount, depositAmount };
  }

  it("should deploy and set the owner correctly", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it("should fail to withdraw more than 0.1 ether", async () => {
    const { faucet, withdrawAmount } = await loadFixture(
      deployContractAndSetVariables
    );

    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it("should fail to withdraw all funds when not owner", async () => {
    const { faucet, notOwner } = await loadFixture(
      deployContractAndSetVariables
    );

    await expect(faucet.connect(notOwner).withdrawAll()).to.be.reverted;
  });

  it("should allow to withdraw all funds when owner", async () => {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    const balanceBefore = await owner.getBalance();
    await faucet.connect(owner).withdrawAll();
    const balance = await ethers.provider.getBalance(faucet.address);
    const balanceAfter = await owner.getBalance();

    expect(balance).to.be.eq(0);
    expect(balanceBefore).to.be.lessThan(balanceAfter);
  });

  it("should fail to destroy smart contract when not owner", async () => {
    const { faucet, notOwner } = await loadFixture(
      deployContractAndSetVariables
    );

    await expect(faucet.connect(notOwner).destroyFaucet()).to.be.reverted;

    const code = await ethers.provider.getCode(faucet.address);
    expect(code).to.not.be.eq("0x");
  });

  it("should fail to destroy smart contract when not owner", async () => {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    await faucet.connect(owner).destroyFaucet();

    const code = await ethers.provider.getCode(faucet.address);
    expect(code).to.be.eq("0x");
  });
});
