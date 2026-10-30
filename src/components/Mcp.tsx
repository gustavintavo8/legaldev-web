import styles from './Mcp.module.css';
import Reveal from './Reveal';

// The tool design in legaldev-tfg/capitulos/23-detalle.tex (table tab:det-mcp-herramientas).
const TOOLS = [
  {
    name: 'analizar_proyecto',
    does: 'Analiza tu proyecto y devuelve el informe con sus citas comprobadas.',
    input: 'los 16 campos del cuestionario',
    output: ['informe', 'normativas_detectadas', 'fragmentos', 'citas'],
  },
  {
    name: 'listar_normativas',
    does: 'Lista las 22 normas del índice y la versión del corpus.',
    input: 'nada',
    output: ['normativas', 'corpus_version'],
  },
  {
    name: 'consultar_obligaciones',
    does: 'Devuelve los fragmentos de una norma para tu contexto, sin pasar por el modelo.',
    input: 'normativa y contexto (hasta 500 caracteres)',
    output: ['fragmentos'],
  },
];

export default function Mcp() {
  return (
    <section className={styles.section} aria-labelledby="mcp-title">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.copy}>
          <Reveal>
            <h2 id="mcp-title" className="title">
              Pronto, dentro de tu editor.
            </h2>
          </Reveal>
          <Reveal as="p" delay={0.07} className="lead">
            LegalDev pasará a ser un servidor MCP. Tu asistente de código podrá usar estas tres herramientas sin salir del
            IDE y recibir el mismo informe con sus citas comprobadas.
          </Reveal>
          <Reveal as="p" delay={0.14} className={styles.status}>
            En desarrollo · demo prevista para diciembre de 2026
          </Reveal>
        </div>

        <div className={styles.tools}>
          <ul aria-label="Herramientas MCP">
            {TOOLS.map((t, i) => (
              <Reveal as="li" key={t.name} delay={0.1 + i * 0.07} className={styles.tool}>
                <code className={styles.name}>{t.name}</code>
                <p className={styles.does}>{t.does}</p>
                <p className={styles.io}>
                  <span>Recibe {t.input}</span>
                  <span>
                    Devuelve{' '}
                    {t.output.map((o, j) => (
                      <span key={o}>
                        <code>{o}</code>
                        {j < t.output.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </p>
              </Reveal>
            ))}
          </ul>
          <p className={styles.caption}>Diseño de las herramientas según el capítulo 23 de la memoria.</p>
        </div>
      </div>
    </section>
  );
}
