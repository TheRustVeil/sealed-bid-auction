/**
 * disperse.test.js — ConfidentialDisperse lifecycle and edge-case tests.
 *
 * All FHE operations are handled by mock contracts installed at the local
 * config addresses via hardhat_setCode (see test/helpers/fhevm-mock.js).
 *
 * Mock handle convention: handle = bytes32(uint256(plaintext_value))
 * Mock claim  convention: call contract.claim(distId, mockDecrypt64(amount)) directly.
 * All test amounts must be > 0.
 */

const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployFhevmMocks, mockEncrypt64, mockDecrypt64 } = require("./helpers/fhevm-mock");

// ── Fixture ────────────────────────────────────────────────────────────────

async function deployFixture() {
  const [owner, alice, bob, charlie, stranger] = await ethers.getSigners();

  await deployFhevmMocks();

  const Token   = await ethers.getContractFactory("ConfidentialToken");
  const token   = await Token.deploy("Test Token", "TST", 6, owner.address);

  const Disperse = await ethers.getContractFactory("ConfidentialDisperse");
  const disperse = await Disperse.deploy(owner.address);

  const SUPPLY = ethers.parseUnits("10000", 6);
  await token.mint(owner.address, SUPPLY);
  await token.approve(await disperse.getAddress(), SUPPLY);

  return { owner, alice, bob, charlie, stranger, token, disperse };
}

// ── Constants ─────────────────────────────────────────────────────────────

const DIST_ID  = ethers.id("auction-round-1");
const DIST_ID2 = ethers.id("auction-round-2");

// ── Helpers ────────────────────────────────────────────────────────────────

async function executeFullDistribution(disperse, token, owner, alice, bob) {
  const aliceAmount = 1_000_000n;
  const bobAmount   = 2_500_000n;
  const total       = aliceAmount + bobAmount;

  await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
  await disperse.fundDistribution(DIST_ID, total);

  const encAlice = mockEncrypt64(aliceAmount);
  const encBob   = mockEncrypt64(bobAmount);

  await disperse.executeDistribution(
    DIST_ID,
    [alice.address, bob.address],
    [encAlice.einput, encBob.einput],
    [encAlice.proof,  encBob.proof],
  );

  return { aliceAmount, bobAmount, total };
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════

describe("ConfidentialDisperse", function () {

  // ── Deployment ────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("deploys and sets owner correctly", async function () {
      const { disperse, owner } = await loadFixture(deployFixture);
      expect(await disperse.owner()).to.equal(owner.address);
    });

    it("address is a non-zero contract address", async function () {
      const { disperse } = await loadFixture(deployFixture);
      expect(await disperse.getAddress()).to.match(/^0x[0-9a-fA-F]{40}$/);
    });
  });

  // ── createDistribution ────────────────────────────────────────────────

  describe("createDistribution", function () {
    it("stores distribution with correct fields", async function () {
      const { disperse, token, owner } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 3);

      const d = await disperse.getDistribution(DIST_ID);
      expect(d.token).to.equal(await token.getAddress());
      expect(d.operator).to.equal(owner.address);
      expect(d.recipientCount).to.equal(3n);
      expect(d.totalFunded).to.equal(0n);
      expect(d.executed).to.be.false;
    });

    it("emits DistributionCreated", async function () {
      const { disperse, token, owner } = await loadFixture(deployFixture);
      await expect(
        disperse.createDistribution(DIST_ID, await token.getAddress(), 2)
      )
        .to.emit(disperse, "DistributionCreated")
        .withArgs(DIST_ID, owner.address, await token.getAddress(), 2n);
    });

    it("reverts DistributionAlreadyExists on duplicate id", async function () {
      const { disperse, token } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);
      await expect(
        disperse.createDistribution(DIST_ID, await token.getAddress(), 1)
      ).to.be.revertedWithCustomError(disperse, "DistributionAlreadyExists");
    });

    it("different operators can create distributions with different ids", async function () {
      const { disperse, token, alice } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID,  await token.getAddress(), 1);
      await disperse.connect(alice).createDistribution(DIST_ID2, await token.getAddress(), 1);

      expect((await disperse.getDistribution(DIST_ID)).operator).to.equal(
        (await ethers.getSigners())[0].address
      );
      expect((await disperse.getDistribution(DIST_ID2)).operator).to.equal(alice.address);
    });
  });

  // ── fundDistribution ──────────────────────────────────────────────────

  describe("fundDistribution", function () {
    it("transfers tokens to contract and updates totalFunded", async function () {
      const { disperse, token, owner } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);

      const amount = 5_000_000n;
      const disperseAddr = await disperse.getAddress();
      const before = await token.balanceOf(disperseAddr);

      await disperse.fundDistribution(DIST_ID, amount);

      expect(await token.balanceOf(disperseAddr)).to.equal(before + amount);
      expect((await disperse.getDistribution(DIST_ID)).totalFunded).to.equal(amount);
    });

    it("emits DistributionFunded", async function () {
      const { disperse, token } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);

      await expect(disperse.fundDistribution(DIST_ID, 1_000_000n))
        .to.emit(disperse, "DistributionFunded")
        .withArgs(DIST_ID, 1_000_000n, 1_000_000n);
    });

    it("can be funded in multiple tranches", async function () {
      const { disperse, token } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);

      await disperse.fundDistribution(DIST_ID, 1_000_000n);
      await disperse.fundDistribution(DIST_ID, 2_000_000n);

      expect((await disperse.getDistribution(DIST_ID)).totalFunded).to.equal(3_000_000n);
    });

    it("reverts DistributionNotFound for unknown id", async function () {
      const { disperse } = await loadFixture(deployFixture);
      await expect(
        disperse.fundDistribution(DIST_ID, 1_000_000n)
      ).to.be.revertedWithCustomError(disperse, "DistributionNotFound");
    });

    it("reverts AlreadyExecuted after execution", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      await expect(
        disperse.fundDistribution(DIST_ID, 1_000_000n)
      ).to.be.revertedWithCustomError(disperse, "AlreadyExecuted");
    });
  });

  // ── executeDistribution ───────────────────────────────────────────────

  describe("executeDistribution", function () {
    it("stores encrypted allocations and sets executed = true", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const d = await disperse.getDistribution(DIST_ID);
      expect(d.executed).to.be.true;

      const handle = await disperse.getAllocationHandle(DIST_ID, alice.address);
      expect(handle).to.not.equal(ethers.ZeroHash);
    });

    it("emits DistributionExecuted", async function () {
      const { disperse, token } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);
      await disperse.fundDistribution(DIST_ID, 1_000_000n);

      const { einput, proof } = mockEncrypt64(1_000_000n);
      await expect(
        disperse.executeDistribution(
          DIST_ID,
          [(await ethers.getSigners())[1].address],
          [einput],
          [proof],
        )
      )
        .to.emit(disperse, "DistributionExecuted")
        .withArgs(DIST_ID, 1n);
    });

    it("reverts NotOperator when non-operator calls", async function () {
      const { disperse, token, alice, bob } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);
      await disperse.fundDistribution(DIST_ID, 1_000_000n);

      const { einput, proof } = mockEncrypt64(1_000_000n);
      await expect(
        disperse.connect(alice).executeDistribution(
          DIST_ID, [bob.address], [einput], [proof]
        )
      ).to.be.revertedWithCustomError(disperse, "NotOperator");
    });

    it("reverts AlreadyExecuted on second call", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const { einput, proof } = mockEncrypt64(1_000_000n);
      await expect(
        disperse.executeDistribution(DIST_ID, [alice.address], [einput], [proof])
      ).to.be.revertedWithCustomError(disperse, "AlreadyExecuted");
    });

    it("reverts ArrayLengthMismatch when arrays differ in length", async function () {
      const { disperse, token, alice, bob } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
      await disperse.fundDistribution(DIST_ID, 2_000_000n);

      const { einput, proof } = mockEncrypt64(1_000_000n);
      await expect(
        disperse.executeDistribution(
          DIST_ID,
          [alice.address, bob.address],
          [einput],
          [proof],
        )
      ).to.be.revertedWithCustomError(disperse, "ArrayLengthMismatch");
    });

    it("reverts DistributionNotFound for unknown id", async function () {
      const { disperse, alice } = await loadFixture(deployFixture);
      const { einput, proof } = mockEncrypt64(1_000_000n);
      await expect(
        disperse.executeDistribution(DIST_ID, [alice.address], [einput], [proof])
      ).to.be.revertedWithCustomError(disperse, "DistributionNotFound");
    });
  });

  // ── claim ─────────────────────────────────────────────────────────────

  describe("claim", function () {
    it("transfers correct token amount to recipient", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      const { aliceAmount } = await executeFullDistribution(disperse, token, owner, alice, bob);

      const before = await token.balanceOf(alice.address);
      const { decryptedResult, decryptionProof } = mockDecrypt64(aliceAmount);
      await disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof);

      expect(await token.balanceOf(alice.address)).to.equal(before + aliceAmount);
    });

    it("sets claimed = true after claim", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof);

      expect(await disperse.claimed(DIST_ID, alice.address)).to.be.true;
    });

    it("emits AllocationClaimed with correct amount", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      const { aliceAmount } = await executeFullDistribution(disperse, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(aliceAmount);
      await expect(
        disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof)
      )
        .to.emit(disperse, "AllocationClaimed")
        .withArgs(DIST_ID, alice.address, aliceAmount);
    });

    it("reverts NotExecuted before execution", async function () {
      const { disperse, token, alice } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await expect(
        disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "NotExecuted");
    });

    it("reverts NoAllocation for address with no encrypted amount", async function () {
      const { disperse, token, owner, alice, bob, stranger } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await expect(
        disperse.connect(stranger).claim(DIST_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "NoAllocation");
    });

    it("reverts AlreadyClaimed on second claim call", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof);

      await expect(
        disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "AlreadyClaimed");
    });

    it("reverts DistributionNotFound for unknown id", async function () {
      const { disperse, alice } = await loadFixture(deployFixture);
      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await expect(
        disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "DistributionNotFound");
    });
  });

  // ── Multi-recipient flows ─────────────────────────────────────────────

  describe("Multi-recipient claims", function () {
    it("all recipients receive correct independent amounts", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      const { aliceAmount, bobAmount } = await executeFullDistribution(
        disperse, token, owner, alice, bob
      );

      const aliceBefore = await token.balanceOf(alice.address);
      const bobBefore   = await token.balanceOf(bob.address);

      const aliceDec = mockDecrypt64(aliceAmount);
      const bobDec   = mockDecrypt64(bobAmount);

      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);
      await disperse.connect(bob).claim(DIST_ID, bobDec.decryptedResult, bobDec.decryptionProof);

      expect(await token.balanceOf(alice.address)).to.equal(aliceBefore + aliceAmount);
      expect(await token.balanceOf(bob.address)).to.equal(bobBefore + bobAmount);
    });

    it("one recipient claiming does not affect another's state", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const aliceDec = mockDecrypt64(1_000_000n);
      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

      expect(await disperse.claimed(DIST_ID, bob.address)).to.be.false;
    });

    it("claims can happen in any order", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      const { aliceAmount, bobAmount } = await executeFullDistribution(
        disperse, token, owner, alice, bob
      );

      // Bob claims first
      const bobDec   = mockDecrypt64(bobAmount);
      const aliceDec = mockDecrypt64(aliceAmount);

      await disperse.connect(bob).claim(DIST_ID, bobDec.decryptedResult, bobDec.decryptionProof);
      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

      expect(await token.balanceOf(bob.address)).to.equal(bobAmount);
      expect(await token.balanceOf(alice.address)).to.equal(aliceAmount);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────

  describe("Edge cases", function () {
    it("reverts AlreadyClaimed if recipient tries claim after claiming", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof);

      await expect(
        disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "AlreadyClaimed");
    });

    it("operator cannot claim for a recipient they are not", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await expect(
        disperse.connect(owner).claim(DIST_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "NoAllocation");
    });

    it("two separate distributions are completely independent", async function () {
      const { disperse, token, owner, alice, bob, charlie } =
        await loadFixture(deployFixture);

      // Distribution 1: alice
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);
      await disperse.fundDistribution(DIST_ID, 1_000_000n);
      const e1 = mockEncrypt64(1_000_000n);
      await disperse.executeDistribution(DIST_ID, [alice.address], [e1.einput], [e1.proof]);

      // Distribution 2: charlie
      await disperse.createDistribution(DIST_ID2, await token.getAddress(), 1);
      await disperse.fundDistribution(DIST_ID2, 500_000n);
      const e2 = mockEncrypt64(500_000n);
      await disperse.executeDistribution(DIST_ID2, [charlie.address], [e2.einput], [e2.proof]);

      const d1 = mockDecrypt64(1_000_000n);
      const d2 = mockDecrypt64(500_000n);

      await disperse.connect(alice).claim(DIST_ID, d1.decryptedResult, d1.decryptionProof);
      await disperse.connect(charlie).claim(DIST_ID2, d2.decryptedResult, d2.decryptionProof);

      expect(await token.balanceOf(alice.address)).to.equal(1_000_000n);
      expect(await token.balanceOf(charlie.address)).to.equal(500_000n);

      // Alice has no allocation in distribution 2
      await expect(
        disperse.connect(alice).claim(DIST_ID2, d1.decryptedResult, d1.decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "NoAllocation");
    });

    it("getAllocationHandle returns zero hash for address not in distribution", async function () {
      const { disperse, token, owner, alice, bob, stranger } = await loadFixture(deployFixture);
      await executeFullDistribution(disperse, token, owner, alice, bob);

      const handle = await disperse.getAllocationHandle(DIST_ID, stranger.address);
      expect(handle).to.equal(ethers.ZeroHash);
    });
  });

});
