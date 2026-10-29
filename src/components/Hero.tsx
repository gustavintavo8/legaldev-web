import { motion, useReducedMotion } from 'motion/react';
import GazetteSheet from './GazetteSheet';
import styles from './Hero.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

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
        <motion.div
          className={styles.field}
          aria-hidden="true"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <motion.div
          className={styles.sheetWrap}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        >
          <GazetteSheet
            highlightDelay={reduce ? 0 : 1.05}
            note={
              <motion.aside
                className={styles.note}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 1.75 }}
              >
                <p className={styles.noteTitle}>Cita comprobada · RGPD, p. 6</p>
                <p>Tu asistente puede crear perfiles de los freelancers y de sus clientes.</p>
                <ul>
                  <li>Seudonimiza los datos antes de generar texto.</li>
                  <li>Documenta el perfilado en el registro de actividades.</li>
                </ul>
              </motion.aside>
            }
          />
        </motion.div>
      </div>
    </header>
  );
}
