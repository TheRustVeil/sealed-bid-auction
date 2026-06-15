/**
 * fhevm-mock.js — Hardhat test helper for local @fhevm/solidity@0.11.1 testing.
 *
 * Problem:
 *   @fhevm/solidity@0.11.1 delegates every FHE / KMS call to external contracts
 *   at addresses stored in the CoprocessorConfig (set by ZamaEthereumConfig in the
 *   constructor).  On a local Hardhat node those addresses are empty and every
 *   FHE operation reverts.
 *
 * Solution:
 *   Deploy MockACL, MockFHEVMExecutor, and MockKMSVerifier to temporary addresses,
 *   copy their runtime bytecode, then install it at the exact addresses the contracts
 *   expect via hardhat_setCode.  Real contracts run completely unchanged; they just
 *   interact with mock infrastructure.
 *
 * Mock handle convention:
 *   handle = bytes32(uint256(plaintext_value))
 *   → create externalEuint64 as: bytes32(uint256(value)), proof as: "0x" (empty)
 *   → FHE.fromExternal with empty proof returns inputHandle directly (no verify call)
 *   → FHE.isInitialized(handle) is true iff handle != bytes32(0) → use non-zero amounts
 *
 * Mock claim convention:
 *   decryptedResult = abi.encode(uint64(value))  — ABI-encoded plaintext
 *   decryptionProof = "0x00"                      — 1 byte; MockKMSVerifier accepts all
 *   → call contract.claim(distId, decryptedResult, decryptionProof) directly
 */

const { ethers } = require("hardhat");

// Addresses from ZamaConfig._getLocalConfig() in @fhevm/solidity@0.11.1
const FHEVM_ADDRESSES = {
  ACL:          "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
  Coprocessor:  "0xe3a9105a3a932253A70F126eb1E3b589C643dD24",
  KMSVerifier:  "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
};

/**
 * Deploy mock contracts and install them at the local config addresses via hardhat_setCode.
 *
 * Returns contract instances bound to the EXPECTED addresses so that tests can
 * inspect mock state directly if needed.
 *
 * Should be called once per test fixture; loadFixture snapshots the result.
 */
async function deployFhevmMocks() {
  const provider = ethers.provider;

  // ── Deploy to temporary addresses to obtain runtime bytecode ──────────────

  const MockACL = await ethers.getContractFactory("MockACL");
  const tempACL = await MockACL.deploy();
  await tempACL.waitForDeployment();

  const MockFHEVMExecutor = await ethers.getContractFactory("MockFHEVMExecutor");
  const tempExecutor = await MockFHEVMExecutor.deploy();
  await tempExecutor.waitForDeployment();

  const MockKMSVerifier = await ethers.getContractFactory("MockKMSVerifier");
  const tempKMS = await MockKMSVerifier.deploy();
  await tempKMS.waitForDeployment();

  // ── Install at the addresses the contracts expect ─────────────────────────

  await provider.send("hardhat_setCode", [
    FHEVM_ADDRESSES.ACL,
    await provider.getCode(await tempACL.getAddress()),
  ]);

  await provider.send("hardhat_setCode", [
    FHEVM_ADDRESSES.Coprocessor,
    await provider.getCode(await tempExecutor.getAddress()),
  ]);

  await provider.send("hardhat_setCode", [
    FHEVM_ADDRESSES.KMSVerifier,
    await provider.getCode(await tempKMS.getAddress()),
  ]);

  // ── Return contract handles at the EXPECTED addresses ─────────────────────

  const aclMock      = await ethers.getContractAt("MockACL",          FHEVM_ADDRESSES.ACL);
  const executorMock = await ethers.getContractAt("MockFHEVMExecutor", FHEVM_ADDRESSES.Coprocessor);
  const kmsMock      = await ethers.getContractAt("MockKMSVerifier",   FHEVM_ADDRESSES.KMSVerifier);

  return { aclMock, executorMock, kmsMock };
}

/**
 * Build a mock encrypted input for a uint64 value.
 *
 * The property is named `einput` for backward compatibility with test code
 * that destructures `{ einput, proof }`.  The Solidity type is now
 * `externalEuint64` (bytes32) — but the ABI encoding is identical.
 *
 * @param {bigint|number} value  The plaintext uint64 value (must be > 0).
 * @returns {{ einput: string, proof: string }}
 *   einput — bytes32 hex string to pass as the externalEuint64 Solidity type
 *   proof  — "0x00" (1 non-empty byte) — triggers Impl.verify path which calls
 *            ACL.allowTransient(handle, msg.sender) on the MockACL, granting the
 *            calling contract permission to use the handle for subsequent FHE.allow calls.
 *            DO NOT use "0x" (empty) — that takes the passthrough path which requires
 *            the handle to already be allowed for the caller, which breaks executeDistribution.
 */
function mockEncrypt64(value) {
  if (BigInt(value) === 0n) {
    throw new Error("mockEncrypt64: value must be > 0 (FHE.isInitialized checks handle != bytes32(0))");
  }
  return {
    einput: ethers.zeroPadValue(ethers.toBeHex(BigInt(value)), 32),
    proof:  "0x00",
  };
}

/**
 * Build a mock KMS decryption result for a uint64 value.
 *
 * In production, @zama-fhe/relayer-sdk decrypts the handle and returns
 * (decryptedResult, decryptionProof) signed by the KMS.  In tests,
 * MockKMSVerifier accepts any non-empty proof, so we just ABI-encode the value.
 *
 * @param {bigint|number} value  The plaintext uint64 value.
 * @returns {{ decryptedResult: string, decryptionProof: string }}
 */
function mockDecrypt64(value) {
  return {
    decryptedResult:  ethers.AbiCoder.defaultAbiCoder().encode(["uint64"], [BigInt(value)]),
    decryptionProof:  "0x00",  // 1 byte — satisfies non-empty; MockKMSVerifier accepts all
  };
}

/**
 * Helper: extract a named event's args from a transaction receipt.
 * Works with ethers v6 log parsing.
 */
function parseEvent(receipt, contract, eventName) {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === eventName) return parsed.args;
    } catch (_) { /* not from this contract */ }
  }
  return null;
}

module.exports = { deployFhevmMocks, mockEncrypt64, mockDecrypt64, parseEvent, FHEVM_ADDRESSES };
