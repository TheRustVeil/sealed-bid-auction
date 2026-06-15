import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { Navbar } from '../../components/layout/Navbar';
import { useWallet } from '../../features/wallet/hooks/useWallet';
import { AllocationCard } from '../../features/allocations/components/AllocationCard';

const STORAGE_KEY = 'watched_distributions';

function loadWatched() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveWatched(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

export function MyAllocations() {
  const { address, isConnected } = useWallet();
  const [watched, setWatched] = useState(loadWatched);
  const [input, setInput] = useState('');

  const addDistribution = () => {
    const trimmed = input.trim();
    if (!trimmed || watched.includes(trimmed)) return;
    const next = [trimmed, ...watched];
    setWatched(next);
    saveWatched(next);
    setInput('');
  };

  const remove = (id) => {
    const next = watched.filter((w) => w !== id);
    setWatched(next);
    saveWatched(next);
  };

  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-50" />
      <div
        className="fixed top-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(6,182,212,0.06) 0%, transparent 70%)' }}
      />

      <Navbar />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs text-cyan-400 uppercase tracking-[0.2em] font-semibold mb-2">Recipient</p>
          <h1 className="text-2xl font-bold text-white mb-2">My Allocations</h1>
          <p className="text-white/40 text-sm">
            Track distributions you're part of. Only you can decrypt your amount.
          </p>
        </div>

        {/* Not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-white/[0.06] bg-panel/40 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center mb-4 text-white/30">
              <WalletIcon />
            </div>
            <h3 className="text-white font-semibold mb-2">Connect your wallet</h3>
            <p className="text-white/35 text-sm mb-6">Connect to view your tracked distributions.</p>
            <ConnectButton />
          </div>
        )}

        {isConnected && (
          <>
            {/* Add distribution input */}
            <div className="rounded-2xl border border-white/[0.07] bg-panel/50 backdrop-blur-sm overflow-hidden mb-6">
              <div className="px-6 py-5">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
                  Track a distribution
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDistribution()}
                    placeholder="0x… (bytes32 distribution ID)"
                    className="flex-1 bg-surface/80 border border-white/8 rounded-xl px-4 py-2.5 text-white placeholder-white/20 font-mono text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  />
                  <button
                    onClick={addDistribution}
                    disabled={!input.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:-translate-y-px"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                      boxShadow: '0 0 0 1px rgba(124,58,237,0.35)',
                    }}
                  >
                    <PlusIcon />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {watched.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-white/[0.06] bg-panel/30 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-4 text-white/20">
                  <InboxIcon />
                </div>
                <p className="text-white/40 text-sm">No distributions tracked yet.</p>
                <p className="text-white/25 text-xs mt-1">Paste a distribution ID above to start.</p>
              </div>
            )}

            {/* Allocation cards */}
            <div className="space-y-3">
              {watched.map((id) => (
                <div key={id} className="relative group">
                  <AllocationCard distributionId={id} account={address} />
                  <button
                    onClick={() => remove(id)}
                    title="Remove"
                    className="absolute top-3.5 right-3.5 w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
