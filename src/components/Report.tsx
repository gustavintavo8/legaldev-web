import { AnimatePresence, animate, motion, stagger, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EJEMPLO } from '../data/example';
import type { AnalysisState } from '../hooks/useAnalysis';
import { markCitations, stripLeadingEmoji } from '../lib/citations';
import { renderMarkdown } from '../lib/markdown';
import type { RAGResponse } from '../lib/types';
import CountUp from './CountUp';
import styles from './Report.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

function Elapsed({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return <span className={styles.elapsed}>{Math.max(0, Math.floor((now - startedAt) / 1000))} s</span>;
}

function Body({ markdown, unverified }: { markdown: string; unverified: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  useLayoutEffect(() => {
    if (ref.current) markCitations(ref.current, unverified);
  }, [html, unverified]);

  useEffect(() => {
    if (reduce || !ref.current) return;
    const blocks = Array.from(ref.current.children).slice(0, 14);
    animate(blocks, { opacity: [0, 1], y: [14, 0] }, { duration: 0.45, ease: EASE, delay: stagger(0.045) });
  }, [html, reduce]);

  return <div ref={ref} className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Success({ data, ejemplo }: { data: RAGResponse; ejemplo: boolean }) {
  const { citas, llm_model: model, corpus_version: corpus, disclaimer } = data;
  return (
    <article className={styles.article} data-ui data-ai-generated="true" data-ai-model={model ?? 'desconocido'}>
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
          <Body markdown={data.respuesta_completa} unverified={citas?.no_verificadas ?? []} />
        ) : (
          <p className={styles.emptyBody}>El servidor no ha devuelto el texto del informe.</p>
        )}
        {disclaimer && <p className={styles.disclaimer}>{stripLeadingEmoji(disclaimer)}</p>}
      </div>
    </article>
  );
}

export default function Report({ state }: { state: AnalysisState }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (state.kind === 'success' || state.kind === 'error') {
      ref.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }, [state, reduce]);

  const key = state.kind === 'success' ? `ok-${state.ejemplo}-${state.data.respuesta_completa.length}` : state.kind;

  return (
    <div ref={ref} id="informe" className={`wrap ${styles.output}`} aria-live="polite">
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
              <div className={styles.loading}>
                <p className={styles.loadingText}>Analizando normativa…</p>
                <Elapsed startedAt={state.startedAt} />
                <div className={styles.bar} aria-hidden="true">
                  <span />
                </div>
              </div>
            )}
            {state.kind === 'error' && (
              <div role="alert" className={styles.error}>
                {state.message}
              </div>
            )}
            {state.kind === 'success' && <Success data={state.data} ejemplo={state.ejemplo} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
