import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../components/ui';

const ENC_STEPS = [
  'Generating encryption keys...',
  'Encrypting payload with Zama TFHE...',
  'Signing transaction...',
  'Sending ciphertext to Sepolia...',
];

// Deterministic particle config so it doesn't re-randomise on re-render
const PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const radius = 80 + (i % 3) * 50;
  const colors = ['#7C3AED', '#06B6D4', '#a78bfa', '#22d3ee', '#818cf8'];
  return {
    id: i,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius - 40,
    color: colors[i % colors.length],
    size: 5 + (i % 3) * 3,
    delay: (i % 6) * 0.04,
  };
});

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: p.delay }}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: p.color }}
        />
      ))}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0 },
};

function SuccessScreen({ hash, onReset }) {
  return (
    <motion.div
      className="space-y-6 text-center"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      initial="hidden"
      animate="show"
    >
      {/* Emoji + confetti */}
      <motion.div variants={fadeUp} className="relative flex justify-center">
        <ConfettiBurst />
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.05 }}
          className="text-5xl relative z-10"
        >
          🎉
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.h2 variants={fadeUp} className="text-xl font-bold text-white">
        Distribution sent!
      </motion.h2>

      {/* "Stored on chain" banner with glow pulse */}
      <motion.div variants={fadeUp}>
        <motion.div
          animate={{ boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 18px rgba(34,197,94,0.35)', '0 0 0px rgba(34,197,94,0)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-green-900/20 border border-green-500/20 rounded-lg p-2 text-xs font-mono text-green-400 text-center tracking-widest"
        >
          ✓ STORED ON CHAIN
        </motion.div>
      </motion.div>

      {/* TX hash — typewriter reveal */}
      <motion.div
        variants={fadeUp}
        className="bg-panel border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-300 break-all text-left"
      >
        <TypewriterText text={`tx: ${hash}`} />
      </motion.div>

      {/* Sub-text */}
      <motion.p variants={fadeUp} className="text-gray-400 text-sm">
        Recipients can now claim and privately decrypt their allocation.
      </motion.p>

      {/* CTA */}
      <motion.div variants={fadeUp}>
        <Button variant="secondary" onClick={onReset}>
          New distribution
        </Button>
      </motion.div>
    </motion.div>
  );
}

function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      idx.current += 1;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-blink-cursor">▌</span>
      )}
    </>
  );
}

export function StepExecute({ execute, isExecuting, executeError, executeData, onReset }) {
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const handleExecute = () => {
    setStarted(true);
    setStepIdx(0);
    execute();
  };

  useEffect(() => {
    if (!isExecuting) return;
    if (stepIdx >= ENC_STEPS.length - 1) return;
    const t = setTimeout(() => setStepIdx(s => s + 1), 950);
    return () => clearTimeout(t);
  }, [isExecuting, stepIdx]);

  if (executeData) {
    return <SuccessScreen hash={executeData.hash} onReset={onReset} />;
  }

  if (started && executeError) {
    const msg = executeError?.message ?? '';
    const message =
      msg.includes('User rejected') || msg.includes('user rejected') || msg.includes('4001')
        ? 'Transaction cancelled — please approve in your wallet.'
        : msg.includes('reverted')
        ? 'Transaction failed on-chain — check your token balance, approval, and ETH for gas.'
        : msg.includes('ncrypt')
        ? 'Encryption failed — please try again.'
        : msg || 'An unexpected error occurred.';

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Execution failed</h2>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{message}</p>
        </div>
        <Button variant="ghost" onClick={handleExecute} loading={isExecuting}>
          Retry
        </Button>
      </div>
    );
  }

  if (isExecuting) {
    return (
      <div className="space-y-4 py-2">
        <h2 className="text-lg font-bold text-white">Encrypting &amp; Broadcasting</h2>
        <div className="bg-black/60 border border-confidential/20 rounded-lg p-4 font-mono text-sm space-y-2.5">
          <AnimatePresence>
            {ENC_STEPS.map((step, i) =>
              i <= stepIdx ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  {i < stepIdx ? (
                    <span className="text-green-400 text-xs w-3">✓</span>
                  ) : (
                    <span className="text-confidential text-xs w-3 animate-pulse">›</span>
                  )}
                  <span className={i < stepIdx ? 'text-gray-500' : 'text-confidential-light'}>
                    {step}
                  </span>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>
        <p className="text-gray-500 text-xs text-center">
          Please approve the transaction in your wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Ready to execute</h2>
        <p className="text-gray-400 mt-2 text-sm">
          This will encrypt all allocations with Zama TFHE, register your wallet pair if needed,
          then broadcast the disperse transaction to Sepolia.
        </p>
      </div>
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-300">
        <p className="font-semibold mb-1">Before you proceed</p>
        <p>Ensure your wallet holds enough token balance and ETH for gas fees.</p>
      </div>
      <Button onClick={handleExecute} className="w-full" size="lg">
        Execute distribution
      </Button>
    </div>
  );
}
