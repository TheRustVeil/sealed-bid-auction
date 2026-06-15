// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockKMSVerifier
 * @notice In-memory mock of Zama's KMSVerifier contract for local Hardhat testing.
 *         Installed via hardhat_setCode at the address from ZamaConfig._getLocalConfig().KMSVerifierAddress.
 *
 *         In production the KMSVerifier checks that the supplied decryptionProof
 *         contains valid EIP-712 signatures from KMS key-holders over
 *         (handlesList, decryptedResult). In tests, this mock accepts ANY proof
 *         as long as it is non-empty, allowing tests to drive claim flows without
 *         setting up a real KMS signing ceremony.
 *
 *         Test helper mockDecrypt64(value) in fhevm-mock.js builds:
 *           decryptedResult  = abi.encode(uint64(value))
 *           decryptionProof  = "0x00"  (1 byte — satisfies non-empty check)
 */
contract MockKMSVerifier {
    function verifyDecryptionEIP712KMSSignatures(
        bytes32[] memory, /*handlesList*/
        bytes memory, /*decryptedResult*/
        bytes memory /*decryptionProof*/
    ) external pure returns (bool) {
        return true;
    }

    // ── EIP-712 stubs ─────────────────────────────────────────────────────────

    function eip712Domain()
        external
        view
        returns (
            bytes1 fields,
            string memory name,
            string memory version,
            uint256 chainId,
            address verifyingContract,
            bytes32 salt,
            uint256[] memory extensions
        )
    {
        return (
            bytes1(0x0f),
            "MockKMSVerifier",
            "1",
            block.chainid,
            address(this),
            bytes32(0),
            new uint256[](0)
        );
    }

    function getThreshold() external pure returns (uint256) { return 1; }

    function getKmsSigners() external pure returns (address[] memory signers) {
        signers = new address[](1);
        signers[0] = address(0x1);
    }
}
