import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { fetchAllocation } from '../api/allocations.api';
import { CONTRACT_ADDRESSES } from '../../../app/config';

export function useAllocation({ distributionId, account }) {
  const publicClient = usePublicClient();
  const disperseAddress = CONTRACT_ADDRESSES.confidentialDisperse;

  return useQuery({
    queryKey: ['allocation', distributionId, account],
    queryFn: () =>
      fetchAllocation({ publicClient, disperseAddress, distributionId, account }),
    enabled: !!distributionId && !!account && !!disperseAddress,
    staleTime: 60_000,
  });
}
