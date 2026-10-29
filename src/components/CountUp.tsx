import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

/** Counts from 0 to `value` once, then stays. Reduced motion shows the value at once. */
export default function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setN(value),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</span>;
}
