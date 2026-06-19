import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { NetworkBadge } from '../../features/wallet/components/NetworkBadge';

const GlassLogo = () => (
  <div className="relative flex-shrink-0">
    {/* Ambient glow ring */}
    <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-violet-600/50 via-purple-500/30 to-cyan-500/25 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
    {/* Glass card */}
    <div className="relative w-12 h-12 rounded-xl border border-white/20 bg-white/[0.05] backdrop-blur-md flex items-center justify-center shadow-2xl shadow-violet-900/50 overflow-hidden">
      {/* Top-edge shine */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      {/* Upper-half sheen */}
      <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/[0.10] to-transparent pointer-events-none" />
      {/* Bottom-edge depth */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-black/30" />
      {/* The iridescent bolt icon from favicon */}
      <svg viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 relative z-10">
        <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
        <mask id="logo-mask" width="48" height="46" x="0" y="0" maskUnits="userSpaceOnUse" style={{maskType:'alpha'}}>
          <path fill="#000" d="M25.842 44.938c-.664.844-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.183c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.498 0-3.579-1.842-3.579H1.133c-.92 0-1.456-1.04-.92-1.787L9.91.473c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.578 1.842 3.578h11.377c.943 0 1.473 1.088.89 1.832L25.843 44.94z"/>
        </mask>
        <g mask="url(#logo-mask)">
          <g filter="url(#logo-b)"><ellipse cx="5.508" cy="14.704" fill="#ede6ff" rx="5.508" ry="14.704" transform="matrix(.00324 1 1 -.00324 -4.47 31.516)"/></g>
          <g filter="url(#logo-c)"><ellipse cx="10.399" cy="29.851" fill="#ede6ff" rx="10.399" ry="29.851" transform="matrix(.00324 1 1 -.00324 -39.328 7.883)"/></g>
          <g filter="url(#logo-d)"><ellipse cx="5.508" cy="30.487" fill="#7e14ff" rx="5.508" ry="30.487" transform="rotate(89.814 -25.913 -14.639)scale(1 -1)"/></g>
          <g filter="url(#logo-g)"><ellipse cx="14.072" cy="22.078" fill="#ede6ff" rx="14.072" ry="22.078" transform="rotate(93.35 24.506 48.493)scale(-1 1)"/></g>
          <g filter="url(#logo-j)"><ellipse cx=".387" cy="8.972" fill="#7e14ff" rx="4.407" ry="29.108" transform="rotate(39.51 .387 8.972)"/></g>
          <g filter="url(#logo-k)"><ellipse cx="47.523" cy="-6.092" fill="#7e14ff" rx="4.407" ry="29.108" transform="rotate(37.892 47.523 -6.092)"/></g>
          <g filter="url(#logo-l)"><ellipse cx="41.412" cy="6.333" fill="#47bfff" rx="5.971" ry="9.665" transform="rotate(37.892 41.412 6.333)"/></g>
          <g filter="url(#logo-p)"><ellipse cx="38.418" cy="32.4" fill="#47bfff" rx="5.971" ry="15.297" transform="rotate(37.892 38.418 32.4)"/></g>
        </g>
        <defs>
          <filter id="logo-b" width="60.045" height="41.654" x="-19.77" y="16.149" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="7.659"/></filter>
          <filter id="logo-c" width="90.34" height="51.437" x="-54.613" y="-7.533" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="7.659"/></filter>
          <filter id="logo-d" width="79.355" height="29.4" x="-49.64" y="2.03" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="logo-g" width="74.749" height="58.852" x="15.756" y="-17.901" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="7.659"/></filter>
          <filter id="logo-j" width="56.045" height="63.649" x="-27.636" y="-22.853" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="logo-k" width="54.814" height="64.646" x="20.116" y="-38.415" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="logo-l" width="33.541" height="35.313" x="24.641" y="-11.323" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
          <filter id="logo-p" width="39.409" height="43.623" x="18.713" y="10.588" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur" stdDeviation="4.596"/></filter>
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
  { label: 'Operator',      to: '/operator',              end: false },
  { label: 'Check Bid',     to: '/recipient',             end: true  },
  { label: 'My Allocations',to: '/recipient/allocations', end: false },
  { label: 'Discover',      to: '/discover',              end: false },
  { label: 'Profile',       to: '/profile',               end: false },
];

export function Navbar({ back }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-surface/75">
      <div className="px-5 py-3.5 flex items-center justify-between gap-4">
        {/* ── Left: logo + back crumb + nav ── */}
        <div className="flex items-center gap-5 min-w-0">
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

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <GlassLogo />
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="font-bold text-[15px] tracking-tight text-white/90 group-hover:text-white transition-colors">
                ConfidentialDrop
              </span>
              <span className="text-[10px] font-medium text-white/30 tracking-widest uppercase mt-0.5">
                Auction
              </span>
            </div>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08] hidden sm:block" />

          {/* Desktop nav — sliding pill via layoutId */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150"
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-lg bg-white/[0.08]"
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
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <NetworkBadge />
          <ConnectButton />
        </div>
      </div>

      {/* Mobile nav row — simple highlight, no layoutId (avoids cross-row conflict) */}
      <div className="flex sm:hidden items-center gap-0.5 px-5 pb-2 overflow-x-auto scrollbar-hide">
        {back && (
          <button
            onClick={() => navigate(back.to)}
            className="flex items-center gap-1 text-white/35 hover:text-white/70 text-xs font-medium transition-colors mr-2 flex-shrink-0"
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
                'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                isActive ? 'text-white bg-white/[0.08]' : 'text-white/40 hover:text-white/75',
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
