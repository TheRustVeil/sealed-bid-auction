/**
 * airdrop.test.js — ConfidentialAirdrop lifecycle and edge-case tests.
 *
 * ConfidentialAirdrop is the pull-claim variant:
 *   createAirdrop → addRecipients (repeatable) → sealAirdrop → fundAirdrop → claim
 *
 * Same mock infrastructure as disperse.test.js.
 * New claim flow: recipient calls claim(airdropId, decryptedResult, decryptionProof)
 * directly using KMS-signed proof (mocked locally via mockDecrypt64).
 */

const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployFhevmMocks, mockEncrypt64, mockDecrypt64 } = require("./helpers/fhevm-mock");

// ── Fixture ────────────────────────────────────────────────────────────────

async function deployFixture() {
  const [owner, alice, bob, charlie, stranger] = await ethers.getSigners();

  await deployFhevmMocks();

  const Token  = await ethers.getContractFactory("ConfidentialToken");
  const token  = await Token.deploy("Airdrop Token", "ADT", 6, owner.address);

  const Airdrop = await ethers.getContractFactory("ConfidentialAirdrop");
  const airdrop = await Airdrop.deploy(owner.address);

  const SUPPLY = ethers.parseUnits("10000", 6);
  await token.mint(owner.address, SUPPLY);
  await token.approve(await airdrop.getAddress(), SUPPLY);

  return { owner, alice, bob, charlie, stranger, token, airdrop };
}

// ── Constants ─────────────────────────────────────────────────────────────

const AIRDROP_ID  = ethers.id("airdrop-season-1");
const AIRDROP_ID2 = ethers.id("airdrop-season-2");

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Full operator setup: create → addRecipients(alice+bob) → seal → fund.
 * Returns the plaintext amounts for balance assertions.
 */
async function setupSealedAirdrop(airdrop, token, owner, alice, bob) {
  const aliceAmount = 1_500_000n;
  const bobAmount   = 3_000_000n;
  const total       = aliceAmount + bobAmount;

  await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

  const encAlice = mockEncrypt64(aliceAmount);
  const encBob   = mockEncrypt64(bobAmount);
  await airdrop.addRecipients(
    AIRDROP_ID,
    [alice.address, bob.address],
    [encAlice.einput, encBob.einput],
    [encAlice.proof,  encBob.proof],
  );

  await airdrop.sealAirdrop(AIRDROP_ID);
  await airdrop.fundAirdrop(AIRDROP_ID, total);

  return { aliceAmount, bobAmount, total };
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════

describe("ConfidentialAirdrop", function () {

  // ── Deployment ────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("deploys with correct owner", async function () {
      const { airdrop, owner } = await loadFixture(deployFixture);
      expect(await airdrop.owner()).to.equal(owner.address);
    });
  });

  // ── createAirdrop ─────────────────────────────────────────────────────

  describe("createAirdrop", function () {
    it("stores airdrop with correct initial fields", async function () {
      const { airdrop, token, owner } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      const a = await airdrop.airdrops(AIRDROP_ID);
      expect(a.token).to.equal(await token.getAddress());
      expect(a.operator).to.equal(owner.address);
      expect(a.totalFunded).to.equal(0n);
      expect(a.isSealed).to.be.false;
    });

    it("emits AirdropCreated", async function () {
      const { airdrop, token, owner } = await loadFixture(deployFixture);
      await expect(airdrop.createAirdrop(AIRDROP_ID, await token.getAddress()))
        .to.emit(airdrop, "AirdropCreated")
        .withArgs(AIRDROP_ID, owner.address, await token.getAddress());
    });

    it("reverts AirdropAlreadyExists on duplicate id", async function () {
      const { airdrop, token } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());
      await expect(
        airdrop.createAirdrop(AIRDROP_ID, await token.getAddress())
      ).to.be.revertedWithCustomError(airdrop, "AirdropAlreadyExists");
    });
  });

  // ── addRecipients ─────────────────────────────────────────────────────

  describe("addRecipients", function () {
    it("operator can add a batch of recipients", async function () {
      const { airdrop, token, alice, bob } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      const encAlice = mockEncrypt64(1_000_000n);
      const encBob   = mockEncrypt64(2_000_000n);

      await expect(
        airdrop.addRecipients(
          AIRDROP_ID,
          [alice.address, bob.address],
          [encAlice.einput, encBob.einput],
          [encAlice.proof,  encBob.proof],
        )
      ).to.emit(airdrop, "RecipientsAdded").withArgs(AIRDROP_ID, 2n);
    });

    it("can be called multiple times before sealing", async function () {
      const { airdrop, token, alice, bob } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      const e1 = mockEncrypt64(1_000_000n);
      await airdrop.addRecipients(AIRDROP_ID, [alice.address], [e1.einput], [e1.proof]);

      const e2 = mockEncrypt64(2_000_000n);
      await airdrop.addRecipients(AIRDROP_ID, [bob.address], [e2.einput], [e2.proof]);

      const handleAlice = await airdrop.getAllocationHandle(AIRDROP_ID, alice.address);
      const handleBob   = await airdrop.getAllocationHandle(AIRDROP_ID, bob.address);
      expect(handleAlice).to.not.equal(ethers.ZeroHash);
      expect(handleBob).to.not.equal(ethers.ZeroHash);
    });

    it("overwrites an existing allocation when called with same recipient again", async function () {
      const { airdrop, token, alice } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      const e1 = mockEncrypt64(1_000_000n);
      await airdrop.addRecipients(AIRDROP_ID, [alice.address], [e1.einput], [e1.proof]);
      const handle1 = await airdrop.getAllocationHandle(AIRDROP_ID, alice.address);

      const e2 = mockEncrypt64(9_999_999n);
      await airdrop.addRecipients(AIRDROP_ID, [alice.address], [e2.einput], [e2.proof]);
      const handle2 = await airdrop.getAllocationHandle(AIRDROP_ID, alice.address);

      expect(handle2).to.not.equal(handle1);
    });

    it("reverts NotOperator when non-operator adds recipients", async function () {
      const { airdrop, token, alice, bob } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      const e = mockEncrypt64(1_000_000n);
      await expect(
        airdrop.connect(alice).addRecipients(AIRDROP_ID, [bob.address], [e.einput], [e.proof])
      ).to.be.revertedWithCustomError(airdrop, "NotOperator");
    });

    it("reverts AlreadySealed after sealing", async function () {
      const { airdrop, token, alice } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());
      await airdrop.sealAirdrop(AIRDROP_ID);

      const e = mockEncrypt64(1_000_000n);
      await expect(
        airdrop.addRecipients(AIRDROP_ID, [alice.address], [e.einput], [e.proof])
      ).to.be.revertedWithCustomError(airdrop, "AlreadySealed");
    });

    it("reverts ArrayLengthMismatch when arrays differ in length", async function () {
      const { airdrop, token, alice, bob } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      const e = mockEncrypt64(1_000_000n);
      await expect(
        airdrop.addRecipients(
          AIRDROP_ID,
          [alice.address, bob.address],
          [e.einput],
          [e.proof],
        )
      ).to.be.revertedWithCustomError(airdrop, "ArrayLengthMismatch");
    });

    it("reverts AirdropNotFound for unknown airdropId", async function () {
      const { airdrop, alice } = await loadFixture(deployFixture);
      const e = mockEncrypt64(1_000_000n);
      await expect(
        airdrop.addRecipients(AIRDROP_ID, [alice.address], [e.einput], [e.proof])
      ).to.be.revertedWithCustomError(airdrop, "AirdropNotFound");
    });
  });

  // ── sealAirdrop ───────────────────────────────────────────────────────

  describe("sealAirdrop", function () {
    it("sets isSealed = true and emits AirdropSealed", async function () {
      const { airdrop, token } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      await expect(airdrop.sealAirdrop(AIRDROP_ID))
        .to.emit(airdrop, "AirdropSealed")
        .withArgs(AIRDROP_ID);

      expect((await airdrop.airdrops(AIRDROP_ID)).isSealed).to.be.true;
    });

    it("reverts NotOperator when non-operator tries to seal", async function () {
      const { airdrop, token, alice } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      await expect(
        airdrop.connect(alice).sealAirdrop(AIRDROP_ID)
      ).to.be.revertedWithCustomError(airdrop, "NotOperator");
    });

    it("reverts AlreadySealed on duplicate seal call", async function () {
      const { airdrop, token } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());
      await airdrop.sealAirdrop(AIRDROP_ID);

      await expect(airdrop.sealAirdrop(AIRDROP_ID))
        .to.be.revertedWithCustomError(airdrop, "AlreadySealed");
    });
  });

  // ── fundAirdrop ───────────────────────────────────────────────────────

  describe("fundAirdrop", function () {
    it("transfers tokens and updates totalFunded", async function () {
      const { airdrop, token } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      const airdropAddr = await airdrop.getAddress();
      const before = await token.balanceOf(airdropAddr);
      await airdrop.fundAirdrop(AIRDROP_ID, 2_000_000n);

      expect(await token.balanceOf(airdropAddr)).to.equal(before + 2_000_000n);
      expect((await airdrop.airdrops(AIRDROP_ID)).totalFunded).to.equal(2_000_000n);
    });

    it("emits AirdropFunded", async function () {
      const { airdrop, token } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      await expect(airdrop.fundAirdrop(AIRDROP_ID, 1_000_000n))
        .to.emit(airdrop, "AirdropFunded")
        .withArgs(AIRDROP_ID, 1_000_000n, 1_000_000n);
    });

    it("can be funded before and after sealing", async function () {
      const { airdrop, token } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

      await airdrop.fundAirdrop(AIRDROP_ID, 1_000_000n);
      await airdrop.sealAirdrop(AIRDROP_ID);
      await airdrop.fundAirdrop(AIRDROP_ID, 1_000_000n);

      expect((await airdrop.airdrops(AIRDROP_ID)).totalFunded).to.equal(2_000_000n);
    });

    it("reverts AirdropNotFound for unknown id", async function () {
      const { airdrop } = await loadFixture(deployFixture);
      await expect(
        airdrop.fundAirdrop(AIRDROP_ID, 1_000_000n)
      ).to.be.revertedWithCustomError(airdrop, "AirdropNotFound");
    });
  });

  // ── claim ─────────────────────────────────────────────────────────────

  describe("claim", function () {
    it("transfers correct amount to recipient and emits AllocationClaimed", async function () {
      const { airdrop, token, owner, alice, bob } = await loadFixture(deployFixture);
      const { aliceAmount } = await setupSealedAirdrop(airdrop, token, owner, alice, bob);

      const before = await token.balanceOf(alice.address);
      const { decryptedResult, decryptionProof } = mockDecrypt64(aliceAmount);

      await expect(
        airdrop.connect(alice).claim(AIRDROP_ID, decryptedResult, decryptionProof)
      )
        .to.emit(airdrop, "AllocationClaimed")
        .withArgs(AIRDROP_ID, alice.address, aliceAmount);

      expect(await token.balanceOf(alice.address)).to.equal(before + aliceAmount);
    });

    it("sets claimed = true after claim", async function () {
      const { airdrop, token, owner, alice, bob } = await loadFixture(deployFixture);
      await setupSealedAirdrop(airdrop, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_500_000n);
      await airdrop.connect(alice).claim(AIRDROP_ID, decryptedResult, decryptionProof);

      expect(await airdrop.claimed(AIRDROP_ID, alice.address)).to.be.true;
    });

    it("reverts NotSealed before sealing", async function () {
      const { airdrop, token, alice } = await loadFixture(deployFixture);
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());
      const e = mockEncrypt64(1_000_000n);
      await airdrop.addRecipients(AIRDROP_ID, [alice.address], [e.einput], [e.proof]);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await expect(
        airdrop.connect(alice).claim(AIRDROP_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(airdrop, "NotSealed");
    });

    it("reverts NoAllocation for address not in the airdrop", async function () {
      const { airdrop, token, owner, alice, bob, stranger } = await loadFixture(deployFixture);
      await setupSealedAirdrop(airdrop, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await expect(
        airdrop.connect(stranger).claim(AIRDROP_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(airdrop, "NoAllocation");
    });

    it("reverts AlreadyClaimed on second claim call", async function () {
      const { airdrop, token, owner, alice, bob } = await loadFixture(deployFixture);
      await setupSealedAirdrop(airdrop, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(1_500_000n);
      await airdrop.connect(alice).claim(AIRDROP_ID, decryptedResult, decryptionProof);

      await expect(
        airdrop.connect(alice).claim(AIRDROP_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(airdrop, "AlreadyClaimed");
    });

    it("reverts AirdropNotFound for unknown id", async function () {
      const { airdrop, alice } = await loadFixture(deployFixture);
      const { decryptedResult, decryptionProof } = mockDecrypt64(1_000_000n);
      await expect(
        airdrop.connect(alice).claim(AIRDROP_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(airdrop, "AirdropNotFound");
    });
  });

  // ── Multi-recipient and edge cases ────────────────────────────────────

  describe("Multi-recipient and edge cases", function () {
    it("all recipients receive correct independent amounts", async function () {
      const { airdrop, token, owner, alice, bob } = await loadFixture(deployFixture);
      const { aliceAmount, bobAmount } = await setupSealedAirdrop(
        airdrop, token, owner, alice, bob
      );

      const aliceDec = mockDecrypt64(aliceAmount);
      const bobDec   = mockDecrypt64(bobAmount);

      await airdrop.connect(alice).claim(AIRDROP_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);
      await airdrop.connect(bob).claim(AIRDROP_ID, bobDec.decryptedResult, bobDec.decryptionProof);

      expect(await token.balanceOf(alice.address)).to.equal(aliceAmount);
      expect(await token.balanceOf(bob.address)).to.equal(bobAmount);
    });

    it("one recipient's claim does not affect another's claimed state", async function () {
      const { airdrop, token, owner, alice, bob } = await loadFixture(deployFixture);
      await setupSealedAirdrop(airdrop, token, owner, alice, bob);

      const aliceDec = mockDecrypt64(1_500_000n);
      await airdrop.connect(alice).claim(AIRDROP_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

      expect(await airdrop.claimed(AIRDROP_ID, bob.address)).to.be.false;
    });

    it("two separate airdrops are completely independent", async function () {
      const { airdrop, token, owner, alice, charlie } = await loadFixture(deployFixture);

      // Airdrop 1: alice only
      await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());
      const e1 = mockEncrypt64(1_000_000n);
      await airdrop.addRecipients(AIRDROP_ID, [alice.address], [e1.einput], [e1.proof]);
      await airdrop.sealAirdrop(AIRDROP_ID);
      await airdrop.fundAirdrop(AIRDROP_ID, 1_000_000n);

      // Airdrop 2: charlie only
      await airdrop.createAirdrop(AIRDROP_ID2, await token.getAddress());
      const e2 = mockEncrypt64(750_000n);
      await airdrop.addRecipients(AIRDROP_ID2, [charlie.address], [e2.einput], [e2.proof]);
      await airdrop.sealAirdrop(AIRDROP_ID2);
      await airdrop.fundAirdrop(AIRDROP_ID2, 750_000n);

      const d1 = mockDecrypt64(1_000_000n);
      const d2 = mockDecrypt64(750_000n);

      await airdrop.connect(alice).claim(AIRDROP_ID, d1.decryptedResult, d1.decryptionProof);
      await airdrop.connect(charlie).claim(AIRDROP_ID2, d2.decryptedResult, d2.decryptionProof);

      expect(await token.balanceOf(alice.address)).to.equal(1_000_000n);
      expect(await token.balanceOf(charlie.address)).to.equal(750_000n);

      // Alice has no allocation in airdrop 2
      await expect(
        airdrop.connect(alice).claim(AIRDROP_ID2, d1.decryptedResult, d1.decryptionProof)
      ).to.be.revertedWithCustomError(airdrop, "NoAllocation");
    });

    it("getAllocationHandle returns zero hash for non-recipient", async function () {
      const { airdrop, token, owner, alice, bob, stranger } = await loadFixture(deployFixture);
      await setupSealedAirdrop(airdrop, token, owner, alice, bob);

      const handle = await airdrop.getAllocationHandle(AIRDROP_ID, stranger.address);
      expect(handle).to.equal(ethers.ZeroHash);
    });
  });

});
