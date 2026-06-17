import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../components/ui';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { Navbar } from '../../components/layout/Navbar';
import { AuctionCard } from '../../features/distributions/components/AuctionCard';
import { useDistributions } from '../../features/distributions/hooks/useDistributions';
import { useWallet } from '../../features/wallet/hooks/useWallet';


const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

const STAT_COLORS = [
  { border: 'border-violet-500/15', bg: 'bg-violet-500/5', text: 'text-violet-300' },
  { border: 'border-emerald-500/15', bg: 'bg-emerald-500/5', text: 'text-emerald-300' },
  { border: 'border-cyan-500/15', bg: 'bg-cyan-500/5', text: 'text-cyan-300' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { data: distributions, isLoading } = useDistributions();

  const count = distributions?.length ?? 0;
  const executedCount = distributions?.filter((d) => d.executed).length ?? 0;
  const totalRecipients = distributions?.reduce((s, d) => s + Number(d.recipientCount ?? 0), 0) ?? 0;

  const stats = [
    { label: 'Auctions', value: count },
    { label: 'Settled', value: executedCount },
    { label: 'Total Bidders', value: totalRecipients },
  ];

  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Ambient */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-60" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[280px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
      />

      {/* ── Header ── */}
      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* ── Page heading ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">Distributions</h1>
            <p className="text-white/35 text-sm mt-1">
              {isConnected
                ? 'Browse and manage your sealed-bid auctions'
                : 'Connect your wallet to get started'}
            </p>
          </div>
          {isConnected && (
            <button
              onClick={() => navigate('/operator/create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                boxShadow: '0 0 0 1px rgba(124,58,237,0.35), 0 4px 16px rgba(124,58,237,0.2)',
              }}
            >
              <PlusIcon />
              New Distribution
            </button>
          )}
        </div>

        {/* ── Stats (only when connected & has data) ── */}
        {isConnected && count > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {stats.map(({ label, value }, i) => {
              const c = STAT_COLORS[i];
              return (
                <div
                  key={label}
                  className={`p-5 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm`}
                >
                  <div className={`text-3xl font-black mb-1 ${c.text}`}>{value}</div>
                  <div className="text-white/35 text-xs uppercase tracking-widest">{label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Not connected ── */}
        {!isConnected && (
          <EmptyState
            icon={<WalletIcon />}
            title="Connect your wallet"
            desc="Connect MetaMask to view and manage your sealed-bid auction distributions."
            action={<ConnectButton />}
          />
        )}

        {/* ── Loading ── */}
        {isConnected && isLoading && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <Spinner />
            <p className="text-white/30 text-sm">Loading distributions…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {isConnected && !isLoading && count === 0 && (
          <EmptyState
            icon={<InboxIcon />}
            title="No distributions yet"
            desc="Create your first sealed-bid auction to distribute tokens privately to recipients."
            action={
              <button
                onClick={() => navigate('/operator/create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: '0 0 0 1px rgba(124,58,237,0.35), 0 4px 16px rgba(124,58,237,0.2)',
                }}
              >
                <PlusIcon />
                Create Distribution
              </button>
            }
          />
        )}

        {/* ── Auction grid ── */}
        {count > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {distributions.map((d) => (
              <AuctionCard
                key={d.id}
                distribution={d}
                onClick={() =>
                  navigate(`/operator/distribution/${encodeURIComponent(d.id)}`)
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/[0.06] bg-panel/40 backdrop-blur-sm text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center mb-5 text-white/30">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-[15px] mb-2">{title}</h3>
      <p className="text-white/35 text-sm mb-7 max-w-xs leading-relaxed">{desc}</p>
      {action}
    </div>
  );
}
