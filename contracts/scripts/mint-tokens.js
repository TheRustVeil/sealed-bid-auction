"use strict";

/**
 * Mint ATK test tokens on Sepolia.
 *
 * Usage:
 *   npx hardhat run scripts/mint-tokens.js --network sepolia
 *
 * Set RECIPIENT to your MetaMask wallet address below.
 * The operator (MNEMONIC account[0]) must own the token contract.
 */

const { ethers } = require("hardhat");

// ── SET THIS to your MetaMask wallet address ───────────────────────────────────
const RECIPIENT = "";   // e.g. "0xAbCd..."   leave blank = mints to operator
// ──────────────────────────────────────────────────────────────────────────────

const TOKEN_ADDRESS = "0x7CF438647deD14b3503ba133176b2EB7524af989";
const MINT_AMOUNT   = ethers.parseUnits("1000", 6); // 1000 ATK (6 decimals)

const TOKEN_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

async function main() {
  const [operator] = await ethers.getSigners();
  const recipient = RECIPIENT || operator.address;

  console.log("Operator  :", operator.address);
  console.log("Recipient :", recipient);

  const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, operator);

  const before = await token.balanceOf(recipient);
  console.log("Balance before:", ethers.formatUnits(before, 6), "ATK");

  console.log(`Minting ${ethers.formatUnits(MINT_AMOUNT, 6)} ATK...`);
  const tx = await token.mint(recipient, MINT_AMOUNT);
  process.stdout.write(`Tx: ${tx.hash}  (waiting...)`);
  await tx.wait();
  console.log("  confirmed.");

  const after = await token.balanceOf(recipient);
  console.log("Balance after :", ethers.formatUnits(after, 6), "ATK");
  console.log("\nDone. Token address for the dApp:", TOKEN_ADDRESS);
}

main().catch((e) => { console.error(e); process.exit(1); });
