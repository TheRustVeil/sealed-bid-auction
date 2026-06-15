const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
  </svg>
);

export function Stepper({ steps, current, className = '' }) {
  return (
    <nav aria-label="Progress" className={`flex items-start ${className}`}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  done   ? 'bg-confidential text-white' :
                  active ? 'border-2 border-confidential text-confidential bg-confidential/10' :
                           'border-2 border-white/20 text-white/30',
                ].join(' ')}
              >
                {done ? <CheckIcon /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${done || active ? 'text-white/80' : 'text-white/30'}`}>
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 transition-colors ${done ? 'bg-confidential' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
