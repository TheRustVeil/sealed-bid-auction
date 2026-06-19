import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { NetworkBadge } from '../../features/wallet/components/NetworkBadge';

function useScrollBehavior(threshold = 80) {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > threshold);
      // Hide when scrolling down past threshold, show when scrolling up
      if (y > threshold) {
        setVisible(y < lastY.current);
      } else {
        setVisible(true);
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return { visible, scrolled };
}

/*
 * ConfidentialDrop logomark:
 *   Shield = sealed / confidential / security
 *   Bold lock + keyhole = encrypted bids
 *   FHE rings = on-chain homomorphic settlement
 *   Violet → cyan gradient = project colour palette
 */
const CDLogo = () => (
  <div className="relative group-hover:scale-[1.04] transition-transform duration-300">
    {/* Hover glow */}
    <div
      className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.55) 0%, rgba(6,182,212,0.25) 65%, transparent 85%)' }}
    />

    {/* Glass tile */}
    <div
      className="relative w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(150deg, rgba(124,58,237,0.18) 0%, rgba(13,13,31,0.70) 55%, rgba(6,182,212,0.12) 100%)',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 10px 40px rgba(124,58,237,0.30), 0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* top-edge shine */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      {/* upper sheen */}
      <div className="absolute top-0 inset-x-0 h-2/5 bg-gradient-to-b from-white/[0.09] to-transparent pointer-events-none" />
      {/* bottom depth */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-black/30" />

      {/* ── Project logomark SVG ── */}
      <svg
        viewBox="0 0 80 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-11 h-12 relative z-10"
      >
        <defs>
          {/* Main shield gradient: violet top-left → cyan bottom-right */}
          <linearGradient id="cd-shield" x1="0" y1="0" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#9333EA" />
            <stop offset="48%"  stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>

          {/* Top-half gloss */}
          <linearGradient id="cd-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Inner ring subtle glow */}
          <radialGradient id="cd-ring-glow" cx="50%" cy="52%" r="50%">
            <stop offset="0%"   stopColor="rgba(167,139,250,0.18)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0)" />
          </radialGradient>
        </defs>

        {/* ── Shield body ── */}
        {/* Pentagon shield — wide top, converging to a rounded bottom point */}
        <path
          d="M40 4 L74 18 L74 52 Q74 76 40 88 Q6 76 6 52 L6 18 Z"
          fill="url(#cd-shield)"
        />
        {/* Top-half gloss overlay */}
        <path
          d="M40 4 L74 18 L74 48 L6 48 L6 18 Z"
          fill="url(#cd-gloss)"
        />
        {/* Shield outer border */}
        <path
          d="M40 4 L74 18 L74 52 Q74 76 40 88 Q6 76 6 52 L6 18 Z"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.5"
        />
        {/* Subtle inner inset border for depth */}
        <path
          d="M40 9 L69 21.5 L69 51 Q69 72 40 83 Q11 72 11 51 L11 21.5 Z"
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1"
        />

        {/* ── FHE encryption rings (concentric circles, faint) ── */}
        <circle cx="40" cy="53" r="28" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
        <circle cx="40" cy="53" r="21" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />

        {/* ── Lock shackle (the "sealed" arc) ── */}
        {/* Shadow/depth pass */}
        <path
          d="M26 52 L26 40 Q26 24 40 24 Q54 24 54 40 L54 52"
          stroke="rgba(0,0,0,0.30)"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Main shackle — bold white */}
        <path
          d="M26 52 L26 40 Q26 24 40 24 Q54 24 54 40 L54 52"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Lock body ── */}
        {/* Dark base */}
        <rect x="17" y="52" width="46" height="28" rx="7" fill="rgba(0,0,0,0.38)" />
        {/* White face */}
        <rect x="17" y="52" width="46" height="28" rx="7" fill="rgba(255,255,255,0.88)" />
        {/* Top inner shadow line */}
        <rect x="17" y="52" width="46" height="5" rx="4" fill="rgba(0,0,0,0.08)" />

        {/* ── Keyhole ── */}
        {/* Keyhole circle */}
        <circle cx="40" cy="62" r="6" fill="rgba(80,20,200,0.75)" />
        {/* Keyhole slot */}
        <rect x="37" y="65" width="6" height="9" rx="2" fill="rgba(80,20,200,0.75)" />

        {/* ── FHE node dots at shield vertices (subtle) ── */}
        <circle cx="40" cy="6"  r="2" fill="rgba(255,255,255,0.35)" />
        <circle cx="72" cy="19" r="1.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="72" cy="51" r="1.5" fill="rgba(6,182,212,0.50)" />
        <circle cx="8"  cy="19" r="1.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="8"  cy="51" r="1.5" fill="rgba(167,139,250,0.50)" />
      </svg>
    </div>
  </div>
);

const ChevronLeft = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Operator',       to: '/operator',              end: false },
  { label: 'Check Bid',      to: '/recipient',             end: true  },
  { label: 'My Allocations', to: '/recipient/allocations', end: false },
  { label: 'Discover',       to: '/discover',              end: false },
  { label: 'Profile',        to: '/profile',               end: false },
];

export function Navbar({ back }) {
  const navigate = useNavigate();
  const { visible, scrolled } = useScrollBehavior();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
    {/* Floating back-to-top button */}
    <AnimatePresence>
      {scrolled && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.85 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={scrollToTop}
          aria-label="Back to top"
          style={{
            position: 'fixed',
            bottom: 28,
            right: 24,
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 16px',
            borderRadius: 9999,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(6,182,212,0.7))',
            border: '1px solid rgba(167,139,250,0.4)',
            boxShadow: '0 4px 24px rgba(124,58,237,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            cursor: 'pointer',
            color: '#fff',
          }}
          whileHover={{ scale: 1.06, boxShadow: '0 6px 32px rgba(124,58,237,0.6), 0 0 0 1px rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Up arrow */}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>
            TOP
          </span>
        </motion.button>
      )}
    </AnimatePresence>

    <motion.header
      className="sticky top-0 z-50"
      animate={{ y: visible ? 0 : '-100%' }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: scrolled
          ? 'linear-gradient(180deg, rgba(13,13,31,0.95) 0%, rgba(13,13,31,0.88) 100%)'
          : 'linear-gradient(180deg, rgba(13,13,31,0.82) 0%, rgba(13,13,31,0.70) 100%)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: scrolled
          ? '0 1px 0 rgba(124,58,237,0.15), 0 8px 32px rgba(0,0,0,0.45)'
          : '0 1px 0 rgba(124,58,237,0.08), 0 4px 24px rgba(0,0,0,0.25)',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Subtle prismatic top edge */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.5) 30%, rgba(6,182,212,0.4) 70%, transparent 95%)' }}
      />

      <div className="px-6 py-4 flex items-center justify-between gap-6">
        {/* ── Left: logo + back crumb + nav ── */}
        <div className="flex items-center gap-6 min-w-0">
          {/* Back crumb */}
          {back && (
            <button
              onClick={() => navigate(back.to)}
              className="hidden sm:flex items-center gap-1 text-white/35 hover:text-white/70 text-xs font-medium transition-colors flex-shrink-0"
            >
              <ChevronLeft />
              {back.label}
            </button>
          )}

          {/* Logo + wordmark */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3.5 group flex-shrink-0"
          >
            <CDLogo />

            {/* Wordmark — desktop only */}
            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span
                className="font-black text-[17px] tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 30%, #c4b5fd 65%, #67e8f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ConfidentialDrop
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-violet-400" />
                <span className="text-[10px] font-semibold text-white/30 tracking-[0.18em] uppercase">
                  FHE Auction Protocol
                </span>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/[0.08] hidden lg:block" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="relative px-3.5 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150"
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.20), rgba(124,58,237,0.08))',
                            border: '1px solid rgba(124,58,237,0.25)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <span className={`relative z-10 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/75'}`}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ── Right: network + wallet ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <NetworkBadge />
          <ConnectButton />
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex lg:hidden items-center gap-0.5 px-6 pb-3 overflow-x-auto scrollbar-hide border-t border-white/[0.04]">
        {back && (
          <button
            onClick={() => navigate(back.to)}
            className="flex items-center gap-1 text-white/35 hover:text-white/70 text-xs font-medium transition-colors mr-3 flex-shrink-0 pt-2"
          >
            <ChevronLeft />
            {back.label}
          </button>
        )}
        {NAV_LINKS.map(({ label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'px-3 py-1.5 mt-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                isActive ? 'text-white bg-violet-500/15 border border-violet-500/25' : 'text-white/40 hover:text-white/70',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </motion.header>
    </>
  );
}
