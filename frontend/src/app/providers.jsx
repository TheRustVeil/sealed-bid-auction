import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  ZamaProvider,
  RelayerWeb,
  SepoliaConfig,
  indexedDBStorage,
  memoryStorage,
} from "@zama-fhe/react-sdk";
import { WagmiSigner } from "@zama-fhe/react-sdk/wagmi";
import { wagmiConfig } from "../lib/wagmi";
import { RPC_URL } from "./config";

const queryClient = new QueryClient();

// When VITE_SKIP_ZAMA=true (Playwright smoke tests, CI without Sepolia) we provide
// minimal stub objects so ZamaProvider + ZamaSDK initialise without crashing.
// All actual FHE operations (encrypt/decrypt) will fail if attempted; but the
// components that don't exercise FHE paths render normally.
const SKIP_ZAMA = import.meta.env.VITE_SKIP_ZAMA === "true";

// A minimal signer stub that satisfies ZamaSDK's internal subscribe() call.
const STUB_SIGNER = {
  subscribe: () => () => {},
  getChainId: async () => 31337,
  getAddress: async () => "0x0000000000000000000000000000000000000000",
  signMessage: async () => { throw new Error("No real signer in mock mode"); },
  signTypedData: async () => { throw new Error("No real signer in mock mode"); },
};

const STUB_RELAYER = {
  getChainId: async () => 31337,
};

const signer = SKIP_ZAMA ? STUB_SIGNER : new WagmiSigner({ config: wagmiConfig });

const relayer = SKIP_ZAMA
  ? STUB_RELAYER
  : new RelayerWeb({
      getChainId: () => signer.getChainId(),
      transports: {
        [sepolia.id]: { ...SepoliaConfig, network: RPC_URL || SepoliaConfig.network },
      },
    });

const storage = SKIP_ZAMA ? memoryStorage : indexedDBStorage;

export function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider relayer={relayer} signer={signer} storage={storage}>
          {children}
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
