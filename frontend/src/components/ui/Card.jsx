export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-panel rounded-xl border border-white/10 ${className}`}
      {...props}
    >
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
