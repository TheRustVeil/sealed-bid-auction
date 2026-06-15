/**
 * validation.test.js — Input-validation and boundary-condition tests.
 *
 * Covers the three edge-case classes called out in the Phase 7 checklist:
 *   1. Bad address  — address(0) as a recipient
 *   2. Duplicates   — the same recipient address appears more than once
 *   3. Over-funded  — total encrypted allocations exceed the funded balance
 *
 * These tests exercise ConfidentialDisperse (the primary settlement contract).
 * Equivalent airdrop behaviour is tested inline where the logic differs.
 */

const { expect }      = require("chai");
const { ethers }      = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployFhevmMocks, mockEncrypt64, mockDecrypt64 } = require("./helpers/fhevm-mock");

// ── Fixture ────────────────────────────────────────────────────────────────

async function deployFixture() {
  const [owner, alice, bob, charlie] = await ethers.getSigners();

  await deployFhevmMocks();

  const Token   = await ethers.getContractFactory("ConfidentialToken");
  const token   = await Token.deploy("Validation Token", "VLD", 6, owner.address);

  const Disperse = await ethers.getContractFactory("ConfidentialDisperse");
  const disperse = await Disperse.deploy(owner.address);

  const SUPPLY = ethers.parseUnits("10000", 6);
  await token.mint(owner.address, SUPPLY);
  await token.approve(await disperse.getAddress(), SUPPLY);

  return { owner, alice, bob, charlie, token, disperse };
}

const DIST_ID = ethers.id("validation-tests");

// ═══════════════════════════════════════════════════════════════════════════
// 1. Bad address — address(0) as recipient
// ═══════════════════════════════════════════════════════════════════════════

describe("Validation — bad recipient address (address(0))", function () {

  it("executeDistribution accepts address(0) as a recipient (no on-chain guard)", async function () {
    // The contract does not validate recipient addresses during execute; tokens
    // would be locked in the contract indefinitely because address(0) cannot
    // sign a claim transaction.  This test documents the behaviour and acts as
    // a regression guard if a guard is added later.
    const { disperse, token } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);
    await disperse.fundDistribution(DIST_ID, 1_000_000n);

    const { einput, proof } = mockEncrypt64(1_000_000n);
    await expect(
      disperse.executeDistribution(
        DIST_ID,
        [ethers.ZeroAddress],
        [einput],
        [proof],
      )
    ).to.not.be.reverted;

    const d = await disperse.getDistribution(DIST_ID);
    expect(d.executed).to.be.true;
  });

  it("address(0) handle is stored (non-zero); allocation is inaccessible", async function () {
    const { disperse, token } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 1);
    await disperse.fundDistribution(DIST_ID, 1_000_000n);

    const { einput, proof } = mockEncrypt64(1_000_000n);
    await disperse.executeDistribution(DIST_ID, [ethers.ZeroAddress], [einput], [proof]);

    const handle = await disperse.getAllocationHandle(DIST_ID, ethers.ZeroAddress);
    expect(handle).to.not.equal(ethers.ZeroHash);
  });

  it("airdrop: addRecipients also accepts address(0) without reverting", async function () {
    const { token, owner } = await loadFixture(deployFixture);
    const Airdrop  = await ethers.getContractFactory("ConfidentialAirdrop");
    const airdrop  = await Airdrop.deploy(owner.address);
    await token.approve(await airdrop.getAddress(), 1_000_000n);

    const AIRDROP_ID = ethers.id("validation-airdrop");
    await airdrop.createAirdrop(AIRDROP_ID, await token.getAddress());

    const { einput, proof } = mockEncrypt64(1_000_000n);
    await expect(
      airdrop.addRecipients(AIRDROP_ID, [ethers.ZeroAddress], [einput], [proof])
    ).to.not.be.reverted;
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Duplicate recipients in the same executeDistribution call
// ═══════════════════════════════════════════════════════════════════════════

describe("Validation — duplicate recipients", function () {

  it("last allocation wins when the same address appears twice in one call", async function () {
    const { disperse, token, alice } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
    await disperse.fundDistribution(DIST_ID, 3_000_000n);

    const enc1 = mockEncrypt64(1_000_000n);
    const enc2 = mockEncrypt64(2_000_000n);

    await disperse.executeDistribution(
      DIST_ID,
      [alice.address, alice.address],
      [enc1.einput, enc2.einput],
      [enc1.proof,  enc2.proof],
    );

    // Mock convention: handle = bytes32(uint256(value)); final write is enc2
    const handle = await disperse.getAllocationHandle(DIST_ID, alice.address);
    expect(BigInt(handle)).to.equal(2_000_000n);
  });

  it("after a duplicate-write execute, alice claims only the final (second) allocation", async function () {
    const { disperse, token, alice } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
    await disperse.fundDistribution(DIST_ID, 3_000_000n);

    const enc1 = mockEncrypt64(1_000_000n);
    const enc2 = mockEncrypt64(2_000_000n);

    await disperse.executeDistribution(
      DIST_ID,
      [alice.address, alice.address],
      [enc1.einput, enc2.einput],
      [enc1.proof,  enc2.proof],
    );

    const before = await token.balanceOf(alice.address);
    const { decryptedResult, decryptionProof } = mockDecrypt64(2_000_000n);
    await disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof);

    expect(await token.balanceOf(alice.address)).to.equal(before + 2_000_000n);
    expect(await disperse.claimed(DIST_ID, alice.address)).to.be.true;
  });

  it("second claim after first succeeds reverts AlreadyClaimed (no double-collect)", async function () {
    const { disperse, token, alice } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
    await disperse.fundDistribution(DIST_ID, 3_000_000n);

    const enc1 = mockEncrypt64(1_000_000n);
    const enc2 = mockEncrypt64(2_000_000n);
    await disperse.executeDistribution(
      DIST_ID,
      [alice.address, alice.address],
      [enc1.einput, enc2.einput],
      [enc1.proof,  enc2.proof],
    );

    const { decryptedResult, decryptionProof } = mockDecrypt64(2_000_000n);
    await disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof);

    await expect(
      disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof)
    ).to.be.revertedWithCustomError(disperse, "AlreadyClaimed");
  });

  it("airdrop: addRecipients with duplicate address overwrites, only one claim possible", async function () {
    const { token, owner, alice } = await loadFixture(deployFixture);
    const Airdrop   = await ethers.getContractFactory("ConfidentialAirdrop");
    const airdrop   = await Airdrop.deploy(owner.address);
    const SUPPLY    = ethers.parseUnits("10000", 6);
    await token.approve(await airdrop.getAddress(), SUPPLY);

    const AID = ethers.id("dup-airdrop");
    await airdrop.createAirdrop(AID, await token.getAddress());

    const enc1 = mockEncrypt64(1_000_000n);
    const enc2 = mockEncrypt64(5_000_000n);
    await airdrop.addRecipients(
      AID,
      [alice.address, alice.address],
      [enc1.einput, enc2.einput],
      [enc1.proof, enc2.proof],
    );
    await airdrop.sealAirdrop(AID);
    await airdrop.fundAirdrop(AID, 5_000_000n);

    const handle = await airdrop.getAllocationHandle(AID, alice.address);
    expect(BigInt(handle)).to.equal(5_000_000n);

    const before = await token.balanceOf(alice.address);
    const { decryptedResult, decryptionProof } = mockDecrypt64(5_000_000n);
    await airdrop.connect(alice).claim(AID, decryptedResult, decryptionProof);
    expect(await token.balanceOf(alice.address)).to.equal(before + 5_000_000n);

    // Second claim must fail
    await expect(
      airdrop.connect(alice).claim(AID, decryptedResult, decryptionProof)
    ).to.be.revertedWithCustomError(airdrop, "AlreadyClaimed");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Allocations exceed funded balance (total > funded)
// ═══════════════════════════════════════════════════════════════════════════

describe("Validation — total allocations exceed funded balance", function () {

  it("executeDistribution succeeds even when sum of allocations > totalFunded", async function () {
    // The contract does not check allocation sums at execute time — it relies on
    // ERC-20 balance checks at transfer time.  This test confirms that over-
    // allocation is detectable only when the last claimant tries to withdraw.
    const { disperse, token, alice, bob } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);

    await disperse.fundDistribution(DIST_ID, 1_000_000n);

    const encAlice = mockEncrypt64(800_000n);
    const encBob   = mockEncrypt64(1_200_000n);

    await expect(
      disperse.executeDistribution(
        DIST_ID,
        [alice.address, bob.address],
        [encAlice.einput, encBob.einput],
        [encAlice.proof,  encBob.proof],
      )
    ).to.not.be.reverted;
  });

  it("first claimant succeeds when their allocation fits within funded balance", async function () {
    const { disperse, token, alice, bob } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
    await disperse.fundDistribution(DIST_ID, 1_000_000n);

    const encAlice = mockEncrypt64(800_000n);
    const encBob   = mockEncrypt64(1_200_000n);

    await disperse.executeDistribution(
      DIST_ID,
      [alice.address, bob.address],
      [encAlice.einput, encBob.einput],
      [encAlice.proof,  encBob.proof],
    );

    const before = await token.balanceOf(alice.address);
    const { decryptedResult, decryptionProof } = mockDecrypt64(800_000n);
    await disperse.connect(alice).claim(DIST_ID, decryptedResult, decryptionProof);
    expect(await token.balanceOf(alice.address)).to.equal(before + 800_000n);
  });

  it("second claimant whose allocation exceeds remaining balance gets ERC20 transfer revert", async function () {
    const { disperse, token, alice, bob } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
    await disperse.fundDistribution(DIST_ID, 1_000_000n);

    const encAlice = mockEncrypt64(800_000n);
    const encBob   = mockEncrypt64(1_200_000n);

    await disperse.executeDistribution(
      DIST_ID,
      [alice.address, bob.address],
      [encAlice.einput, encBob.einput],
      [encAlice.proof,  encBob.proof],
    );

    // Drain most of the balance via alice's claim
    const aliceDec = mockDecrypt64(800_000n);
    await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

    // Bob's claim now exceeds the remaining 200_000 — should revert
    const bobDec = mockDecrypt64(1_200_000n);
    await expect(
      disperse.connect(bob).claim(DIST_ID, bobDec.decryptedResult, bobDec.decryptionProof)
    ).to.be.reverted; // SafeERC20: ERC20 transfer amount exceeds balance
  });

  it("operator can top-up funding before claims to prevent the shortfall", async function () {
    const { disperse, token, alice, bob } = await loadFixture(deployFixture);
    await disperse.createDistribution(DIST_ID, await token.getAddress(), 2);
    await disperse.fundDistribution(DIST_ID, 1_000_000n);

    const encAlice = mockEncrypt64(800_000n);
    const encBob   = mockEncrypt64(1_200_000n);

    await disperse.executeDistribution(
      DIST_ID,
      [alice.address, bob.address],
      [encAlice.einput, encBob.einput],
      [encAlice.proof,  encBob.proof],
    );

    // Top-up via direct transfer (fundDistribution reverts after execution)
    await token.transfer(await disperse.getAddress(), 1_000_000n);

    const aliceDec = mockDecrypt64(800_000n);
    await disperse.connect(alice).claim(DIST_ID, aliceDec.decryptedResult, aliceDec.decryptionProof);

    const bobBefore = await token.balanceOf(bob.address);
    const bobDec = mockDecrypt64(1_200_000n);
    await disperse.connect(bob).claim(DIST_ID, bobDec.decryptedResult, bobDec.decryptionProof);
    expect(await token.balanceOf(bob.address)).to.equal(bobBefore + 1_200_000n);
  });
});
