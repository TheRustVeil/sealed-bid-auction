import { Button } from '../../../../components/ui';

const TYPES = [
  {
    id: 'disperse',
    title: 'Confidential Disperse',
    description:
      'Push tokens to all recipients in one transaction. Amounts are encrypted — no one sees what others received.',
  },
  {
    id: 'airdrop',
    title: 'Confidential Airdrop',
    description:
      'Recipients claim their own allocation. Each claim is privately authorized by the operator.',
  },
];

const PRIVACY_MODES = [
  {
    id: 'fully-confidential',
    label: 'Fully Confidential',
    desc: 'No amounts revealed after settlement. Maximum privacy.',
  },
  {
    id: 'reveal-winner',
    label: 'Reveal Winner Only',
    desc: 'Winning address is disclosed after settlement; amounts stay private.',
  },
  {
    id: 'reveal-highest-bid',
    label: 'Reveal Highest Bid After End',
    desc: 'Top bid amount is published after settlement for transparency.',
  },
];

export function StepType({ type, setType, label, setLabel, privacyMode, setPrivacyMode, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Distribution type</h2>
        <p className="text-gray-400 mt-1 text-sm">Choose how tokens will reach recipients.</p>
      </div>

      <div className="space-y-3">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`w-full text-left p-4 rounded-xl border transition-colors ${
              type === t.id
                ? 'border-confidential bg-confidential/10'
                : 'border-white/10 bg-panel hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">{t.title}</p>
              {type === t.id && <span className="text-confidential text-sm font-bold">✓</span>}
            </div>
            <p className="text-gray-400 text-sm mt-1">{t.description}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Distribution label (optional)</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Auction Round 1"
          className="w-full bg-panel border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-confidential"
        />
      </div>

      {/* Privacy Mode selector */}
      <div>
        <label className="block text-white/60 text-sm font-medium mb-2">
          Privacy mode
        </label>
        <p className="text-white/30 text-xs mb-3">
          Controls what, if anything, is publicly revealed after settlement.
        </p>
        <div className="space-y-2">
          {PRIVACY_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setPrivacyMode(m.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                privacyMode === m.id
                  ? 'border-violet-500/50 bg-violet-500/[0.08]'
                  : 'border-white/[0.08] bg-panel/40 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-white font-medium text-sm">{m.label}</p>
                {privacyMode === m.id && (
                  <span className="text-violet-400 text-sm font-bold">✓</span>
                )}
              </div>
              <p className="text-white/35 text-xs mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Next →</Button>
      </div>
    </div>
  );
}
