import { motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { useSeen } from '../hooks/useSeen';

const TAGS = { div: motion.div, p: motion.p, li: motion.li, span: motion.span };

interface Props {
  children: ReactNode;
  as?: keyof typeof TAGS;
  delay?: number;
  className?: string;
}

/** Rises into place once, the first time it enters the viewport. */
export default function Reveal({ children, as = 'div', delay = 0, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const shown = useSeen(ref);
  const reduce = useReducedMotion();

  const Tag = TAGS[as];
  return (
    <Tag
      ref={ref as never}
      className={className}
      initial={reduce ? false : { opacity: 0, transform: 'translateY(20px)' }}
      animate={shown ? { opacity: 1, transform: 'translateY(0px)' } : { opacity: 0, transform: 'translateY(20px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}
