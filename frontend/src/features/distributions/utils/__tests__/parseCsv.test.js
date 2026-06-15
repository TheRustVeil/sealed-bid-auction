import { describe, it, expect } from 'vitest';
import { parseCsv } from '../parseCsv';

describe('parseCsv', () => {
  it('parses comma-separated address,amount pairs', () => {
    const { rows, errors } = parseCsv('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,100');
    expect(errors).toHaveLength(0);
    expect(rows).toEqual([{ address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', rawAmount: '100' }]);
  });

  it('parses space-separated pairs', () => {
    const { rows, errors } = parseCsv('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 250');
    expect(errors).toHaveLength(0);
    expect(rows[0]).toMatchObject({ rawAmount: '250' });
  });

  it('parses tab-separated pairs', () => {
    const { rows, errors } = parseCsv('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\t500');
    expect(errors).toHaveLength(0);
    expect(rows[0].rawAmount).toBe('500');
  });

  it('parses multiple lines', () => {
    const text = [
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,100',
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8,200',
    ].join('\n');
    const { rows, errors } = parseCsv(text);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(2);
    expect(rows[1].rawAmount).toBe('200');
  });

  it('skips comment lines starting with #', () => {
    const text = '# this is a comment\n0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,100';
    const { rows, errors } = parseCsv(text);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
  });

  it('skips blank lines', () => {
    const text = '\n0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,100\n\n';
    const { rows } = parseCsv(text);
    expect(rows).toHaveLength(1);
  });

  it('records an error for a line missing the amount', () => {
    const { rows, errors } = parseCsv('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/missing amount/);
  });

  it('returns empty rows for empty string', () => {
    const { rows, errors } = parseCsv('');
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('uses only the first two fields (ignores extra columns)', () => {
    const { rows, errors } = parseCsv('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,100,extra');
    expect(errors).toHaveLength(0);
    expect(rows[0]).toMatchObject({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      rawAmount: '100',
    });
  });
});
