/**
 * Parse CSV / whitespace-separated address,amount pairs.
 * Accepts: "0xABC,100"  "0xABC 100"  "0xABC\t100"
 * Lines starting with # are treated as comments.
 *
 * @param {string} text
 * @returns {{ rows: Array<{address: string, rawAmount: string}>, errors: string[] }}
 */
export function parseCsv(text) {
  const rows = [];
  const errors = [];

  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/[,\s\t]+/);
    if (parts.length < 2) {
      errors.push(`Line ${i + 1}: missing amount — "${line}"`);
      continue;
    }

    rows.push({ address: parts[0].trim(), rawAmount: parts[1].trim() });
  }

  return { rows, errors };
}
