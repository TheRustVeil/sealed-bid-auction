import { useState, useEffect } from 'react';
import { usePublicDecrypt } from '@zama-fhe/react-sdk';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { decodeAbiParameters } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES } from '../../../app/config';
import { ZERO_BYTES32 } from '../../../lib/erc7984';

const CLAIM_ABI = [
  {
    name: 'claim', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'distributionId',  type: 'bytes32' },
      { name: 'decryptedResult', type: 'bytes'   },
      { name: 'decryptionProof', type: 'bytes'   },
    ],
    outputs: [],
  },
];

/**
 * Claim tokens and reveal the allocation amount in one user action.
 *
 * Flow:
 *  1. publicDecrypt([handle]) → { abiEncodedClearValues, decryptionProof }
 *     (off-chain: relayer-sdk asks KMS to sign a decryption proof)
 *  2. disperse.claim(distributionId, abiEncodedClearValues, decryptionProof) on-chain
 *     (on-chain: IKMSVerifier verifies the signature, tokens transferred)
 *  3. Decode uint64 from abiEncodedClearValues for display
 *
 * After the tx confirms, invalidates ['allocation', ...] so allocation.claimed refreshes.
 *
 * @param {{ distributionId: string, handle: string, account: string }} params
 * @returns {{ claimAndReveal: () => void, plaintext: bigint|null, isClaiming: boolean, isClaimed: boolean, error: Error|null }}
 */
export function useClaimReveal({ distributionId, handle, account }) {
  const [plaintext, setPlaintext] = useState(null);
  const disperseAddress = CONTRACT_ADDRESSES.confidentialDisperse;
  const queryClient = useQueryClient();

  const publicDecrypt = usePublicDecrypt();
  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isClaimed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isClaimed && distributionId && account) {
      queryClient.invalidateQueries({ queryKey: ['allocation', distributionId, account] });
    }
  }, [isClaimed, distributionId, account, queryClient]);

  async function claimAndReveal() {
    if (!handle || handle === ZERO_BYTES32 || !distributionId || !disperseAddress) return;

    // Step 1: Off-chain KMS decrypt — asks the relayer to produce a signed proof
    const result = await publicDecrypt.mutateAsync([handle]);

    // Decode uint64 for display (before submitting tx so user sees amount immediately)
    const [amount] = decodeAbiParameters([{ type: 'uint64' }], result.abiEncodedClearValues);
    setPlaintext(amount);

    // Step 2: Submit on-chain claim with the KMS-signed proof
    writeContract({
      address: disperseAddress,
      abi: CLAIM_ABI,
      functionName: 'claim',
      args: [distributionId, result.abiEncodedClearValues, result.decryptionProof],
    });
  }

  return {
    claimAndReveal,
    plaintext,
    isClaiming: publicDecrypt.isPending || isWriting || isConfirming,
    isClaimed,
    error: publicDecrypt.error ?? writeError ?? null,
  };
}
