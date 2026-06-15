const variants = {
  default:      'bg-white/10 text-white/70',
  confidential: 'bg-confidential/20 text-confidential-light border border-confidential/40',
  success:      'bg-green-900/40 text-green-400',
  warning:      'bg-yellow-900/40 text-yellow-400',
  error:        'bg-red-900/40 text-red-400',
  info:         'bg-blue-900/40 text-blue-400',
};

export function Pill({ variant = 'default', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-chip px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
