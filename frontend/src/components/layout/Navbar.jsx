import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { NetworkBadge } from '../../features/wallet/components/NetworkBadge';

/* ── Advanced iridescent bolt logo ── */
const AdvancedLogo = () => (
  <div className="relative group-hover:scale-[1.03] transition-transform duration-300">
    {/* Outer glow halo */}
    <div
      className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
      style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(6,182,212,0.3) 60%, transparent 80%)' }}
    />

    {/* Glass card */}
    <div
      className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(124,58,237,0.12) 50%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.25), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Top shine streak */}
      <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      {/* Upper sheen */}
      <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />
      {/* Bottom depth */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-black/25 rounded-b-2xl" />

      {/* Iridescent bolt — main icon */}
      <svg viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 relative z-10 drop-shadow-lg">
        <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
        <mask id="adv-logo-mask" width="48" height="46" x="0" y="0" maskUnits="userSpaceOnUse" style={{maskType:'alpha'}}>
          <path fill="#000" d="M25.842 44.938c-.664.844-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.183c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.498 0-3.579-1.842-3.579H1.133c-.92 0-1.456-1.04-.92-1.787L9.91.473c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.578 1.842 3.578h11.377c.943 0 1.473 1.088.89 1.832L25.843 44.94z"/>
        </mask>
        <g mask="url(#adv-logo-mask)">
          <g filter="url(#adv-b)"><ellipse cx="5.508" cy="14.704" fill="#ede6ff" rx="5.508" ry="14.704" transform="matrix(.00324 1 1 -.00324 -4.47 31.516)"/></g>
          <g filter="url(#adv-c)"><ellipse cx="10.399" cy="29.851" fill="#ede6ff" rx="10.399" ry="29.851" transform="matrix(.00324 1 1 -.00324 -39.328 7.883)"/></g>
          <g filter="url(#adv-d)"><ellipse cx="5.508" cy="30.487" fill="#7e14ff" rx="5.508" ry="30.487" transform="rotate(89.814 -25.913 -14.639)scale(1 -1)"/></g>
          <g filter="url(#adv-g)"><ellipse cx="14.072" cy="22.078" fill="#ede6ff" rx="14.072" ry="22.078" transform="rotate(93.35 24.506 48.493)scale(-1 1)"/></g>
          <g filter="url(#adv-j)"><ellipse cx=".387" cy="8.972" fill="#7e14ff" rx="4.407" ry="29.108" transform="rotate(39.51 .387 8.972)"/></g>
          <g filter="url(#adv-k)"><ellipse cx="47.523" cy="-6.092" fill="#7e14ff" rx="4.407" ry="29.108" transform="rotate(37.892 47.523 -6.092)"/></g>
          <g filter="url(#adv-l)"><ellipse cx="41.412" cy="6.333" fill="#47bfff" rx="5.971" ry="9.665" transform="rotate(37.892 41.412 6.333)"/></g>
          <g filter="url(#adv-p)"><ellipse cx="38.418" cy="32.4" fill="#47bfff" rx="5.971" ry="15.297" transform="rotate(37.892 38.418 32.4)"/></g>
        </g>
        <defs>
          <filter id="adv-b" width="60.045" height="41.654" x="-19.77" y="16.149" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="7.659"/></filter>
          <filter id="adv-c" width="90.34" height="51.437" x="-54.613" y="-7.533" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="7.659"/></filter>
          <filter id="adv-d" width="79.355" height="29.4" x="-49.64" y="2.03" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="adv-g" width="74.749" height="58.852" x="15.756" y="-17.901" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="7.659"/></filter>
          <filter id="adv-j" width="56.045" height="63.649" x="-27.636" y="-22.853" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="adv-k" width="54.814" height="64.646" x="20.116" y="-38.415" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="adv-l" width="33.541" height="35.313" x="24.641" y="-11.323" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="adv-p" width="39.409" height="43.623" x="18.713" y="10.588" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
        </defs>
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

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        /* Glass morphism — ONLY on the navbar */
        background: 'linear-gradient(180deg, rgba(13,13,31,0.82) 0%, rgba(13,13,31,0.70) 100%)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 0 rgba(124,58,237,0.08), 0 4px 24px rgba(0,0,0,0.25)',
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
            <AdvancedLogo />

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
    </header>
  );
}
