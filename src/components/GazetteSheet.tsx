import { type CSSProperties, Fragment, type ReactNode } from 'react';
import { FRASE_CITADA, RGPD_PAGINA } from '../data/rgpd';
import styles from './Hero.module.css';

const [FECHA, PAGINA, DIARIO, IDIOMA] = RGPD_PAGINA.cabecera;

/**
 * The cited phrase, highlighted word by word so the marker sweeps across line
 * breaks. Each word's ink is a CSS animation delayed by its index (--i).
 */
function Highlight() {
  const words = FRASE_CITADA.split(' ');
  return (
    <mark className={styles.mark}>
      {words.map((w, i) => (
        <span key={i}>
          <span className={styles.word}>
            <span className={styles.ink} aria-hidden="true" style={{ '--i': i } as CSSProperties} />
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </mark>
  );
}

interface Props {
  /** Margin note, anchored right under the cited recital so it never covers the phrase. */
  note?: ReactNode;
}

export default function GazetteSheet({ note }: Props) {
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
                {cited && <Highlight />}
              </span>
            </p>
            {cited && note && <div className={styles.anchor}>{note}</div>}
          </Fragment>
        );
      })}
    </div>
  );
}
