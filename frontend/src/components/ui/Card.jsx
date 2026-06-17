import { motion } from 'framer-motion';

const baseClass = 'bg-panel rounded-xl border border-white/10';

export function Card({ className = '', hoverable = false, children, ...props }) {
  if (hoverable) {
    return (
      <motion.div
        whileHover={{
          y: -3,
          boxShadow: '0 0 0 1px rgba(124,58,237,0.3), 0 12px 32px rgba(124,58,237,0.14)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`${baseClass} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-4 border-b border-white/10 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-4 border-t border-white/10 ${className}`} {...props}>
      {children}
    </div>
  );
}
