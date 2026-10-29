import styles from './Mcp.module.css';
import Reveal from './Reveal';

// Summary of the tool design in legaldev-tfg/capitulos/23-detalle.tex (table tab:det-mcp-herramientas).
const TOOLS = `{
  "tools": [
    {
      "name": "analizar_proyecto",
      "input": "los 16 campos del cuestionario",
      "output": ["informe", "normativas_detectadas", "fragmentos",
                 "citas", "llm_model", "corpus_version"],
      "annotations": { "readOnlyHint": true, "openWorldHint": true }
    },
    {
      "name": "listar_normativas",
      "input": {},
      "output": ["normativas", "corpus_version"],
      "annotations": { "readOnlyHint": true, "openWorldHint": false }
    },
    {
      "name": "consultar_obligaciones",
      "input": { "normativa": "RGPD | LSSI | …", "contexto": "≤ 500 caracteres" },
      "output": ["fragmentos"],
      "annotations": { "readOnlyHint": true, "openWorldHint": false }
    }
  ]
}`;

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
            LegalDev pasará a ser un servidor MCP. Tu asistente de código podrá llamar a analizar_proyecto,
            listar_normativas y consultar_obligaciones sin salir del IDE, y recibir el mismo informe con sus citas
            comprobadas.
          </Reveal>
          <Reveal as="p" delay={0.14} className={styles.status}>
            En desarrollo · demo prevista para diciembre de 2026
          </Reveal>
        </div>
        <Reveal delay={0.1} className={styles.fragment}>
          <p className={styles.caption}>Diseño de las tres herramientas, según el capítulo 23 de la memoria</p>
          <pre className={styles.code} data-ui>
            <code>{TOOLS}</code>
          </pre>
        </Reveal>
      </div>
    </section>
  );
}
