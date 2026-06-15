import { Pill } from '../../../components/ui';

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

export function DistributionCard({ distribution, onClick }) {
  const { label, type, recipientCount, executed, createdAt } = distribution;

  const date = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const count = recipientCount != null ? recipientCount.toString() : '—';
  const initial = (label ?? 'U')[0].toUpperCase();

  return (
    <div
      className="group flex items-center justify-between px-5 py-4 rounded-2xl border border-white/[0.06] bg-panel/50 hover:border-violet-500/25 hover:bg-violet-500/[0.04] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-lg"
      style={{ '--tw-shadow': '0 4px 20px rgba(124,58,237,0.08)' }}
      onClick={onClick}
    >
      {/* Left: avatar + info */}
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-violet-300 border border-violet-500/20 bg-violet-500/10 group-hover:border-violet-500/40 transition-colors"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{label ?? 'Unnamed'}</p>
          <p className="text-white/35 text-xs mt-0.5">
            {count} recipient{count !== '1' ? 's' : ''} · {date}
          </p>
        </div>
      </div>

      {/* Right: pills + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <Pill variant="confidential">{type ?? 'disperse'}</Pill>
        {executed !== undefined && (
          <Pill variant={executed ? 'success' : 'warning'}>
            {executed ? 'settled' : 'pending'}
          </Pill>
        )}
        <span className="ml-1 text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all">
          <ArrowIcon />
        </span>
      </div>
    </div>
  );
}
