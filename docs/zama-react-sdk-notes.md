# @zama-fhe/react-sdk — distilled notes (Phase 6)

> Source: npm readme for `@zama-fhe/react-sdk`. Saved 2026-06-09 to avoid re-pasting.
> `@zama-fhe/sdk` is a direct dep — no separate install needed.

## Install

Already pulled in as a dep of `@zama-fhe/react-sdk`:
```bash
pnpm add @zama-fhe/react-sdk @tanstack/react-query --filter frontend
# (already installed in this project)
```

## Provider wiring (wagmi, Sepolia) — DONE in providers.jsx

```jsx
import { ZamaProvider, RelayerWeb, SepoliaConfig, indexedDBStorage } from "@zama-fhe/react-sdk";
import { WagmiSigner } from "@zama-fhe/react-sdk/wagmi";

// Create once at module level (stable references)
const signer = new WagmiSigner({ config: wagmiConfig });
const relayer = new RelayerWeb({
  getChainId: () => signer.getChainId(),
  transports: {
    [sepolia.id]: { ...SepoliaConfig, network: RPC_URL },
    // SepoliaConfig spreads in: relayerUrl (public Zama relay), kmsContractAddress, aclContractAddress
    // Override `network` with your own Infura/Alchemy key to avoid rate limits
  },
});

// Wrap order: WagmiProvider > QueryClientProvider > ZamaProvider
<ZamaProvider relayer={relayer} signer={signer} storage={indexedDBStorage}>
  {children}
</ZamaProvider>
```

`indexedDBStorage` — persists FHE keypair (30-day TTL by default). Session signature is in-memory only (re-prompted on reload, by design).

## Hooks relevant to this project

### Getting the encryptor for @tokenops/sdk hooks

```js
import { useZamaSDK } from "@zama-fhe/react-sdk";

const zamaSDK = useZamaSDK();
// Pass as lazy factory so the live context is captured at submit time (not stale mount-time):
encryptor: () => zamaSDK.relayer
```

### Encrypt for a custom contract (StepExecute / operator side)

```js
import { useEncrypt } from "@zama-fhe/react-sdk"; // re-exported low-level hook

const encrypt = useEncrypt();
const { handles, inputProof } = await encrypt.mutateAsync({
  values: [{ value: amount, type: "euint64" }],
  contractAddress: "0xYourContract",
  userAddress,
});
// Pass handles[0] + inputProof to your contract write
```

### Decrypt a recipient's allocation handle (DecryptReveal)

```js
import { useUserDecrypt } from "@zama-fhe/react-sdk";

const { data, isPending } = useUserDecrypt(
  {
    handles: [{ handle: allocationHandle, contractAddress: airdropAddress }],
  },
  { enabled: shouldReveal },
);
// data: { [handle]: bigint } — the plaintext amount
```

### Pre-authorize decrypt (avoid repeated wallet prompts)

```js
import { useAllow, useIsAllowed } from "@zama-fhe/react-sdk";

// Call once after wallet connect to batch-sign for all known contracts:
const { mutateAsync: allow } = useAllow();
await allow([airdropAddress, disperseAddress]);

// Gate the "Reveal" button:
const { data: allowed } = useIsAllowed({ contractAddresses: [airdropAddress] });
<button disabled={!allowed}>Reveal my amount</button>
```

### Error handling

```js
import { matchZamaError } from "@zama-fhe/react-sdk";

const message = matchZamaError(error, {
  SIGNING_REJECTED: () => "Transaction cancelled — please approve in your wallet.",
  ENCRYPTION_FAILED: () => "Encryption failed — please try again.",
  DECRYPTION_FAILED: () => "Decryption failed — please try again.",
  APPROVAL_FAILED:   () => "Token approval failed — please try again.",
  TRANSACTION_REVERTED: () => "Transaction failed on-chain — check your balance.",
  _: () => "An unexpected error occurred.",
});
```

## What we do NOT use from this SDK

These hooks are for wrapped confidential ERC-20 operations (shield/unshield/balance), not our airdrop/disperse flow:
- `useConfidentialBalance` / `useConfidentialBalances`
- `useShield` / `useUnshield` / `useUnwrap`
- `useConfidentialTransfer`

Our flow: operator encrypts allocation via `encryptUint64` (TokenOps SDK) → recipient decrypts via `useUserDecrypt` (this SDK).

## Credential lifecycle (affects UX design)

1. **First decrypt** — wallet prompted to sign EIP-712, keypair generated, stored in IndexedDB
2. **Same session** — cached credentials reused silently (no re-prompt)
3. **Page reload** — keypair loaded from IndexedDB, wallet re-prompted once per session
4. **Expiry** — 30-day TTL (`keypairTTL`); after expiry, regenerates + re-prompts
5. **Pre-auth** — `useAllow([...addresses])` batches the wallet prompt; call after wallet connect

Design implication: show a "Authorize decrypt" step before the RevealAmount flow, using `useIsAllowed` as the gate.

## Key re-exports from @zama-fhe/sdk

Available from `@zama-fhe/react-sdk` directly (no need to install core):
- `SepoliaConfig`, `MainnetConfig`, `HardhatConfig` — network presets
- `RelayerWeb`, `ZamaSDK`, `Token`, `ReadonlyToken`
- `indexedDBStorage`, `memoryStorage`
- All error classes and `matchZamaError`

## Query key reference

```js
import { zamaQueryKeys } from "@zama-fhe/react-sdk";

queryClient.invalidateQueries({ queryKey: zamaQueryKeys.confidentialBalance.all });
```
