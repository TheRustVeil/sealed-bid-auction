// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockFHEVMExecutor
 * @notice In-memory mock of Zama's FHEVMExecutor (Coprocessor) for local Hardhat testing.
 *         Installed via hardhat_setCode at the address from ZamaConfig._getLocalConfig().CoprocessorAddress.
 *
 *         Handle encoding (mock convention used across all test files):
 *           handle = bytes32(uint256(plaintext_value))
 *
 *         verifyInput simply returns the inputHandle — test callers create
 *         externalEuint64 = bytes32(uint256(value)), inputProof = "0x".
 *         This means FHE.isInitialized(handle) is true iff bytes32(0) != handle
 *         — all test allocations must use non-zero amounts.
 */
contract MockFHEVMExecutor {
    function verifyInput(
        bytes32 inputHandle,
        address, /*caller*/
        bytes memory, /*inputProof*/
        uint8 /*toType (FheType enum)*/
    ) external pure returns (bytes32) {
        return inputHandle;
    }

    function trivialEncrypt(uint256 ct, bytes1 /*toType*/) external pure returns (bytes32) {
        return bytes32(ct);
    }

    function trivialEncrypt(bytes memory ct, bytes1 /*toType*/) external pure returns (bytes32) {
        return bytes32(ct);
    }

    // ── Arithmetic stubs (not used by our contracts) ───────────────────────────

    function fheAdd(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheSub(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheMul(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheDiv(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheRem(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheBitAnd(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheBitOr(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheBitXor(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheShl(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheShr(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheRotl(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheRotr(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheEq(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheNe(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheGe(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheGt(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheLe(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheLt(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheMin(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheMax(bytes32 lhs, bytes32, bytes1) external pure returns (bytes32) { return lhs; }
    function fheNeg(bytes32 ct) external pure returns (bytes32) { return ct; }
    function fheNot(bytes32 ct) external pure returns (bytes32) { return ct; }
    function cast(bytes32 ct, bytes1) external pure returns (bytes32) { return ct; }
    function fheIfThenElse(bytes32, bytes32 ifTrue, bytes32) external pure returns (bytes32) { return ifTrue; }
    function fheRand(bytes1) external view returns (bytes32) { return blockhash(block.number - 1); }
    function fheRandBounded(uint256 upperBound, bytes1) external view returns (bytes32) {
        return bytes32(uint256(blockhash(block.number - 1)) % upperBound);
    }
}
