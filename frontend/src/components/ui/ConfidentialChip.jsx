import { useState, useEffect, useRef } from 'react';

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 shrink-0">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5V4.5a2 2 0 1 0-4 0V6h4Z" clipRule="evenodd" />
  </svg>
);

const UnlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 shrink-0">
    <path fillRule="evenodd" d="M8 1a2.5 2.5 0 0 0-2.5 2.5V6H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1.5V3.5A1.5 1.5 0 0 1 12 2a.5.5 0 0 0 0-1 2.5 2.5 0 0 0-2.5 2.5V6H6V3.5A2 2 0 0 1 8 1.5V1z" clipRule="evenodd" />
  </svg>
);

export function ConfidentialChip({ value, label = 'Confidential', revealed = false, className = '' }) {
  const [glitching, setGlitching] = useState(false);
  const prevRevealed = useRef(revealed);

  useEffect(() => {
    if (revealed && !prevRevealed.current) {
      setGlitching(true);
      const t = setTimeout(() => setGlitching(false), 350);
      prevRevealed.current = true;
      return () => clearTimeout(t);
    }
    if (!revealed) prevRevealed.current = false;
  }, [revealed]);

  if (revealed && value != null) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-chip px-2.5 py-0.5 text-xs font-mono font-medium bg-green-900/40 text-green-400 border border-green-500/20 ${glitching ? 'animate-glitch' : ''} ${className}`}
      >
        <UnlockIcon />
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-chip px-2.5 py-0.5 text-xs font-medium bg-confidential/20 text-confidential-light border border-confidential/40 ${className}`}>
      <LockIcon />
      {label}
    </span>
  );
}
