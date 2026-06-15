/**
 * allocation.decrypt.test.js — Access-control and privacy-boundary tests.
 *
 * Focus:
 *  1. getAllocationHandle — correct handle for known recipients, zero for others
 *  2. grantDecryptAccess — only operator, requires executed, emits AuditorGranted
 *  3. grantAuditorHandleAccess — requires whitelisted auditor + valid allocation
 *  4. Privacy boundaries — recipient A's claim cannot affect B; claim uses msg.sender
 *  5. ACL integration — MockACL.isAllowed reflects FHE.allow grants
 *  6. Full multi-recipient claim flow with final balance verification
 */

const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const {
  deployFhevmMocks,
  mockEncrypt64,
  mockDecrypt64,
  FHEVM_ADDRESSES,
} = require("./helpers/fhevm-mock");

// ── Fixture ────────────────────────────────────────────────────────────────

async function deployFixture() {
  const [owner, alice, bob, auditor, stranger] = await ethers.getSigners();

  const { aclMock } = await deployFhevmMocks();

  const Token    = await ethers.getContractFactory("ConfidentialToken");
  const token    = await Token.deploy("Test Token", "TTK", 6, owner.address);

  const Disperse = await ethers.getContractFactory("ConfidentialDisperse");
  const disperse = await Disperse.deploy(owner.address);

  const SUPPLY = ethers.parseUnits("10000", 6);
  await token.mint(owner.address, SUPPLY);
  await token.approve(await disperse.getAddress(), SUPPLY);

  return { owner, alice, bob, auditor, stranger, token, disperse, aclMock };
}

// ── Constants ──────────────────────────────────────────────────────────────

const DIST_ID = ethers.id("dist-decrypt-test");

// ── Helpers ────────────────────────────────────────────────────────────────

const ALICE_AMOUNT = 1_000_000n;
const BOB_AMOUNT   = 2_000_000n;
const TOTAL        = ALICE_AMOUNT + BOB_AMOUNT;

/** Create + fund + execute a distribution for alice and bob. */
async function executeDistribution(disperse, token, owner, alice, bob) {
  await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
  await disperse.fundDistribution(DIST_ID, TOTAL);

  const encAlice = mockEncrypt64(ALICE_AMOUNT);
  const encBob   = mockEncrypt64(BOB_AMOUNT);

  await disperse.executeDistribution(
    DIST_ID,
    [alice.address, bob.address],
    [encAlice.einput, encBob.einput],
    [encAlice.proof,  encBob.proof],
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════

describe("Allocation decryption and access control", function () {

  // ── getAllocationHandle ────────────────────────────────────────────────

  describe("getAllocationHandle", function () {
    it("returns non-zero handle for each recipient after execution", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const handleAlice = await disperse.getAllocationHandle(DIST_ID, alice.address);
      const handleBob   = await disperse.getAllocationHandle(DIST_ID, bob.address);

      // Mock convention: handle = bytes32(uint256(plaintext_value))
      expect(BigInt(handleAlice)).to.equal(ALICE_AMOUNT);
      expect(BigInt(handleBob)).to.equal(BOB_AMOUNT);
    });

    it("returns zero (uninitialized) for non-recipient", async function () {
      const { disperse, token, owner, alice, bob, stranger } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const handle = await disperse.getAllocationHandle(DIST_ID, stranger.address);
      expect(handle).to.equal(ethers.ZeroHash);
    });

    it("returns zero before execution", async function () {
      const { disperse, token, alice } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);

      const handle = await disperse.getAllocationHandle(DIST_ID, alice.address);
      expect(handle).to.equal(ethers.ZeroHash);
    });
  });

  // ── ACL grants from executeDistribution ───────────────────────────────

  describe("ACL grants via executeDistribution", function () {
    it("grants ACL permission to each recipient after execution", async function () {
      const { disperse, token, owner, alice, bob, aclMock } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const handleAlice = await disperse.getAllocationHandle(DIST_ID, alice.address);
      expect(await aclMock.isAllowed(handleAlice, alice.address)).to.be.true;
    });

    it("grants ACL permission to the operator after execution", async function () {
      const { disperse, token, owner, alice, bob, aclMock } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const handleBob = await disperse.getAllocationHandle(DIST_ID, bob.address);
      expect(await aclMock.isAllowed(handleBob, owner.address)).to.be.true;
    });

    it("grants ACL permission to the contract itself", async function () {
      const { disperse, token, owner, alice, bob, aclMock } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const disperseAddr = await disperse.getAddress();
      const handleAlice  = await disperse.getAllocationHandle(DIST_ID, alice.address);
      expect(await aclMock.isAllowed(handleAlice, disperseAddr)).to.be.true;
    });
  });

  // ── grantDecryptAccess ─────────────────────────────────────────────────

  describe("grantDecryptAccess", function () {
    it("whitelists auditor and emits AuditorGranted", async function () {
      const { disperse, token, owner, alice, bob, auditor } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      await expect(disperse.grantDecryptAccess(DIST_ID, auditor.address))
        .to.emit(disperse, "AuditorGranted")
        .withArgs(DIST_ID, auditor.address);

      expect(await disperse.auditorAccess(DIST_ID, auditor.address)).to.be.true;
    });

    it("reverts NotOperator when non-operator calls it", async function () {
      const { disperse, token, owner, alice, bob, auditor, stranger } =
        await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      await expect(
        disperse.connect(stranger).grantDecryptAccess(DIST_ID, auditor.address)
      ).to.be.revertedWithCustomError(disperse, "NotOperator");
    });

    it("reverts NotExecuted before executeDistribution is called", async function () {
      const { disperse, token, auditor } = await loadFixture(deployFixture);
      await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);

      await expect(
        disperse.grantDecryptAccess(DIST_ID, auditor.address)
      ).to.be.revertedWithCustomError(disperse, "NotExecuted");
    });

    it("reverts DistributionNotFound for an unknown id", async function () {
      const { disperse, auditor } = await loadFixture(deployFixture);
      await expect(
        disperse.grantDecryptAccess(DIST_ID, auditor.address)
      ).to.be.revertedWithCustomError(disperse, "DistributionNotFound");
    });
  });

  // ── grantAuditorHandleAccess ───────────────────────────────────────────

  describe("grantAuditorHandleAccess", function () {
    it("grants ACL permission to a whitelisted auditor for a specific handle", async function () {
      const { disperse, token, owner, alice, bob, auditor, aclMock } =
        await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);
      await disperse.grantDecryptAccess(DIST_ID, auditor.address);

      await disperse.grantAuditorHandleAccess(DIST_ID, alice.address, auditor.address);

      const handleAlice = await disperse.getAllocationHandle(DIST_ID, alice.address);
      expect(await aclMock.isAllowed(handleAlice, auditor.address)).to.be.true;
    });

    it("does NOT grant the auditor access to other recipients' handles", async function () {
      const { disperse, token, owner, alice, bob, auditor, aclMock } =
        await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);
      await disperse.grantDecryptAccess(DIST_ID, auditor.address);

      await disperse.grantAuditorHandleAccess(DIST_ID, alice.address, auditor.address);

      const handleBob = await disperse.getAllocationHandle(DIST_ID, bob.address);
      expect(await aclMock.isAllowed(handleBob, auditor.address)).to.be.false;
    });

    it("reverts NotApprovedAuditor when auditor was not whitelisted first", async function () {
      const { disperse, token, owner, alice, bob, auditor } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      await expect(
        disperse.grantAuditorHandleAccess(DIST_ID, alice.address, auditor.address)
      ).to.be.revertedWithCustomError(disperse, "NotApprovedAuditor");
    });

    it("reverts NoAllocation for a recipient with no allocation", async function () {
      const { disperse, token, owner, alice, bob, auditor, stranger } =
        await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);
      await disperse.grantDecryptAccess(DIST_ID, auditor.address);

      await expect(
        disperse.grantAuditorHandleAccess(DIST_ID, stranger.address, auditor.address)
      ).to.be.revertedWithCustomError(disperse, "NoAllocation");
    });

    it("reverts NotOperator when non-operator calls it", async function () {
      const { disperse, token, owner, alice, bob, auditor, stranger } =
        await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);
      await disperse.grantDecryptAccess(DIST_ID, auditor.address);

      await expect(
        disperse.connect(stranger).grantAuditorHandleAccess(DIST_ID, alice.address, auditor.address)
      ).to.be.revertedWithCustomError(disperse, "NotOperator");
    });
  });

  // ── Privacy boundaries ─────────────────────────────────────────────────

  describe("Privacy boundaries", function () {
    it("claim uses msg.sender — a non-recipient hits NoAllocation", async function () {
      const { disperse, token, owner, alice, bob, stranger } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const { decryptedResult, decryptionProof } = mockDecrypt64(ALICE_AMOUNT);
      await expect(
        disperse.connect(stranger).claim(DIST_ID, decryptedResult, decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "NoAllocation");
    });

    it("alice's claim does not affect bob's claimed state", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const aliceDec = mockDecrypt64(ALICE_AMOUNT);
      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

      expect(await disperse.claimed(DIST_ID, bob.address)).to.be.false;
    });

    it("alice cannot claim on behalf of bob (msg.sender check)", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      // Alice claims — only her OWN allocation is affected
      const aliceDec = mockDecrypt64(ALICE_AMOUNT);
      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

      expect(await disperse.claimed(DIST_ID, alice.address)).to.be.true;
      expect(await disperse.claimed(DIST_ID, bob.address)).to.be.false;
    });

    it("claiming sends exactly alice's amount, not bob's", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const aliceBefore = await token.balanceOf(alice.address);
      const aliceDec = mockDecrypt64(ALICE_AMOUNT);
      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

      expect(await token.balanceOf(alice.address)).to.equal(aliceBefore + ALICE_AMOUNT);
      expect(await token.balanceOf(bob.address)).to.equal(0n);
    });

    it("alice's double-claim attempt reverts AlreadyClaimed", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const aliceDec = mockDecrypt64(ALICE_AMOUNT);
      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

      await expect(
        disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof)
      ).to.be.revertedWithCustomError(disperse, "AlreadyClaimed");
    });
  });

  // ── Full multi-recipient flow with balance verification ────────────────

  describe("Full claim flow with balance verification", function () {
    it("all recipients receive correct amounts; contract balance reaches zero", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const disperseAddr = await disperse.getAddress();

      const aliceDec = mockDecrypt64(ALICE_AMOUNT);
      const bobDec   = mockDecrypt64(BOB_AMOUNT);

      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);
      await disperse.connect(bob).claim(DIST_ID, bobDec.decryptedResult, bobDec.decryptionProof);

      expect(await token.balanceOf(alice.address)).to.equal(ALICE_AMOUNT);
      expect(await token.balanceOf(bob.address)).to.equal(BOB_AMOUNT);
      expect(await token.balanceOf(disperseAddr)).to.equal(0n);
    });

    it("AllocationClaimed events carry correct amounts", async function () {
      const { disperse, token, owner, alice, bob } = await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const aliceDec = mockDecrypt64(ALICE_AMOUNT);
      await expect(
        disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof)
      )
        .to.emit(disperse, "AllocationClaimed")
        .withArgs(DIST_ID, alice.address, ALICE_AMOUNT);

      const bobDec = mockDecrypt64(BOB_AMOUNT);
      await expect(
        disperse.connect(bob).claim(DIST_ID, bobDec.decryptedResult, bobDec.decryptionProof)
      )
        .to.emit(disperse, "AllocationClaimed")
        .withArgs(DIST_ID, bob.address, BOB_AMOUNT);
    });

    it("auditor can be granted per-handle access after all claims are fulfilled", async function () {
      const { disperse, token, owner, alice, bob, auditor, aclMock } =
        await loadFixture(deployFixture);
      await executeDistribution(disperse, token, owner, alice, bob);

      const aliceDec = mockDecrypt64(ALICE_AMOUNT);
      const bobDec   = mockDecrypt64(BOB_AMOUNT);

      await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);
      await disperse.connect(bob).claim(DIST_ID, bobDec.decryptedResult, bobDec.decryptionProof);

      await disperse.grantDecryptAccess(DIST_ID, auditor.address);
      await disperse.grantAuditorHandleAccess(DIST_ID, alice.address, auditor.address);
      await disperse.grantAuditorHandleAccess(DIST_ID, bob.address,   auditor.address);

      const handleAlice = await disperse.getAllocationHandle(DIST_ID, alice.address);
      const handleBob   = await disperse.getAllocationHandle(DIST_ID, bob.address);

      expect(await aclMock.isAllowed(handleAlice, auditor.address)).to.be.true;
      expect(await aclMock.isAllowed(handleBob,   auditor.address)).to.be.true;
    });
  });

});
