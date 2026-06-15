import { useMemo } from 'react';
import { useWallet } from '../../wallet/hooks/useWallet';
import { loadDistributionsLocally } from '../../distributions/api/distributions.api';

/**
 * Derives reputation stats and badges from the localStorage distribution array.
 * Public stats are visible to all. Private stats require a connected wallet.
 */
export function useReputation() {
  const { address, isConnected } = useWallet();

  const distributions = useMemo(() => loadDistributionsLocally(), []);

  const totalAuctions = distributions.length;
  const settledCount = distributions.filter((d) => d.executed).length;
  const activeCount = distributions.filter((d) => !d.executed).length;
  const totalBidders = distributions.reduce((s, d) => s + (d.recipientCount ?? 0), 0);

  const badges = useMemo(
    () => [
      {
        id: 'secret-whale',
        icon: '🥷',
        label: 'Secret Whale',
        condition: 'Operate a sealed-bid auction',
        unlocked: totalAuctions >= 1,
      },
      {
        id: 'competitive-bidder',
        icon: '⚔️',
        label: 'Competitive Bidder',
        condition: 'Create 5+ distributions',
        unlocked: totalAuctions >= 5,
      },
      {
        id: 'auction-winner',
        icon: '🏆',
        label: 'Auction Winner',
        condition: 'Settle your first auction',
        unlocked: settledCount >= 1,
      },
      {
        id: 'power-collector',
        icon: '🔥',
        label: 'Power Collector',
        condition: 'Settle 3+ auctions',
        unlocked: settledCount >= 3,
      },
    ],
    [totalAuctions, settledCount],
  );

  return {
    isConnected,
    address,
    totalAuctions,
    settledCount,
    activeCount,
    totalBidders,
    badges,
  };
}
