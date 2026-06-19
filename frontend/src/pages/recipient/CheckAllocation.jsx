import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { useWallet } from '../../features/wallet/hooks/useWallet';
import { DecryptReveal } from '../../features/allocations/components/DecryptReveal';

const BYTES32_RE = /^0x[0-9a-fA-F]{64}$/;

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

export function CheckAllocation() {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const [distributionId, setDistributionId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValidId = BYTES32_RE.test(distributionId);
  const canCheck = isConnected && isValidId;

  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-50" />
      <div
        className="fixed top-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(6,182,212,0.06) 0%, transparent 70%)' }}
      />

      <main className="relative z-10 max-w-lg mx-auto px-6 py-12">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs text-cyan-400 uppercase tracking-[0.2em] font-semibold mb-2">Recipient</p>
          <h1 className="text-2xl font-bold text-white mb-2">Check your allocation</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Enter a distribution ID to decrypt your private bid amount.{' '}
            <span className="text-white/60">Only your wallet can see your figure.</span>
          </p>
        </div>

        {/* Not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-white/[0.06] bg-panel/40 text-center px-6 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center mb-4 text-white/30">
              <WalletIcon />
            </div>
            <h3 className="text-white font-semibold mb-2">Connect your wallet</h3>
            <p className="text-white/35 text-sm mb-6">Your wallet is needed to decrypt your allocation.</p>
            <ConnectButton />
          </div>
        )}

        {/* Connected: input form */}
        {isConnected && (
          <div className="rounded-2xl border border-white/[0.07] bg-panel/50 backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                Distribution ID
              </label>
              <input
                type="text"
                value={distributionId}
                onChange={(e) => {
                  setDistributionId(e.target.value);
                  setSubmitted(false);
                }}
                placeholder="0x0000…0000 (bytes32)"
                className="w-full bg-surface/80 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 font-mono text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
              {distributionId && !isValidId && (
                <p className="text-yellow-400/80 text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> Must be a 32-byte hex string (0x + 64 hex chars)
                </p>
              )}
            </div>

            <div className="px-6 py-4">
              <button
                disabled={!canCheck}
                onClick={() => setSubmitted(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: canCheck ? '0 0 0 1px rgba(124,58,237,0.35), 0 4px 16px rgba(124,58,237,0.2)' : 'none',
                }}
              >
                Decrypt My Allocation
              </button>
            </div>

            {submitted && canCheck && (
              <div className="px-6 pb-5 border-t border-white/[0.06] pt-4">
                <DecryptReveal distributionId={distributionId} account={address} />
              </div>
            )}
          </div>
        )}

        {/* Link to all allocations */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/recipient/allocations')}
            className="text-white/35 text-sm hover:text-violet-300 transition-colors"
          >
            View all my tracked allocations →
          </button>
        </div>
      </main>
    </div>
  );
}
