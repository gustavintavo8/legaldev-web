import { useReducedMotion } from 'motion/react';
import GazetteSheet from './GazetteSheet';
import styles from './Hero.module.css';

// The signature move runs once at load, when the main thread is busiest, so it
// is plain CSS (Hero.module.css): field 0–0.7 s, sheet from 0.25 s, highlight
// from 0.75 s, margin note at 1.35 s.
export default function Hero({ onExample }: { onExample: () => void }) {
  const reduce = useReducedMotion();
  const goToDemo = () =>
    document.getElementById('demo')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  return (
    <header className={styles.hero}>
      <div className={`wrap ${styles.copy}`}>
        <h1 className={styles.headline}>Tu código, frente a la ley.</h1>
        <p className={styles.sub}>
          Describe tu proyecto y LegalDev te dice qué te exige el RGPD, la AI Act o la LSSI, subrayando la frase exacta del
          texto oficial donde lo pone.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={goToDemo}>
            Analizar mi proyecto
          </button>
          <button type="button" className={styles.secondary} onClick={onExample}>
            o ver un informe de ejemplo
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        {/* The shutter: the yellow field opens from the left, then the page arrives on it. */}
        <div className={styles.field} aria-hidden="true" />
        <div className={styles.sheetWrap}>
          <GazetteSheet
            note={
              <aside className={styles.note}>
                <p className={styles.noteTitle}>Cita comprobada · RGPD, p. 6</p>
                <p>Tu asistente puede crear perfiles de los freelancers y de sus clientes.</p>
                <ul>
                  <li>Seudonimiza los datos antes de generar texto.</li>
                  <li>Documenta el perfilado en el registro de actividades.</li>
                </ul>
              </aside>
            }
          />
        </div>
      </div>
    </header>
  );
}
