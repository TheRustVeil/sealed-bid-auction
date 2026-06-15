import { useInView } from '../../../hooks/useInView';

const FEATURES = [
  {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(124,58,237,0.15)',
    border: 'hover:border-violet-500/30',
    tag: 'TFHE',
    title: 'End-to-end Encryption',
    desc: 'Every bid is sealed with Zama TFHE before leaving your browser. The contract receives only ciphertext — the cleartext price never touches the wire.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    gradient: 'from-cyan-500 to-teal-500',
    glow: 'rgba(6,182,212,0.12)',
    border: 'hover:border-cyan-500/30',
    tag: 'ERC-20',
    title: 'Exact Price Settlement',
    desc: 'No uniform clearing price. Each winner receives tokens at precisely their sealed bid — the deal they committed to, nothing more, nothing less.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99.203 1.99.377 3 .52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 5.491z" />
      </svg>
    ),
  },
  {
    gradient: 'from-emerald-500 to-green-500',
    glow: 'rgba(16,185,129,0.12)',
    border: 'hover:border-emerald-500/30',
    tag: 'Sepolia',
    title: 'On-chain Verifiable',
    desc: 'The FHE co-processor decrypts inside the EVM. Any observer can independently verify the settlement outcome without ever learning individual bids.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    gradient: 'from-orange-500 to-amber-500',
    glow: 'rgba(249,115,22,0.12)',
    border: 'hover:border-orange-500/30',
    tag: 'Gas',
    title: 'Gas Optimized Disperse',
    desc: 'Batched ERC-20 transfers via ConfidentialDisperse settle thousands of recipients in a single transaction, minimizing gas cost for operators.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    gradient: 'from-pink-500 to-rose-500',
    glow: 'rgba(236,72,153,0.12)',
    border: 'hover:border-pink-500/30',
    tag: 'RBAC',
    title: 'Auditor Access Control',
    desc: 'Operators can grant specific wallet addresses permission to decrypt all allocations via grantDecryptAccess — without exposing data to everyone.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'rgba(99,102,241,0.12)',
    border: 'hover:border-blue-500/30',
    tag: 'SDK',
    title: 'Client-side Key Derivation',
    desc: 'The Zama SDK derives your encryption key from a wallet signature — no key management, no backend, no trust required from any third party.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  const [ref, inView] = useInView(0.08);

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 uppercase tracking-[0.2em] font-semibold mb-3">Protocol properties</p>
          <h2 className="text-4xl font-bold text-white mb-4">Built different</h2>
          <p className="text-white/35 text-[15px] max-w-lg mx-auto leading-relaxed">
            Six guarantees that make ConfidentialDrop the only honest token distribution protocol.
          </p>
        </div>

        {/* Grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`group relative p-6 rounded-2xl border border-white/[0.06] bg-panel/50 backdrop-blur-sm transition-all duration-700 hover:-translate-y-1 cursor-default ${f.border}`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 80}ms`,
                transitionProperty: 'opacity, transform, border-color, box-shadow',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${f.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Top accent */}
              <div
                className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-full`}
              />

              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                {f.icon}
              </div>

              {/* Tag */}
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-white/5 text-white/30 mb-3">
                {f.tag}
              </span>

              <h3 className="text-white font-bold text-[15px] mb-2">{f.title}</h3>
              <p className="text-white/38 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
