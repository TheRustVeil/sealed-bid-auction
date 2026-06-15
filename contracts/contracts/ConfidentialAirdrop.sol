// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, IKMSVerifier} from "@fhevm/solidity/lib/FHE.sol";
import {Impl} from "@fhevm/solidity/lib/Impl.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConfidentialAirdrop
 * @notice Pull-based variant of ConfidentialDisperse.
 *
 * Key difference from ConfidentialDisperse:
 *   - Operator creates the airdrop and adds recipients incrementally (addRecipients
 *     can be called multiple times before the airdrop is sealed).
 *   - Once sealed, any whitelisted recipient can call claim() at their own pace.
 *   - Recipient COUNT can be public; per-recipient AMOUNTS are always encrypted.
 *
 * Flow:
 *   1. operator createAirdrop → addRecipients (repeatable) → sealAirdrop
 *   2. operator fundAirdrop (can be done any time before/after sealing)
 *   3. recipient uses zama-fhe/relayer-sdk to decrypt their handle off-chain,
 *      then calls claim(airdropId, decryptedResult, decryptionProof)
 */
contract ConfidentialAirdrop is ZamaEthereumConfig, Ownable {
    using SafeERC20 for IERC20;

    // ── Structs ───────────────────────────────────────────────────────────────

    struct Airdrop {
        address token;
        address operator;
        uint256 totalFunded;
        bool isSealed;
    }

    // ── Storage ───────────────────────────────────────────────────────────────

    mapping(bytes32 => Airdrop) public airdrops;
    mapping(bytes32 => mapping(address => euint64)) private allocations;
    mapping(bytes32 => mapping(address => bool)) public claimed;

    // ── Events ────────────────────────────────────────────────────────────────

    event AirdropCreated(bytes32 indexed id, address indexed operator, address token);
    event RecipientsAdded(bytes32 indexed id, uint256 count);
    event AirdropSealed(bytes32 indexed id);
    event AirdropFunded(bytes32 indexed id, uint256 amount, uint256 newTotal);
    event AllocationClaimed(bytes32 indexed id, address indexed recipient, uint64 amount);

    // ── Errors ────────────────────────────────────────────────────────────────

    error AirdropAlreadyExists();
    error AirdropNotFound();
    error NotOperator();
    error AlreadySealed();
    error NotSealed();
    error AlreadyClaimed();
    error NoAllocation();
    error ArrayLengthMismatch();
    error InvalidDecryptionProof();

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address initialOwner) ZamaEthereumConfig() Ownable(initialOwner) {}

    // ── Operator ──────────────────────────────────────────────────────────────

    function createAirdrop(bytes32 airdropId, address token) external {
        if (airdrops[airdropId].operator != address(0)) revert AirdropAlreadyExists();
        airdrops[airdropId] = Airdrop({token: token, operator: msg.sender, totalFunded: 0, isSealed: false});
        emit AirdropCreated(airdropId, msg.sender, token);
    }

    /**
     * @notice Add (or overwrite) encrypted allocations for a batch of recipients.
     *         Can be called multiple times until the airdrop is sealed.
     */
    function addRecipients(
        bytes32 airdropId,
        address[] calldata recipients,
        externalEuint64[] calldata encryptedAmounts,
        bytes[] calldata inputProofs
    ) external {
        Airdrop storage drop = _requireAirdrop(airdropId);
        if (msg.sender != drop.operator) revert NotOperator();
        if (drop.isSealed) revert AlreadySealed();
        if (recipients.length != encryptedAmounts.length || recipients.length != inputProofs.length)
            revert ArrayLengthMismatch();

        for (uint256 i = 0; i < recipients.length; i++) {
            euint64 handle = FHE.fromExternal(encryptedAmounts[i], inputProofs[i]);
            allocations[airdropId][recipients[i]] = handle;
            FHE.allowThis(handle);
            FHE.allow(handle, recipients[i]);
            FHE.allow(handle, drop.operator);
            Impl.makePubliclyDecryptable(euint64.unwrap(handle));
        }

        emit RecipientsAdded(airdropId, recipients.length);
    }

    /** @notice Prevent further recipient additions; open the airdrop for claims. */
    function sealAirdrop(bytes32 airdropId) external {
        Airdrop storage drop = _requireAirdrop(airdropId);
        if (msg.sender != drop.operator) revert NotOperator();
        if (drop.isSealed) revert AlreadySealed();
        drop.isSealed = true;
        emit AirdropSealed(airdropId);
    }

    function fundAirdrop(bytes32 airdropId, uint256 amount) external {
        Airdrop storage drop = _requireAirdrop(airdropId);
        IERC20(drop.token).safeTransferFrom(msg.sender, address(this), amount);
        drop.totalFunded += amount;
        emit AirdropFunded(airdropId, amount, drop.totalFunded);
    }

    // ── Recipient ─────────────────────────────────────────────────────────────

    /**
     * @notice Recipient submits a KMS-signed decryption proof to claim tokens.
     *         The airdrop must be sealed before claims are accepted.
     *
     * @param airdropId        The airdrop to claim from.
     * @param decryptedResult  ABI-encoded uint64: abi.encode(amount).
     * @param decryptionProof  EIP-712 KMS signatures over (handlesList, decryptedResult).
     */
    function claim(
        bytes32 airdropId,
        bytes calldata decryptedResult,
        bytes calldata decryptionProof
    ) external {
        Airdrop storage drop = _requireAirdrop(airdropId);
        if (!drop.isSealed) revert NotSealed();
        if (claimed[airdropId][msg.sender]) revert AlreadyClaimed();

        euint64 handle = allocations[airdropId][msg.sender];
        if (!FHE.isInitialized(handle)) revert NoAllocation();

        bytes32[] memory handlesList = new bytes32[](1);
        handlesList[0] = euint64.unwrap(handle);

        address kmsVerifier = Impl.getCoprocessorConfig().KMSVerifierAddress;
        bool valid = IKMSVerifier(kmsVerifier).verifyDecryptionEIP712KMSSignatures(
            handlesList, decryptedResult, decryptionProof
        );
        if (!valid) revert InvalidDecryptionProof();

        uint64 amount = abi.decode(decryptedResult, (uint64));

        claimed[airdropId][msg.sender] = true;
        IERC20(drop.token).safeTransfer(msg.sender, uint256(amount));

        emit AllocationClaimed(airdropId, msg.sender, amount);
    }

    // ── View ──────────────────────────────────────────────────────────────────

    function getAllocationHandle(bytes32 airdropId, address recipient) external view returns (euint64) {
        return allocations[airdropId][recipient];
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _requireAirdrop(bytes32 id) internal view returns (Airdrop storage drop) {
        drop = airdrops[id];
        if (drop.operator == address(0)) revert AirdropNotFound();
    }
}
