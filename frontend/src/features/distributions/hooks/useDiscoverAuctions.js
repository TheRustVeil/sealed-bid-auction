import { useMemo } from 'react';
import { loadDistributionsLocally } from '../api/distributions.api';

const AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function endMs(d) {
  return (d.createdAt ?? 0) + AUCTION_DURATION_MS;
}

function isActive(d) {
  return !d.executed && Date.now() < endMs(d);
}

function isEnded(d) {
  return d.executed || Date.now() >= endMs(d);
}

/**
 * Reads + sorts the localStorage distribution array into discovery sections.
 * Same data source as the dashboard — no new network calls.
 */
export function useDiscoverAuctions(filter = 'all') {
  const all = useMemo(() => loadDistributionsLocally(), []);

  const filtered = useMemo(() => {
    if (filter === 'active') return all.filter(isActive);
    if (filter === 'ended') return all.filter(isEnded);
    return all;
  }, [all, filter]);

  const trending = useMemo(
    () => [...filtered].sort((a, b) => (b.recipientCount ?? 0) - (a.recipientCount ?? 0)).slice(0, 6),
    [filtered],
  );

  const endingSoon = useMemo(
    () =>
      [...filtered]
        .filter(isActive)
        .sort((a, b) => endMs(a) - endMs(b))
        .slice(0, 6),
    [filtered],
  );

  const mostActive = useMemo(
    () =>
      [...filtered]
        .filter((d) => (d.recipientCount ?? 0) > 0)
        .sort((a, b) => (b.recipientCount ?? 0) - (a.recipientCount ?? 0))
        .slice(0, 6),
    [filtered],
  );

  const recentlyListed = useMemo(
    () => [...filtered].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, 6),
    [filtered],
  );

  return { trending, endingSoon, mostActive, recentlyListed, total: filtered.length };
}
