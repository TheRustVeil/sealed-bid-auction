import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { WalletModal } from './WalletModal';

function truncate(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const SpinnerMini = () => (
  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// Both button variants are always present in the DOM — we toggle visibility
// with CSS display instead of mounting/unmounting. This avoids React 19's
// insertBefore crash: when MetaMask opens it mutates document.body, making
// any sibling-reference node stale.
export function ConnectButton() {
  const walletHooks = useWallet();
  const { address, isConnected, isConnecting, disconnect } = walletHooks;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* ── Connected state ── */}
      <button
        onClick={disconnect}
        tabIndex={isConnected ? 0 : -1}
        aria-hidden={!isConnected}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:border-white/20 transition-all text-xs font-medium"
        style={{ display: isConnected ? undefined : 'none' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        <span>{address ? truncate(address) : '…'}</span>
      </button>

      {/* ── Disconnected state ── */}
      <button
        onClick={() => setModalOpen(true)}
        disabled={isConnecting}
        tabIndex={isConnected ? -1 : 0}
        aria-hidden={isConnected}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all hover:-translate-y-px"
        style={{
          display: isConnected ? 'none' : undefined,
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 4px 12px rgba(124,58,237,0.2)',
        }}
      >
        {isConnecting && <SpinnerMini />}
        <span>{isConnecting ? 'Connecting…' : 'Connect Wallet'}</span>
      </button>

      {/* ── Wallet picker modal ── */}
      <WalletModal
        open={modalOpen && !isConnected}
        onClose={() => setModalOpen(false)}
        walletHooks={walletHooks}
      />
    </>
  );
}
