# @tokenops/sdk — distilled notes (Phase 5)

> Source: npm readme for `@tokenops/sdk`. Saved to avoid re-pasting in future sessions.
> Last updated: 2026-06-09

## Install

```bash
pnpm add @tokenops/sdk @zama-fhe/sdk@^3 @zama-fhe/react-sdk@^3 --filter frontend
```

Node >= 22 required. No API key — wallet-based auth only.

## Subpaths used by this project

| Subpath | What it covers |
|---------|----------------|
| `@tokenops/sdk/fhe-airdrop` | ConfidentialAirdrop factory + EIP-712 claim (matches `ConfidentialAirdrop.sol`) |
| `@tokenops/sdk/fhe-airdrop/react` | React/wagmi hooks for airdrop flow |
| `@tokenops/sdk/fhe-disperse` | DisperseConfidential singleton (matches `ConfidentialDisperse.sol`) |
| `@tokenops/sdk/fhe-disperse/react` | React/wagmi hooks for disperse flow |

All imports go through `lib/tokenops.js` — never import the SDK directly from components.

## Key design points

- **No API key** — pure viem-first SDK
- **Deployed factories only** — SDK calls pre-deployed factory/singleton contracts (no deploy helpers)
- **Sepolia factories live**: fhe-airdrop + fhe-vesting. fhe-disperse on mainnet + Sepolia.
- **ZamaProvider required** for React hooks — `<ZamaProvider>` from `@zama-fhe/react-sdk` must wrap the app (see migration note below)
- **Encryptor pattern**: pass `encryptor: () => zamaSDK.relayer` (lazy factory) so hooks pick up live context

## Airdrop flow (`@tokenops/sdk/fhe-airdrop`)

### Operator (admin) side

```js
import {
  createConfidentialAirdropFactoryClient,
  encryptUint64,
  signClaimAuthorization,
} from '@tokenops/sdk/fhe-airdrop';

// 1. Deploy campaign clone
const factory = createConfidentialAirdropFactoryClient({ publicClient, walletClient, encryptor });
const { airdrop } = await factory.createConfidentialAirdropAndGetAddress({
  params: {
    token,
    startTimestamp: now + 60,
    endTimestamp: now + 30 * 86400,
    canExtendClaimWindow: false,
    admin: operatorAddress,
  },
  userSalt: '0x0000...0001',
});

// 2. Encrypt allocation for each recipient (proof is bound to recipient address)
const encrypted = await encryptUint64({
  encryptor,
  contractAddress: airdrop,
  userAddress: recipient,
  value: 1_000_000n,        // raw token units (ERC-7984 uses 6 decimals → 1 token = 1_000_000n)
});

// 3. Sign EIP-712 claim authorization
const signature = await signClaimAuthorization({
  walletClient,
  airdropAddress: airdrop,
  recipient,
  encryptedAmountHandle: encrypted.handle,
});

// 4. Deliver { encryptedInput: encrypted, signature } to recipient out-of-band
```

### Recipient side

```js
import { createConfidentialAirdropClient } from '@tokenops/sdk/fhe-airdrop';

const client = createConfidentialAirdropClient({ publicClient, walletClient, address: airdrop });
// GAS_FEE() fetched and attached as msg.value automatically
await client.claim({ signature, encryptedInput: encrypted });
```

### React hooks (`@tokenops/sdk/fhe-airdrop/react`)

```js
import {
  useCreateConfidentialAirdropAndGetAddress,  // deploy campaign
  useSignClaimAuthorization,                   // sign EIP-712 auth
  useClaim,                                    // recipient claim
  encryptUint64,                               // still plain async fn, not a hook
} from '@tokenops/sdk/fhe-airdrop/react';

// Query key: ["tokenops-sdk", "fhe-airdrop"]
```

## Disperse flow (`@tokenops/sdk/fhe-disperse`)

Singleton address resolves automatically on Sepolia/mainnet from `DEPLOYED_ADDRESSES`.

```js
import { createConfidentialDisperseClient } from '@tokenops/sdk/fhe-disperse';

const client = createConfidentialDisperseClient({ publicClient, walletClient, encryptor });

// One-time registration per user per token (deploys a wallet pair clone)
if (!(await client.isRegistered(account.address))) {
  await client.register({ token });
}

// Preflight: checks all 5 failure modes (not registered, insufficient balance, etc.)
const report = await client.preflightDisperse({
  user: account.address,
  token,
  recipients,               // `0x${string}[]`
  amounts,                  // bigint[]  (raw units)
  mode: 'wallet',
});
if (!report.ready) {
  // report.blockerErrors: TokenOpsSdkError[] — use err.code for typed UI, err.message for text
  throw report.blockerErrors;
}

// Encrypt + disperse (SDK handles encryption, ACL grants, ETH gas fee)
const { hash } = await client.disperse({ token, mode: 'wallet', recipients, amounts });
```

### React hooks (`@tokenops/sdk/fhe-disperse/react`)

```js
import {
  useIsRegistered,      // read: is user registered?
  useRegister,          // write: deploy wallet pair clone
  usePreflightDisperse, // read: check all failure modes before dispatch
  useDisperse,          // write: encrypt + disperse
} from '@tokenops/sdk/fhe-disperse/react';

// Query key: ["tokenops-sdk", "fhe-disperse"]
// useDisperse needs: encryptor: () => zamaSDK.relayer  (lazy factory)
```

## ZamaProvider migration (required before FHE write flows work)

`@tokenops/sdk` React hooks use `useZamaSDK()` from `@zama-fhe/react-sdk` internally.
`@zama-fhe/sdk@^3` supersedes `fhevmjs@0.6.2`.

Steps needed (Phase 6 prep):
1. Add `<ZamaProvider>` from `@zama-fhe/react-sdk` inside `<WagmiProvider>` in `providers.jsx`
2. Retire `FheContext.jsx` (fhevmjs-based) once ZamaProvider covers FHE init
3. Keep `fhe.js` `reencryptAllocation` until the `@zama-fhe/sdk` equivalent is confirmed

```jsx
// providers.jsx target shape:
<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <ZamaProvider>        {/* ← add this; wires useZamaSDK() */}
      {children}
    </ZamaProvider>
  </QueryClientProvider>
</WagmiProvider>
```

## Amounts / decimals

- ERC-7984 tokens use 6 decimals
- 1 token = `1_000_000n` raw units
- Pass raw `bigint` — SDK handles encryption
