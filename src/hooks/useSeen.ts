import { useInView, useReducedMotion } from 'motion/react';
import { type RefObject, useEffect, useState } from 'react';

const FALLBACK_MS = 1500;

/**
 * True once the element has been on screen (or right away with reduced
 * motion). If the observer never fires, a fallback checks the element's
 * position after 1.5 s and on scroll, so entrance animations can never leave
 * content hidden.
 */
export function useSeen(ref: RefObject<Element | null>): boolean {
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const reduce = useReducedMotion();
  const [fallback, setFallback] = useState(false);
  const seen = inView || fallback || !!reduce;

  useEffect(() => {
    if (seen) return;
    const check = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r && r.top <= window.innerHeight && r.bottom >= 0) setFallback(true);
    };
    const t = window.setTimeout(() => {
      check();
      window.addEventListener('scroll', check, { passive: true });
    }, FALLBACK_MS);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', check);
    };
  }, [seen, ref]);

  return seen;
}
