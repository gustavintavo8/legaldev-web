import { motion, useInView, useReducedMotion } from 'motion/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

const TAGS = { div: motion.div, p: motion.p, li: motion.li, span: motion.span };

interface Props {
  children: ReactNode;
  as?: keyof typeof TAGS;
  delay?: number;
  className?: string;
}

const FALLBACK_MS = 1500;

/**
 * Rises into place once, the first time it enters the viewport. If the
 * observer never fires, a fallback reveals it once it is on screen, so content
 * can never stay hidden.
 */
export default function Reveal({ children, as = 'div', delay = 0, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const reduce = useReducedMotion();
  const [fallback, setFallback] = useState(false);
  const shown = inView || fallback || reduce;

  useEffect(() => {
    if (shown) return;
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
  }, [shown]);

  const Tag = TAGS[as];
  return (
    <Tag
      ref={ref as never}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}
