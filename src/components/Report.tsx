import { AnimatePresence, animate, motion, stagger, useReducedMotion } from 'motion/react';
import { type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EJEMPLO } from '../data/example';
import type { AnalysisState } from '../hooks/useAnalysis';
import { markCitations, stripLeadingEmoji } from '../lib/citations';
import { renderMarkdown } from '../lib/markdown';
import type { CitationStats, RAGResponse } from '../lib/types';
import CountUp from './CountUp';
import styles from './Report.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

function Elapsed({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  // Visual only: a ticking number would be re-announced every second.
  return (
    <span className={styles.elapsed} aria-hidden="true">
      {Math.max(0, Math.floor((now - startedAt) / 1000))} s
    </span>
  );
}

const nextFrame = (fn: () => void) =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : window.setTimeout(fn, 16);

// Motion measures `height: 'auto'` keyframes (the «Más detalles» and tipo-IA
// reveals that loading the example opens) and then restores the window scroll
// to where it was, which cancels a smooth scroll started in the same frames.
const AFTER_MEASURE_MS = 160;

/**
 * Brings a freshly mounted result into view and gives it focus, once the
 * layout reveals it triggered have been measured.
 */
function useArrive<T extends HTMLElement>(ref: RefObject<T | null>, focus: boolean, arrival: object) {
  const reduce = useReducedMotion();
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    nextFrame(() =>
      nextFrame(() => {
        timer = window.setTimeout(() => {
          const el = ref.current;
          if (cancelled || !el) return;
          el.closest('#informe')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          if (focus) el.focus({ preventScroll: true });
        }, AFTER_MEASURE_MS);
      }),
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // Every new state object is a new arrival, even with the same result (the example asked for again).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrival]);
}

function Body({ markdown, citas }: { markdown: string; citas: CitationStats | undefined }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  useLayoutEffect(() => {
    if (ref.current) markCitations(ref.current, citas);
  }, [html, citas]);

  useEffect(() => {
    if (reduce || !ref.current) return;
    const blocks = Array.from(ref.current.children).slice(0, 14);
    animate(blocks, { opacity: [0, 1], y: [14, 0] }, { duration: 0.45, ease: EASE, delay: stagger(0.045) });
  }, [html, reduce]);

  return <div ref={ref} className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Success({ data, ejemplo, arrival }: { data: RAGResponse; ejemplo: boolean; arrival: object }) {
  const { citas, llm_model: model, corpus_version: corpus, disclaimer } = data;
  const ref = useRef<HTMLElement>(null);
  useArrive(ref, true, arrival);
  const announce =
    citas && citas.total > 0
      ? `Informe listo: ${citas.verificadas} de ${citas.total} citas comprobadas.`
      : 'Informe listo.';
  return (
    <article
      ref={ref}
      tabIndex={-1}
      className={styles.article}
      data-ui
      data-ai-generated="true"
      data-ai-model={model ?? 'desconocido'}
    >
      <p role="status" className="sr-only">
        {announce}
      </p>
      <header className={styles.summary}>
        {ejemplo && <p className={styles.example}>{EJEMPLO.etiqueta}</p>}

        {citas &&
          (citas.total > 0 ? (
            <p className={styles.figure}>
              <CountUp value={citas.verificadas} /> de {citas.total}{' '}
              {citas.total === 1 ? 'cita encontrada' : 'citas encontradas'} literalmente en la ley
            </p>
          ) : (
            <p className={styles.figure}>Este informe no contiene citas literales</p>
          ))}

        {data.normativas_detectadas.length > 0 && (
          <ul className={styles.chips} aria-label="Normas detectadas">
            {data.normativas_detectadas.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}

        <p className={styles.meta}>
          {data.chunks_utilizados}{' '}
          {data.chunks_utilizados === 1 ? 'fragmento de la ley usado' : 'fragmentos de la ley usados'}
          {corpus && <> · corpus {corpus}</>}
        </p>

        {model && (
          <p className={styles.aiNotice}>
            Este informe lo ha redactado un modelo de lenguaje ({model}) a partir de fragmentos de la ley recuperados por
            LegalDev. Las citas se comprueban de forma automática; la interpretación, no.
          </p>
        )}
      </header>

      <div className={styles.content}>
        {data.respuesta_completa.trim() ? (
          <Body markdown={data.respuesta_completa} citas={citas} />
        ) : (
          <p className={styles.emptyBody}>El servidor no ha devuelto el texto del informe.</p>
        )}
        {disclaimer && <p className={styles.disclaimer}>{stripLeadingEmoji(disclaimer)}</p>}
      </div>
    </article>
  );
}

function ErrorBlock({ message, onExample, arrival }: { message: string; onExample?: () => void; arrival: object }) {
  const ref = useRef<HTMLDivElement>(null);
  useArrive(ref, false, arrival);
  return (
    <div ref={ref} role="alert" className={styles.error}>
      <p>{message}</p>
      {onExample && (
        <button type="button" className={styles.errorAction} onClick={onExample}>
          Ver un informe de ejemplo
        </button>
      )}
    </div>
  );
}

interface Props {
  state: AnalysisState;
  onExample?: () => void;
}

export default function Report({ state, onExample }: Props) {
  const reduce = useReducedMotion();
  const key = state.kind === 'success' ? `ok-${state.ejemplo}-${state.data.respuesta_completa.length}` : state.kind;

  return (
    <div id="informe" className={`wrap ${styles.output}`}>
      <AnimatePresence mode="wait" initial={false}>
        {state.kind !== 'idle' && (
          <motion.div
            key={key}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {state.kind === 'loading' && (
              <div role="status" className={styles.loading}>
                <p className={styles.loadingText}>Analizando normativa…</p>
                <Elapsed startedAt={state.startedAt} />
                <div className={styles.bar} aria-hidden="true">
                  <span />
                </div>
              </div>
            )}
            {state.kind === 'error' && (
              <ErrorBlock message={state.message} onExample={state.offerExample ? onExample : undefined} arrival={state} />
            )}
            {state.kind === 'success' && <Success data={state.data} ejemplo={state.ejemplo} arrival={state} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
