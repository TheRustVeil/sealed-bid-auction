import { getAllocationHandle, getClaimStatus } from '../../../lib/erc7984';

/**
 * Fetch allocation handle + claim status for a recipient in a distribution.
 */
export async function fetchAllocation({ publicClient, disperseAddress, distributionId, account }) {
  const [handle, status] = await Promise.all([
    getAllocationHandle(publicClient, disperseAddress, distributionId, account),
    getClaimStatus(publicClient, disperseAddress, distributionId, account),
  ]);
  return { handle, ...status };
}
