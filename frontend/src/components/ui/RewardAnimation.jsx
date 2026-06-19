import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useAnimatedCounter(target, duration, enabled) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || target == null) return;
    const end = parseFloat(target) || 0;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(end * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return value;
}

const PARTICLE_COLORS = ['#a78bfa', '#22d3ee', '#10b981', '#f59e0b', '#c084fc', '#818cf8'];

// Deterministic pseudo-random so particles are stable across renders
const seeded = (i, salt) => ((i * 9301 + salt * 49297 + 233280) % 1000) / 1000;

const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const angle = (360 / 22) * i + (seeded(i, 1) * 22 - 11);
  const dist = 110 + seeded(i, 2) * 80;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    tx: Math.cos(rad) * dist,
    ty: Math.sin(rad) * dist,
    size: 3 + seeded(i, 3) * 5,
    delay: seeded(i, 4) * 0.3,
    duration: 0.85 + seeded(i, 5) * 0.55,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  };
});

function SpinningRim() {
  return (
    <motion.div
      animate={{ rotateY: 360 }}
      transition={{ duration: 11, ease: 'linear', repeat: Infinity }}
      style={{ position: 'absolute', perspective: 520 }}
    >
      <div
        style={{
          width: 182,
          height: 182,
          borderRadius: '50%',
          background:
            'conic-gradient(from 0deg, #7C3AED 0%, #a78bfa 20%, #22d3ee 48%, #818cf8 72%, #7C3AED 100%)',
          padding: 2.5,
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0D0D1F' }} />
      </div>
    </motion.div>
  );
}

function CoinFace() {
  return (
    <motion.div
      animate={{ rotateX: [0, 14, 0, -14, 0], rotateY: [0, 22, 0, -22, 0] }}
      transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}
      style={{ position: 'absolute', perspective: 420 }}
    >
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 32% 28%, rgba(167,139,250,0.38) 0%, rgba(6,182,212,0.2) 50%, transparent 80%)',
          border: '1px solid rgba(167,139,250,0.45)',
          boxShadow:
            '0 0 50px rgba(124,58,237,0.55), 0 0 100px rgba(124,58,237,0.22), inset 0 0 40px rgba(6,182,212,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* CRT scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.018) 3px, rgba(255,255,255,0.018) 4px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Animated unlock icon */}
        <motion.svg
          width="54"
          height="54"
          viewBox="0 0 24 24"
          fill="none"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.35, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.path
            d="M8 11V7a4 4 0 018 0"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.85, ease: 'easeOut' }}
          />
          <motion.rect
            x="3"
            y="11"
            width="18"
            height="12"
            rx="3"
            fill="rgba(124,58,237,0.28)"
            stroke="#22d3ee"
            strokeWidth="1.5"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.72, duration: 0.38 }}
          />
          <motion.circle
            cx="12"
            cy="16.5"
            r="2"
            fill="#22d3ee"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.05, type: 'spring', stiffness: 320 }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
}

function OrbitDot({ radius, size, color, duration, reverse }) {
  return (
    <motion.div
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, ease: 'linear', repeat: Infinity }}
      style={{ position: 'absolute', width: radius * 2, height: radius * 2 }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}80`,
        }}
      />
    </motion.div>
  );
}

/**
 * Full-screen 3D reward reveal animation.
 * Shows when a user successfully claims their allocation.
 *
 * @param {{ amount: string|number, visible: boolean, onDismiss: () => void }} props
 */
export function RewardAnimation({ amount, visible, onDismiss }) {
  const displayAmount = useAnimatedCounter(amount, 1850, visible);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="reward-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          onClick={onDismiss}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5,5,17,0.88)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          {/* Tap-to-close hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            transition={{ delay: 2.5 }}
            style={{
              position: 'absolute',
              bottom: 36,
              margin: 0,
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 3,
              textTransform: 'uppercase',
              pointerEvents: 'none',
            }}
          >
            Tap anywhere to close
          </motion.p>

          {/* ── 3D Stage ── */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 320,
              height: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Ambient radial glow */}
            <div
              style={{
                position: 'absolute',
                width: 440,
                height: 440,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(124,58,237,0.28) 0%, rgba(6,182,212,0.14) 42%, transparent 70%)',
                filter: 'blur(34px)',
                pointerEvents: 'none',
              }}
            />

            {/* Burst rings */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.85 }}
                animate={{ scale: 3.2 + i * 0.55, opacity: 0 }}
                transition={{ duration: 1.5, delay: i * 0.19, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  border: `1.5px solid ${i % 2 === 0 ? 'rgba(124,58,237,0.75)' : 'rgba(6,182,212,0.75)'}`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Particle burst */}
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: p.tx,
                  y: p.ty,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.3, 0.9, 0],
                }}
                transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 2.5}px ${p.color}, 0 0 ${p.size * 5}px ${p.color}60`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Orbiting dots */}
            <OrbitDot radius={98}  size={6} color="#22d3ee" duration={3.2} />
            <OrbitDot radius={78}  size={5} color="#a78bfa" duration={5}   reverse />
            <OrbitDot radius={115} size={4} color="#10b981" duration={7}   />

            {/* 3D coin */}
            <SpinningRim />
            <CoinFace />
          </div>

          {/* ── Amount + badge ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', marginTop: 24 }}
          >
            <div
              style={{
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'rgba(6,182,212,0.72)',
                letterSpacing: 5,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Your Allocation
            </div>

            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 44%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {displayAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                marginTop: 14,
                padding: '6px 16px',
                borderRadius: 9999,
                background: 'rgba(16,185,129,0.11)',
                border: '1px solid rgba(16,185,129,0.32)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #10b981, 0 0 12px #10b98180',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#10b981',
                  letterSpacing: 2.5,
                  textTransform: 'uppercase',
                }}
              >
                Reward Unlocked
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
