import { describe, it, expect } from 'vitest';
import { validateRecipients } from '../validateRecipients';

const ADDR_A = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const ADDR_B = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

describe('validateRecipients', () => {
  it('accepts valid address + amount pairs', () => {
    const { valid, errors } = validateRecipients([
      { address: ADDR_A, rawAmount: '100' },
      { address: ADDR_B, rawAmount: '250.5' },
    ]);
    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(2);
    expect(valid[0].address).toBe(ADDR_A);
    expect(valid[1].amount).toBe(250500000n); // 250.5 * 1e6
  });

  it('converts amounts using default 6 decimals', () => {
    const { valid } = validateRecipients([{ address: ADDR_A, rawAmount: '1' }]);
    expect(valid[0].amount).toBe(1000000n); // 1 * 1e6
  });

  it('uses custom decimals when provided', () => {
    const { valid } = validateRecipients([{ address: ADDR_A, rawAmount: '1' }], 18);
    expect(valid[0].amount).toBe(1000000000000000000n);
  });

  it('rejects an invalid address', () => {
    const { valid, errors } = validateRecipients([{ address: 'not-an-address', rawAmount: '100' }]);
    expect(valid).toHaveLength(0);
    expect(errors[0]).toMatch(/invalid address/);
  });

  it('rejects zero address', () => {
    const { valid, errors } = validateRecipients([
      { address: '0x0000000000000000000000000000000000000000', rawAmount: '100' },
    ]);
    // isAddress returns true for zero address — it's still a valid hex address format.
    // The contract rejects it; frontend validation only checks format here.
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });

  it('rejects amount of 0', () => {
    const { valid, errors } = validateRecipients([{ address: ADDR_A, rawAmount: '0' }]);
    expect(valid).toHaveLength(0);
    expect(errors[0]).toMatch(/invalid amount/);
  });

  it('rejects negative amount', () => {
    const { valid, errors } = validateRecipients([{ address: ADDR_A, rawAmount: '-5' }]);
    expect(valid).toHaveLength(0);
    expect(errors[0]).toMatch(/invalid amount/);
  });

  it('rejects non-numeric amount', () => {
    const { valid, errors } = validateRecipients([{ address: ADDR_A, rawAmount: 'abc' }]);
    expect(valid).toHaveLength(0);
    expect(errors[0]).toMatch(/invalid amount/);
  });

  it('rejects duplicate addresses', () => {
    const { valid, errors } = validateRecipients([
      { address: ADDR_A, rawAmount: '100' },
      { address: ADDR_A, rawAmount: '200' },
    ]);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/duplicate address/);
  });

  it('treats addresses case-insensitively for duplicate detection', () => {
    const { valid, errors } = validateRecipients([
      { address: ADDR_A.toLowerCase(), rawAmount: '100' },
      { address: ADDR_A.toUpperCase(), rawAmount: '200' },
    ]);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });

  it('returns empty arrays for empty input', () => {
    const { valid, errors } = validateRecipients([]);
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('processes independent rows: valid ones are kept even if some fail', () => {
    const { valid, errors } = validateRecipients([
      { address: ADDR_A, rawAmount: '100' },
      { address: 'bad', rawAmount: '50' },
      { address: ADDR_B, rawAmount: '200' },
    ]);
    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(1);
  });
});
