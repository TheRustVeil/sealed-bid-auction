# ConfidentialDrop

> Sealed-bid auction settlement on the Zama fhEVM — winners receive tokens at their private bid price. No one can see what anyone else was paid.

**Live demo:** https://sealed-bid-auction-frontend.vercel.app

---

## What We Built

ConfidentialDrop is a fully on-chain sealed-bid auction settlement system. An **operator** (the auction house) holds the final winning bids off-chain, then pushes results on-chain in one transaction. Every recipient's payout is individually FHE-encrypted — only the recipient and the Zama KMS can ever see their own amount. The contract stores opaque 64-bit ciphertexts; the blockchain sees handles (bytes32), not numbers.

### Core privacy guarantee

```
Operator   → knows recipients + amounts  (they ran the auction)
Blockchain → sees only encrypted handles (bytes32)
Recipient  → decrypts only their own payout via Zama relayer
Public     → sees recipient COUNT, nothing else
```

### User flows

| Role | What they do |
|------|-------------|
| **Operator** | Connect wallet → choose token → paste recipient CSV → execute (encrypts + deploys) → optionally grant auditor access |
| **Recipient** | Connect wallet → enter distribution ID → decrypt-reveal their payout → claim tokens |
| **Auditor** | Operator grants ACL on specific handles → auditor decrypts individual amounts |

---

## How It Works (FHE mechanics)

1. The operator pastes a CSV of `address, amount` pairs into the UI.
2. The frontend calls `zamaSDK.relayer.encrypt()` on all amounts in one batch, producing per-handle `bytes32[]` + a shared `inputProof`.
3. Three on-chain transactions are sent sequentially:
   - `createDistribution(id, token, count)` — registers the distribution
   - `token.approve(disperseAddress, total)` — ERC-20 allowance
   - `fundDistribution(id, total)` — pulls tokens into the contract
   - `executeDistribution(id, recipients[], handles[], proofs[])` — stores one `euint64` per recipient
4. The contract calls `FHE.allowThis`, `FHE.allow(recipient)`, `FHE.allow(operator)`, and `Impl.makePubliclyDecryptable(handle)` on each handle.
5. A recipient calls `zamaSDK.relayer.publicDecrypt([handle])` off-chain to get `{ decryptedResult, decryptionProof }`, then submits both on-chain via `claim(id, decryptedResult, decryptionProof)`.
6. The contract verifies the KMS signature with `IKMSVerifier.verifyDecryptionEIP712KMSSignatures` and transfers tokens.

---

## Project Structure

This is a **pnpm monorepo** managed by Turborepo. There is no traditional backend server — the smart contracts running on Ethereum ARE the backend.

```
confidential-drop/
│
├── frontend/                   ← React dApp (the UI)
│   ├── src/
│   │   ├── app/                ← router, providers, chain config
│   │   ├── pages/              ← one folder per route (thin, compose features)
│   │   ├── features/           ← domain logic (distributions, allocations, wallet…)
│   │   ├── components/ui/      ← shared design-system primitives
│   │   └── lib/                ← SDK/chain integration (wagmi, FHE, contract ABIs)
│   ├── tests/e2e/              ← Playwright smoke tests (31 passing)
│   ├── .env.example
│   └── package.json
│
├── contracts/                  ← On-chain backend (Solidity + Hardhat + fhEVM)
│   ├── contracts/
│   │   ├── ConfidentialDisperse.sol    ← main settlement contract
│   │   ├── ConfidentialAirdrop.sol     ← pull-claim airdrop variant
│   │   ├── tokens/ConfidentialToken.sol
│   │   ├── interfaces/
│   │   └── mocks/                      ← local test doubles for FHE contracts
│   ├── deploy/                 ← Hardhat deploy scripts
│   ├── scripts/                ← e2e lifecycle scripts (local + Sepolia)
│   ├── tasks/                  ← Hardhat CLI tasks
│   ├── test/                   ← Mocha/Chai tests (93 passing)
│   ├── .env.example
│   └── hardhat.config.js
│
├── docs/                       ← SDK integration notes
├── .github/workflows/ci.yml    ← CI: lint + contract tests + frontend build
├── package.json                ← pnpm workspace root
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Key Files Explained

### Contracts (`contracts/contracts/`)

#### `ConfidentialDisperse.sol` — the core contract
The settlement engine. Stores one encrypted `euint64` allocation handle per recipient per distribution. Key design decisions:
- Uses `@fhevm/solidity@0.11.1` — the `FHE` library (not the old `TFHE`) with `euint64` as `bytes32`.
- `executeDistribution` calls `FHE.fromExternal(handle, proof)` for each recipient, then grants ACL via `FHE.allowThis` / `FHE.allow(recipient)` / `FHE.allow(operator)` and marks handles as publicly decryptable so the relayer can service `publicDecrypt` requests.
- `claim` verifies the Zama KMS EIP-712 signature on-chain via `IKMSVerifier.verifyDecryptionEIP712KMSSignatures`, then calls `IERC20.safeTransfer`.
- Auditor flow: `grantDecryptAccess(id, auditor)` whitelists an address, then `grantAuditorHandleAccess(id, recipient, auditor)` grants per-handle ACL.

#### `ConfidentialAirdrop.sol` — pull-claim variant
Operator adds recipients with pre-encrypted amounts via `addRecipients`, seals the airdrop, funds it, then recipients claim at their own pace. Same KMS-proof claim pattern as `ConfidentialDisperse`.

#### `tokens/ConfidentialToken.sol` — settlement token
Plain ERC-20 with configurable decimals + owner-gated `mint`/`burn`. The confidentiality lives at the disperse layer, not at the token level (ERC-7984 upgrade is a future extension).

#### `mocks/` — local FHE test doubles
`MockACL`, `MockFHEVMExecutor`, `MockKMSVerifier` — deployed at the same addresses the real Zama contracts use on Sepolia. `MockFHEVMExecutor.verifyInput` returns the handle as-is (identity encryption). `MockKMSVerifier.verifyDecryptionEIP712KMSSignatures` always returns `true`. This lets the 93 contract tests run entirely locally without a live FHE node.

---

### Frontend (`frontend/src/`)

#### `app/config.js` — environment wiring
Reads `VITE_*` env vars and exports `CONTRACT_ADDRESSES`, `RPC_URL`, and `ZAMA_CONFIG` (KMS + ACL addresses for Sepolia). Single source of truth for all chain constants.

#### `app/providers.jsx` — context tree
`WagmiProvider > QueryClientProvider > ZamaProvider`. Initializes a `RelayerWeb` with Sepolia transport, wired to a `WagmiSigner`. This is the FHE encryption/decryption context for the whole app. `VITE_SKIP_ZAMA=true` substitutes stubs so Playwright tests run without a wallet.

#### `lib/erc7984.js` — contract ABI + read helpers
Inlined ABIs for `ConfidentialDisperse` (read functions: `getDistribution`, `claimed`, `getAllocationHandle`) and `ERC20` (`name`, `symbol`, `decimals`, `balanceOf`, `approve`). All on-chain reads go through helper functions exported from this file. Write ABIs (create/fund/execute) live in `useCreateDistribution.js` to keep them co-located with the mutation that uses them.

#### `lib/fhe.js` — legacy fhevmjs layer
`initFhevm` / `getFhevmInstance` / `encryptAmount` / `reencryptAllocation` using the older `fhevmjs@0.6.2` API. Kept for reference; active encryption now goes through `zamaSDK.relayer` from `@zama-fhe/react-sdk`.

#### `lib/wagmi.js` — chain config
Wagmi v3 client with Sepolia + injected/WalletConnect connectors. `publicClient` and `walletClient` are consumed by hooks throughout the app.

#### `features/distributions/hooks/useCreateDistribution.js` — the operator wizard brain
Owns all wizard state (`step`, `token`, `label`, `recipients`, `privacyMode`) via `useReducer`. The `executeMutation` runs the full 4-transaction sequence:
1. `walletClient.writeContract → createDistribution`
2. `walletClient.writeContract → token.approve`
3. `walletClient.writeContract → fundDistribution`
4. `zamaSDK.relayer.encrypt(amounts, {contractAddress, userAddress})` → batch encrypt
5. `walletClient.writeContract → executeDistribution`

Each tx waits for a receipt (`publicClient.waitForTransactionReceipt`) before the next step. On completion, saves the distribution to `localStorage` so the Dashboard can list it.

#### `features/distributions/components/steps/StepExecute.jsx` — execute UI
Shows a terminal-style animation during the multi-tx flow. On error, parses the viem error message and shows a human-readable failure reason with a Retry button.

#### `features/allocations/hooks/useDecrypt.js` — recipient decrypt + claim
Calls `zamaSDK.relayer.publicDecrypt([handle])` to get the `decryptedResult` + `decryptionProof` from the Zama KMS, then calls `claim(distributionId, decryptedResult, decryptionProof)` on-chain.

#### `features/allocations/components/DecryptReveal.jsx` — the money moment
Masked `****` → animated number reveal. Renders `PersonalAnalytics` below on successful decrypt.

#### `components/ui/ConfidentialChip.jsx` — privacy pill
Two modes: locked (`🔒 CONFIDENTIAL`) and revealed (green monospace number). Used on both operator and recipient screens.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Solidity 0.8.24, Hardhat 2.22, `@fhevm/solidity@0.11.1` |
| FHE runtime | Zama fhEVM coprocessor (Sepolia) |
| Frontend | React 19, Vite 8, Tailwind CSS 3, Framer Motion |
| Wallet / chain | wagmi v3, viem v2 |
| FHE SDK (browser) | `@zama-fhe/react-sdk@^3`, `@zama-fhe/sdk@^3` |
| Data fetching | TanStack Query v5 |
| E2E tests | Playwright |
| Contract tests | Mocha + Chai (93 tests) |
| Monorepo | pnpm workspaces + Turborepo |
| CI | GitHub Actions |
| Hosting | Vercel (frontend) |

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 8 (`npm install -g pnpm`)
- **MetaMask** (or any EIP-1193 wallet) connected to **Sepolia**
- **Sepolia ETH** for gas — get some from https://sepoliafaucet.com
- **Infura account** (free) or any Sepolia RPC URL

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/TheRustVeil/sealed-bid-auction-settlement.git
cd sealed-bid-auction-settlement
```

### 2. Install dependencies

```bash
pnpm install
```

This installs everything for both `frontend/` and `contracts/` via pnpm workspaces.

### 3. Configure environment

**Contracts (`contracts/.env`):**
```bash
cp contracts/.env.example contracts/.env
```
Edit `contracts/.env`:
```env
MNEMONIC="your twelve word seed phrase here"
INFURA_API_KEY=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_key
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

**Frontend (`frontend/.env.local`):**
```bash
cp frontend/.env.local.example frontend/.env.local
```
Edit `frontend/.env.local` — fill in deployed contract addresses (see step 5):
```env
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_TOKEN_ADDRESS=0x...
VITE_DISPERSE_ADDRESS=0x...
VITE_SKIP_ZAMA=false
```

### 4. Compile contracts

```bash
pnpm --filter confidential-drop-contracts compile
```

### 5. Deploy to Sepolia

```bash
cd contracts
node scripts/e2e-sepolia.js
```

This script:
- Deploys `ConfidentialToken` (ATK, 6 decimals)
- Deploys `ConfidentialDisperse`
- Mints tokens to the deployer
- Runs a full FHE end-to-end test (encrypt → execute → publicDecrypt → claim)
- **Writes the contract addresses into `frontend/.env.local` automatically**

> Alternatively deploy step by step:
> ```bash
> npx hardhat run deploy/01_token.js --network sepolia
> npx hardhat run deploy/02_distributor.js --network sepolia
> ```

### 6. Run contract tests (local, no Sepolia needed)

```bash
pnpm --filter confidential-drop-contracts test
```

Runs 93 Mocha tests against a local Hardhat network with mock FHE contracts. All tests pass in ~30 seconds.

### 7. Start the frontend dev server

```bash
pnpm --filter frontend dev
```

Opens at http://localhost:5173

### 8. (Optional) Run Playwright E2E tests

```bash
cd frontend
npx playwright install
pnpm test:e2e
```

Set `VITE_SKIP_ZAMA=true` in `frontend/.env.local` to run the full E2E suite without a live wallet.

---

## Already Deployed (Sepolia)

These are the live contract addresses used by the deployed Vercel frontend:

| Contract | Address |
|----------|---------|
| ConfidentialToken (ATK, 6 decimals) | `0x7CF438647deD14b3503ba133176b2EB7524af989` |
| ConfidentialDisperse | `0x5F48197D829D7FD967799C7F2a9C94fbC30fc634` |

Zama infrastructure addresses on Sepolia (auto-configured by `@fhevm/solidity`):

| Contract | Address |
|----------|---------|
| ACL | `0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5` |
| KMSVerifier | `0x9D6891A6240D6130c54ae243d8005063D05fE14b` |

---

## Operator Workflow (step by step)

1. Go to `/operator/create`
2. **Type** — choose "Disperse" and privacy mode
3. **Token** — paste the ERC-20 address (`0x7CF438647...` for the deployed ATK token)
4. **Recipients** — paste a CSV of winners:
   ```
   0xRecipient1Address,1000
   0xRecipient2Address,2500
   0xRecipient3Address,750
   ```
   Amounts are in token units (ATK has 6 decimals, so `1000` = 1000 × 10⁶ base units)
5. **Review** — confirm the list
6. **Execute** — approve 4 wallet transactions sequentially. The UI shows a terminal-style progress animation.

---

## Recipient Workflow

1. Go to `/recipient` (or "Check Bid" in the nav)
2. Enter the distribution ID (bytes32 hash) given by the operator
3. Click **Decrypt** — the Zama relayer decrypts your allocation (off-chain KMS call, no gas)
4. Your amount animates from `****` to the real number
5. Click **Claim** — submits the KMS proof on-chain, tokens transfer to your wallet

---

## Environment Variables Reference

### `contracts/.env`

| Variable | Description |
|----------|-------------|
| `MNEMONIC` | 12-word seed phrase for the deployer wallet |
| `INFURA_API_KEY` | Infura project ID (optional if using publicnode RPC) |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint (defaults to publicnode.com free endpoint) |
| `ETHERSCAN_API_KEY` | For contract verification on Etherscan (optional) |

### `frontend/.env.local`

| Variable | Description |
|----------|-------------|
| `VITE_CHAIN_ID` | `11155111` for Sepolia, `31337` for local Hardhat |
| `VITE_RPC_URL` | Ethereum JSON-RPC endpoint |
| `VITE_DISPERSE_ADDRESS` | Deployed `ConfidentialDisperse` contract address |
| `VITE_TOKEN_ADDRESS` | Deployed `ConfidentialToken` address |
| `VITE_AIRDROP_ADDRESS` | Deployed `ConfidentialAirdrop` address (optional) |
| `VITE_SKIP_ZAMA` | `true` to bypass FHE in Playwright CI (stub mode) |

---

## Scripts Reference

### Contracts

```bash
# Compile all contracts
pnpm --filter confidential-drop-contracts compile

# Run all 93 tests
pnpm --filter confidential-drop-contracts test

# Deploy to Sepolia + full FHE e2e test
cd contracts && node scripts/e2e-sepolia.js

# Check deployer balance
cd contracts && node scripts/check-balance.js

# Hardhat task: create a distribution from CLI
npx hardhat create-distribution --network sepolia --token 0x... --recipients 0xA,100 0xB,200
```

### Frontend

```bash
# Dev server
pnpm --filter frontend dev

# Production build
pnpm --filter frontend build

# Unit tests (Vitest)
pnpm --filter frontend test

# Playwright E2E
pnpm --filter frontend test:e2e
```

### Monorepo root

```bash
# Run dev server for all packages
pnpm dev

# Build everything
pnpm build

# Run all tests
pnpm test
```

---

## Project Phases (what was built and when)

| Phase | What | Status |
|-------|------|--------|
| 0–2 | Monorepo setup, Hardhat config, React scaffold | ✅ |
| 3 | Smart contracts: `ConfidentialDisperse`, `ConfidentialAirdrop`, `ConfidentialToken`, mocks, interfaces | ✅ |
| 4 | UI primitives: Button, Card, Pill, Spinner, ConfidentialChip, Modal, Stepper, NotificationToast, HeatScore | ✅ |
| 5 | Integration layer: wagmi.js, erc7984.js, fhe.js, providers.jsx (ZamaProvider) | ✅ |
| 6 | All pages and features: operator wizard, recipient claim, dashboard, distribution detail | ✅ |
| 7 | 93 contract tests + 31 Playwright E2E tests | ✅ |
| 8 | Frontend wiring: real wagmi writes, useClaimReveal, clean build | ✅ |
| 9 | Sepolia deployment + full FHE e2e verified on-chain | ✅ |
| 10 | Auction UI: AuctionCard, BidIntensityMeter, ActivityFeed, PersonalAnalytics, Discover, Profile, HeatScore, animations | ✅ |
| 11 | Vercel deployment | ✅ Live at sealed-bid-auction-frontend.vercel.app |

---

## License

MIT
