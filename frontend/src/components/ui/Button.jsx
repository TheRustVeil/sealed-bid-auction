import { motion } from 'framer-motion';
import { Spinner } from './Spinner';

const variants = {
  primary:   'bg-confidential hover:bg-confidential-dark text-white',
  secondary: 'bg-panel border border-confidential text-confidential hover:bg-confidential/10',
  ghost:     'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const isInteractive = !disabled && !loading;

  return (
    <motion.button
      whileTap={isInteractive ? { scale: 0.96 } : undefined}
      whileHover={isInteractive && variant === 'primary' ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={disabled || loading}
      className={[
        'relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-confidential focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {/* Shimmer sweep — primary only */}
      {variant === 'primary' && isInteractive && (
        <span className="btn-shimmer" aria-hidden="true" />
      )}

      {loading && <Spinner size="sm" />}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
