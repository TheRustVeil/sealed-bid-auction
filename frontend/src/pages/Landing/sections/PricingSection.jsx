import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '../../../hooks/useInView';

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const PLANS = [
  {
    name: 'Open',
    monthly: 0,
    annually: 0,
    desc: 'Perfect for early-stage teams running their first private auction.',
    highlight: false,
    features: [
      'Up to 100 recipients',
      'Single ERC-20 token',
      'TFHE encryption',
      'On-chain settlement proof',
      'Community support',
      'Sepolia testnet',
    ],
    cta: 'Deploy Free',
    ctaVariant: 'outline',
  },
  {
    name: 'Protocol',
    monthly: 99,
    annually: 79,
    desc: 'For growing protocols running regular token distributions.',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Up to 5,000 recipients',
      'Multi-token distributions',
      'Auditor access control',
      'Priority gas optimization',
      'Private CSV import',
      'Email + Discord support',
    ],
    cta: 'Start Protocol',
    ctaVariant: 'primary',
  },
  {
    name: 'Enterprise',
    monthly: null,
    annually: null,
    desc: 'For large protocols, DAOs, and funds with custom requirements.',
    highlight: false,
    features: [
      'Unlimited recipients',
      'White-label deployment',
      'Custom network support',
      'SLA guarantees',
      'Dedicated engineering',
      'Audit report included',
    ],
    cta: 'Contact Us',
    ctaVariant: 'outline',
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();
  const [ref, inView] = useInView(0.08);

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs text-violet-400 uppercase tracking-[0.2em] font-semibold mb-3">Pricing</p>
          <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-white/35 text-[15px] max-w-md mx-auto mb-8">
            Start free. Scale as your distribution grows. No hidden fees, no surprises.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03]">
            <span className={`text-sm font-medium transition-colors ${!annual ? 'text-white' : 'text-white/35'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-10 h-5 rounded-chip bg-violet-600/30 border border-violet-500/30 transition-colors"
              style={annual ? { background: 'rgba(124,58,237,0.6)', borderColor: 'rgba(124,58,237,0.5)' } : {}}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: annual ? '20px' : '2px' }}
              />
            </button>
            <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${annual ? 'text-white' : 'text-white/35'}`}>
              Annual
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                −20%
              </span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              className="relative flex flex-col rounded-2xl p-px transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 100}ms`,
                background: p.highlight
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(6,182,212,0.3))'
                  : 'rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="relative flex flex-col flex-1 rounded-2xl p-6"
                style={{
                  background: p.highlight
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(13,13,31,0.98) 60%)'
                    : 'rgba(13,13,31,0.85)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Popular badge */}
                {p.badge && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-chip text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {p.badge}
                  </div>
                )}

                {/* Plan name + price */}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-lg mb-1">{p.name}</h3>
                  <p className="text-white/35 text-sm mb-5 leading-relaxed">{p.desc}</p>
                  <div className="flex items-end gap-1">
                    {p.monthly === null ? (
                      <span className="text-4xl font-black text-white">Custom</span>
                    ) : p.monthly === 0 ? (
                      <span className="text-4xl font-black text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-white/40 text-xl font-bold mb-1">$</span>
                        <span className="text-4xl font-black text-white tabular-nums">
                          {annual ? p.annually : p.monthly}
                        </span>
                        <span className="text-white/35 text-sm mb-1">/mo</span>
                      </>
                    )}
                  </div>
                  {p.monthly !== null && p.monthly !== 0 && annual && (
                    <p className="text-white/30 text-xs mt-1">Billed annually</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/55">
                      <span className="text-emerald-400 mt-px"><CheckIcon /></span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => navigate(p.name === 'Enterprise' ? '/' : '/operator')}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-px"
                  style={p.highlight ? {
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                    color: 'white',
                    boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 4px 16px rgba(124,58,237,0.2)',
                  } : {
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/25 text-xs mt-8">
          All plans include TFHE encryption, on-chain settlement, and Sepolia testnet support. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
