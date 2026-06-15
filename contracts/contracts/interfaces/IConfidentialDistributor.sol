// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

interface IConfidentialDistributor {
    // ── Operator ──────────────────────────────────────────────────────────────

    function createDistribution(bytes32 distributionId, address token, uint256 recipientCount) external;

    function fundDistribution(bytes32 distributionId, uint256 amount) external;

    function executeDistribution(
        bytes32 distributionId,
        address[] calldata recipients,
        externalEuint64[] calldata encryptedAmounts,
        bytes[] calldata inputProofs
    ) external;

    function grantDecryptAccess(bytes32 distributionId, address auditor) external;

    // ── Recipient ─────────────────────────────────────────────────────────────

    /**
     * @notice Recipient submits a KMS-signed decryption proof to claim their allocation.
     * @param distributionId   The distribution to claim from.
     * @param decryptedResult  ABI-encoded plaintext: abi.encode(uint64 amount).
     * @param decryptionProof  EIP-712 KMS signatures over (handlesList, decryptedResult).
     */
    function claim(
        bytes32 distributionId,
        bytes calldata decryptedResult,
        bytes calldata decryptionProof
    ) external;

    // ── View ──────────────────────────────────────────────────────────────────

    function getAllocationHandle(bytes32 distributionId, address recipient) external view returns (euint64);
}
