import { isAddress } from 'viem';

/**
 * Validate parsed recipient rows and convert amounts to raw token units.
 *
 * @param {Array<{address: string, rawAmount: string}>} rows
 * @param {number} decimals - token decimals (ERC-7984 default: 6)
 * @returns {{ valid: Array<{address: string, amount: bigint}>, errors: string[] }}
 */
export function validateRecipients(rows, decimals = 6) {
  const valid = [];
  const errors = [];
  const seen = new Set();

  for (let i = 0; i < rows.length; i++) {
    const { address, rawAmount } = rows[i];

    if (!isAddress(address)) {
      errors.push(`Row ${i + 1}: invalid address "${address}"`);
      continue;
    }

    if (seen.has(address.toLowerCase())) {
      errors.push(`Row ${i + 1}: duplicate address "${address}"`);
      continue;
    }

    const numAmount = Number(rawAmount);
    if (!rawAmount || isNaN(numAmount) || numAmount <= 0) {
      errors.push(`Row ${i + 1}: invalid amount "${rawAmount}"`);
      continue;
    }

    seen.add(address.toLowerCase());
    const amount = BigInt(Math.round(numAmount * 10 ** decimals));
    valid.push({ address, amount });
  }

  return { valid, errors };
}
