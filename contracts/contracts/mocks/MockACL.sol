// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockACL
 * @notice In-memory mock of Zama's ACL contract for local Hardhat testing.
 *         Installed via hardhat_setCode at the address from ZamaConfig._getLocalConfig().ACLAddress.
 *
 *         Semantics:
 *         - allow / allowTransient  → store permission in mapping
 *         - isAllowed               → return stored permission
 *         - allowForDecryption      → no-op (KMS tracks this in prod)
 *         - cleanTransientStorage   → no-op
 */
contract MockACL {
    mapping(bytes32 => mapping(address => bool)) private _permissions;

    function allowTransient(bytes32 handle, address account) external {
        _permissions[handle][account] = true;
    }

    function allow(bytes32 handle, address account) external {
        _permissions[handle][account] = true;
    }

    function cleanTransientStorage() external {}

    function isAllowed(bytes32 handle, address account) external view returns (bool) {
        return _permissions[handle][account];
    }

    function allowForDecryption(bytes32[] memory /*handlesList*/) external {}

    function isAllowedForDecryption(bytes32 /*handle*/) external pure returns (bool) {
        return false;
    }
}
