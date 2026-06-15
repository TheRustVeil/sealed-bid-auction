import { createContext, useContext, useEffect, useState } from 'react';
import { initFhevm } from '../lib/fhe';
import { Spinner } from '../components/ui';

const FheContext = createContext(null);

/** Access the FHE instance and initialization state anywhere in the tree. */
export function useFhe() {
  return useContext(FheContext);
}

/**
 * Initializes the Zama fhEVM browser SDK once at app startup.
 *
 * - Blocks rendering with a loading screen while fhevmjs fetches the FHE public
 *   key from the Zama KMS contract on-chain.
 * - Shows an error screen if initialization fails (e.g. no wallet, wrong network).
 * - The module-level cache in lib/fhe.js ensures re-renders and route changes never
 *   trigger a second initialization.
 */
export function FheProvider({ children }) {
  const [state, setState] = useState({ instance: null, ready: false, error: null });

  useEffect(() => {
    let cancelled = false;

    initFhevm()
      .then((instance) => {
        if (!cancelled) setState({ instance, ready: true, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ instance: null, ready: false, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, []); // empty deps — run exactly once, never on re-render or route change

  if (!state.ready && !state.error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-white/60 text-sm tracking-wide">Initializing FHE…</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-400 font-semibold text-base">FHE initialization failed</p>
        <p className="text-white/50 text-sm max-w-md">{state.error.message}</p>
        <p className="text-white/30 text-xs max-w-md">
          Make sure MetaMask is installed and connected to Sepolia, then reload the page.
        </p>
      </div>
    );
  }

  return (
    <FheContext.Provider value={state}>
      {children}
    </FheContext.Provider>
  );
}
