import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const VARIANT_STYLES = {
  info:     'border-violet-500/30 bg-violet-950/80',
  warning:  'border-yellow-500/30 bg-yellow-950/80',
  activity: 'border-cyan-500/20  bg-cyan-950/80',
};

const AUTO_DISMISS_MS = 5000;

function Toast({ toast, onDismiss }) {
  const { id, message, icon = '🔒', variant = 'info' } = toast;
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ x: 90, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 90, opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={[
        'relative flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md text-sm text-white/85 shadow-xl overflow-hidden',
        VARIANT_STYLES[variant] ?? VARIANT_STYLES.info,
      ].join(' ')}
    >
      <span className="shrink-0 text-base leading-5">{icon}</span>
      <p className="leading-snug flex-1 font-mono text-xs tracking-wide">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 text-white/30 hover:text-white/60 transition-colors text-xs leading-5 ml-1"
        aria-label="Dismiss"
      >
        ✕
      </button>
      {/* countdown bar depletes over AUTO_DISMISS_MS */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06]">
        <div
          className="h-full bg-white/25 rounded-full"
          style={{ animation: `count-down ${AUTO_DISMISS_MS}ms linear forwards` }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Portal-mounted stack of privacy-first notification toasts.
 * Never shows bid amounts or wallet addresses. Max 3 visible (enforced by useNotifications).
 */
export function NotificationToast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;
  return createPortal(
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-72">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
