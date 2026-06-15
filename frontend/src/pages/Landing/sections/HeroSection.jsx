import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowRight = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const BIDS = [
  { addr: '0x1a2b…9f0e', color: 'text-violet-400' },
  { addr: '0x3c4d…1a2b', color: 'text-cyan-400' },
  { addr: '0x5e6f…3c4d', color: 'text-emerald-400' },
  { addr: '0x7g8h…5e6f', color: 'text-orange-400' },
];

const SETTLED = [
  { addr: '0x1a2b…9f0e', amount: '150 USDC', color: 'text-violet-400' },
  { addr: '0x3c4d…1a2b', amount: '200 USDC', color: 'text-cyan-400' },
  { addr: '0x5e6f…3c4d', amount: '175 USDC', color: 'text-emerald-400' },
  { addr: '0x7g8h…5e6f', amount: '125 USDC', color: 'text-orange-400' },
];

/* Cycles through: collecting → settling → complete → reset */
function AuctionTerminal() {
  const [phase, setPhase] = useState(0); // 0=collecting, 1=settling, 2=complete

  useEffect(() => {
    const delays = [2800, 1200, 2500];
    const timer = setTimeout(() => setPhase((p) => (p + 1) % 3), delays[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-panel/70 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-surface/60">
        <span className="w-3 h-3 rounded-full bg-red-400/50" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/50" />
        <span className="w-3 h-3 rounded-full bg-emerald-400/50" />
        <span className="ml-3 text-white/25 text-xs font-mono">confidential-drop — settlement</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400/70 text-[10px] font-mono">live</span>
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-4 font-mono text-xs space-y-2 min-h-[220px]">
        <div className="text-white/30">
          {'> '}<span className="text-white/60">Contract:</span>{' '}
          <span className="text-violet-400">0x3C4D…DISPERSE</span>
        </div>
        <div className="text-white/30">
          {'> '}<span className="text-white/60">Token:</span>{' '}
          <span className="text-cyan-400">0x705F…USDC</span>
        </div>
        <div className="mt-3 text-white/20">─────────────────────────────</div>

        {phase === 0 && (
          <div className="space-y-2">
            <div className="text-yellow-400/70 flex items-center gap-2">
              <span className="animate-pulse">◉</span> Collecting encrypted bids…
            </div>
            {BIDS.map((b, i) => (
              <div key={b.addr} className="flex items-center justify-between gap-4 opacity-0"
                style={{ animation: `fadeIn 0.4s ease ${i * 0.15}s forwards` }}>
                <span className={b.color}>{b.addr}</span>
                <span className="text-white/20 bg-white/5 rounded px-2 py-0.5 border border-white/8">
                  [ENCRYPTED]
                </span>
              </div>
            ))}
          </div>
        )}

        {phase === 1 && (
          <div className="space-y-3">
            <div className="text-violet-400/80 flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
              TFHE co-processor decrypting…
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                style={{ animation: 'progressBar 1.1s ease-in forwards' }}
              />
            </div>
            <div className="text-white/25 text-[10px]">Verifying FHE proof on-chain…</div>
          </div>
        )}

        {phase === 2 && (
          <div className="space-y-2">
            <div className="text-emerald-400 flex items-center gap-2 font-semibold">
              <CheckIcon /> Settlement complete
            </div>
            {SETTLED.map((b, i) => (
              <div key={b.addr} className="flex items-center justify-between gap-4 opacity-0"
                style={{ animation: `fadeIn 0.35s ease ${i * 0.12}s forwards` }}>
                <span className={b.color}>{b.addr}</span>
                <span className="text-white/70">→ <span className="text-white font-semibold">{b.amount}</span></span>
                <CheckIcon />
              </div>
            ))}
            <div className="mt-2 text-white/20 text-[10px]">Proof pinned: 0xfe12…8a3b</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* ── Left: copy ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-chip border border-violet-500/25 bg-violet-500/8 text-violet-300 text-xs font-medium mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Sealed-Bid Auction Protocol · Powered by Zama TFHE
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-black tracking-tight leading-[1.05] mb-6">
              <span className="block text-white">Private Bids.</span>
              <span
                className="block"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Fair Prices.
              </span>
              <span className="block text-white">Zero Knowledge.</span>
            </h1>

            <p className="text-[17px] text-white/45 leading-relaxed mb-8 max-w-lg">
              The first token distribution protocol where every winner pays their exact private bid.
              {' '}<span className="text-white/75 font-medium">
                Encrypted end-to-end with TFHE — no one ever sees what others paid.
              </span>
            </p>

            {/* Trust points */}
            <div className="flex flex-col gap-2 mb-10">
              {[
                'Bids encrypted client-side before submission',
                'Operator never sees plaintext amounts',
                'Settlement proven on-chain via FHE',
              ].map((p) => (
                <div key={p} className="flex items-center gap-2.5 text-sm text-white/50">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <CheckIcon />
                  </span>
                  {p}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/operator')}
                className="group flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 8px 24px rgba(124,58,237,0.25)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124,58,237,0.6), 0 12px 32px rgba(124,58,237,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124,58,237,0.4), 0 8px 24px rgba(124,58,237,0.25)'; }}
              >
                Launch Auction
                <span className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight />
                </span>
              </button>

              <button
                onClick={() => navigate('/recipient')}
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white/65 border border-white/10 bg-white/[0.04] hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-white transition-all hover:-translate-y-0.5"
              >
                Check My Allocation
                <span className="group-hover:translate-x-0.5 transition-transform opacity-60 group-hover:opacity-100">
                  <ArrowRight />
                </span>
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-2">
                {['V', 'S', 'K', 'M'].map((l, i) => (
                  <div
                    key={l}
                    className="w-7 h-7 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white"
                    style={{
                      background: ['#7C3AED','#06B6D4','#10B981','#F59E0B'][i],
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs">
                Trusted by <span className="text-white/60 font-semibold">50+</span> Web3 teams
              </p>
            </div>
          </div>

          {/* ── Right: animated terminal ── */}
          <div className="relative">
            <div
              className="absolute inset-0 -m-8 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
            />
            <div className="relative animate-float">
              <AuctionTerminal />
            </div>
            {/* Floating stat chips */}
            <div
              className="absolute -bottom-4 -left-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-panel/90 backdrop-blur text-xs shadow-xl"
              style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '0.5s' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/60">0 bids exposed</span>
            </div>
            <div
              className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-panel/90 backdrop-blur text-xs shadow-xl"
              style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '1s' }}
            >
              <span className="text-violet-400 font-mono font-bold">TFHE</span>
              <span className="text-white/40">encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
