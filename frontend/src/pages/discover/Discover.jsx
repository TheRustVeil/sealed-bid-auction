import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { AuctionCard } from '../../features/distributions/components/AuctionCard';
import { useDiscoverAuctions } from '../../features/distributions/hooks/useDiscoverAuctions';

const FILTERS = ['all', 'active', 'ended'];

function Section({ title, items, onSelect, index = 0 }) {
  if (!items.length) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.12 }}
    >
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3 font-mono">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <AuctionCard key={d.id} distribution={d} onClick={() => onSelect(d.id)} />
        ))}
      </div>
    </motion.section>
  );
}

export function Discover() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const { trending, endingSoon, mostActive, recentlyListed } = useDiscoverAuctions(filter);

  const handleSelect = (id) =>
    navigate(`/operator/distribution/${encodeURIComponent(id)}`);

  const isEmpty =
    !trending.length && !endingSoon.length && !mostActive.length && !recentlyListed.length;

  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-60" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[280px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
      />

      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 relative overflow-hidden">
          {/* Radar sweep shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-confidential/8 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '250%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
          />
          <h1 className="text-xl font-bold text-white">Discover Auctions</h1>
          <motion.p
            className="text-xs font-mono tracking-widest mt-1 text-confidential/50"
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            › SCANNING ENCRYPTED NETWORK...
          </motion.p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 mb-8 p-1 rounded-xl bg-panel/60 border border-white/[0.07] w-fit">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                filter === f
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : 'text-white/40 hover:text-white/70',
              ].join(' ')}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/[0.06] bg-panel/40 text-center px-6">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-white font-semibold mb-2">No auctions found</h3>
            <p className="text-white/35 text-sm">
              {filter === 'all'
                ? 'Create a distribution from the Operator dashboard to see it here.'
                : `No ${filter} auctions at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <Section title="🔥 Trending"        items={trending}       onSelect={handleSelect} index={0} />
            <Section title="⏳ Ending Soon"      items={endingSoon}     onSelect={handleSelect} index={1} />
            <Section title="📊 Most Active"      items={mostActive}     onSelect={handleSelect} index={2} />
            <Section title="🆕 Recently Listed"  items={recentlyListed} onSelect={handleSelect} index={3} />
          </div>
        )}
      </main>
    </div>
  );
}
