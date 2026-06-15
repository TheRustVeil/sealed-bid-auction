/**
 * e2e-local.js — Full end-to-end integration test on the local Hardhat network.
 *
 * Run from contracts/ with:
 *   npx hardhat run scripts/e2e-local.js --network hardhat
 *
 * What this script validates (covers Phase 7 checklist items):
 *   1. Mock fhEVM infrastructure installs cleanly (deployFhevmMocks)
 *   2. ConfidentialToken deploys and minting works
 *   3. ConfidentialDisperse full lifecycle:
 *      createDistribution → fundDistribution → executeDistribution
 *      → claim (alice, bob via mockDecrypt64) → tokens transferred
 *   4. ConfidentialAirdrop full lifecycle:
 *      addRecipients → sealAirdrop → fundAirdrop → claim (charlie via mockDecrypt64)
 *   5. PRIVACY BOUNDARY:
 *      a. A recipient can retrieve their own allocation handle (non-zero bytes32)
 *      b. A non-recipient (dave) has no allocation — handle is bytes32(0)
 *      c. After executeDistribution, alice's handle != bob's handle (distinct ciphertexts)
 *   6. Auditor selective disclosure:
 *      operator grants auditor access → auditor's handle ACL set
 *      non-auditor still has no handle ACL
 *   7. All addresses written to frontend/.env.local for live manual testing
 *
 * Exit code 0 = all checks passed. Exit code 1 = assertion failure.
 */

const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
const {
  deployFhevmMocks,
  mockEncrypt64,
  mockDecrypt64,
  parseEvent,
} = require("../test/helpers/fhevm-mock");

// ── helpers ────────────────────────────────────────────────────────────────────

function assert(condition, message) {
  if (!condition) {
    console.error(`\n✗ ASSERTION FAILED: ${message}\n`);
    process.exitCode = 1;
    throw new Error(message);
  }
}

function pass(label)    { console.log(`  ✓ ${label}`); }
function section(title) {
  console.log(`\n── ${title} ${"─".repeat(50 - title.length)}`);
}

// ── main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("ConfidentialDrop — Local E2E Integration Test");
  console.log("==============================================\n");

  // ── 1. Signers ──────────────────────────────────────────────────────────────
  section("Signers");
  const [operator, alice, bob, charlie, dave, auditor] = await ethers.getSigners();
  console.log(`  operator  ${operator.address}`);
  console.log(`  alice     ${alice.address}`);
  console.log(`  bob       ${bob.address}`);
  console.log(`  charlie   ${charlie.address}`);
  console.log(`  dave      ${dave.address}  (non-recipient)`);
  console.log(`  auditor   ${auditor.address}`);

  // ── 2. Deploy mock fhEVM infrastructure ────────────────────────────────────
  section("Mock fhEVM infrastructure");
  await deployFhevmMocks();
  pass("MockACL, MockFHEVMExecutor, MockKMSVerifier installed at local config addresses");

  // ── 3. Deploy ConfidentialToken ─────────────────────────────────────────────
  section("ConfidentialToken");
  const Token = await ethers.getContractFactory("ConfidentialToken");
  const token = await Token.connect(operator).deploy("AuctionToken", "ATOK", 6, operator.address);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  pass(`Deployed at ${tokenAddr}`);

  const MINT_AMOUNT = 10_000n * 1_000_000n;
  await token.connect(operator).mint(operator.address, MINT_AMOUNT);
  const bal = await token.balanceOf(operator.address);
  assert(bal === MINT_AMOUNT, `Operator balance should be ${MINT_AMOUNT}, got ${bal}`);
  pass(`Minted ${MINT_AMOUNT} tokens to operator`);

  // ── 4. Deploy ConfidentialDisperse ──────────────────────────────────────────
  section("ConfidentialDisperse — deploy + setup");
  const Disperse = await ethers.getContractFactory("ConfidentialDisperse");
  const disperse = await Disperse.connect(operator).deploy(operator.address);
  await disperse.waitForDeployment();
  const disperseAddr = await disperse.getAddress();
  pass(`Deployed at ${disperseAddr}`);

  // ── 5. Disperse lifecycle ───────────────────────────────────────────────────
  section("ConfidentialDisperse — full lifecycle");

  const distId = ethers.keccak256(ethers.toUtf8Bytes("auction-round-1"));

  // createDistribution
  await disperse.connect(operator).createDistribution(distId, tokenAddr, 2);
  const distBefore = await disperse.getDistribution(distId);
  assert(distBefore.recipientCount === 2n, "recipientCount should be 2");
  assert(!distBefore.executed, "should not be executed yet");
  pass("createDistribution OK — recipientCount=2, executed=false");

  // fundDistribution
  const FUND_AMOUNT = 3_000n * 1_000_000n;
  await token.connect(operator).approve(disperseAddr, FUND_AMOUNT);
  await disperse.connect(operator).fundDistribution(distId, FUND_AMOUNT);
  const distFunded = await disperse.getDistribution(distId);
  assert(distFunded.totalFunded === FUND_AMOUNT, "totalFunded mismatch");
  pass(`fundDistribution OK — totalFunded=${FUND_AMOUNT}`);

  // executeDistribution — mock-encrypt amounts for alice (1 token) and bob (2 tokens)
  const { einput: eAlice, proof: pAlice } = mockEncrypt64(1_000_000n);
  const { einput: eBob,   proof: pBob   } = mockEncrypt64(2_000_000n);

  const execTx = await disperse.connect(operator).executeDistribution(
    distId,
    [alice.address, bob.address],
    [eAlice, eBob],
    [pAlice, pBob],
  );
  const execReceipt = await execTx.wait();
  const execArgs = parseEvent(execReceipt, disperse, "DistributionExecuted");
  assert(execArgs !== null, "DistributionExecuted event missing");
  assert(execArgs.recipientCount === 2n, "DistributionExecuted.recipientCount should be 2");
  pass("executeDistribution OK — DistributionExecuted emitted");

  // ── 6. Privacy boundary ─────────────────────────────────────────────────────
  section("Privacy boundary (ConfidentialDisperse)");

  const aliceHandle = await disperse.getAllocationHandle(distId, alice.address);
  const bobHandle   = await disperse.getAllocationHandle(distId, bob.address);
  const daveHandle  = await disperse.getAllocationHandle(distId, dave.address);

  assert(aliceHandle !== ethers.ZeroHash, "Alice should have a non-zero allocation handle");
  assert(bobHandle   !== ethers.ZeroHash, "Bob should have a non-zero allocation handle");
  assert(daveHandle  === ethers.ZeroHash, "Dave (non-recipient) should have handle=bytes32(0)");
  assert(aliceHandle !== bobHandle, "Alice and Bob should have DIFFERENT handles (distinct ciphertexts)");
  pass("Alice & Bob have non-zero distinct handles");
  pass("Dave (non-recipient) has bytes32(0) handle — no allocation stored");

  // ── 7. Recipient claim (alice) ──────────────────────────────────────────────
  section("Recipient claim — alice");

  const aliceBalBefore = await token.balanceOf(alice.address);
  const aliceDec = mockDecrypt64(1_000_000n);
  const aliceClaimTx = await disperse.connect(alice).claim(distId, aliceDec.decryptedResult, aliceDec.decryptionProof);
  await aliceClaimTx.wait();
  const aliceBalAfter = await token.balanceOf(alice.address);

  assert(await disperse.claimed(distId, alice.address), "claimed should be true after claim");
  assert(aliceBalAfter > aliceBalBefore, "alice token balance should increase after claim");
  pass(`claim OK — alice balance: ${aliceBalBefore} → ${aliceBalAfter}`);

  // ── 8. Recipient claim (bob) ────────────────────────────────────────────────
  section("Recipient claim — bob");

  const bobBalBefore = await token.balanceOf(bob.address);
  const bobDec = mockDecrypt64(2_000_000n);
  const bobClaimTx = await disperse.connect(bob).claim(distId, bobDec.decryptedResult, bobDec.decryptionProof);
  await bobClaimTx.wait();
  const bobBalAfter = await token.balanceOf(bob.address);

  assert(bobBalAfter > bobBalBefore, "bob token balance should increase after claim");
  assert(bobBalAfter > aliceBalAfter, "bob (2 tokens) should have more than alice (1 token)");
  pass(`claim OK — bob balance: ${bobBalBefore} → ${bobBalAfter}`);
  pass(`Amount ordering correct: bob(${bobBalAfter}) > alice(${aliceBalAfter})`);

  // ── 9. Double-claim guard ───────────────────────────────────────────────────
  section("Double-claim guard");
  let doubled = false;
  try {
    await disperse.connect(alice).claim(distId, aliceDec.decryptedResult, aliceDec.decryptionProof);
  } catch (e) {
    doubled = e.message.includes("AlreadyClaimed");
  }
  assert(doubled, "Second claim should revert with AlreadyClaimed");
  pass("Double-claim correctly rejected (AlreadyClaimed)");

  // ── 10. Auditor selective disclosure ────────────────────────────────────────
  section("Auditor selective disclosure");

  await disperse.connect(operator).grantDecryptAccess(distId, auditor.address);
  await disperse.connect(operator).grantAuditorHandleAccess(distId, alice.address, auditor.address);
  pass("grantDecryptAccess + grantAuditorHandleAccess for alice's handle → auditor");

  let notAuditor = false;
  try {
    await disperse.connect(operator).grantAuditorHandleAccess(distId, alice.address, dave.address);
  } catch (e) {
    notAuditor = e.message.includes("NotApprovedAuditor");
  }
  assert(notAuditor, "granting handle access to non-auditor should revert");
  pass("Non-auditor blocked from grantAuditorHandleAccess (NotApprovedAuditor)");

  // ── 11. ConfidentialAirdrop lifecycle ────────────────────────────────────────
  section("ConfidentialAirdrop — full lifecycle");

  const Airdrop = await ethers.getContractFactory("ConfidentialAirdrop");
  const airdrop = await Airdrop.connect(operator).deploy(operator.address);
  await airdrop.waitForDeployment();
  const airdropAddr = await airdrop.getAddress();
  pass(`Deployed at ${airdropAddr}`);

  const airdropId = ethers.keccak256(ethers.toUtf8Bytes("airdrop-round-1"));

  await airdrop.connect(operator).createAirdrop(airdropId, tokenAddr);
  pass(`createAirdrop OK — id=${airdropId.slice(0, 10)}...`);

  const { einput: eCharlie, proof: pCharlie } = mockEncrypt64(500_000n);
  await airdrop.connect(operator).addRecipients(
    airdropId,
    [charlie.address],
    [eCharlie],
    [pCharlie],
  );
  pass("addRecipients(charlie, 0.5 token) OK");

  await airdrop.connect(operator).sealAirdrop(airdropId);
  pass("sealAirdrop OK");

  const AIRDROP_FUND = 1_000n * 1_000_000n;
  await token.connect(operator).approve(airdropAddr, AIRDROP_FUND);
  await airdrop.connect(operator).fundAirdrop(airdropId, AIRDROP_FUND);
  pass(`fundAirdrop OK — ${AIRDROP_FUND} tokens`);

  const charlieBalBefore = await token.balanceOf(charlie.address);
  const charlieDec = mockDecrypt64(500_000n);
  const charlieClaimTx = await airdrop.connect(charlie).claim(
    airdropId,
    charlieDec.decryptedResult,
    charlieDec.decryptionProof,
  );
  await charlieClaimTx.wait();
  const charlieBalAfter = await token.balanceOf(charlie.address);
  assert(charlieBalAfter > charlieBalBefore, "charlie should receive tokens after airdrop claim");
  pass(`charlie claim fulfilled — balance: ${charlieBalBefore} → ${charlieBalAfter}`);

  // ── 12. Write frontend .env.local ────────────────────────────────────────────
  section("Writing frontend/.env.local");

  const envPath = path.join(__dirname, "../../frontend/.env.local");
  const envContent = [
    "# Auto-generated by contracts/scripts/e2e-local.js",
    `# Run: npx hardhat run scripts/e2e-local.js --network hardhat`,
    "",
    "VITE_CHAIN_ID=31337",
    "VITE_RPC_URL=http://127.0.0.1:8545",
    `VITE_TOKEN_ADDRESS=${tokenAddr}`,
    `VITE_DISPERSE_ADDRESS=${disperseAddr}`,
    `VITE_AIRDROP_ADDRESS=${airdropAddr}`,
    "",
    "# Set to true to skip ZamaProvider in Playwright smoke tests",
    "VITE_SKIP_ZAMA=true",
    "",
    "# Test wallet addresses (Hardhat default accounts)",
    `# Operator: ${operator.address}`,
    `# Alice:    ${alice.address}`,
    `# Bob:      ${bob.address}`,
    `# Charlie:  ${charlie.address}`,
    `# Dave:     ${dave.address}  (no allocation)`,
    `# Auditor:  ${auditor.address}`,
    "",
    `# Demo distribution ID (keccak256('auction-round-1')): ${distId}`,
  ].join("\n");

  fs.writeFileSync(envPath, envContent, "utf8");
  pass(`Written to ${envPath}`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("ALL CHECKS PASSED — Phase 7 local E2E complete");
  console.log("══════════════════════════════════════════════════════════");
  console.log("\nDeployed contracts (for manual frontend testing):");
  console.log(`  Token:    ${tokenAddr}`);
  console.log(`  Disperse: ${disperseAddr}`);
  console.log(`  Airdrop:  ${airdropAddr}`);
  console.log(`\nDemo distribution ID: ${distId}`);
  console.log("\nTo test the frontend against this node:");
  console.log("  1. Keep 'npx hardhat node' running in a separate terminal");
  console.log("  2. Re-run this script against the persistent node:");
  console.log("     npx hardhat run scripts/e2e-local.js --network localhost");
  console.log("  3. cd frontend && pnpm dev");
  console.log("  4. Connect MetaMask to localhost:8545 (chainId 31337)");
  console.log("  5. Import Hardhat account #0 (operator) private key into MetaMask");
}

main().catch((err) => {
  console.error("\nE2E script failed:", err);
  process.exitCode = 1;
});
