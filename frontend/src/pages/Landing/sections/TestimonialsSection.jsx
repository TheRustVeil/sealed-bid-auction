import { useInView } from '../../../hooks/useInView';

const STARS = Array(5).fill(null);

const TESTIMONIALS = [
  {
    quote: "We ran our entire Series A SAFT distribution using ConfidentialDrop. Investors couldn't see each other's allocations — it completely eliminated the negotiation drama we'd had in every previous round.",
    name: 'Marcus Chen',
    role: 'CEO',
    company: 'ProtocolXYZ',
    initials: 'MC',
    color: 'from-violet-500 to-purple-600',
    rating: 5,
  },
  {
    quote: "The TFHE encryption is a genuine game-changer. We've evaluated every token distribution tool on the market and ConfidentialDrop is the only one that actually keeps bid data private during the auction window.",
    name: 'Sarah Kim',
    role: 'General Partner',
    company: 'CryptoVentures',
    initials: 'SK',
    color: 'from-cyan-500 to-teal-600',
    rating: 5,
  },
  {
    quote: "Set up our genesis community drop in 20 minutes. The operator dashboard is intuitive and the on-chain proof made it trivially easy for recipients to verify fairness. No complaints from 1,200 participants.",
    name: 'David Park',
    role: 'CTO',
    company: 'DeFi Startup',
    initials: 'DP',
    color: 'from-emerald-500 to-green-600',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [ref, inView] = useInView(0.08);

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 uppercase tracking-[0.2em] font-semibold mb-3">Social proof</p>
          <h2 className="text-4xl font-bold text-white mb-4">Trusted by Web3 teams</h2>
          <p className="text-white/35 text-[15px] max-w-md mx-auto">
            From seed rounds to community airdrops — protocols rely on ConfidentialDrop for fair, private settlement.
          </p>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="relative p-6 rounded-2xl border border-white/[0.07] bg-panel/50 backdrop-blur-sm flex flex-col transition-all duration-700 hover:-translate-y-1 hover:border-white/[0.12]"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 120}ms`,
                transitionProperty: 'opacity, transform, border-color',
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {STARS.map((_, si) => (
                  <svg key={si} viewBox="0 0 20 20" fill="#FBBF24" className="w-4 h-4">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-white/55 text-sm leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-white/35 text-xs">{t.role} · {t.company}</div>
                </div>
              </div>

              {/* Subtle top border accent */}
              <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${t.color} opacity-30 rounded-full`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
