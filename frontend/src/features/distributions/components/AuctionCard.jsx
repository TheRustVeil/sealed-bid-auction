import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, HeatScore } from '../../../components/ui';
import { BidIntensityMeter } from './BidIntensityMeter';

const GRADIENTS = [
  ['#7C3AED', '#1E1B4B'],
  ['#059669', '#022C22'],
  ['#DB2777', '#4A044E'],
  ['#D97706', '#451A03'],
  ['#0891B2', '#082F49'],
  ['#9333EA', '#3B0764'],
];

function pickGradient(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function truncate(str = '', start = 6, end = 4) {
  if (str.length <= start + end + 3) return str;
  return `${str.slice(0, start)}…${str.slice(-end)}`;
}

const AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function formatDuration(ms) {
  if (ms <= 0) return 'Ended';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function Countdown({ endMs }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endMs - Date.now()));

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining(Math.max(0, endMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [endMs]);

  return <span>{formatDuration(remaining)}</span>;
}

export function AuctionCard({ distribution, onClick }) {
  const { id = '', label, type, recipientCount = 0, executed, createdAt } = distribution;

  const endMs = createdAt ? createdAt + AUCTION_DURATION_MS : Date.now();
  const remaining = Math.max(0, endMs - Date.now());

  const status = executed ? 'settled' : remaining <= 0 ? 'settling' : 'active';
  const statusVariant = status === 'settled' ? 'success' : status === 'settling' ? 'warning' : 'info';

  const count = Number(recipientCount);
  const initial = (label ?? 'U')[0].toUpperCase();
  const [from, to] = pickGradient(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(124,58,237,0.22)' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group rounded-2xl border border-white/[0.07] bg-panel/60 hover:border-violet-500/30 hover:bg-violet-500/[0.04] cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* NFT art placeholder */}
      <div
        className="relative h-36 flex items-center justify-center overflow-hidden select-none"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {/* Animated concentric rings — energy orb effect */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/25"
            style={{ width: 56 + i * 44, height: 56 + i * 44 }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
            transition={{
              duration: 2.4 + i * 0.9,
              delay: i * 0.55,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        <span className="relative z-10 text-white/80 text-5xl font-black drop-shadow-lg">{initial}</span>
        <div className="absolute top-3 right-3">
          <BidIntensityMeter recipientCount={count} />
        </div>
        {/* Confidential tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-white/50 text-[10px] font-mono tracking-widest">🔒 CONFIDENTIAL</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-white font-semibold text-sm leading-snug truncate">
            {label ?? 'Unnamed Auction'}
          </p>
          <Pill variant={statusVariant} className="shrink-0">
            {status}
          </Pill>
        </div>

        {/* ID + bidder count */}
        <div className="flex items-center justify-between text-xs text-white/40">
          <span className="font-mono">{truncate(id, 6, 4)}</span>
          <span>
            👤 {count} bidder{count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Heat score */}
        <HeatScore recipientCount={count} createdAt={createdAt} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
          <Pill variant="confidential">{type ?? 'disperse'}</Pill>
          {!executed && (
            <span className="text-xs text-white/35 tabular-nums">
              ⏱ <Countdown endMs={endMs} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
