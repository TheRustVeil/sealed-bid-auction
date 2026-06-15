import { motion } from 'framer-motion';

export function BadgeCard({ badge }) {
  const { icon, label, condition, unlocked } = badge;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={unlocked ? { scale: 1.04, boxShadow: '0 0 24px rgba(124,58,237,0.28)' } : {}}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={[
        'flex flex-col items-center text-center p-5 rounded-2xl border transition-colors duration-200',
        unlocked
          ? 'border-violet-500/30 bg-violet-500/[0.06] hover:border-violet-500/50'
          : 'border-white/[0.05] bg-panel/40',
      ].join(' ')}
    >
      {/* Icon container */}
      <div className="relative w-14 h-14 mb-3">
        <div
          className={[
            'w-full h-full rounded-2xl flex items-center justify-center text-3xl',
            unlocked ? 'bg-violet-500/15' : 'bg-white/[0.04]',
            !unlocked ? 'blur-[2px] opacity-40' : '',
          ].join(' ')}
        >
          {icon}
        </div>
        {/* Pulsing border ring on unlocked */}
        {unlocked && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-violet-400/50"
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {/* CLASSIFIED stamp on locked */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-black tracking-[0.2em] text-red-400/60 border border-red-400/30 px-1 py-0.5 rounded rotate-[-15deg]">
              LOCKED
            </span>
          </div>
        )}
      </div>

      <p className={`font-semibold text-sm mb-1 ${unlocked ? 'text-white' : 'text-white/30'}`}>
        {label}
      </p>
      <p className={`text-xs leading-relaxed ${unlocked ? 'text-white/35' : 'text-white/20'}`}>
        {condition}
      </p>

      {unlocked ? (
        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-violet-400 uppercase">
          ✓ Earned
        </span>
      ) : (
        <span className="mt-2 inline-block text-[9px] font-mono text-white/15 tracking-[0.2em] uppercase">
          [CLASSIFIED]
        </span>
      )}
    </motion.div>
  );
}
