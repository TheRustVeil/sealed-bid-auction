import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { loadDistributionsLocally } from '../api/distributions.api';
import { getDistribution } from '../../../lib/erc7984';
import { CONTRACT_ADDRESSES } from '../../../app/config';

export function useDistribution(id) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['distribution', id],
    queryFn: async () => {
      const local = loadDistributionsLocally().find((d) => d.id === id);
      if (!local) throw new Error('Distribution not found');

      const disperseAddr = CONTRACT_ADDRESSES.confidentialDisperse;
      if (local.type === 'disperse' && disperseAddr) {
        try {
          const onChain = await getDistribution(publicClient, disperseAddr, id);
          return { ...local, ...onChain };
        } catch {
          return local;
        }
      }
      return local;
    },
    enabled: !!id,
  });
}
