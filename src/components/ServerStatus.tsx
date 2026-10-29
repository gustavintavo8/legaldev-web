import type { HealthView } from '../hooks/useHealth';
import styles from './Demo.module.css';

interface Props {
  health: HealthView;
  onExample: () => void;
}

export default function ServerStatus({ health, onExample }: Props) {
  return (
    <p role="status" className={styles.status} data-state={health.state}>
      <span className={styles.dot} aria-hidden="true" />
      <span>
        {health.state === 'online' &&
          `Servidor activo · ${health.chunks.toLocaleString('es-ES')} fragmentos de 22 normas indexados. Un análisis tarda unos 20 s.`}
        {health.state === 'waking' && 'El servidor está arrancando: la primera consulta puede tardar 40–60 s.'}
        {health.state === 'checking' &&
          'Comprobando el servidor… La primera consulta puede tardar 40–60 s si estaba inactivo.'}
        {health.state === 'offline' && (
          <>
            No se puede contactar con el servidor ahora mismo. Puedes{' '}
            <button type="button" className={styles.inlineLink} onClick={onExample}>
              ver un informe de ejemplo
            </button>
            .
          </>
        )}
      </span>
    </p>
  );
}
