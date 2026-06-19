import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ── Brand icons ───────────────────────────────────────────────────────────────

const MetaMaskSVG = () => (
  <svg viewBox="0 0 212 189" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M201.7 4L121.5 63.5l15-35.4L201.7 4z" fill="#E2761B" stroke="#E2761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.3 4l79.5 60.1-14.3-35.6L10.3 4z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M172.3 136.6l-21.3 32.7 45.6 12.5 13.1-44.4-37.4-.8z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.3 137.4l13 44.4 45.6-12.5-21.3-32.7-37.3.8z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M58.3 83.4l-12.6 19 44.9 2-1.6-48.2-30.7 27.2z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M153.7 83.4l-31.2-27.8-1 48.8 44.9-2-12.7-19z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60.9 169.3l27-13.2-23.2-18.1-3.8 31.3z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M124.1 156.1l27 13.2-3.8-31.3-23.2 18.1z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M151.1 169.3l-27-13.2 2.1 17.5-.2 7-24.9-24.5 24.9-24.5.2 7-2.1 17.5 27-13.2-3.8 26.4z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60.9 169.3l3.8-26.4 27 13.2-2.1-17.5.2-7-24.9 24.5 24.9 24.5-.2-7 2.1-17.5-27 13.2z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M106 85.7l-44.9 2 12.6 41.5 14.8-25.5 17.5 0z" fill="#CD6116" stroke="#CD6116" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M106 85.7l17.5 0 14.8 25.5 12.6-41.5-44.9-2z" fill="#CD6116" stroke="#CD6116" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M61.1 87.7l23.2 18.1 3.5-16.2-26.7-1.9z" fill="#E4751F" stroke="#E4751F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M150.9 87.7l-26.7 1.9 3.5 16.2 23.2-18.1z" fill="#E4751F" stroke="#E4751F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M61.1 87.7l-3.8 31.3 4.7-31.3z" fill="#D75E0C" stroke="#D75E0C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M150.9 87.7l.4 31.3-4.2-31.3z" fill="#D75E0C" stroke="#D75E0C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M87.7 103.6l-3.4-16.2-22 5.9 25.4 10.3z" fill="#233447" stroke="#233447" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M124.3 103.6l25.4-10.3-22-5.9-3.4 16.2z" fill="#233447" stroke="#233447" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M61.1 87.7l-4.7 31.3 3.3-.4 27.3-15.5-3.5-16.2-22.4.8z" fill="#CD6116" stroke="#CD6116" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M150.9 87.7l-22.4-.8-3.5 16.2 27.3 15.5 3.3.4-4.7-31.3z" fill="#CD6116" stroke="#CD6116" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M62.1 127.7l24.9-24.5-23.2-15.5-1.7 40z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M149.9 127.7l1.7-40-23.2 15.5 21.5 24.5z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M62.1 127.7l23.8-3.1-20.6-21.4-3.2 24.5z" fill="#F6851B" stroke="#F6851B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M124.1 124.6l23.8 3.1-3.2-24.5-20.6 21.4z" fill="#F6851B" stroke="#F6851B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60.9 169.3l3.8-31.3-26.4 12.5 22.6 18.8z" fill="#C0AD9E" stroke="#C0AD9E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M147.3 138l3.8 31.3 22.6-18.8-26.4-12.5z" fill="#C0AD9E" stroke="#C0AD9E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M124.1 156.1l-18.1-17.8-18.1 17.8 18.1 18.2 18.1-18.2z" fill="#161616" stroke="#161616" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M87.9 124.6l-25.8 3.1 22.3 28.4 3.5-31.5z" fill="#763D16" stroke="#763D16" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M124.1 124.6l3.5 31.5 22.3-28.4-25.8-3.1z" fill="#763D16" stroke="#763D16" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M106 85.7l-17.5 0 17.5 32.7 17.5-32.7-17.5 0z" fill="#F6851B" stroke="#F6851B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M87.7 103.6l-25.6 24.1 23.8-3.1-18.2-21z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M124.3 103.6l-18.2 21 23.8 3.1-25.6-24.1z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M106 118.4l-18.3 6.2 18.3 31.5 18.3-31.5-18.3-6.2z" fill="#F6851B" stroke="#F6851B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M87.7 124.6l18.3-6.2-17.5-32.7-25.4 10.3 24.6 28.6z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M124.3 124.6l24.6-28.6-25.4-10.3-17.5 32.7 18.3 6.2z" fill="#E4761B" stroke="#E4761B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BraveSVG = () => (
  <svg viewBox="0 0 57 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M55.3 20.5L57 14.6l-1.8-5.7-3.2.9-1.7-1.6.4-3.3L45.9.3 43.5 3.6l-2.4-.3L39.4.3 28.5 3.5 17.6.3l-1.7 3-2.4.3L11.1.3 6.3 4.9l.4 3.3-1.7 1.6L1.8 9 0 14.6l1.7 5.9-1 2.3 2 3.3-1.2 3.2 3 4.5-.8 2.2 4.2 5.5 1.3 1.8 3.6 1.2 4.5 5.8 2.5 1.6 3.5 4 5.1 3.1 5.1-3.1 3.5-4 2.5-1.6 4.5-5.8 3.6-1.2 1.3-1.8 4.2-5.5-.8-2.2 3-4.5-1.2-3.2 2-3.3-1-2.3z" fill="#FF5500"/>
    <path d="M38.5 27.1l2.6-2.5-.9-1.9-5.6 1.6-3.3-.7h-5.7l-3.3.7-5.6-1.6-.9 1.9 2.6 2.5-1.1 3.5.5 3.2L22 40l2.4 5.2h8.1L35 40l4.6-6.2.5-3.2-1.6-3.5z" fill="white"/>
    <path d="M44.8 22.9c-.3-.5-.8-1.2-1.1-1.4l-3.4-2.2-5.2 1.6-6.7-.4-6.7.4-5.2-1.6-3.4 2.2c-.3.2-.8.9-1.1 1.4l-.4.7 5.5-1.6L26 23l2.5.3 2.5-.3 9.2-.7 5.5 1.6-.4-.7-.5-.3z" fill="white" fillOpacity="0.7"/>
  </svg>
);

const WalletConnectSVG = () => (
  <svg viewBox="0 0 300 185" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M61.4 36.7C107.7-8.9 182.3-8.9 228.6 36.7L234.3 42.3c2.3 2.3 2.3 5.9 0 8.2l-19.1 18.7c-1.1 1.1-3 1.1-4.1 0l-7.8-7.6c-32.7-32-85.7-32-118.4 0l-8.4 8.2c-1.1 1.1-3 1.1-4.1 0l-19.1-18.7c-2.3-2.3-2.3-5.9 0-8.2l8.1-6.2zM268.3 76l17 16.7c2.3 2.3 2.3 5.9 0 8.2l-76.7 75.1c-2.3 2.3-5.9 2.3-8.2 0l-54.4-53.3c-.6-.6-1.5-.6-2 0l-54.4 53.3c-2.3 2.3-5.9 2.3-8.2 0l-76.7-75.1c-2.3-2.3-2.3-5.9 0-8.2l17-16.7c2.3-2.3 5.9-2.3 8.2 0l54.4 53.3c.6.6 1.5.6 2 0l54.4-53.3c2.3-2.3 5.9-2.3 8.2 0l54.4 53.3c.6.6 1.5.6 2 0L260 76c2.3-2.3 6-2.3 8.3 0z" fill="white"/>
  </svg>
);

const RainbowSVG = () => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M60 105c24.9 0 45-20.1 45-45S84.9 15 60 15 15 35.1 15 60" stroke="url(#rb1)" strokeWidth="16" strokeLinecap="round"/>
    <path d="M60 88c15.5 0 28-12.5 28-28S75.5 32 60 32 32 44.5 32 60" stroke="url(#rb2)" strokeWidth="12" strokeLinecap="round"/>
    <path d="M60 73c7.2 0 13-5.8 13-13S67.2 47 60 47 47 52.8 47 60" stroke="url(#rb3)" strokeWidth="10" strokeLinecap="round"/>
    <circle cx="60" cy="60" r="8" fill="url(#rb4)"/>
    <defs>
      <linearGradient id="rb1" x1="15" y1="60" x2="105" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6B6B"/><stop offset="0.33" stopColor="#FFD93D"/><stop offset="0.66" stopColor="#6BCB77"/><stop offset="1" stopColor="#4D96FF"/>
      </linearGradient>
      <linearGradient id="rb2" x1="32" y1="60" x2="88" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6B6B"/><stop offset="0.5" stopColor="#FFD93D"/><stop offset="1" stopColor="#6BCB77"/>
      </linearGradient>
      <linearGradient id="rb3" x1="47" y1="60" x2="73" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6B6B"/><stop offset="1" stopColor="#FFD93D"/>
      </linearGradient>
      <linearGradient id="rb4" x1="52" y1="52" x2="68" y2="68" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6B6B"/><stop offset="1" stopColor="#FFD93D"/>
      </linearGradient>
    </defs>
  </svg>
);

const CoinbaseSVG = () => (
  <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="512" cy="512" r="512" fill="white"/>
    <path d="M512 190c-177.9 0-322 144.1-322 322s144.1 322 322 322 322-144.1 322-322S689.9 190 512 190zm0 574.6c-139.5 0-252.6-113.1-252.6-252.6S372.5 259.4 512 259.4 764.6 372.5 764.6 512 651.5 764.6 512 764.6zm-71.1-252.6c0-39.3 31.8-71.1 71.1-71.1s71.1 31.8 71.1 71.1-31.8 71.1-71.1 71.1-71.1-31.8-71.1-71.1z" fill="#0052FF"/>
  </svg>
);

const BaseSVG = () => (
  <svg viewBox="0 0 146 146" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="73" cy="73" r="73" fill="white"/>
    <path d="M73.2 21C44.9 21 22 43.9 22 72.2s22.9 51.2 51.2 51.2c27.1 0 49.4-21 51.1-47.7H71.8V67.5h54.3c.1 1.6.2 3.2.2 4.7 0 29.5-24 53.4-53.4 53.4C43.4 125.6 19.5 101.7 19.5 72.2S43.4 18.8 72.9 18.8c14.8 0 28.2 5.9 37.9 15.5l-8.2 8.2C95.4 35.5 84.6 31 73.2 31c-22.7 0-41.2 18.4-41.2 41.2s18.5 41.1 41.2 41.1c21.2 0 38.7-15.9 41-36.6H73.2V21z" fill="#0052FF"/>
  </svg>
);

// ── Icon wrapper ──────────────────────────────────────────────────────────────
const WalletIcon = ({ children, bg }) => (
  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden ${bg}`}>
    <div className="w-6 h-6">{children}</div>
  </div>
);

// ── Wallet registry ───────────────────────────────────────────────────────────
const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    bg: 'bg-gradient-to-br from-[#E8761B] to-[#C95F10]',
    Icon: MetaMaskSVG,
    connect: (hooks) => hooks.connectInjected(),
    detect: () => typeof window !== 'undefined' && !!window.ethereum?.isMetaMask && !window.ethereum?.isBraveWallet,
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    bg: 'bg-gradient-to-br from-[#FF7847] to-[#E0440E]',
    Icon: BraveSVG,
    connect: (hooks) => hooks.connectInjected(),
    detect: () => typeof window !== 'undefined' && !!window.ethereum?.isBraveWallet,
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    bg: 'bg-gradient-to-br from-[#1652F0] to-[#0039B5]',
    Icon: CoinbaseSVG,
    connect: (hooks) => hooks.connectInjected(),
    detect: () => typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet,
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    bg: 'bg-gradient-to-br from-purple-500 via-pink-400 to-orange-400',
    Icon: RainbowSVG,
    connect: (hooks) => hooks.connectWC(),
    detect: () => false,
  },
  {
    id: 'base',
    name: 'Base Wallet',
    bg: 'bg-gradient-to-br from-[#1652F0] to-[#0039B5]',
    Icon: BaseSVG,
    connect: (hooks) => hooks.connectInjected(),
    detect: () => false,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    bg: 'bg-gradient-to-br from-[#3396FF] to-[#1A7AE0]',
    Icon: WalletConnectSVG,
    connect: (hooks) => hooks.connectWC(),
    detect: () => false,
  },
];

const LAST_WALLET_KEY = 'cdrop_last_wallet';

// ── Info panel ────────────────────────────────────────────────────────────────
const InfoPanel = () => (
  <div className="hidden md:flex flex-col justify-between p-8 bg-white/[0.02] border-l border-white/[0.06] min-w-0 w-72 flex-shrink-0">
    <div>
      <h3 className="text-white font-semibold text-base mb-6">What is a Wallet?</h3>
      <div className="space-y-5">
        <div className="flex gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-violet-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"/>
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium mb-1">A Home for your Digital Assets</p>
            <p className="text-white/40 text-[11px] leading-relaxed">Wallets store, send, and receive tokens, NFTs, and crypto — all controlled by you.</p>
          </div>
        </div>
        <div className="flex gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-cyan-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium mb-1">A New Way to Log In</p>
            <p className="text-white/40 text-[11px] leading-relaxed">No passwords needed — just sign with your wallet to access any Web3 app instantly.</p>
          </div>
        </div>
        <div className="flex gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium mb-1">You're Always in Control</p>
            <p className="text-white/40 text-[11px] leading-relaxed">Only you hold your private keys. No bank, no middleman — your funds, your rules.</p>
          </div>
        </div>
      </div>
    </div>
    <div className="space-y-2.5 mt-8">
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-px"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 4px 12px rgba(124,58,237,0.2)' }}
      >
        Get a Wallet
      </a>
      <a
        href="https://ethereum.org/en/wallets/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center w-full py-2 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
      >
        Learn More
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 ml-1">
          <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd"/>
        </svg>
      </a>
    </div>
  </div>
);

// ── Main modal ────────────────────────────────────────────────────────────────
export function WalletModal({ open, onClose, walletHooks }) {
  const [lastUsed, setLastUsed] = useState(() => {
    try { return localStorage.getItem(LAST_WALLET_KEY); } catch { return null; }
  });
  const [connecting, setConnecting] = useState(null);

  // Detect installed wallets on mount
  const [installed, setInstalled] = useState([]);
  useEffect(() => {
    if (open) {
      setInstalled(WALLETS.filter((w) => w.detect()).map((w) => w.id));
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleConnect = useCallback(async (wallet) => {
    setConnecting(wallet.id);
    try {
      localStorage.setItem(LAST_WALLET_KEY, wallet.id);
      setLastUsed(wallet.id);
      wallet.connect(walletHooks);
      onClose();
    } catch {
      setConnecting(null);
    }
  }, [walletHooks, onClose]);

  // Split into installed vs popular sections
  const installedWallets = WALLETS.filter((w) => installed.includes(w.id));
  const popularWallets  = WALLETS.filter((w) => !installed.includes(w.id));

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col md:flex-row w-full max-w-[720px] max-h-[90vh] rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/60"
              style={{ background: 'linear-gradient(145deg, #0f0f1c 0%, #0b0b16 100%)' }}
            >
              {/* ── Left: wallet list ── */}
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                  <h2 className="text-white font-semibold text-base tracking-tight">Connect a Wallet</h2>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition-all"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                    </svg>
                  </button>
                </div>

                {/* Wallet list */}
                <div className="overflow-y-auto px-3 pb-5 space-y-1 flex-1">
                  {/* Installed section */}
                  {installedWallets.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 px-3 pt-1 pb-2">Installed</p>
                      {installedWallets.map((wallet) => (
                        <WalletRow
                          key={wallet.id}
                          wallet={wallet}
                          badge="Installed"
                          badgeColor="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                          isLast={lastUsed === wallet.id}
                          isConnecting={connecting === wallet.id}
                          onClick={() => handleConnect(wallet)}
                        />
                      ))}
                      <div className="h-px bg-white/[0.05] my-2 mx-3" />
                    </>
                  )}

                  {/* Popular section */}
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 pt-1 pb-2">Popular</p>
                  {popularWallets.map((wallet) => (
                    <WalletRow
                      key={wallet.id}
                      wallet={wallet}
                      isLast={lastUsed === wallet.id}
                      isConnecting={connecting === wallet.id}
                      onClick={() => handleConnect(wallet)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Right: info panel ── */}
              <InfoPanel />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

// ── Wallet row ────────────────────────────────────────────────────────────────
function WalletRow({ wallet, badge, badgeColor, isLast, isConnecting, onClick }) {
  const { Icon, name, bg } = wallet;
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-all text-left group disabled:opacity-60"
    >
      <WalletIcon bg={bg}>
        <Icon />
      </WalletIcon>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/85 group-hover:text-white transition-colors">{name}</span>
          {badge && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${badgeColor}`}>{badge}</span>
          )}
          {isLast && !badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border text-blue-400 bg-blue-400/10 border-blue-400/20">Recent</span>
          )}
        </div>
      </div>
      {isConnecting ? (
        <svg className="animate-spin w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 12H4z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/20 group-hover:text-white/50 flex-shrink-0 transition-colors">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
        </svg>
      )}
    </button>
  );
}
