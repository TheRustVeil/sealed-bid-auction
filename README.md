# ConfidentialDrop

> A sealed-bid auction settlement dApp built on Zama's fhEVM — winners receive tokens at their private bid price. Nobody on the blockchain can see what anyone else was paid.

**Live Demo:** https://sealed-bid-auction-frontend.vercel.app

---

## Table of Contents

1. [What is This Project?](#1-what-is-this-project)
2. [The Problem it Solves](#2-the-problem-it-solves)
3. [How FHE Works Here (Simple Explanation)](#3-how-fhe-works-here-simple-explanation)
4. [System Architecture](#4-system-architecture)
5. [Project Structure](#5-project-structure)
6. [Smart Contracts Explained](#6-smart-contracts-explained)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Tech Stack](#8-tech-stack)
9. [Complete User Flows](#9-complete-user-flows)
10. [Getting Started](#10-getting-started)
11. [Environment Variables](#11-environment-variables)
12. [Running Tests](#12-running-tests)
13. [Deployed Contracts (Sepolia)](#13-deployed-contracts-sepolia)
14. [Scripts Reference](#14-scripts-reference)
15. [Interview Q&A Prep](#15-interview-qa-prep)

---

## 1. What is This Project?

**ConfidentialDrop** is a fully on-chain sealed-bid auction settlement system.

In a sealed-bid auction, every bidder submits their price privately (sealed envelope). The auctioneer opens the envelopes, picks the winners, and pays each winner at their own submitted price — nobody knows what anyone else paid.

This project brings that concept on-chain using **Fully Homomorphic Encryption (FHE)**. The operator (auction house) records each winner's payout as an **encrypted number** on the blockchain. The blockchain stores only an opaque handle (a `bytes32` pointer). Only the individual recipient — using a cryptographic proof from Zama's Key Management System — can ever reveal their own amount.

### In one sentence:
> Every winner's payout is stored on-chain as an encrypted ciphertext. You can see that you won, but you cannot see what anyone else won.

---

## 2. The Problem it Solves

### The Privacy Problem with Normal Blockchains

Ethereum is transparent by design — every transaction, every storage slot, every number is readable by anyone. This makes traditional sealed-bid auctions impossible on-chain:

```
Normal ERC-20 transfer:
  recipient = 0xAlice
  amount    = 5000        ← EVERYONE can see this
```

### What ConfidentialDrop Does Differently

```
ConfidentialDrop distribution:
  recipient = 0xAlice
  handle    = 0x7f3a...c9  ← This is an encrypted pointer. Blockchain sees nothing.

Only Alice + Zama KMS can decrypt 0x7f3a...c9 → 5000
```

### Who Benefits?

| Scenario | Why privacy matters |
|----------|---------------------|
| Token sales / IDOs | Investors don't want to reveal how much allocation they received |
| Corporate bonuses on-chain | Salary privacy between employees |
| Competitive auctions | Bidders don't want competitors knowing their prices |
| Treasury distributions | DAO members don't need to know each other's grants |

---

## 3. How FHE Works Here (Simple Explanation)

FHE stands for **Fully Homomorphic Encryption**. It lets you do math on encrypted numbers without ever decrypting them.

### The Key Insight

Zama's fhEVM adds an FHE coprocessor alongside the EVM. When your smart contract does operations on `euint64` (an encrypted 64-bit integer), the coprocessor handles the encrypted arithmetic. The EVM itself never sees the actual numbers.

### The Flow in Plain English

```
Step 1 — Operator side (off-chain):
  I have: Alice=5000, Bob=3000, Carol=7500
  I encrypt each amount using Zama's SDK → get handles: [0x7f3a, 0xb2c1, 0x9e44]

Step 2 — On-chain (ConfidentialDisperse contract):
  Store mapping: Alice → handle_0x7f3a
  The blockchain literally stores bytes32. It has no idea the number is 5000.
  Grant Alice "ACL permission" so only she can decrypt her handle.

Step 3 — Recipient side (Alice, off-chain):
  Alice asks the Zama KMS relayer: "decrypt handle_0x7f3a for me"
  The KMS checks: does Alice have ACL permission? Yes.
  KMS returns: { decryptedResult: abi.encode(5000), decryptionProof: <EIP-712 signature> }

Step 4 — Recipient side (Alice, on-chain):
  Alice submits the proof to the contract: claim(distributionId, 5000, proof)
  Contract verifies the KMS signature cryptographically.
  Contract transfers 5000 tokens to Alice.
```

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                               │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                    React Frontend (Vite)                     │  │
│   │                                                              │  │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │  │
│   │  │  Operator  │  │ Recipient  │  │   Discover / Profile   │ │  │
│   │  │  Dashboard │  │   Pages    │  │        Pages           │ │  │
│   │  └─────┬──────┘  └─────┬──────┘  └──────────┬─────────────┘ │  │
│   │        │               │                    │               │  │
│   │  ┌─────▼───────────────▼────────────────────▼─────────────┐ │  │
│   │  │              Feature Hooks + Context                   │ │  │
│   │  │   useDistributions / useDecrypt / useWallet / etc.     │ │  │
│   │  └─────┬───────────────────────────────────┬─────────────┘ │  │
│   │        │                                   │               │  │
│   │  ┌─────▼─────────┐               ┌─────────▼─────────────┐ │  │
│   │  │  wagmi / viem │               │  @zama-fhe/react-sdk  │ │  │
│   │  │ (read/write   │               │  (encrypt / decrypt)  │ │  │
│   │  │  contracts)   │               │                       │ │  │
│   │  └──────┬────────┘               └──────────┬────────────┘ │  │
│   └─────────┼──────────────────────────────────-┼──────────────┘  │
└─────────────┼────────────────────────────────────┼────────────────┘
              │  JSON-RPC (write txs)               │  HTTPS (KMS calls)
              ▼                                     ▼
┌─────────────────────────────┐     ┌───────────────────────────────┐
│     Ethereum Sepolia         │     │       Zama KMS Relayer        │
│                             │     │   (off-chain decryption node) │
│  ┌──────────────────────┐   │     │                               │
│  │  ConfidentialDisperse │   │     │  Holds FHE master key         │
│  │  (settlement engine) │   │     │  Verifies ACL permissions     │
│  │  ├─ createDistrib.   │   │     │  Returns signed plaintext     │
│  │  ├─ fundDistrib.     │◄──┼─────┤  for authorized recipients    │
│  │  ├─ executeDistrib.  │   │     │                               │
│  │  └─ claim()          │   │     └───────────────────────────────┘
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │  ConfidentialToken   │   │
│  │  (ERC-20, ATK)       │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │  Zama ACL Contract   │   │  ← Tracks who can decrypt what
│  │  Zama KMSVerifier    │   │  ← Verifies on-chain KMS proofs
│  └──────────────────────┘   │
└─────────────────────────────┘
```

**There is no traditional backend server.** The smart contracts ARE the backend. The only off-chain piece is the Zama KMS relayer, which Zama hosts.

---

## 5. Project Structure

```
sealed-bid-auction-settlement/       ← pnpm monorepo root
│
├── frontend/                        ← React dApp (everything the user sees)
│   ├── src/
│   │   ├── app/                     ← App-level wiring
│   │   │   ├── config.js            ← All env vars in one place (contract addresses, RPC)
│   │   │   ├── Layout.jsx           ← Navbar + page wrapper
│   │   │   ├── providers.jsx        ← WagmiProvider + ZamaProvider + QueryClientProvider
│   │   │   └── router.jsx           ← All routes defined here
│   │   │
│   │   ├── pages/                   ← One folder per route (thin, just compose features)
│   │   │   ├── Landing/             ← Marketing/home page (Hero, Features, HowItWorks...)
│   │   │   ├── operator/            ← /operator/dashboard, /operator/create
│   │   │   ├── recipient/           ← /recipient (check bid + claim)
│   │   │   ├── discover/            ← /discover (browse trending auctions)
│   │   │   └── profile/             ← /profile (reputation + badges)
│   │   │
│   │   ├── features/                ← Domain logic, grouped by concern
│   │   │   ├── distributions/       ← Operator: create/fund/execute distributions
│   │   │   │   ├── components/      ← AuctionCard, StepExecute, wizard steps...
│   │   │   │   └── hooks/           ← useDistributions, useCreateDistribution
│   │   │   ├── allocations/         ← Recipient: decrypt + claim
│   │   │   │   ├── components/      ← AllocationCard, DecryptReveal, PersonalAnalytics
│   │   │   │   └── hooks/           ← useAllocation, useDecrypt (calls Zama relayer)
│   │   │   ├── wallet/              ← Connect wallet, show network badge
│   │   │   │   ├── components/      ← ConnectButton, WalletModal, NetworkBadge
│   │   │   │   └── hooks/           ← useWallet
│   │   │   └── reputation/          ← Badges + on-chain activity score
│   │   │       ├── components/      ← BadgeCard
│   │   │       └── hooks/           ← useReputation
│   │   │
│   │   ├── components/ui/           ← Reusable design-system primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ConfidentialChip.jsx ← The "🔒 CONFIDENTIAL" / revealed number chip
│   │   │   ├── HeatScore.jsx        ← Competition heat indicator
│   │   │   ├── Modal.jsx
│   │   │   ├── NotificationToast.jsx
│   │   │   ├── RewardAnimation.jsx  ← 3D animation when a claim reveals
│   │   │   ├── Spinner.jsx
│   │   │   └── Stepper.jsx
│   │   │
│   │   ├── lib/                     ← Low-level SDK/chain integration
│   │   │   ├── erc7984.js           ← Contract ABIs + viem read helpers
│   │   │   ├── fhe.js               ← FHE encrypt/decrypt wrappers
│   │   │   ├── tokenops.js          ← TokenOps SDK integration
│   │   │   └── wagmi.js             ← wagmi config (chains, connectors)
│   │   │
│   │   ├── context/
│   │   │   └── FheContext.jsx       ← React context for FHE instance
│   │   │
│   │   └── hooks/                   ← App-wide utility hooks
│   │       ├── useCountUp.js        ← Animated number counter
│   │       ├── useInView.js         ← Intersection observer
│   │       └── useNotifications.js  ← Toast notification state
│   │
│   ├── tests/e2e/                   ← Playwright end-to-end tests (31 passing)
│   │   ├── helpers/mock-wallet.js   ← Injects a fake wallet for CI
│   │   ├── landing.spec.js
│   │   ├── operator-flow.spec.js
│   │   ├── recipient-flow.spec.js
│   │   └── privacy-boundary.spec.js
│   │
│   ├── .env.example                 ← Copy to .env.local and fill in
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── playwright.config.js
│   └── package.json
│
├── contracts/                       ← Solidity smart contracts (the on-chain backend)
│   ├── contracts/
│   │   ├── ConfidentialDisperse.sol ← MAIN: sealed-bid settlement engine
│   │   ├── ConfidentialAirdrop.sol  ← Pull-claim airdrop variant (incremental)
│   │   ├── tokens/
│   │   │   └── ConfidentialToken.sol ← ERC-20 settlement token (ATK)
│   │   ├── interfaces/
│   │   │   └── IConfidentialDistributor.sol
│   │   └── mocks/                   ← Local test doubles (no Sepolia needed for tests)
│   │       ├── MockACL.sol
│   │       ├── MockFHEVMExecutor.sol
│   │       └── MockKMSVerifier.sol
│   │
│   ├── deploy/
│   │   └── 01_token.js              ← Hardhat deploy script
│   │
│   ├── scripts/
│   │   ├── e2e-local.js             ← Full local lifecycle test + writes .env.local
│   │   ├── e2e-sepolia.js           ← Full Sepolia lifecycle + writes .env.local
│   │   ├── check-balance.js         ← Check deployer wallet balance
│   │   └── mint-tokens.js           ← Mint test tokens
│   │
│   ├── tasks/
│   │   └── grant-access.js          ← Hardhat CLI task
│   │
│   ├── test/                        ← Mocha + Chai tests (93 passing)
│   │   ├── disperse.test.js         ← ConfidentialDisperse full lifecycle tests
│   │   ├── airdrop.test.js          ← ConfidentialAirdrop tests
│   │   ├── allocation.decrypt.test.js
│   │   ├── validation.test.js       ← Input validation & error cases
│   │   ├── helpers/fhevm-mock.js    ← mockEncrypt64 helper for tests
│   │   └── setup.js                 ← Deploy mock contracts before tests
│   │
│   ├── .env.example
│   ├── hardhat.config.js            ← Hardhat config (networks, plugins)
│   └── package.json
│
├── docs/                            ← SDK integration research notes
│   ├── tokenops-sdk-notes.md
│   └── zama-react-sdk-notes.md
│
├── package.json                     ← pnpm workspace root
├── pnpm-workspace.yaml              ← Declares frontend/ and contracts/ as workspaces
└── turbo.json                       ← Turborepo pipeline (build/test ordering)
```

---

## 6. Smart Contracts Explained

### `ConfidentialDisperse.sol` — The Main Contract

This is the heart of the project. It stores one **encrypted allocation** per recipient per distribution.

**Key functions:**

| Function | Who calls it | What it does |
|----------|-------------|--------------|
| `createDistribution(id, token, count)` | Operator | Registers a new distribution on-chain |
| `fundDistribution(id, amount)` | Operator | Pulls ERC-20 tokens into the contract |
| `executeDistribution(id, recipients[], handles[], proofs[])` | Operator | Stores one `euint64` per recipient, grants ACL |
| `grantDecryptAccess(id, auditor)` | Operator | Whitelists an auditor address |
| `claim(id, decryptedResult, decryptionProof)` | Recipient | Verifies KMS proof on-chain, transfers tokens |
| `getAllocationHandle(id, recipient)` | Anyone | Returns the encrypted `bytes32` handle |

**The critical ACL grants in `executeDistribution`:**
```solidity
FHE.allowThis(handle);          // contract can verify decryption proofs
FHE.allow(handle, recipients[i]); // recipient can self-decrypt
FHE.allow(handle, dist.operator); // operator retains read access
Impl.makePubliclyDecryptable(...); // Zama relayer can service publicDecrypt requests
```

**The `claim` function flow:**
```solidity
1. Check: distribution executed, not already claimed, recipient has allocation
2. Build handlesList = [euint64.unwrap(handle)]
3. Call IKMSVerifier.verifyDecryptionEIP712KMSSignatures(handlesList, decryptedResult, proof)
   → This verifies Zama's EIP-712 signature cryptographically. Cannot be faked.
4. Decode amount = abi.decode(decryptedResult, (uint64))
5. Mark claimed = true (prevents replay)
6. IERC20.safeTransfer(msg.sender, amount)
```

---

### `ConfidentialAirdrop.sol` — Pull-Claim Variant

Same privacy guarantees as `ConfidentialDisperse` but with a different operator flow:

- Operator can call `addRecipients` **multiple times** before sealing (batch processing)
- `sealAirdrop` locks the list — after this, recipients can claim
- `fundAirdrop` can be called at any time (before or after sealing)

**Good for:** large airdrops where the operator adds recipients in batches over time.

---

### `ConfidentialToken.sol` — Settlement Token (ATK)

A standard ERC-20 with configurable decimals and owner-only `mint`/`burn`. Nothing special — the privacy lives in `ConfidentialDisperse`, not in the token itself.

```
Deployed on Sepolia: 0x7CF438647deD14b3503ba133176b2EB7524af989
Symbol: ATK  |  Decimals: 6
```

---

### `mocks/` — Local Test Doubles

The real Zama contracts (ACL, KMSVerifier, FHEVMExecutor) run on Sepolia. These mocks let the 93 contract tests run **entirely locally** with no network needed:

| Mock | What it does |
|------|-------------|
| `MockFHEVMExecutor` | `verifyInput` returns the handle as-is (identity encryption) |
| `MockKMSVerifier` | `verifyDecryptionEIP712KMSSignatures` always returns `true` |
| `MockACL` | Stores allow-lists in memory |

The mocks are deployed at the same addresses the real Zama contracts use, so no code changes are needed between local and Sepolia.

---

## 7. Frontend Architecture

### Provider Tree

```
App
└── WagmiProvider          ← wallet + chain connectivity
    └── QueryClientProvider  ← TanStack Query cache
        └── ZamaProvider     ← FHE encrypt/decrypt context
            └── <Router>     ← React Router v7
```

The `VITE_SKIP_ZAMA=true` flag swaps the real `WagmiSigner` + `RelayerWeb` for stub objects, allowing Playwright tests to run without MetaMask.

### Pages and What They Do

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Landing.jsx` | Marketing page — explains the project |
| `/operator` | `Dashboard.jsx` | Lists operator's distributions as AuctionCards |
| `/operator/create` | Multi-step wizard | Create → Token → Recipients → Review → Execute |
| `/recipient` | `CheckAllocation.jsx` | Enter distribution ID → decrypt → claim |
| `/recipient/my` | `MyAllocations.jsx` | List all allocations for connected wallet |
| `/discover` | `Discover.jsx` | Trending / EndingSoon / MostActive auctions |
| `/profile` | `Profile.jsx` | Reputation badges + activity history |

### The Operator Create Wizard

The create wizard is a multi-step flow managed by `useCreateDistribution` (a `useReducer`-based hook):

```
Step 1: Type        → choose Disperse or Airdrop, pick privacy mode
Step 2: Token       → paste ERC-20 address, preview token metadata
Step 3: Recipients  → paste CSV of address,amount pairs
Step 4: Review      → confirm list, see total
Step 5: Execute     → runs 4 sequential on-chain transactions with terminal UI
```

The Execute step sends transactions in this exact order:
1. `createDistribution` — register on-chain
2. `token.approve(disperseAddress, total)` — ERC-20 allowance
3. `fundDistribution` — pull tokens into contract
4. Batch encrypt via `zamaSDK.relayer.encrypt(amounts)` — off-chain FHE
5. `executeDistribution` — store encrypted handles on-chain

Each step waits for a transaction receipt before proceeding to the next.

### The Decrypt + Claim Flow

In `useDecrypt.js`:
```js
// Step 1: Ask Zama KMS to decrypt the handle
const { clearValues, abiEncodedClearValues, decryptionProof } =
  await zamaSDK.relayer.publicDecrypt([handle]);

// Step 2: Submit the proof on-chain to claim tokens
await writeContract({
  functionName: 'claim',
  args: [distributionId, abiEncodedClearValues, decryptionProof],
});
```

The amount animates from `****` → real number in `DecryptReveal.jsx`.

### Key UI Components

| Component | File | What it shows |
|-----------|------|---------------|
| `ConfidentialChip` | `ui/ConfidentialChip.jsx` | `🔒 CONFIDENTIAL` locked state or green revealed number |
| `AuctionCard` | `features/distributions/components/AuctionCard.jsx` | Distribution card with competition heat meter |
| `DecryptReveal` | `features/allocations/components/DecryptReveal.jsx` | The masked → revealed amount animation |
| `PersonalAnalytics` | `features/allocations/components/PersonalAnalytics.jsx` | Post-claim stats (rank, percentile, etc.) |
| `RewardAnimation` | `ui/RewardAnimation.jsx` | 3D particle burst on claim reveal |
| `HeatScore` | `ui/HeatScore.jsx` | Green/yellow/fire competition level indicator |

---

## 8. Tech Stack

### Why Each Technology Was Chosen

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **FHE runtime** | Zama fhEVM | — | Only production FHE coprocessor on Ethereum. `euint64` lets us store encrypted amounts on-chain. |
| **FHE Solidity lib** | `@fhevm/solidity` | 0.11.1 | Official Zama library. `FHE.fromExternal`, `FHE.allow`, `IKMSVerifier`. |
| **FHE browser SDK** | `@zama-fhe/react-sdk` | ^3 | React context + `RelayerWeb` for off-chain KMS decryption in the browser. |
| **Smart contracts** | Solidity | 0.8.24 | Latest stable with custom errors and `ZamaEthereumConfig` support. |
| **Contract toolchain** | Hardhat | 2.22 | Industry standard, best plugin ecosystem for fhEVM. |
| **Token standard** | OpenZeppelin ERC-20 | ^5 | Battle-tested SafeERC20 prevents reentrancy on transfers. |
| **Frontend framework** | React | 19 | Latest with concurrent features; pairs well with TanStack Query. |
| **Build tool** | Vite | 8 | Fast HMR, native ESM, minimal config. |
| **Styling** | Tailwind CSS | 3.4 | Utility-first; fast iteration on dark glassmorphism design. |
| **Wallet connectivity** | wagmi | v3 | Best-in-class React hooks for Ethereum. `useWriteContract`, `useWaitForTransactionReceipt`. |
| **Chain utilities** | viem | v2 | Type-safe Ethereum client; used for `publicClient` reads and error parsing. |
| **Data fetching** | TanStack Query | v5 | Caching + background refetch for on-chain state reads. |
| **Routing** | React Router | v7 | File-based routing pattern without the full framework overhead. |
| **E2E tests** | Playwright | — | Browser automation; 31 tests covering operator + recipient flows. |
| **Contract tests** | Mocha + Chai | — | 93 tests; runs locally with mock FHE contracts, no Sepolia needed. |
| **Monorepo** | pnpm workspaces + Turborepo | — | Shared `node_modules`, parallel task runner (build/test caching). |
| **CI** | GitHub Actions | — | Runs lint + contract tests + frontend build on every push. |
| **Hosting** | Vercel | — | Zero-config frontend deployment with automatic HTTPS. |
| **Network** | Ethereum Sepolia | — | Zama fhEVM coprocessor is live on Sepolia testnet. |

---

## 9. Complete User Flows

### Operator Flow (Auction House)

```
1. Go to /operator (Operator Dashboard)
2. Click "New Distribution"
3. Wizard Step 1 — Type:
   - Choose "Disperse" (push-based, one-shot)
   - Choose privacy mode (Standard / StepType)
4. Wizard Step 2 — Token:
   - Paste the ERC-20 contract address
   - App fetches name/symbol/decimals automatically
5. Wizard Step 3 — Recipients:
   - Paste CSV:
       0xAlice...,5000
       0xBob...,3000
       0xCarol...,7500
   - Total = 15,500 tokens shown
6. Wizard Step 4 — Review:
   - See all recipients and amounts before committing
7. Wizard Step 5 — Execute (4 wallet popups):
   TX 1: createDistribution(id, token, 3)
   TX 2: token.approve(disperseAddress, 15500)
   TX 3: fundDistribution(id, 15500)
   [Off-chain] FHE encrypt [5000, 3000, 7500] via Zama relayer
   TX 4: executeDistribution(id, [Alice,Bob,Carol], [handle1,handle2,handle3], [proof1,proof2,proof3])

   Terminal-style animation plays during execution.
8. Distribution appears on Dashboard as an AuctionCard.
```

### Recipient Flow (Winner)

```
1. Go to /recipient
2. Enter the distribution ID (bytes32) — given by the operator
3. App reads getAllocationHandle(id, wallet) → shows 🔒 CONFIDENTIAL
4. Click "Decrypt":
   [Off-chain] zamaSDK.relayer.publicDecrypt([handle])
   → Zama KMS verifies ACL permission for your address
   → Returns { decryptedResult: 0x...5000..., decryptionProof: 0x... }
5. Amount animates: **** → 5,000 ATK  (+ 3D particle animation)
6. Click "Claim":
   TX: claim(id, decryptedResult, decryptionProof)
   → Contract verifies KMS EIP-712 signature on-chain
   → Transfers 5000 ATK to your wallet
```

### Auditor Flow (Optional)

```
1. Operator calls grantDecryptAccess(id, auditorAddress)
2. Operator calls grantAuditorHandleAccess(id, recipientAddress, auditorAddress)
   for each recipient the auditor should see
3. Auditor can now publicDecrypt specific handles via Zama relayer
```

---

## 10. Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 8: `npm install -g pnpm`
- **MetaMask** (or any EIP-1193 wallet) connected to Sepolia
- **Sepolia ETH** for gas — get free ETH at https://sepoliafaucet.com
- An RPC endpoint (free: `https://ethereum-sepolia-rpc.publicnode.com`)

### Step 1 — Clone the repo

```bash
git clone https://github.com/TheRustVeil/sealed-bid-auction-settlement.git
cd sealed-bid-auction-settlement
```

### Step 2 — Install all dependencies

```bash
pnpm install
```

This installs packages for both `frontend/` and `contracts/` via pnpm workspaces.

### Step 3 — Configure the contracts environment

```bash
cp contracts/.env.example contracts/.env
```

Edit `contracts/.env`:
```env
MNEMONIC="your twelve word seed phrase here"
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=your_etherscan_key     # optional, for contract verification
INFURA_API_KEY=your_infura_id            # optional, publicnode works without this
```

### Step 4 — Configure the frontend environment

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_TOKEN_ADDRESS=0x7CF438647deD14b3503ba133176b2EB7524af989
VITE_DISPERSE_ADDRESS=0x5F48197D829D7FD967799C7F2a9C94fbC30fc634
VITE_SKIP_ZAMA=false
```

> The addresses above are the already-deployed contracts on Sepolia. Skip Step 5 if you want to use the existing deployment.

### Step 5 — (Optional) Deploy your own contracts

```bash
cd contracts
node scripts/e2e-sepolia.js
```

This script deploys `ConfidentialToken` + `ConfidentialDisperse`, mints tokens, runs a full FHE end-to-end test, and **automatically writes the contract addresses into `frontend/.env.local`**.

### Step 6 — Compile contracts (optional, needed if editing Solidity)

```bash
pnpm --filter confidential-drop-contracts compile
```

### Step 7 — Start the frontend

```bash
pnpm --filter frontend dev
```

App opens at **http://localhost:5173**

---

## 11. Environment Variables

### `contracts/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `MNEMONIC` | Yes | 12-word seed phrase for the deployer wallet |
| `SEPOLIA_RPC_URL` | Yes | Sepolia RPC endpoint (publicnode.com free endpoint works) |
| `ETHERSCAN_API_KEY` | No | For contract verification on Etherscan |
| `INFURA_API_KEY` | No | Infura project ID (publicnode works without it) |

### `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CHAIN_ID` | Yes | `11155111` for Sepolia, `31337` for local Hardhat |
| `VITE_RPC_URL` | Yes | Ethereum JSON-RPC endpoint |
| `VITE_DISPERSE_ADDRESS` | Yes | Deployed `ConfidentialDisperse` contract address |
| `VITE_TOKEN_ADDRESS` | Yes | Deployed `ConfidentialToken` address |
| `VITE_AIRDROP_ADDRESS` | No | Deployed `ConfidentialAirdrop` address |
| `VITE_SKIP_ZAMA` | No | Set `true` to bypass FHE for Playwright CI (stub mode) |

---

## 12. Running Tests

### Contract Tests (Local — no Sepolia needed)

```bash
pnpm --filter confidential-drop-contracts test
```

Runs **93 Mocha tests** against a local Hardhat network with mock FHE contracts. All tests pass in ~30 seconds.

What is tested:
- Full create → fund → execute → claim lifecycle
- Airdrop: addRecipients → seal → fund → claim
- Access control: only operator can execute, double-claim reverts
- Auditor grant flow
- All custom error conditions (DistributionNotFound, AlreadyClaimed, etc.)
- KMS proof verification gate

### Frontend E2E Tests (Playwright)

```bash
# First install browsers
cd frontend && npx playwright install

# Run all 31 E2E tests
pnpm --filter frontend test:e2e
```

Set `VITE_SKIP_ZAMA=true` in `frontend/.env.local` so tests run without a live wallet.

What is tested:
- Landing page renders correctly
- Operator flow: create distribution wizard navigation
- Recipient flow: enter distribution ID → decrypt UI renders
- Privacy boundary: no amounts visible before decrypt

---

## 13. Deployed Contracts (Sepolia)

These are the live contracts used by the Vercel frontend:

| Contract | Address |
|----------|---------|
| **ConfidentialToken (ATK)** | `0x7CF438647deD14b3503ba133176b2EB7524af989` |
| **ConfidentialDisperse** | `0x5F48197D829D7FD967799C7F2a9C94fbC30fc634` |

Zama infrastructure (auto-configured by `@fhevm/solidity`, no manual setup needed):

| Contract | Address |
|----------|---------|
| ACL | `0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D` |
| KMSVerifier | `0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A` |

---

## 14. Scripts Reference

### Contracts

```bash
# Compile all contracts
pnpm --filter confidential-drop-contracts compile

# Run all 93 tests locally (fast, no Sepolia)
pnpm --filter confidential-drop-contracts test

# Full e2e: deploy to Sepolia + FHE test + writes frontend/.env.local
cd contracts && node scripts/e2e-sepolia.js

# Full e2e: deploy to local Hardhat + writes frontend/.env.local
cd contracts && node scripts/e2e-local.js

# Check deployer balance on Sepolia
cd contracts && node scripts/check-balance.js

# Hardhat CLI task: create a distribution from terminal
npx hardhat create-distribution --network sepolia --token 0x... --recipients 0xA,100 0xB,200

# Grant auditor access
npx hardhat grant-access --network sepolia --distribution 0x... --auditor 0x...
```

### Frontend

```bash
# Dev server (hot reload)
pnpm --filter frontend dev

# Production build (outputs to frontend/dist/)
pnpm --filter frontend build

# Preview production build locally
pnpm --filter frontend preview

# Playwright E2E tests
pnpm --filter frontend test:e2e
```

### Monorepo root

```bash
# Run dev server for all packages in parallel
pnpm dev

# Build everything (Turborepo handles ordering)
pnpm build

# Run all tests (contracts + frontend)
pnpm test
```

---

## 15. Interview Q&A Prep

These are the questions an interviewer is most likely to ask. Read these before your interview.

---

**Q: What does this project do in one sentence?**

> It's a sealed-bid auction settlement system on Ethereum — each winner's payout is stored as an FHE-encrypted ciphertext on-chain, so only the recipient can ever see their own amount, even though everything happens on a public blockchain.

---

**Q: What is FHE and why did you use it?**

> FHE stands for Fully Homomorphic Encryption. Normally, blockchains are completely public — anyone can read any storage slot. FHE lets you store encrypted values on-chain and do computations on them without ever decrypting. I used Zama's fhEVM, which adds an FHE coprocessor alongside the Ethereum VM. The smart contract stores `euint64` (encrypted 64-bit integers) that appear as opaque `bytes32` handles on-chain. Nobody can read the numbers — not even nodes, not even the contract itself.

---

**Q: How does a recipient actually get their tokens if the amount is encrypted?**

> The recipient calls the Zama KMS relayer off-chain with their handle. The KMS verifies they have ACL permission on-chain (granted by the contract during `executeDistribution`), then returns a signed decryption: `{ decryptedResult: abi.encode(5000), decryptionProof: <EIP-712 sig> }`. The recipient submits this proof to the `claim` function. The contract verifies the KMS signature using `IKMSVerifier.verifyDecryptionEIP712KMSSignatures` and then calls `safeTransfer`. The key point: the proof verification happens on-chain, so it's trustless.

---

**Q: What does "no traditional backend" mean?**

> There is no Node.js API server, no database, no REST endpoints. The smart contracts running on Ethereum are the backend. All state (distributions, encrypted allocations, claim status) lives on-chain. The only off-chain component is the Zama KMS relayer, which Zama hosts — and it's only involved in the decryption step, not in writing state.

---

**Q: How do the mock contracts work for local testing?**

> The real Zama contracts (ACL, KMSVerifier, FHEVMExecutor) run on Sepolia and do real FHE math. For local tests, I deployed mocks at the same addresses: `MockFHEVMExecutor.verifyInput` returns the handle as-is (identity encryption, no real FHE), and `MockKMSVerifier.verifyDecryptionEIP712KMSSignatures` always returns `true`. This lets all 93 tests run in ~30 seconds locally with no network calls and no real FHE computation.

---

**Q: How is the multi-step wizard managed on the frontend?**

> The operator wizard uses `useReducer` inside `useCreateDistribution.js` to manage wizard state across 5 steps. The execute mutation runs 5 operations sequentially — 4 on-chain transactions + 1 off-chain FHE encryption call — with each step awaiting a receipt before the next starts. The UI shows a terminal-style progress animation during execution. On failure, it parses the viem error message and shows a human-readable reason with a retry button.

---

**Q: Why pnpm + Turborepo?**

> pnpm workspaces let `frontend/` and `contracts/` share a single `node_modules` at the root, which reduces install size and version conflicts. Turborepo provides a task graph — it knows to compile contracts before running the frontend E2E tests, and caches task outputs so unchanged packages aren't rebuilt on CI.

---

**Q: What would you improve with more time?**

> A few things: (1) Upgrade the token to full ERC-7984 (encrypted balances), so even the token amounts at wallet level are private, not just the distribution amounts. (2) Add a Merkle proof layer so recipients can verify inclusion in a distribution without revealing the full list. (3) Add on-chain events indexing via The Graph so the Discover page can query historical distributions without relying on localStorage.

---

## License

MIT
