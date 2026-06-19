import { useInView } from '../../../hooks/useInView';

const STACK = [
  {
    name: 'Zama fhEVM',
    sub: 'FHE co-processor',
    color: '#7C3AED',
    border: 'rgba(124,58,237,0.3)',
    bg: 'rgba(124,58,237,0.08)',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <rect width="32" height="32" rx="8" fill="rgba(124,58,237,0.15)" />
        <path d="M8 10h16M8 16h10M8 22h13" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="22" r="3.5" fill="#7C3AED" />
        <circle cx="24" cy="22" r="1.5" fill="white" />
      </svg>
    ),
  },
  {
    name: 'Sepolia',
    sub: 'EVM testnet',
    color: '#627EEA',
    border: 'rgba(98,126,234,0.3)',
    bg: 'rgba(98,126,234,0.08)',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <rect width="32" height="32" rx="8" fill="rgba(98,126,234,0.15)" />
        <path d="M16 6l7.5 9.5-7.5 4.5-7.5-4.5L16 6z" fill="#627EEA" opacity="0.8" />
        <path d="M16 22l7.5-6.5-7.5 4.5-7.5-4.5L16 22z" fill="#627EEA" />
        <path d="M16 22v4l7.5-10.5L16 22z" fill="#627EEA" opacity="0.6" />
        <path d="M16 26v-4l-7.5-6.5L16 26z" fill="#627EEA" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'OpenZeppelin',
    sub: 'ERC-20 + access control',
    color: '#4E5EE4',
    border: 'rgba(78,94,228,0.3)',
    bg: 'rgba(78,94,228,0.08)',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <rect width="32" height="32" rx="8" fill="rgba(78,94,228,0.15)" />
        <path d="M16 7c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="#4E5EE4" />
        <circle cx="16" cy="16" r="3" fill="white" opacity="0.9" />
      </svg>
    ),
  },
  {
    name: 'Hardhat',
    sub: 'Contract development',
    color: '#F0C000',
    border: 'rgba(240,192,0,0.3)',
    bg: 'rgba(240,192,0,0.07)',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <rect width="32" height="32" rx="8" fill="rgba(240,192,0,0.1)" />
        <path d="M6 20s4-8 10-8 10 8 10 8H6z" fill="#F0C000" opacity="0.8" />
        <rect x="10" y="13" width="12" height="3" rx="1.5" fill="#F0C000" />
        <rect x="13" y="10" width="6" height="4" rx="2" fill="#F0C000" opacity="0.6" />
        <rect x="4" y="20" width="24" height="3" rx="1.5" fill="#F0C000" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'wagmi + viem',
    sub: 'Web3 React hooks',
    color: '#06B6D4',
    border: 'rgba(6,182,212,0.3)',
    bg: 'rgba(6,182,212,0.08)',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <rect width="32" height="32" rx="8" fill="rgba(6,182,212,0.12)" />
        <path d="M8 20l4-8 4 5 4-9 4 12" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'React + Vite',
    sub: 'Frontend framework',
    color: '#10B981',
    border: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.08)',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <rect width="32" height="32" rx="8" fill="rgba(16,185,129,0.12)" />
        <circle cx="16" cy="16" r="4" fill="none" stroke="#10B981" strokeWidth="2" />
        <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#10B981" strokeWidth="1.5" />
        <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#10B981" strokeWidth="1.5" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#10B981" strokeWidth="1.5" transform="rotate(120 16 16)" />
      </svg>
    ),
  },
];

export function TechStackBar() {
  const [ref, inView] = useInView(0.1);

  return (
    <section className="relative z-10 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <p className="text-center text-xs text-white/20 uppercase tracking-[0.25em] font-semibold mb-8">
          Built on battle-tested infrastructure
        </p>

        {/* Stack chips */}
        <div
          ref={ref}
          className="flex flex-wrap justify-center gap-3"
        >
          {STACK.map((s, i) => (
            <div
              key={s.name}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all duration-700 cursor-default"
              style={{
                border: `1px solid ${s.border}`,
                background: s.bg,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(12px)',
                transitionDelay: `${i * 70}ms`,
                transitionProperty: 'opacity, transform',
              }}
            >
              {s.icon}
              <div>
                <div className="text-white font-semibold text-[12px] leading-tight">{s.name}</div>
                <div className="text-white/30 text-[10px] leading-tight">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Zama attribution bar */}
        <div className="mt-8 flex justify-center">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-white/50 text-xs">Powered by</span>
            <span
              className="text-sm font-bold tracking-wide"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Zama fhEVM + @fhevm/solidity@0.11
            </span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/35 text-xs font-mono">ERC-7984</span>
          </div>
        </div>
      </div>
    </section>
  );
}
