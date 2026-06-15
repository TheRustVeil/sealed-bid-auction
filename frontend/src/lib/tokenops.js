/**
 * TokenOps SDK integration layer — Phase 5
 *
 * Abstracts all @tokenops/sdk calls so features never import the SDK directly.
 *
 * Subpaths used:
 *   @tokenops/sdk/fhe-airdrop  — ConfidentialAirdrop factory + EIP-712 claim flow
 *   @tokenops/sdk/fhe-disperse — DisperseConfidential singleton (register → disperse)
 *
 * Required peers (installed):
 *   @tokenops/sdk, @zama-fhe/sdk@^3
 *   React hooks additionally need @zama-fhe/react-sdk@^3 with <ZamaProvider> in providers.jsx.
 *
 * MIGRATION NOTE: @zama-fhe/sdk@^3 supersedes fhevmjs. Before FHE write flows work,
 *   providers.jsx must add <ZamaProvider> from @zama-fhe/react-sdk inside WagmiProvider.
 *   FheContext.jsx can be retired once ZamaProvider is wired.
 *
 * No API key required — pure viem-first SDK, auth is wallet-based.
 */

// --- Airdrop (factory + EIP-712 claim flow) ---
// Operator:
//   factory = createConfidentialAirdropFactoryClient({ publicClient, walletClient, encryptor })
//   { airdrop } = await factory.createConfidentialAirdropAndGetAddress({ params, userSalt })
//   encrypted = await encryptUint64({ encryptor, contractAddress: airdrop, userAddress: recipient, value })
//   signature = await signClaimAuthorization({ walletClient, airdropAddress: airdrop, recipient, encryptedAmountHandle: encrypted.handle })
//   → deliver { encryptedInput: encrypted, signature } to recipient out-of-band
//
// Recipient:
//   client = createConfidentialAirdropClient({ publicClient, walletClient, address: airdrop })
//   await client.claim({ signature, encryptedInput: encrypted })
export {
  createConfidentialAirdropFactoryClient,
  createConfidentialAirdropClient,
  encryptUint64,
  signClaimAuthorization,
} from '@tokenops/sdk/fhe-airdrop';

// --- Disperse (singleton — one address on Sepolia + mainnet) ---
// Operator:
//   client = createConfidentialDisperseClient({ publicClient, walletClient, encryptor })
//   if (!(await client.isRegistered(account))) await client.register({ token })
//   report = await client.preflightDisperse({ user, token, recipients, amounts, mode: 'wallet' })
//   if (!report.ready) throw report.blockerErrors
//   await client.disperse({ token, mode: 'wallet', recipients, amounts })
export { createConfidentialDisperseClient } from '@tokenops/sdk/fhe-disperse';
