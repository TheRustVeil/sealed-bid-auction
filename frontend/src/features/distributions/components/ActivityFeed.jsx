import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActivityFeed } from '../hooks/useActivityFeed';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function ActivityFeed({ distributionId }) {
  const entries = useActivityFeed({ distributionId });
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [entries.length]);

  return (
    <div className="bg-black/70 border border-confidential/20 rounded-xl font-mono text-xs overflow-hidden">
      {/* Terminal title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-white/25 tracking-widest text-[10px]">
          ENCRYPTED ACTIVITY LOG
        </span>
      </div>

      {/* Feed content */}
      <div className="p-3">
        {entries.length === 0 ? (
          <div className="py-8 flex flex-col items-center text-center gap-2">
            <span className="text-confidential/60 tracking-wider">
              {'>'} AWAITING ENCRYPTED EVENTS...
            </span>
            <span className="inline-block w-2 h-3.5 bg-confidential/60 animate-blink-cursor" />
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1" ref={listRef}>
            <AnimatePresence initial={false}>
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span className="text-confidential/40 tabular-nums shrink-0">
                    {formatTime(entry.ts)}
                  </span>
                  <span className="text-confidential/60">{'>'}</span>
                  <span className={idx === 0 ? 'text-green-300/90' : 'text-green-400/60'}>
                    {entry.message}
                  </span>
                  {idx === 0 && (
                    <span className="inline-block w-1.5 h-3 bg-green-400/60 animate-blink-cursor ml-0.5 shrink-0" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
