// Minimal ABIs inlined from contract source — avoids a dependency on compiled artifacts.

// euint64 is bytes32 in @fhevm/solidity@0.11.1; zero handle means no allocation exists.
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ERC20_ABI = [
  { name: 'name',      type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  {
    name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'approve', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
];

const DISPERSE_ABI = [
  {
    name: 'getDistribution', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'distributionId', type: 'bytes32' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'token',          type: 'address'  },
        { name: 'operator',       type: 'address'  },
        { name: 'recipientCount', type: 'uint256'  },
        { name: 'totalFunded',    type: 'uint256'  },
        { name: 'executed',       type: 'bool'     },
      ],
    }],
  },
  {
    // public mapping: claimed[bytes32][address] → bool
    name: 'claimed', type: 'function', stateMutability: 'view',
    inputs: [{ name: '', type: 'bytes32' }, { name: '', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    // euint64 is bytes32 in @fhevm/solidity@0.11.1; returns ZERO_BYTES32 when no allocation exists
    name: 'getAllocationHandle', type: 'function', stateMutability: 'view',
    inputs: [
      { name: 'distributionId', type: 'bytes32' },
      { name: 'recipient',      type: 'address' },
    ],
    outputs: [{ type: 'bytes32' }],
  },
  {
    // KMS-proof claim: recipient submits off-chain decryption result + KMS signature
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
 * Fetch name, symbol, and decimals for a token in a single parallel batch.
 *
 * @param {import('viem').PublicClient} publicClient
 * @param {`0x${string}`} tokenAddress
 * @returns {Promise<{ name: string, symbol: string, decimals: number }>}
 */
export async function getTokenMeta(publicClient, tokenAddress) {
  const [name, symbol, decimals] = await Promise.all([
    publicClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'name' }),
    publicClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'symbol' }),
    publicClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'decimals' }),
  ]);
  return { name, symbol, decimals };
}

/**
 * Read a wallet's ERC-20 token balance.
 *
 * @param {import('viem').PublicClient} publicClient
 * @param {`0x${string}`} tokenAddress
 * @param {`0x${string}`} account
 * @returns {Promise<bigint>}
 */
export async function getBalance(publicClient, tokenAddress, account) {
  return publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [account],
  });
}

/**
 * Read the on-chain Distribution struct from ConfidentialDisperse.
 *
 * @param {import('viem').PublicClient} publicClient
 * @param {`0x${string}`} disperseAddress
 * @param {`0x${string}`} distributionId - bytes32 distribution identifier
 * @returns {Promise<{ token: string, operator: string, recipientCount: bigint, totalFunded: bigint, executed: boolean }>}
 */
export async function getDistribution(publicClient, disperseAddress, distributionId) {
  return publicClient.readContract({
    address: disperseAddress,
    abi: DISPERSE_ABI,
    functionName: 'getDistribution',
    args: [distributionId],
  });
}

/**
 * Check whether a recipient has claimed from a distribution.
 *
 * @param {import('viem').PublicClient} publicClient
 * @param {`0x${string}`} disperseAddress
 * @param {`0x${string}`} distributionId
 * @param {`0x${string}`} account
 * @returns {Promise<{ claimed: boolean }>}
 */
export async function getClaimStatus(publicClient, disperseAddress, distributionId, account) {
  const claimed = await publicClient.readContract({
    address: disperseAddress,
    abi: DISPERSE_ABI,
    functionName: 'claimed',
    args: [distributionId, account],
  });
  return { claimed };
}

/**
 * Read the raw euint64 handle (bytes32) for a recipient's allocation.
 * Compare against ZERO_BYTES32 to check whether an allocation exists.
 * The recipient must have ACL permission on-chain to decrypt the handle via relayer-sdk.
 *
 * @param {import('viem').PublicClient} publicClient
 * @param {`0x${string}`} disperseAddress
 * @param {`0x${string}`} distributionId
 * @param {`0x${string}`} account
 * @returns {Promise<`0x${string}`>} bytes32 handle; equals ZERO_BYTES32 when no allocation exists.
 */
export async function getAllocationHandle(publicClient, disperseAddress, distributionId, account) {
  return publicClient.readContract({
    address: disperseAddress,
    abi: DISPERSE_ABI,
    functionName: 'getAllocationHandle',
    args: [distributionId, account],
  });
}
