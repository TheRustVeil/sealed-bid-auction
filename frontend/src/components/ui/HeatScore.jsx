import { motion } from 'framer-motion';

const AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Computes a 0-100 "auction heat" score from public metadata only.
 * score = (bidScore × 40) + (timeUrgency × 35) + (activityRate × 25)
 */
function computeHeat(recipientCount = 0, createdAt = Date.now()) {
  const elapsed = Math.max(Date.now() - (createdAt ?? Date.now()), 0);
  const daysElapsed = Math.max(elapsed / (24 * 60 * 60 * 1000), 0.01);

  const bidScore = Math.min(recipientCount / 20, 1) * 100;
  const urgencyScore = Math.min(elapsed / AUCTION_DURATION_MS, 1) * 100;
  const activityScore = Math.min((recipientCount / daysElapsed) / 3, 1) * 100;

  return Math.round(bidScore * 0.4 + urgencyScore * 0.35 + activityScore * 0.25);
}

function heatGradient(score) {
  if (score >= 75) return 'linear-gradient(90deg, #f97316, #ef4444)';
  if (score >= 45) return 'linear-gradient(90deg, #eab308, #f97316)';
  return 'linear-gradient(90deg, #22c55e, #84cc16)';
}

function heatLabel(score) {
  if (score >= 75) return { text: 'Hot', color: 'text-orange-400' };
  if (score >= 45) return { text: 'Warm', color: 'text-yellow-400' };
  return { text: 'Cool', color: 'text-emerald-400' };
}

/**
 * Displays "Auction Heat: XX/100" with a gradient progress bar.
 * Accepts recipientCount + createdAt — both are public on-chain metadata.
 *
 * variant "compact" → one-line row for AuctionCard
 * variant "full"    → labelled block for DistributionDetail
 */
export function HeatScore({ recipientCount = 0, createdAt, variant = 'compact' }) {
  const score = computeHeat(recipientCount, createdAt);
  const gradient = heatGradient(score);
  const { text, color } = heatLabel(score);

  if (variant === 'full') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Auction Heat</span>
          <span className={`font-bold tabular-nums ${color}`}>
            {score}/100 <span className="font-normal text-white/30 text-xs">{text}</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{ background: gradient, boxShadow: `0 0 8px ${score >= 75 ? '#f97316' : score >= 45 ? '#eab308' : '#22c55e'}60` }}
          />
        </div>
        <p className="text-white/20 text-xs">
          Score derived from bid count, time urgency, and activity rate — all public metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-xs text-white/40">
      <span>Heat</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ background: gradient }}
          />
        </div>
        <span className={`tabular-nums font-medium ${color}`}>{score}/100</span>
      </div>
    </div>
  );
}
