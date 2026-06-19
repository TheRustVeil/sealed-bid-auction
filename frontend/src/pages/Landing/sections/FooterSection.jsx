import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

const LINKS = {
  Product: [
    { label: 'Operator Dashboard', to: '/operator' },
    { label: 'Check Allocation', to: '/recipient' },
    { label: 'My Allocations', to: '/recipient/allocations' },
  ],
  Protocol: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Resources: [
    { label: 'Zama TFHE', href: 'https://www.zama.ai' },
    { label: 'Sepolia Faucet', href: 'https://sepoliafaucet.com' },
    { label: 'GitHub', href: 'https://github.com/TheRustVeil/sealed-bid-auction' },
  ],
  Legal: [
    { label: 'Disclaimer', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/TheRustVeil/sealed-bid-auction',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/RustVeilX',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Discord',
    href: 'https://discord.com/users/rustveilhq',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
      </svg>
    ),
  },
];

export function FooterSection() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <footer className="relative z-10 border-t border-white/[0.05] px-6 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* CTA band */}
        <div
          className="rounded-3xl p-px mb-16"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.2), rgba(124,58,237,0.1))' }}
        >
          <div
            className="rounded-3xl px-5 py-8 sm:px-10 sm:py-12 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(13,13,31,0.95) 60%)' }}
          >
            <h2 className="text-3xl font-bold text-white mb-3">Ready to deploy?</h2>
            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
              No backend, no trusted party. Deploy your first sealed-bid auction in minutes on Sepolia.
            </p>
            <button
              onClick={() => navigate('/operator')}
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 8px 24px rgba(124,58,237,0.2)',
              }}
            >
              Launch Auction <ArrowRight />
            </button>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
              >
                <BoltIcon />
              </div>
              <span className="font-bold text-[15px] tracking-tight">ConfidentialDrop</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed mb-5">
              Sealed-bid auction settlement with end-to-end TFHE encryption. Private bids, fair prices, trustless proofs.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/35 hover:text-white hover:border-white/20 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section} className="col-span-1">
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <button
                        onClick={() => navigate(l.to)}
                        className="text-white/35 hover:text-white text-sm transition-colors"
                      >
                        {l.label}
                      </button>
                    ) : (
                      <a
                        href={l.href}
                        className="text-white/35 hover:text-white text-sm transition-colors"
                        target={l.href?.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h4 className="text-white font-medium text-sm mb-1">Stay in the loop</h4>
            <p className="text-white/30 text-xs">Protocol updates, new features, and audit reports.</p>
          </div>
          {!submitted ? (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@protocol.xyz"
                className="flex-1 md:w-60 bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-px flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: '0 0 0 1px rgba(124,58,237,0.35)',
                }}
              >
                Subscribe
              </button>
            </form>
          ) : (
            <p className="text-emerald-400 text-sm font-medium">✓ You're subscribed!</p>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">© 2024 ConfidentialDrop. Built for the Zama hackathon.</p>
          <div className="flex items-center gap-4 text-white/15 text-xs">
            <span>Powered by Zama TFHE</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>Sepolia Testnet</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>ERC-20</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
