// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, IKMSVerifier} from "@fhevm/solidity/lib/FHE.sol";
import {Impl} from "@fhevm/solidity/lib/Impl.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IConfidentialDistributor} from "./interfaces/IConfidentialDistributor.sol";

/**
 * @title ConfidentialDisperse
 * @notice Sealed-bid auction settlement: the operator stores an encrypted amount
 *         on-chain for each winner. Recipients self-decrypt their own allocation
 *         via the Zama KMS and submit a signed proof to claim tokens.
 *         No one else can see what another recipient was paid.
 *
 * Flow:
 *   1. operator calls createDistribution → fundDistribution → executeDistribution
 *      (executeDistribution stores per-recipient euint64 handles + ACL-grants them)
 *   2. recipient uses zama-fhe/relayer-sdk off-chain to decrypt their handle;
 *      the KMS returns (decryptedResult, decryptionProof)
 *   3. recipient calls claim(distId, decryptedResult, decryptionProof) on-chain;
 *      contract verifies the KMS signature and transfers tokens
 *   4. operator can grantDecryptAccess to an auditor; then per-handle ACL via
 *      grantAuditorHandleAccess so the auditor can also decrypt specific amounts
 */
contract ConfidentialDisperse is ZamaEthereumConfig, Ownable, IConfidentialDistributor {
    using SafeERC20 for IERC20;

    // ── Structs ───────────────────────────────────────────────────────────────

    struct Distribution {
        address token;
        address operator;
        uint256 recipientCount;
        uint256 totalFunded;
        bool executed;
    }

    // ── Storage ───────────────────────────────────────────────────────────────

    mapping(bytes32 => Distribution) public distributions;
    mapping(bytes32 => mapping(address => euint64)) private allocations;
    mapping(bytes32 => mapping(address => bool)) public claimed;
    mapping(bytes32 => mapping(address => bool)) public auditorAccess;

    // ── Events ────────────────────────────────────────────────────────────────

    event DistributionCreated(bytes32 indexed id, address indexed operator, address token, uint256 recipientCount);
    event DistributionFunded(bytes32 indexed id, uint256 amount, uint256 newTotal);
    event DistributionExecuted(bytes32 indexed id, uint256 recipientCount);
    event AllocationClaimed(bytes32 indexed id, address indexed recipient, uint64 amount);
    event AuditorGranted(bytes32 indexed id, address indexed auditor);

    // ── Errors ────────────────────────────────────────────────────────────────

    error DistributionAlreadyExists();
    error DistributionNotFound();
    error NotOperator();
    error AlreadyExecuted();
    error NotExecuted();
    error AlreadyClaimed();
    error NoAllocation();
    error ArrayLengthMismatch();
    error NotApprovedAuditor();
    error InvalidDecryptionProof();

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address initialOwner) ZamaEthereumConfig() Ownable(initialOwner) {}

    // ── Operator: setup ───────────────────────────────────────────────────────

    function createDistribution(
        bytes32 distributionId,
        address token,
        uint256 recipientCount
    ) external override {
        if (distributions[distributionId].operator != address(0)) revert DistributionAlreadyExists();
        distributions[distributionId] = Distribution({
            token: token,
            operator: msg.sender,
            recipientCount: recipientCount,
            totalFunded: 0,
            executed: false
        });
        emit DistributionCreated(distributionId, msg.sender, token, recipientCount);
    }

    function fundDistribution(bytes32 distributionId, uint256 amount) external override {
        Distribution storage dist = _requireDistribution(distributionId);
        if (dist.executed) revert AlreadyExecuted();
        IERC20(dist.token).safeTransferFrom(msg.sender, address(this), amount);
        dist.totalFunded += amount;
        emit DistributionFunded(distributionId, amount, dist.totalFunded);
    }

    /**
     * @notice Set encrypted allocation for each recipient.
     * @param encryptedAmounts  Client-side FHE-encrypted uint64 handles (externalEuint64).
     * @param inputProofs       ZK proofs corresponding to each encrypted amount.
     *
     * ACL grants made here:
     *   - allowThis: contract can use the handle for KMS decryption verification
     *   - allow(recipient): recipient can trigger self-decryption via relayer SDK
     *   - allow(operator): operator retains read access for auditing
     */
    function executeDistribution(
        bytes32 distributionId,
        address[] calldata recipients,
        externalEuint64[] calldata encryptedAmounts,
        bytes[] calldata inputProofs
    ) external override {
        Distribution storage dist = _requireDistribution(distributionId);
        if (msg.sender != dist.operator) revert NotOperator();
        if (dist.executed) revert AlreadyExecuted();
        if (recipients.length != encryptedAmounts.length || recipients.length != inputProofs.length)
            revert ArrayLengthMismatch();

        for (uint256 i = 0; i < recipients.length; i++) {
            euint64 handle = FHE.fromExternal(encryptedAmounts[i], inputProofs[i]);
            allocations[distributionId][recipients[i]] = handle;
            FHE.allowThis(handle);
            FHE.allow(handle, recipients[i]);
            FHE.allow(handle, dist.operator);
            Impl.makePubliclyDecryptable(euint64.unwrap(handle));
        }

        dist.executed = true;
        emit DistributionExecuted(distributionId, recipients.length);
    }

    // ── Operator: access control ──────────────────────────────────────────────

    /**
     * @notice Whitelist an auditor address for this distribution.
     *         The auditor still needs per-handle ACL via grantAuditorHandleAccess.
     */
    function grantDecryptAccess(bytes32 distributionId, address auditor) external override {
        Distribution storage dist = _requireDistribution(distributionId);
        if (msg.sender != dist.operator) revert NotOperator();
        if (!dist.executed) revert NotExecuted();
        auditorAccess[distributionId][auditor] = true;
        emit AuditorGranted(distributionId, auditor);
    }

    /**
     * @notice Give a whitelisted auditor ACL permission to decrypt a specific
     *         recipient's allocation handle.
     */
    function grantAuditorHandleAccess(
        bytes32 distributionId,
        address recipient,
        address auditor
    ) external {
        Distribution storage dist = _requireDistribution(distributionId);
        if (msg.sender != dist.operator) revert NotOperator();
        if (!auditorAccess[distributionId][auditor]) revert NotApprovedAuditor();
        euint64 handle = allocations[distributionId][recipient];
        if (!FHE.isInitialized(handle)) revert NoAllocation();
        FHE.allow(handle, auditor);
    }

    // ── Recipient: claim ──────────────────────────────────────────────────────

    /**
     * @notice Recipient submits a KMS-signed decryption proof to claim tokens.
     *
     * Off-chain steps (using zama-fhe/relayer-sdk):
     *   1. Call relayer.decrypt(handle, signerWallet) → { decryptedResult, decryptionProof }
     *   2. Call this function with the returned values.
     *
     * @param distributionId   The distribution to claim from.
     * @param decryptedResult  ABI-encoded uint64: abi.encode(amount).
     * @param decryptionProof  EIP-712 KMS signatures over (handlesList, decryptedResult).
     */
    function claim(
        bytes32 distributionId,
        bytes calldata decryptedResult,
        bytes calldata decryptionProof
    ) external override {
        Distribution storage dist = _requireDistribution(distributionId);
        if (!dist.executed) revert NotExecuted();
        if (claimed[distributionId][msg.sender]) revert AlreadyClaimed();

        euint64 handle = allocations[distributionId][msg.sender];
        if (!FHE.isInitialized(handle)) revert NoAllocation();

        bytes32[] memory handlesList = new bytes32[](1);
        handlesList[0] = euint64.unwrap(handle);

        address kmsVerifier = Impl.getCoprocessorConfig().KMSVerifierAddress;
        bool valid = IKMSVerifier(kmsVerifier).verifyDecryptionEIP712KMSSignatures(
            handlesList, decryptedResult, decryptionProof
        );
        if (!valid) revert InvalidDecryptionProof();

        uint64 amount = abi.decode(decryptedResult, (uint64));

        claimed[distributionId][msg.sender] = true;
        IERC20(dist.token).safeTransfer(msg.sender, uint256(amount));

        emit AllocationClaimed(distributionId, msg.sender, amount);
    }

    // ── View ──────────────────────────────────────────────────────────────────

    /**
     * @notice Returns the encrypted allocation handle for a recipient.
     *         The caller must have ACL permission (FHE.isAllowed) to decrypt it.
     */
    function getAllocationHandle(
        bytes32 distributionId,
        address recipient
    ) external view override returns (euint64) {
        return allocations[distributionId][recipient];
    }

    function getDistribution(bytes32 distributionId) external view returns (Distribution memory) {
        return distributions[distributionId];
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _requireDistribution(bytes32 id) internal view returns (Distribution storage dist) {
        dist = distributions[id];
        if (dist.operator == address(0)) revert DistributionNotFound();
    }
}
