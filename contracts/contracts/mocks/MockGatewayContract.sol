// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockGatewayContract
 * @notice In-memory mock of Zama's GatewayContract for local Hardhat testing.
 *         Installed via hardhat_setCode at the address returned by
 *         ZamaGatewayConfig.getSepoliaConfig().
 *
 *         In production, the Gateway relays async decryption requests to the
 *         Zama KMS and delivers the plaintext back via callback. Here, tests
 *         call fulfillRequest(requestId, decryptedValue) directly to simulate
 *         the KMS response.
 *
 *         Because this contract IS deployed at the Gateway address, when it calls
 *         back into the dApp contract (e.g. fulfillClaim), msg.sender equals the
 *         Gateway address — satisfying the onlyGateway modifier.
 *
 *         Mock handle convention: handle == uint256(plaintext). autoFulfillRequest
 *         uses this to derive the decrypted value without a separate argument.
 */
contract MockGatewayContract {
    uint256 private _requestCounter;

    struct PendingRequest {
        address callerContract;
        bytes4  callbackSelector;
        uint256 handle; // first (and only) handle in our single-decrypt requests
    }

    mapping(uint256 => PendingRequest) public pendingRequests;

    event DecryptionRequested(uint256 indexed requestId, address indexed caller, uint256 handle);
    event DecryptionFulfilled(uint256 indexed requestId, uint64 decryptedValue);

    function requestDecryption(
        uint256[] calldata ctsHandles,
        bytes4 callbackSelector,
        uint256, /*msgValue*/
        uint256, /*maxTimestamp*/
        bool    /*passSignaturesToCaller*/
    ) external returns (uint256 requestId) {
        requestId = ++_requestCounter;
        pendingRequests[requestId] = PendingRequest({
            callerContract:   msg.sender,
            callbackSelector: callbackSelector,
            handle:           ctsHandles.length > 0 ? ctsHandles[0] : 0
        });
        emit DecryptionRequested(requestId, msg.sender, ctsHandles.length > 0 ? ctsHandles[0] : 0);
    }

    /**
     * @notice Simulate KMS fulfilling a decrypt request with an explicit value.
     *         Called by tests to drive the fulfillClaim / fulfillClaim callback.
     */
    function fulfillRequest(uint256 requestId, uint64 decryptedValue) external {
        PendingRequest memory req = pendingRequests[requestId];
        require(req.callerContract != address(0), "MockGateway: unknown requestId");
        delete pendingRequests[requestId];

        (bool ok, bytes memory errData) = req.callerContract.call(
            abi.encodeWithSelector(req.callbackSelector, requestId, decryptedValue)
        );
        if (!ok) {
            // Bubble up revert reason
            if (errData.length > 0) {
                assembly { revert(add(errData, 32), mload(errData)) }
            }
            revert("MockGateway: callback reverted");
        }
        emit DecryptionFulfilled(requestId, decryptedValue);
    }

    /**
     * @notice Auto-fulfill using handle == plaintext (mock convention).
     *         Convenient shortcut when tests don't need to specify the value.
     */
    function autoFulfillRequest(uint256 requestId) external {
        PendingRequest memory req = pendingRequests[requestId];
        require(req.callerContract != address(0), "MockGateway: unknown requestId");
        uint64 decryptedValue = uint64(req.handle);
        this.fulfillRequest(requestId, decryptedValue);
    }
}
