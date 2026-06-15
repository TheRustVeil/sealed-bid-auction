// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockTFHEExecutor
 * @notice In-memory mock of Zama's TFHEExecutor contract for local Hardhat testing.
 *         Installed via hardhat_setCode at the address returned by
 *         ZamaFHEVMConfig.getSepoliaConfig().TFHEExecutorAddress.
 *
 *         Handle encoding (mock convention used across all test files):
 *           handle = uint256(plaintext_value)
 *
 *         This means TFHE.isInitialized(handle) is true iff value != 0, so all
 *         test allocations must use non-zero amounts.
 *
 *         verifyCiphertext simply returns the input handle cast to uint256 —
 *         test callers create einput = bytes32(uint256(value)), proof = "".
 */
contract MockTFHEExecutor {
    function verifyCiphertext(
        bytes32 inputHandle,
        address, /*callerAddress*/
        bytes memory, /*inputProof*/
        bytes1 /*inputType*/
    ) external pure returns (uint256) {
        return uint256(inputHandle);
    }

    function trivialEncrypt(uint256 ct, bytes1 /*toType*/) external pure returns (uint256) {
        return ct;
    }

    function trivialEncrypt(bytes memory ct, bytes1 /*toType*/) external pure returns (uint256) {
        return uint256(bytes32(ct));
    }

    // ── Arithmetic stubs (not used by our contracts, included for interface completeness) ───

    function fheAdd(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheSub(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheMul(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheDiv(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheRem(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheBitAnd(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheBitOr(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheBitXor(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheShl(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheShr(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheRotl(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheRotr(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheEq(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheNe(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheGe(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheGt(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheLe(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheLt(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheMin(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheMax(uint256 lhs, uint256, bytes1) external pure returns (uint256) { return lhs; }
    function fheNeg(uint256 ct) external pure returns (uint256) { return ct; }
    function fheNot(uint256 ct) external pure returns (uint256) { return ct; }
    function fheEq(uint256 lhs, bytes memory, bytes1) external pure returns (uint256) { return lhs; }
    function fheNe(uint256 lhs, bytes memory, bytes1) external pure returns (uint256) { return lhs; }
    function fheIfThenElse(uint256, uint256 ifTrue, uint256) external pure returns (uint256) { return ifTrue; }
    function fheRand(bytes1) external view returns (uint256) { return uint256(blockhash(block.number - 1)); }
    function fheRandBounded(uint256 upperBound, bytes1) external view returns (uint256) {
        return uint256(blockhash(block.number - 1)) % upperBound;
    }
    function cast(uint256 ct, bytes1) external pure returns (uint256) { return ct; }
}
