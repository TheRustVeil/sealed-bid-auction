import { NavLink, useNavigate } from 'react-router-dom';
import { ConnectButton } from '../../features/wallet/components/ConnectButton';
import { NetworkBadge } from '../../features/wallet/components/NetworkBadge';

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const ChevronLeft = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
  </svg>
);

/*
 * NAV_LINKS:
 *  - end=false  → active for the path AND any deeper route
 *  - end=true   → active only on exact path
 */
const NAV_LINKS = [
  { label: 'Operator', to: '/operator', end: false },
  { label: 'Check Bid', to: '/recipient', end: true },
  { label: 'My Allocations', to: '/recipient/allocations', end: false },
  { label: 'Discover', to: '/discover', end: false },
  { label: 'Profile', to: '/profile', end: false },
];

/**
 * Shared sticky navbar used on every page.
 *
 * Props:
 *   back  – { label, to }  →  shows a back-chevron breadcrumb before the logo
 */
export function Navbar({ back }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-surface/75">
      <div className="px-5 py-3.5 flex items-center justify-between gap-4">
        {/* ── Left: logo + back crumb + nav ── */}
        <div className="flex items-center gap-5 min-w-0">
          {/* Back crumb (optional) */}
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
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
            >
              <BoltIcon />
            </div>
            <span className="font-bold text-[14px] tracking-tight text-white/80 group-hover:text-white transition-colors hidden sm:block">
              ConfidentialDrop
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08] hidden sm:block" />

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-white/40 hover:text-white/75 hover:bg-white/[0.05]',
                  ].join(' ')
                }
              >
                {label}
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

      {/* Mobile nav row */}
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
                isActive
                  ? 'text-white bg-white/[0.08]'
                  : 'text-white/40 hover:text-white/75',
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
