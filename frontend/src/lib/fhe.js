import { createInstance } from 'fhevmjs';
import { ZAMA_CONFIG } from '../app/config';

// Module-level singleton — survives route changes, never re-initialized.
let _instance = null;

/**
 * Initialize the Zama fhEVM browser SDK.
 * Called once at app boot by FheProvider. Subsequent calls return the cached instance.
 *
 * Requires window.ethereum (MetaMask or any EIP-1193 wallet) so it can read the
 * FHE public key from the KMS contract on-chain.
 */
export async function initFhevm() {
  if (_instance) return _instance;

  if (!window.ethereum) {
    throw new Error(
      'No Ethereum provider found. Install MetaMask or another EIP-1193 wallet to use this app.'
    );
  }

  _instance = await createInstance({
    kmsContractAddress: ZAMA_CONFIG.kmsContractAddress,
    aclContractAddress: ZAMA_CONFIG.aclContractAddress,
    network: window.ethereum,
    gatewayUrl: ZAMA_CONFIG.gatewayUrl,
  });

  return _instance;
}

/** Returns the cached instance. Throws if initFhevm() has not been called. */
export function getFhevmInstance() {
  if (!_instance) throw new Error('FHE not initialized — app should call initFhevm() at startup.');
  return _instance;
}

/**
 * Encrypt a uint64 amount for a specific contract + user pair.
 *
 * @param {number|bigint} plaintext - The amount to encrypt.
 * @param {`0x${string}`} contractAddress - The ConfidentialDisperse contract address.
 * @param {`0x${string}`} userAddress - The operator's wallet address.
 * @returns {{ handle: Uint8Array, inputProof: Uint8Array }}
 *   Pass handle as einput[] and inputProof as bytes[] to executeDistribution.
 */
export async function encryptAmount(plaintext, contractAddress, userAddress) {
  const instance = getFhevmInstance();
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(BigInt(plaintext));
  const encrypted = await input.encrypt();
  return {
    handle: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

/**
 * Re-encrypt a recipient's allocation handle so they can read their own amount in-browser.
 *
 * Flow:
 *  1. Generate a throwaway keypair.
 *  2. Ask the user to sign an EIP-712 message that authorizes the re-encryption.
 *  3. The fhevmjs SDK sends the signed request to the Zama Gateway, which decrypts the
 *     handle under the user's ephemeral public key and returns the ciphertext.
 *  4. Decrypt locally with the ephemeral private key → plaintext bigint.
 *
 * @param {bigint} handle - The euint64 handle from getAllocationHandle().
 * @param {`0x${string}`} contractAddress - The ConfidentialDisperse contract address.
 * @param {`0x${string}`} userAddress - The recipient's wallet address.
 * @param {import('viem').WalletClient} walletClient - Used to sign the EIP-712 message.
 * @returns {Promise<bigint>} The decrypted allocation amount.
 */
export async function reencryptAllocation(handle, contractAddress, userAddress, walletClient) {
  const instance = getFhevmInstance();
  const { publicKey, privateKey } = instance.generateKeypair();
  const eip712 = instance.createEIP712(publicKey, contractAddress, userAddress);
  const signature = await walletClient.signTypedData(eip712);
  return instance.reencrypt(handle, privateKey, publicKey, signature, contractAddress, userAddress);
}
