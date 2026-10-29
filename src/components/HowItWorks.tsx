import { EJEMPLO } from '../data/example';
import styles from './HowItWorks.module.css';
import Reveal from './Reveal';

// What the deterministic rules (legaldev/app/rag.py:115-218) do with the example input.
const DESCARTADAS = [
  ['ENS', 'solo aplica al sector público'],
  ['Ley de Propiedad Intelectual', 'no publica contenido digital'],
  ['Guía de IA agéntica', 'la IA es generativa, no de agentes'],
];
const GARANTIZADAS = [
  ['RGPD', 'trata nombre, email y datos financieros'],
  ['AI Act', 'usa inteligencia artificial'],
  ['LSSI', 'usa cookies y es una SaaS pública'],
  ['Guía de cookies', 'usa cookies'],
];

// legaldev/app/config.py defaults, and the example's real total.
const EMBUDO: [string, string][] = [
  ['13.756', 'fragmentos indexados de las 22 normas'],
  ['100', 'candidatos más parecidos a tu proyecto'],
  ['25', 'como máximo, los que superan una similitud de 0,40'],
  ['12', 'tras reordenarlos con un cross-encoder, con 4 por norma como mucho'],
  ['21', 'en el ejemplo, al sumar los que garantizan las reglas'],
];

const ENTRADA = JSON.stringify(EJEMPLO.entrada, null, 2);

export default function HowItWorks() {
  const citas = EJEMPLO.respuesta.citas!;
  return (
    <section id="como-funciona" className={styles.section} aria-labelledby="como-funciona-title">
      <div className="wrap">
        <Reveal>
          <h2 id="como-funciona-title" className={`title ${styles.title}`}>
            Cómo llega a cada obligación
          </h2>
        </Reveal>

        <div className={styles.exchange}>
          <div className={styles.call}>
            <Reveal as="p" className={styles.step}>
              Primero, respondes al cuestionario.
            </Reveal>
            <Reveal delay={0.07}>
              <pre className={styles.code}>
                <code>{ENTRADA}</code>
              </pre>
            </Reveal>
          </div>
          <Reveal delay={0.14} className={styles.response}>
            <div className={styles.panel} data-ui>
              <p className={styles.panelTitle}>Antes de buscar, las reglas deciden qué normas entran seguro y cuáles no.</p>
              <div className={styles.rules}>
                <div>
                  <p className={styles.rulesHead}>Descartadas</p>
                  <ul aria-label="Normas descartadas">
                    {DESCARTADAS.map(([n, why]) => (
                      <li key={n}>
                        <s>{n}</s>
                        <span>{why}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={styles.rulesHead}>Garantizadas</p>
                  <ul aria-label="Normas garantizadas">
                    {GARANTIZADAS.map(([n, why]) => (
                      <li key={n}>
                        <b>{n}</b>
                        <span>{why}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className={styles.exchange}>
          <div className={styles.call}>
            <Reveal as="p" className={styles.step}>
              Después, busca en 13.756 fragmentos de la ley.
            </Reveal>
            <Reveal delay={0.07}>
              <p className={styles.quoteIn}>«{EJEMPLO.entrada.descripcion_breve}»</p>
            </Reveal>
          </div>
          <Reveal delay={0.14} className={styles.response}>
            <ol className={styles.funnel} aria-label="Recuperación de fragmentos" data-ui>
              {EMBUDO.map(([n, label], i) => (
                <li key={n} style={{ ['--w' as string]: `${100 - i * 14}%` }}>
                  <span className={styles.funnelNum}>{n}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <div className={`${styles.exchange} ${styles.final}`}>
          <div className={styles.call}>
            <Reveal as="p" className={styles.step}>
              Por último, el modelo redacta y se comprueba cada cita.
            </Reveal>
            <Reveal delay={0.07}>
              <pre className={styles.code}>
                <code>{`modelo: ${EJEMPLO.respuesta.llm_model}\ntemperatura: 0\nfragmentos: ${EJEMPLO.respuesta.chunks_utilizados}`}</code>
              </pre>
            </Reveal>
          </div>
          <Reveal delay={0.14} className={styles.response}>
            <div className={styles.panel} data-ui>
              <p className={styles.panelTitle}>Reglamento General de Protección de Datos (RGPD)</p>
              <blockquote className={styles.quote}>
                <span className={styles.quoteLabel}>Cita comprobada en el texto oficial</span>
                <span className={styles.quoteText}>
                  «ser utilizadas para elaborar per files de las personas físicas e identificarlas.» — RGPD, p. 6
                </span>
              </blockquote>
              <p>
                <b>Interpretación:</b> La IA generativa que redacta propuestas puede crear perfiles a partir de datos
                personales (nombre, email, datos financieros) de los freelancers y sus clientes.
              </p>
              <p className={styles.check}>
                {citas.verificadas} de {citas.total} citas encontradas literalmente en la ley. Las otras{' '}
                {citas.total - citas.verificadas} se marcan como no comprobadas.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal as="p" className={styles.stack}>
          Construido con FastAPI · ChromaDB · LangChain · Groq (gpt-oss-120b) · sentence-transformers · Hugging Face Spaces
        </Reveal>
      </div>
    </section>
  );
}
