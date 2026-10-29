import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { GRUPOS, NORMAS, TOTAL_FRAGMENTOS } from '../data/normas';
import { useSeen } from '../hooks/useSeen';
import Reveal from './Reveal';
import styles from './Shelf.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX = Math.max(...NORMAS.map((n) => n.fragmentos));
const MIN_H = 76;
const MAX_H = 300;

export default function Shelf() {
  const [sel, setSel] = useState(() => NORMAS.findIndex((n) => n.stem === 'RGPD'));
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const shelfRef = useRef<HTMLDivElement>(null);
  const seen = useSeen(shelfRef);
  const reduce = useReducedMotion();
  const norma = NORMAS[sel];

  const select = (i: number) => {
    const next = (i + NORMAS.length) % NORMAS.length;
    setSel(next);
    buttons.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const moves: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: NORMAS.length - 1 };
    if (e.key in moves) {
      e.preventDefault();
      select(moves[e.key]);
    }
  };

  return (
    <section id="normas" className={styles.section} aria-labelledby="normas-title">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.head}>
          <Reveal>
            <h2 id="normas-title" className="title">
              Las 22 normas que lee
            </h2>
          </Reveal>
          <Reveal as="p" delay={0.07} className={`lead ${styles.lead}`}>
            {TOTAL_FRAGMENTOS.toLocaleString('es-ES')} fragmentos de textos oficiales de EUR-Lex, el BOE, la AEPD y el CCII.
            Cada lomo es una norma y su altura, cuánto texto aporta. Elige una para ver cuándo entra en tu informe.
          </Reveal>
        </div>

        <div ref={shelfRef} role="group" aria-label="Estantería de normas" className={styles.shelf}>
          {GRUPOS.map((g) => (
            <div key={g} className={styles.group}>
              <div className={styles.spines}>
                {NORMAS.map((n, i) => {
                  if (n.grupo !== g) return null;
                  const selected = i === sel;
                  const share = n.fragmentos / MAX;
                  return (
                    <motion.button
                      key={n.stem}
                      ref={(el) => {
                        buttons.current[i] = el;
                      }}
                      type="button"
                      className={styles.spine}
                      style={{ ['--h' as string]: `${Math.round(MIN_H + share * (MAX_H - MIN_H))}px`, ['--w' as string]: `${Math.max(18, share * 100)}%` }}
                      aria-label={`${n.nombre}, ${n.fragmentos} fragmentos`}
                      aria-pressed={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(i)}
                      onKeyDown={(e) => onKey(e, i)}
                      initial={reduce ? false : { scaleY: 0 }}
                      animate={seen ? { scaleY: 1 } : { scaleY: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: i * 0.03 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <span className={styles.spineLabel}>{n.corto}</span>
                      {selected && (
                        <motion.span
                          layoutId="shelf-selection"
                          className={styles.marker}
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <p className={styles.groupLabel}>{g}</p>
            </div>
          ))}
        </div>

        <div role="region" aria-label="Detalle de la norma" aria-live="polite" className={styles.detail}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={norma.stem}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              <p className={styles.detailGroup}>{norma.grupo}</p>
              <p className={styles.detailName}>{norma.nombre}</p>
              <p className={styles.detailCount}>
                {norma.fragmentos.toLocaleString('es-ES')} fragmentos ·{' '}
                {((norma.fragmentos / TOTAL_FRAGMENTOS) * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 })} % del
                índice
              </p>
              <p className={styles.detailRule}>{norma.regla}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
