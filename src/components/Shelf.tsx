import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { GRUPOS, NORMAS, TOTAL_FRAGMENTOS } from '../data/normas';
import { useMediaQuery } from '../hooks/useMediaQuery';
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
  const phone = useMediaQuery('(max-width: 640px)');
  // Spines grow up from the shelf; on phones they are bars that grow from the left.
  // clip-path reveals without squashing the label the way a scale would.
  const hidden = phone ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)';
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
            Cada lomo es una norma: cuanto más alto, más fragmentos aporta al índice. Elige una para ver cuándo entra en tu informe.
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
                    // The button lifts with CSS (hover, press, «pulled out» when selected);
                    // the spine inside grows in once, along the axis the layout uses.
                    <button
                      key={n.stem}
                      ref={(el) => {
                        buttons.current[i] = el;
                      }}
                      type="button"
                      className={styles.spine}
                      style={{ ['--h' as string]: `${Math.round(MIN_H + share * (MAX_H - MIN_H))}px`, ['--w' as string]: `${Math.max(18, share * 100)}%` }}
                      aria-label={`${n.corto}: ${n.nombre}, ${n.fragmentos} fragmentos`}
                      aria-pressed={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(i)}
                      onKeyDown={(e) => onKey(e, i)}
                      onPointerEnter={(e) => e.pointerType === 'mouse' && setSel(i)}
                    >
                      <motion.span
                        className={styles.fill}
                        initial={reduce ? false : { clipPath: hidden }}
                        animate={{ clipPath: seen ? 'inset(0 0 0 0)' : hidden }}
                        transition={{ duration: 0.5, ease: EASE, delay: i * 0.03 }}
                      >
                        <span className={styles.spineLabel}>{n.corto}</span>
                      </motion.span>
                      {selected && (
                        <motion.span
                          layoutId="shelf-selection"
                          className={styles.marker}
                          // Arrow keys move it: quick and without bounce.
                          transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className={styles.groupLabel}>{g}</p>
            </div>
          ))}
        </div>

        <div role="region" aria-label="Detalle de la norma" aria-live="polite" className={styles.detail}>
          {/* Swapped with the arrow keys: no exit to wait for, a short fade in. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={norma.stem}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12, ease: EASE }}
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
