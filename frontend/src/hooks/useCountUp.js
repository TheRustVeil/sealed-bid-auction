import { useEffect, useState } from 'react';
import { useInView } from './useInView';

/**
 * Animates a number from 0 to `target` when the returned ref enters the viewport.
 * Returns [ref, displayValue].
 */
export function useCountUp(target, { duration = 1800, decimals = 0 } = {}) {
  const [ref, inView] = useInView(0.2);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime = null;

    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, target, duration, decimals]);

  return [ref, value];
}
