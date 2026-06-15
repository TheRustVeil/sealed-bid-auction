const AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function formatAmount(raw) {
  return (Number(raw) / 1e6).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

function formatDuration(ms) {
  if (ms <= 0) return 'Ended';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

/**
 * Post-decrypt analytics panel — renders only after a successful claim+reveal.
 *
 * @param {{ plaintext: bigint|null, isClaimed: boolean, distribution?: object }} props
 */
export function PersonalAnalytics({ plaintext, isClaimed, distribution }) {
  if (plaintext == null) return null;

  const timeRemaining =
    distribution?.createdAt != null
      ? Math.max(0, distribution.createdAt + AUCTION_DURATION_MS - Date.now())
      : null;

  const rows = [
    {
      label: 'Your Bid',
      value: `${formatAmount(plaintext)} tokens`,
      highlight: true,
    },
    {
      label: 'Your Status',
      value: isClaimed ? '🏆 Winner — Claimed' : '🎯 Winner — Claim Available',
    },
    timeRemaining !== null && {
      label: 'Time Remaining',
      value: formatDuration(timeRemaining),
    },
    distribution && {
      label: 'Settlement',
      value: distribution.executed ? '✅ Settled' : '⏳ Pending settlement',
    },
  ].filter(Boolean);

  return (
    <div className="mt-5 p-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
        Your Auction Analytics
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className="space-y-0.5">
            <p className="text-white/35 text-xs">{label}</p>
            <p className={`text-sm font-semibold ${highlight ? 'text-emerald-300' : 'text-white/80'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
