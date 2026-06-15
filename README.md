# ConfidentialDrop

Sealed-bid auction settlement dApp on the Zama Protocol.
Winners receive tokens at their private bid price — no one can see what others paid.

**Stack:** React + Vite + Tailwind · wagmi + viem · Solidity + fhEVM · Hardhat · TokenOps SDK · ERC-7984

## Monorepo structure

```
confidential-drop/
├─ frontend/    # React dApp
├─ contracts/   # Solidity + Hardhat + fhEVM
├─ server/      # Optional metadata API
└─ docs/
```

## Setup

```bash
# Install dependencies
pnpm install

# Frontend dev server
pnpm --filter frontend dev

# Compile contracts
pnpm --filter confidential-drop-contracts compile

# Run contract tests
pnpm --filter confidential-drop-contracts test
```

## Environment

Copy `.env.example` files and fill in real values:
- `frontend/.env` — chain ID, RPC URL, contract addresses
- `contracts/.env` — mnemonic, Infura key, Etherscan key

See `ARCHITECTURE.md` for full folder conventions.
