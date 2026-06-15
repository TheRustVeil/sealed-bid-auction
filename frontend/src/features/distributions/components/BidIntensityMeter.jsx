const LEVELS = [
  {
    max: 5,
    label: 'Calm',
    icon: '🟢',
    textColor: 'text-emerald-400',
    bg: 'bg-emerald-900/40',
    border: 'border-emerald-500/30',
    barFrom: '#10b981',
    barTo: '#34d399',
    pct: 28,
    pulse: false,
  },
  {
    max: 15,
    label: 'Active',
    icon: '🟡',
    textColor: 'text-yellow-400',
    bg: 'bg-yellow-900/40',
    border: 'border-yellow-500/30',
    barFrom: '#f59e0b',
    barTo: '#fcd34d',
    pct: 65,
    pulse: false,
  },
  {
    max: Infinity,
    label: 'Critical',
    icon: '🔥',
    textColor: 'text-orange-400',
    bg: 'bg-orange-900/40',
    border: 'border-orange-500/30',
    barFrom: '#f97316',
    barTo: '#ef4444',
    pct: 100,
    pulse: true,
  },
];

export function BidIntensityMeter({ recipientCount = 0 }) {
  const count = Number(recipientCount);
  const level = LEVELS.find((l) => count <= l.max) ?? LEVELS[LEVELS.length - 1];

  return (
    <div
      className={`inline-flex flex-col gap-1 px-2 py-1 rounded-lg border backdrop-blur-sm ${level.bg} ${level.border}`}
    >
      <div className={`flex items-center gap-1 text-[10px] font-bold tracking-wide ${level.textColor}`}>
        <span>{level.icon}</span>
        <span>{level.label}</span>
      </div>
      <div className="w-14 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${level.pulse ? 'animate-pulse' : ''}`}
          style={{
            width: `${level.pct}%`,
            background: `linear-gradient(90deg, ${level.barFrom}, ${level.barTo})`,
            boxShadow: `0 0 6px ${level.barFrom}80`,
          }}
        />
      </div>
    </div>
  );
}
