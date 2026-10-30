import { motion, useReducedMotion } from 'motion/react';
import { Fragment, type ReactNode } from 'react';
import { FRASE_CITADA, RGPD_PAGINA } from '../data/rgpd';
import styles from './Hero.module.css';

const [FECHA, PAGINA, DIARIO, IDIOMA] = RGPD_PAGINA.cabecera;

/** The cited phrase, highlighted word by word so the marker sweeps across line breaks. */
function Highlight({ delay }: { delay: number }) {
  const reduce = useReducedMotion();
  const words = FRASE_CITADA.split(' ');
  return (
    <mark className={styles.mark}>
      {words.map((w, i) => (
        <span key={i}>
          <span className={styles.word}>
            <motion.span
              className={styles.ink}
              aria-hidden="true"
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.16, ease: 'linear', delay: delay + i * 0.045 }}
            />
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </mark>
  );
}

interface Props {
  highlightDelay: number;
  /** Margin note, anchored right under the cited recital so it never covers the phrase. */
  note?: ReactNode;
}

export default function GazetteSheet({ highlightDelay, note }: Props) {
  return (
    <div className={styles.sheet} data-ui>
      <div className={styles.sheetHead}>
        <span>{PAGINA}</span>
        <span className={styles.sheetTitle}>
          <span className={styles.lang}>{IDIOMA}</span>
          {DIARIO}
        </span>
        <span>{FECHA}</span>
      </div>
      {RGPD_PAGINA.considerandos.map((c) => {
        const cited = c.n === 30;
        const before = cited ? c.texto.slice(0, c.texto.length - FRASE_CITADA.length) : c.texto;
        return (
          <Fragment key={c.n}>
            <p className={styles.recital} data-cited={cited || undefined}>
              <span className={styles.recitalNum}>({c.n})</span>
              <span>
                {before}
                {cited && <Highlight delay={highlightDelay} />}
              </span>
            </p>
            {cited && note && <div className={styles.anchor}>{note}</div>}
          </Fragment>
        );
      })}
    </div>
  );
}
