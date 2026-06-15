import { createConfidentialDisperseClient } from '../../../lib/tokenops';

const STORAGE_KEY = 'confidential_distributions';

/**
 * Build a disperse SDK client. encryptor must be a lazy factory:
 *   () => zamaSDK.relayer
 * so the live Zama context is captured at call time, not at mount time.
 */
export function createDisperseApi({ publicClient, walletClient, encryptor }) {
  return createConfidentialDisperseClient({ publicClient, walletClient, encryptor });
}

export function loadDistributionsLocally() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveDistributionLocally({ id, label, token, recipientCount, type, createdAt }) {
  const existing = loadDistributionsLocally();
  const updated = [
    { id, label, token, recipientCount, type, createdAt: createdAt ?? Date.now() },
    ...existing,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeDistributionLocally(id) {
  const existing = loadDistributionsLocally();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter((d) => d.id !== id)));
}
