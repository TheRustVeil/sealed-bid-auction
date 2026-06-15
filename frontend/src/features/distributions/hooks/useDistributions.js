import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { loadDistributionsLocally } from '../api/distributions.api';
import { getDistribution } from '../../../lib/erc7984';
import { CONTRACT_ADDRESSES } from '../../../app/config';

export function useDistributions() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['distributions'],
    queryFn: async () => {
      const local = loadDistributionsLocally();
      if (!local.length) return [];

      const disperseAddr = CONTRACT_ADDRESSES.confidentialDisperse;
      const results = await Promise.allSettled(
        local.map(async (d) => {
          if (d.type === 'disperse' && disperseAddr) {
            try {
              const onChain = await getDistribution(publicClient, disperseAddr, d.id);
              return { ...d, ...onChain };
            } catch {
              return d;
            }
          }
          return d;
        })
      );

      return results.map((r, i) => (r.status === 'fulfilled' ? r.value : local[i]));
    },
    staleTime: 30_000,
  });
}
