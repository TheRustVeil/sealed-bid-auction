import { createConfig, http } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { injected, walletConnect } from "@wagmi/connectors";
import { RPC_URL, CHAIN_ID } from "../app/config";

export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";
const isLocal = CHAIN_ID === 31337;

export const wagmiConfig = createConfig({
  chains: isLocal ? [hardhat, sepolia] : [sepolia],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [sepolia.id]: http(RPC_URL || undefined),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
