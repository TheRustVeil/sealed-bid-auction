import { useState, useRef, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';

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
// any sibling-reference node stale. With always-mounted nodes, React only
// needs to change className/style — no DOM insertions during wallet connect.
export function ConnectButton() {
  const { address, isConnected, isConnecting, connectInjected, connectWC, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Close picker once connection starts
  useEffect(() => { if (isConnecting) setOpen(false); }, [isConnecting]);

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
      <div
        className="relative"
        ref={ref}
        style={{ display: isConnected ? 'none' : undefined }}
        aria-hidden={isConnected}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={isConnecting}
          tabIndex={isConnected ? -1 : 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all hover:-translate-y-px"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
            boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 4px 12px rgba(124,58,237,0.2)',
          }}
        >
          <span style={{ display: isConnecting ? undefined : 'none' }}>
            <SpinnerMini />
          </span>
          <span>{isConnecting ? 'Connecting…' : 'Connect Wallet'}</span>
        </button>

        {/* ── Connector picker ── */}
        {open && !isConnecting && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0f0f1a] shadow-2xl overflow-hidden z-50">
            <button
              onClick={() => { connectInjected(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
            >
              <span className="text-xl leading-none">🦊</span>
              <div>
                <div className="text-xs font-medium text-white">Browser Wallet</div>
                <div className="text-[11px] text-white/40 mt-0.5">MetaMask, Brave, etc.</div>
              </div>
            </button>
            <div className="h-px bg-white/[0.06]" />
            <button
              onClick={() => { connectWC(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
            >
              <span className="text-xl leading-none">📱</span>
              <div>
                <div className="text-xs font-medium text-white">WalletConnect</div>
                <div className="text-[11px] text-white/40 mt-0.5">Mobile wallets · QR code</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
