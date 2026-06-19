import { AnimatePresence, motion } from 'framer-motion';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { BadgeCard } from '../../features/reputation/components/BadgeCard';
import { useReputation } from '../../features/reputation/hooks/useReputation';

function truncate(addr = '', start = 6, end = 4) {
  if (addr.length <= start + end + 3) return addr;
  return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

const ADJECTIVES = ['Shadow', 'Phantom', 'Silent', 'Ghost', 'Cipher', 'Stealth', 'Zero'];
const NOUNS      = ['Bidder', 'Trader', 'Collector', 'Vault', 'Operator', 'Agent', 'Signal'];

function agentCodename(address = '') {
  const h = address.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0);
  return `${ADJECTIVES[Math.abs(h) % ADJECTIVES.length]} ${NOUNS[Math.abs(h >> 4) % NOUNS.length]}`;
}

const STAT_COLORS = [
  { border: 'border-violet-500/15', bg: 'bg-violet-500/5', text: 'text-violet-300' },
  { border: 'border-emerald-500/15', bg: 'bg-emerald-500/5', text: 'text-emerald-300' },
  { border: 'border-cyan-500/15', bg: 'bg-cyan-500/5', text: 'text-cyan-300' },
  { border: 'border-orange-500/15', bg: 'bg-orange-500/5', text: 'text-orange-300' },
];

const statVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay: i * 0.08 },
  }),
};

export function Profile() {
  const { isConnected, address, totalAuctions, settledCount, activeCount, totalBidders, badges } =
    useReputation();

  const stats = [
    { label: 'Auctions',      value: totalAuctions },
    { label: 'Settled',       value: settledCount  },
    { label: 'Active',        value: activeCount   },
    { label: 'Total Bidders', value: totalBidders  },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const codename = isConnected ? agentCodename(address) : 'Anonymous Bidder';

  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-60" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[280px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
      />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* ── Identity card ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-6 rounded-2xl border border-white/[0.07] bg-panel/60 backdrop-blur-sm overflow-hidden relative"
        >
          {/* Subtle scan line */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-confidential/5 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
          />

          <div className="flex items-center gap-4 relative">
            {/* Avatar orb */}
            <div className="relative shrink-0">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white/80"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
              >
                {address ? address.slice(2, 4).toUpperCase() : '🕶️'}
              </div>
              {isConnected && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-surface"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-white font-bold text-base">{codename}</h1>
                {isConnected && (
                  <span className="text-[9px] font-mono tracking-widest text-green-400/70 border border-green-400/25 px-1.5 py-0.5 rounded">
                    ONLINE
                  </span>
                )}
              </div>
              <p className="text-white/35 text-xs font-mono tracking-wide">
                {isConnected ? truncate(address) : 'Identity concealed'}
              </p>
              <p className="text-white/20 text-xs mt-1">
                {unlockedCount} badge{unlockedCount !== 1 ? 's' : ''} earned
              </p>
            </div>

            {!isConnected && <ConnectButton />}
          </div>
        </motion.div>

        {/* ── Public stats (staggered) ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            Public Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(({ label, value }, i) => {
              const c = STAT_COLORS[i];
              return (
                <motion.div
                  key={label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={statVariants}
                  className={`p-4 rounded-2xl border ${c.border} ${c.bg} text-center`}
                >
                  <div className={`text-2xl font-black mb-0.5 ${c.text}`}>{value}</div>
                  <div className="text-white/35 text-xs uppercase tracking-wider">{label}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Badge shelf ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            Clearance Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </section>

        {/* ── Private portfolio — blur→reveal on wallet connect ── */}
        <AnimatePresence>
          {isConnected && (
            <motion.section
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
                Private Portfolio
                <span className="ml-2 text-green-400/60">🔓 Unlocked</span>
              </h2>
              <div className="p-5 rounded-2xl border border-confidential/20 bg-panel/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Total allocations</span>
                  <span className="text-confidential/70">🔒 Encrypted on-chain</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Claim history</span>
                  <span className="text-confidential/70">🔒 Private</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Auction wins</span>
                  <span className="text-confidential/70">🔒 Confidential</span>
                </div>
                <p className="text-white/20 text-[10px] pt-2 border-t border-white/[0.06] leading-relaxed">
                  Your allocation amounts are end-to-end encrypted using Zama FHE — only you can decrypt them from the recipient dashboard.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
