# ConfidentialDrop — Architecture

> Companion to `PROJECT_CHECKLIST.md`. This is the intended folder structure + component conventions.
> **Phases 0–10 complete as of 2026-06-15. Phase 11 (Vercel deploy) is next. The real repo is the source of truth.**

Confidential token disperse dApp on the Zama Protocol (TokenOps SDK + ERC-7984).
Use case: **sealed-bid auction settlement** — winners receive tokens at their private bid price; no one sees what others paid.

---

## Privacy rule (drives every screen)

- A recipient only ever sees THEIR OWN decrypted amount.
- The operator only ever sees aggregate/encrypted data — never one winner's amount shown to another.
- Recipient COUNT can be public; per-recipient AMOUNTS are always encrypted on-chain.

---

## Status (2026-06-15)

| Area | Status |
|------|--------|
| Monorepo root (`package.json`, `pnpm-workspace.yaml`, `turbo.json`) | ✓ done |
| `frontend/` — Vite + React 19 + Tailwind 3 + wagmi + TanStack Query | ✓ done |
| `frontend/src/` — full folder structure + stub pages + lib/ | ✓ done |
| `contracts/` — Hardhat + **@fhevm/solidity@0.11.1** + 4 contracts | ✓ done |
| `.env.example` files | ✓ done |
| CI workflow stub | ✓ done |
| Smart contract logic — Phase 3 | ✓ complete — 4 contracts, deploy scripts, tasks, compiles clean |
| UI primitives (`components/ui/`) — Phase 4 | ✓ complete — 9 primitives: Spinner, Button, Card, Pill, ConfidentialChip, Modal, Stepper, **NotificationToast**, **HeatScore** |
| Integration layer (`lib/`) — Phase 5 | ✓ complete — wagmi.js, erc7984.js, fhe.js (legacy), tokenops.js; providers.jsx → ZamaProvider wired |
| Pages / features — Phase 6 | ✓ complete — all 7 original pages; wagmi v3 conflict resolved via plain SDK client + useMutation |
| Contract tests — Phase 7 | **93/93 passing** — disperse, airdrop, allocation.decrypt, validation |
| Frontend E2E — Phase 7 | **31/31 Playwright smoke tests passing** — all 7 pages, wallet-gated flows |
| Frontend wiring — Phase 8 | ✓ complete — `erc7984.js` updated for @0.11.1; `useClaimReveal`; `DistributionDetail` real wagmi write; build clean |
| Sepolia deployment — Phase 9 | ✓ contracts deployed 2026-06-12; **full FHE e2e VERIFIED** on Sepolia. `frontend/.env.local` updated. |
| Auction UI Enhancement — Phase 10 | **✅ COMPLETE (2026-06-15)** — all 7 parts done; 1746 modules, 0 build errors. Details below. |
| Cyber Animation Enhancement | **All 3 parts ✅ COMPLETE (2026-06-15)** — A: ConfidentialChip glitch, DecryptReveal cipher scramble, StepExecute terminal. B: AuctionCard orb rings, BidIntensityMeter bar, ActivityFeed terminal. C: Profile agent codename + blur-reveal portfolio, BadgeCard LOCKED stamp + glow, HeatScore animated bar, NotificationToast slide-in + countdown bar, Discover radar sweep + section stagger. |
| Frontend deployment — Phase 11 | **NEXT** — deploy to Vercel with current `frontend/.env.local` env vars |

### Phase 10 deliverables (complete 2026-06-15)

| Part | What was built | Key files |
|------|---------------|-----------|
| 1 | AuctionCard + BidIntensityMeter; Dashboard switched to card grid | `AuctionCard.jsx`, `BidIntensityMeter.jsx`, `Dashboard.jsx` |
| 2 | Live activity feed (wagmi watchContractEvent, privacy-safe) | `ActivityFeed.jsx`, `useActivityFeed.js` |
| 3 | PersonalAnalytics panel below DecryptReveal (post-decrypt, gated on isSuccess) | `PersonalAnalytics.jsx`, `DecryptReveal.jsx` |
| 4 | `/discover` route — Trending / Ending Soon / Most Active / Recently Listed + filter bar | `Discover.jsx`, `useDiscoverAuctions.js` |
| 5 | `/profile` route — identity card, public stats, badge shelf, private portfolio (wallet-gated) | `Profile.jsx`, `BadgeCard.jsx`, `useReputation.js` |
| 6 | Smart notifications — portal toasts, privacy-first messages, auto-dismiss 5 s, max 3 | `NotificationToast.jsx`, `useNotifications.js`, `App.jsx` (InnerApp) |
| 7 | HeatScore (0-100 gradient bar, compact + full variants); Privacy Mode selector in StepType; Selective Disclosure card in DistributionDetail | `HeatScore.jsx`, `StepType.jsx`, `DistributionDetail.jsx` |

New routes: `/discover`, `/profile`. New nav links: Discover, Profile.

**Key versions locked:** Node 24, pnpm 11.5.2, React 19, Tailwind 3.4, wagmi 3, viem 2, **@fhevm/solidity 0.11.1**, **@zama-fhe/relayer-sdk 0.4.3**, Hardhat 2.22, @tokenops/sdk 1.0.0, @zama-fhe/sdk ^3, @zama-fhe/react-sdk ^3
**Animation deps (added Phase 10 animation):** `framer-motion` (Part B+) — Part A uses pure CSS keyframes + React state only

---

## Monorepo root

```
confidential-drop/
├─ frontend/              # React + Vite + Tailwind (the dApp UI)
├─ contracts/             # Solidity + Hardhat + fhEVM (the on-chain backend)
├─ server/                # OPTIONAL thin Node API (metadata, claim links — no sensitive data)
├─ docs/                  # tokenops-sdk-notes.md, zama-react-sdk-notes.md (Phase 8 deliverable docs go here too)
├─ .github/workflows/     # CI: lint, test contracts, build frontend
├─ video/                 # 3-min demo assets / script
├─ package.json           # pnpm/turbo workspace root
├─ pnpm-workspace.yaml
└─ README.md
```

---

## Frontend — `frontend/`

Organized by FEATURE (modern convention): colocate components, hooks, and SDK calls per domain.
Pages stay thin and only compose features. All SDK/FHE calls live in `lib/` and are exposed only via hooks.

```
frontend/
├─ public/
├─ src/
│  ├─ main.jsx                      # entry: mounts <App> (StrictMode in dev)
│  ├─ App.jsx                       # ErrorBoundary > Providers > InnerApp; InnerApp: useNotifications + NotificationToast + Suspense + RouterProvider
│  ├─ index.css                     # @tailwind base/components/utilities
│  │
│  ├─ app/                          # app-level wiring
│  │  ├─ router.jsx                 # route table — 9 routes: 7 original + /discover + /profile
│  │  ├─ providers.jsx              # ✓ WagmiProvider > QueryClientProvider > ZamaProvider (fhevmjs retired)
│  │  └─ config.js                  # chainId, contract addresses, RPC_URL, ZAMA_CONFIG (Sepolia)
│  │
│  ├─ pages/                        # one folder per route — thin, compose features
│  │  ├─ Landing/Landing.jsx        # hero + role fork (operator / recipient)
│  │  ├─ operator/
│  │  │  ├─ Dashboard.jsx           # ✓ done; Phase 10: switch to AuctionCard grid
│  │  │  ├─ CreateDistribution.jsx  # the wizard shell (owns step state)
│  │  │  └─ DistributionDetail.jsx  # status + grant auditor access; Phase 10: reads privacyMode, renders HeatScore + ActivityFeed
│  │  ├─ recipient/
│  │  │  ├─ CheckAllocation.jsx     # decrypt-my-amount entry point; Phase 10: PersonalAnalytics card added below DecryptReveal
│  │  │  ├─ MyAllocations.jsx       # portfolio across distributions
│  │  │  └─ VerifyProof.jsx         # cryptographic verify page
│  │  ├─ discover/
│  │  │  └─ Discover.jsx            # Phase 10 Part 4 — browseable auction discovery (Trending / Ending Soon / Most Active / Recently Listed)
│  │  └─ profile/
│  │     └─ Profile.jsx             # Phase 10 Part 5 — public reputation card + badge shelf + private portfolio (wallet-gated)
│  │
│  ├─ features/                     # domain logic, grouped by concern
│  │  ├─ distributions/
│  │  │  ├─ components/
│  │  │  │  ├─ StepRail.jsx
│  │  │  │  ├─ steps/
│  │  │  │  │  ├─ StepType.jsx            # Phase 10 Part 7: Privacy Mode selector added (Fully Confidential / Reveal Winner Only / Reveal Highest Bid After End)
│  │  │  │  │  ├─ StepToken.jsx
│  │  │  │  │  ├─ StepRecipients.jsx      # the masked-chip table
│  │  │  │  │  ├─ StepReview.jsx
│  │  │  │  │  └─ StepExecute.jsx
│  │  │  │  ├─ RecipientTable.jsx
│  │  │  │  ├─ DistributionCard.jsx
│  │  │  │  ├─ AuctionCard.jsx            # Phase 10 Part 1 — NFT image, title, seller, countdown, bidder count, privacy badge, status pill
│  │  │  │  └─ BidIntensityMeter.jsx      # Phase 10 Part 1 — 🟢 Low / 🟡 Medium / 🔥 High from recipientCount; replaces Highest Bid display
│  │  │  ├─ hooks/
│  │  │  │  ├─ useCreateDistribution.js   # owns multi-step + encrypt→submit; privacyMode state; VITE_SKIP_ZAMA=true path returns stub success
│  │  ├─ useDiscoverAuctions.js     # ✓ Part 4 — sorts localStorage distributions into Trending/EndingSoon/MostActive/RecentlyListed
│  │  │  │  ├─ useDistributions.js
│  │  │  │  └─ useDistribution.js         # single, by id
│  │  │  ├─ api/distributions.api.js      # TokenOps SDK create/fund/execute
│  │  │  └─ utils/
│  │  │     ├─ parseCsv.js
│  │  │     └─ validateRecipients.js
│  │  │
│  │  ├─ allocations/
│  │  │  ├─ components/
│  │  │  │  ├─ AllocationCard.jsx
│  │  │  │  └─ DecryptReveal.jsx          # masked → number animation; Phase 10 Part 3: PersonalAnalytics card rendered below on isSuccess
│  │  │  ├─ hooks/
│  │  │  │  ├─ useAllocation.js
│  │  │  │  └─ useDecrypt.js              # exports useClaimReveal — usePublicDecrypt (off-chain KMS) + useWriteContract (claim)
│  │  │  └─ api/allocations.api.js
│  │  │
│  │  ├─ activity/                        # Phase 10 Part 2
│  │  │  ├─ components/
│  │  │  │  └─ ActivityFeed.jsx           # scrollable feed, max 20 entries, privacy-safe messages only
│  │  │  └─ hooks/
│  │  │     └─ useActivityFeed.js         # wagmi watchContractEvent → privacy message map
│  │  │
│  │  ├─ reputation/                      # Phase 10 Part 5
│  │  │  ├─ components/
│  │  │  │  └─ BadgeCard.jsx             # badge icon + label + unlock condition
│  │  │  └─ hooks/
│  │  │     └─ useReputation.js          # derives stats from localStorage; private stats wallet-gated
│  │  │
│  │  └─ wallet/
│  │     ├─ components/
│  │     │  ├─ ConnectButton.jsx
│  │     │  └─ NetworkBadge.jsx
│  │     └─ hooks/useWallet.js
│  │
│  ├─ components/ui/                # design-system primitives (reused everywhere)
│  │  ├─ index.js                   # ✓ barrel export for all primitives; Phase 10: add new primitives here
│  │  ├─ Button.jsx                 # ✓ 4 variants, 3 sizes, loading state
│  │  ├─ Card.jsx                   # ✓ CardHeader/CardBody/CardFooter
│  │  ├─ Pill.jsx                   # ✓ 6 color variants
│  │  ├─ Spinner.jsx                # ✓ SVG animate-spin, 3 sizes
│  │  ├─ ConfidentialChip.jsx       # ✓ masked (lock + label) / revealed (green mono value)
│  │  ├─ Modal.jsx                  # ✓ portal, Escape-dismiss, backdrop click
│  │  ├─ Stepper.jsx                # ✓ done/active/pending states, connector fills
│  │  ├─ NotificationToast.jsx      # Phase 10 Part 6 — privacy-first toast; never shows amounts; max 3 visible
│  │  └─ HeatScore.jsx              # Phase 10 Part 7 — Auction Heat XX/100 gradient bar; score from bid count + time urgency + activity rate
│  │
│  ├─ lib/                          # integration layer (SDK / chain isolated here)
│  │  ├─ wagmi.js                   # ✓ wagmi/viem chain config
│  │  ├─ erc7984.js                 # ✓ ZERO_BYTES32 const, getDistribution, getClaimStatus (claimed only),
│  │  │                             #   getAllocationHandle (returns bytes32); claim(bytes32,bytes,bytes) ABI
│  │  ├─ fhe.js                     # legacy — fhevmjs@0.6.2 (superseded by @zama-fhe/react-sdk); keep until confirmed unused
│  │  └─ tokenops.js                # ✓ fhe-airdrop (factory + encryptUint64 + signClaimAuthorization + claim) + fhe-disperse (createConfidentialDisperseClient)
│  │
│  ├─ hooks/                        # shared hooks
│  │  ├─ useNotifications.js        # ✓ Part 6 — wagmi event watchers + final-hour timer; returns { toasts, dismiss }
│  │  ├─ useInView.js
│  ├─ context/
│  │  └─ FheContext.jsx             # legacy fhevmjs init — no longer mounted; retire when confirmed unused
│  ├─ constants/                    # (empty placeholder — route path constants go here)
│  ├─ assets/                       # (empty placeholder — static assets go here)
│  └─ styles/                       # (empty placeholder — tailwind theme extensions go here)
│
├─ index.html
├─ tailwind.config.js               # design tokens: colors, radius, fonts
├─ postcss.config.js
├─ vite.config.js
├─ .env.example                     # VITE_CHAIN_ID, contract addresses, RPC
├─ eslint.config.js
└─ package.json
```

### The two components that carry the UX
- `ConfidentialChip.jsx` — the 🔒 confidential pill. Used on the operator side (amounts mask on entry) AND recipient side (before decrypt). Build once, reuse.
- `DecryptReveal.jsx` — the masked → revealed-number moment on the recipient screen. This is the demo's payoff.

---

## Backend (contracts) — `contracts/`

The real backend. No traditional server holds sensitive data — amounts live on-chain as encrypted
handles; Zama's coprocessor/relayer (managed) does the FHE compute.

**FHE stack: `@fhevm/solidity@0.11.1` + `@zama-fhe/relayer-sdk@0.4.3`**
(Upgraded from `fhevm@0.6.2` in June 2026 to unblock Sepolia FHE. Key changes: `TFHE` → `FHE` library, `euint64 is bytes32`, async Gateway callback replaced with KMS-signature proof claim, `ZamaEthereumConfig` auto-configures coprocessor by chainId.)

```
contracts/
├─ contracts/
│  ├─ ConfidentialDisperse.sol      # ✓ implemented: euint64 allocations (bytes32 handles), ACL grants
│  │                                #   (allowThis / allow recipient / allow operator), KMS-proof claim
│  │                                #   (claim(distId, decryptedResult, decryptionProof) verifies via IKMSVerifier)
│  │                                #   auditor whitelist (grantDecryptAccess + grantAuditorHandleAccess)
│  │                                #   inherits ZamaEthereumConfig for auto coprocessor setup
│  │                                #   executeDistribution calls Impl.makePubliclyDecryptable(handle)
│  │                                #   so relayer publicDecrypt works after execution
│  ├─ ConfidentialAirdrop.sol       # ✓ implemented: pull-claim variant; addRecipients (repeatable until seal),
│  │                                #   sealAirdrop, fundAirdrop, claim(id, decryptedResult, decryptionProof)
│  │                                #   addRecipients calls Impl.makePubliclyDecryptable(handle) per recipient
│  ├─ tokens/
│  │  └─ ConfidentialToken.sol      # ✓ implemented: ERC-20 mintable (ERC-7984 upgrade = future work)
│  ├─ interfaces/
│  │  └─ IConfidentialDistributor.sol  # ✓ updated: externalEuint64[] params, claim(bytes32,bytes,bytes)
│  └─ mocks/                        # ✓ local test doubles — installed at local config addrs via hardhat_setCode
│     ├─ MockACL.sol                # allow/allowTransient/isAllowed/allowForDecryption stubs (bytes32 handles)
│     ├─ MockFHEVMExecutor.sol      # verifyInput returns inputHandle (identity); all arith stubs (bytes32)
│     └─ MockKMSVerifier.sol        # verifyDecryptionEIP712KMSSignatures always returns true
├─ deploy/
│  ├─ 01_token.js
│  └─ 02_distributor.js
├─ test/
│  ├─ helpers/
│  │  └─ fhevm-mock.js              # ✓ deployFhevmMocks (hardhat_setCode), mockEncrypt64 (proof="0x00"),
│  │                                #   mockDecrypt64, parseEvent
│  │                                #   IMPORTANT: proof must be "0x00" (non-empty) — empty "0x" takes a
│  │                                #   passthrough path in FHE.fromExternal that requires pre-existing ACL
│  │                                #   permission; non-empty goes through Impl.verify → ACL.allowTransient
│  ├─ setup.js                      # ✓ mocha pre-require: fixes pnpm dual-chai instance bug
│  ├─ disperse.test.js              # ✓ ConfidentialDisperse full lifecycle + edge cases (33 tests)
│  ├─ airdrop.test.js               # ✓ ConfidentialAirdrop full lifecycle + edge cases (28 tests)
│  ├─ allocation.decrypt.test.js    # ✓ ACL grants, auditor access, privacy boundaries (22 tests)
│  └─ validation.test.js            # ✓ bad address (addr(0)), duplicate recipients, total > funded (10 tests)
├─ tasks/                           # ✓ create-distribution.js, grant-access.js
├─ scripts/
│  ├─ e2e-local.js                  # ✓ full lifecycle on local Hardhat; writes frontend/.env.local
│  ├─ e2e-sepolia.js                # ✓ deploy + verify proxies + non-FHE lifecycle + FULL FHE e2e verified
│  │                                #   uses @zama-fhe/relayer-sdk/node (NOT /relayer-sdk root — no exports main)
│  │                                #   createInstance({ ...SepoliaConfig, network: rpcUrl })
│  │                                #   createEncryptedInput(disperseAddress, operator.address)  ← must be msg.sender
│  │                                #   instance.publicDecrypt([handle]) → { abiEncodedClearValues, decryptionProof }
│  └─ check-balance.js              # deployer balance check
├─ hardhat.config.js                # SEPOLIA_RPC fallback chain: SEPOLIA_RPC_URL → Infura → publicnode.com
│                                   # mocha timeout 60 000 ms; pnpm dual-chai fix via TASK_TEST_SETUP_TEST_ENVIRONMENT subtask
├─ .env                             # MNEMONIC, INFURA_API_KEY, SEPOLIA_RPC_URL (= publicnode fallback)
├─ .env.example                     # MNEMONIC, INFURA_API_KEY, ETHERSCAN_API_KEY, SEPOLIA_RPC_URL
└─ package.json
```

### Local mock proxy addresses (from `ZamaConfig._getLocalConfig()` in @fhevm/solidity@0.11.1)

| Contract | Address |
|----------|---------|
| ACL | `0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D` |
| Coprocessor (FHEVMExecutor) | `0xe3a9105a3a932253A70F126eb1E3b589C643dD24` |
| KMSVerifier | `0x901F8942346f7AB3a01F6D7613119Bca447Bb030` |

### Sepolia proxy addresses (from `ZamaConfig.getSepoliaConfig()` in @fhevm/solidity@0.11.1)

| Contract | Address |
|----------|---------|
| ACL | `0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D` |
| Coprocessor (FHEVMExecutor) | `0x92C920834Ec8941d2C77D188936E1f7A6f49c127` |
| KMSVerifier | `0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A` |

### Deployed app contracts on Sepolia (2026-06-12)

| Contract | Address |
|----------|---------|
| ConfidentialToken (ATK, 6 dec) | `0x7CF438647deD14b3503ba133176b2EB7524af989` |
| ConfidentialDisperse | `0x5F48197D829D7FD967799C7F2a9C94fbC30fc634` |

Deployer wallet: `0x45Ac14861BD3b1c736F01B3855784648a8b5Ac51` (account[0] from MNEMONIC)
RPC: `https://ethereum-sepolia-rpc.publicnode.com` (PublicNode free, no key needed)
FHE e2e verified: `executeDistribution` → `publicDecrypt` → `claim` (alice balance = 1,000,000 ATK confirmed on-chain)

---

## Optional helper server — `server/`

Only if you want shareable claim links, distribution titles/logos, or notifications.
Stores ZERO sensitive amounts — public metadata only, keyed by distribution address.

```
server/
├─ src/
│  ├─ index.js                      # express/fastify entry
│  ├─ routes/
│  │  ├─ distributions.route.js     # GET metadata, claim-link resolution
│  │  └─ recipients.route.js        # which distributions a wallet appears in
│  ├─ services/
│  ├─ db/                           # prisma schema (metadata only)
│  └─ config.js
├─ .env.example
└─ package.json
```

---

## Modern React conventions

- Functional components only; logic lives in custom hooks, not components.
- `useCreateDistribution` owns the wizard's multi-step state + the encrypt→submit sequence; the page just renders steps.
- Compose with `components/ui/` primitives — no inheritance.
- TanStack Query for chain/server state (cache, retry, loading for free); useState/useReducer for ephemeral form state.
- Tailwind design tokens in `tailwind.config.js` (chip color, radius, fonts) — never scatter raw hex in className strings.
- Components never import the SDK directly — only through `features/*/hooks`, which call `lib/`.
```
