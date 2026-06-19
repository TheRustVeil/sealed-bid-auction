import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../../../hooks/useInView';

/* ── Icons ── */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const ChainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);
const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

/* ── Step definitions ── */
const STEPS = [
  {
    n: '01',
    key: 'encrypt',
    gradient: 'from-violet-500 to-purple-600',
    hex: '#7C3AED',
    glow: 'rgba(124,58,237,0.18)',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/8',
    tag: 'CLIENT-SIDE',
    tagStyle: { color: '#a78bfa', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' },
    title: 'Seal Your Bid',
    desc: 'Zama SDK encrypts your bid directly in the browser using TFHE. The plaintext amount never leaves your device — only a ciphertext is submitted on-chain.',
    icon: <LockIcon />,
    visual: {
      lines: [
        { label: 'bid_amount',   val: '200 USDC',       style: 'text-white/70' },
        { label: 'ciphertext',   val: '0xae3f…d1c8',    style: 'text-violet-400 font-mono' },
        { label: 'proof',        val: '0x00…verified',  style: 'text-violet-300/70 font-mono' },
      ],
      status: { text: 'Encrypted', color: '#a78bfa' },
      code: "instance.createEncryptedInput(addr, user)\n  .add64(bidAmount)\n  .encrypt()",
    },
  },
  {
    n: '02',
    key: 'submit',
    gradient: 'from-cyan-500 to-teal-500',
    hex: '#06B6D4',
    glow: 'rgba(6,182,212,0.15)',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/8',
    tag: 'ON-CHAIN',
    tagStyle: { color: '#22d3ee', background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.25)' },
    title: 'Submit Ciphertext',
    desc: 'The encrypted bid is sent to the ConfidentialDisperse smart contract. The operator sees only a ciphertext — they can never learn the bid amount.',
    icon: <ChainIcon />,
    visual: {
      lines: [
        { label: 'contract',     val: '0x3C4D…DROP',    style: 'text-cyan-400 font-mono' },
        { label: 'from',         val: '0x1a2b…9f0e',    style: 'text-white/60 font-mono' },
        { label: 'bid_handle',   val: 'euint64(0xae3f…)',style: 'text-cyan-300/70 font-mono' },
      ],
      status: { text: 'Tx confirmed', color: '#22d3ee' },
      code: "disperse.addRecipient(\n  recipientAddr,\n  handles[0],   // euint64\n  inputProof\n)",
    },
  },
  {
    n: '03',
    key: 'fhe',
    gradient: 'from-orange-500 to-amber-500',
    hex: '#F97316',
    glow: 'rgba(249,115,22,0.15)',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/8',
    tag: 'FHE CO-PROCESSOR',
    tagStyle: { color: '#fb923c', background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.25)' },
    title: 'On-chain Settlement',
    desc: "The Zama FHE co-processor decrypts all bids inside the EVM, computes each winner's allocation at their sealed price, and posts a KMS-signed proof on-chain.",
    icon: <CpuIcon />,
    visual: {
      lines: [
        { label: 'mode',         val: 'publicDecrypt',  style: 'text-orange-400' },
        { label: 'kms_proof',    val: '0xfe12…8a3b',   style: 'text-orange-300/70 font-mono' },
        { label: 'gas_used',     val: '~840,000',       style: 'text-white/60' },
      ],
      status: { text: 'Settlement complete', color: '#fb923c' },
      code: "disperse.executeDistribution(\n  distId,          // bytes32\n  handles,         // euint64[]\n  inputProofs      // bytes[]\n)",
    },
  },
  {
    n: '04',
    key: 'claim',
    gradient: 'from-emerald-500 to-green-500',
    hex: '#10B981',
    glow: 'rgba(16,185,129,0.15)',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/8',
    tag: 'RECIPIENT',
    tagStyle: { color: '#34d399', background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' },
    title: 'Claim with Proof',
    desc: 'Recipients decrypt their allocation off-chain using the Zama relayer SDK, then submit the cleartext + KMS proof on-chain. The contract verifies and transfers tokens.',
    icon: <ShieldIcon />,
    visual: {
      lines: [
        { label: 'decrypted',    val: '200 USDC',       style: 'text-emerald-400' },
        { label: 'proof_valid',  val: 'EIP-712 ✓',      style: 'text-emerald-300/70' },
        { label: 'status',       val: 'Tokens sent ✓',  style: 'text-white' },
      ],
      status: { text: 'Claimed', color: '#34d399' },
      code: "const { abiEncoded, proof } =\n  await instance.publicDecrypt([handle])\n\ndisperse.claim(distId, abiEncoded, proof)",
    },
  },
];

/* ── Step visual panel ── */
function VisualPanel({ step }) {
  return (
    <motion.div
      key={step.key}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl border border-white/[0.08] bg-panel/70 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-surface/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
        <span className="ml-3 text-white/25 text-[11px] font-mono">step-{step.n} / {step.key}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: step.hex }} />
          <span className="text-[10px] font-mono" style={{ color: step.hex + 'aa' }}>{step.visual.status.text}</span>
        </span>
      </div>

      {/* Data rows */}
      <div className="px-4 pt-4 pb-3 space-y-2">
        {step.visual.lines.map(({ label, val, style }) => (
          <div key={label} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-white/30 shrink-0">{label}</span>
            <span className={`text-right ${style} text-[11px]`}>{val}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${step.hex}33, transparent)` }} />

      {/* Code snippet */}
      <div className="px-4 py-3">
        <div className="text-white/15 text-[9px] uppercase tracking-widest mb-2 font-mono">SDK call</div>
        <pre
          className="text-[11px] font-mono leading-relaxed whitespace-pre"
          style={{ color: step.hex + 'cc' }}
        >
          {step.visual.code}
        </pre>
      </div>
    </motion.div>
  );
}

/* ── Connector arrow (desktop) ── */
function Connector({ color }) {
  return (
    <div className="hidden lg:flex items-center justify-center w-8 shrink-0 mt-6">
      <div className="relative w-full flex items-center">
        <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: `${color}40` }} />
        <motion.div
          className="absolute right-0 w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ x: ['-100%', '0%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView(0.08);

  const step = STEPS[active];

  return (
    <section className="relative z-10 px-6 py-24" id="how-it-works">
      <div className="max-w-6xl mx-auto">

        {/* ── Heading ── */}
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 uppercase tracking-[0.2em] font-semibold mb-3">Protocol flow</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Four steps.{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Zero trust required.
            </span>
          </h2>
          <p className="text-white/35 text-[15px] max-w-lg mx-auto leading-relaxed">
            From encrypted bid submission to on-chain settlement — no plaintext ever exposed,
            no trusted third party involved.
          </p>
        </div>

        {/* ── Step selector row (desktop horizontal, mobile vertical) ── */}
        <div
          ref={ref}
          className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-0 mb-10"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
        >
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex lg:flex-col items-start lg:items-center flex-1 gap-0">
              <button
                onClick={() => setActive(i)}
                className="group relative flex lg:flex-col items-center gap-3 lg:gap-2 w-full lg:text-center text-left p-3 rounded-2xl transition-all duration-300"
                style={active === i ? { background: s.glow, border: `1px solid ${s.hex}44` } : { border: '1px solid transparent' }}
              >
                {/* Number + icon */}
                <div
                  className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${s.hex}, ${s.hex}99)` }}
                >
                  {s.icon}
                </div>

                <div className="flex-1 lg:flex-none min-w-0">
                  {/* Number badge */}
                  <div className="text-[9px] font-mono tracking-widest mb-0.5" style={{ color: s.hex + '99' }}>
                    STEP {s.n}
                  </div>
                  <div className="font-semibold text-sm text-white truncate lg:whitespace-normal">{s.title}</div>
                  <div className="text-white/35 text-[11px] leading-snug mt-0.5 hidden sm:block">{s.desc.split(' ').slice(0, 8).join(' ')}…</div>
                </div>

                {/* Active indicator dot */}
                {active === i && (
                  <motion.div
                    layoutId="step-dot"
                    className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full"
                    style={{ background: s.hex }}
                  />
                )}
              </button>

              {/* Desktop connector */}
              {i < STEPS.length - 1 && <Connector color={STEPS[i + 1].hex} />}
            </div>
          ))}
        </div>

        {/* ── Detail panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left: full description + tag */}
          <motion.div
            key={active}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-5"
          >
            <div>
              <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded mr-3" style={step.tagStyle}>
                {step.tag}
              </span>
              <span className="text-white/20 text-xs font-mono">Step {step.n} of 04</span>
            </div>

            <h3 className="text-2xl font-bold text-white">{step.title}</h3>
            <p className="text-white/50 text-[15px] leading-relaxed">{step.desc}</p>

            {/* Privacy guarantee */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ borderColor: `${step.hex}25`, background: `${step.hex}08` }}
            >
              <span className="text-lg shrink-0">🔒</span>
              <div>
                <div className="text-white/70 text-[12px] font-semibold mb-0.5">Privacy guarantee</div>
                <div className="text-white/35 text-[11px] leading-relaxed">
                  {active === 0 && 'TFHE ciphertext is computationally indistinguishable from random — zero information leakage.'}
                  {active === 1 && 'The operator contract receives only opaque handles (euint64). No plaintext bid is ever stored.'}
                  {active === 2 && 'FHE computation happens inside the EVM co-processor. Even the validators never see cleartext.'}
                  {active === 3 && 'Decryption is gated by the KMS verifier — only the authorized recipient can trigger it.'}
                </div>
              </div>
            </div>

            {/* Step navigation */}
            <div className="flex gap-2 pt-2">
              {active > 0 && (
                <button
                  onClick={() => setActive(active - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all"
                >
                  ← Previous
                </button>
              )}
              {active < STEPS.length - 1 && (
                <button
                  onClick={() => setActive(active + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${step.hex}, ${step.hex}cc)`, boxShadow: `0 0 0 1px ${step.hex}44` }}
                >
                  Next step →
                </button>
              )}
              {active === STEPS.length - 1 && (
                <button
                  onClick={() => setActive(0)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-violet-500/30 hover:text-white/80 transition-all"
                >
                  ↺ Restart
                </button>
              )}
            </div>
          </motion.div>

          {/* Right: live visual */}
          <div className="relative">
            <div
              className="absolute inset-0 -m-6 pointer-events-none"
              style={{ background: `radial-gradient(ellipse, ${step.glow} 0%, transparent 70%)` }}
            />
            <div className="relative">
              <AnimatePresence mode="wait">
                <VisualPanel key={step.key} step={step} />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Bottom: trust anchors ── */}
        <div className="mt-14 pt-8 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🔐', title: 'No trusted setup', desc: 'The TFHE scheme requires no ceremony — keys are derived deterministically from wallet signatures.' },
            { icon: '⛓️', title: 'Fully on-chain', desc: 'Settlement logic lives entirely in auditable Solidity contracts. No off-chain computation required.' },
            { icon: '🔍', title: 'Publicly verifiable', desc: 'Any observer can verify the settlement outcome without ever learning what individual bidders paid.' },
          ].map((t) => (
            <div key={t.title} className="flex gap-3 items-start">
              <span className="text-xl shrink-0">{t.icon}</span>
              <div>
                <div className="text-white font-semibold text-sm mb-1">{t.title}</div>
                <div className="text-white/35 text-xs leading-relaxed">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
