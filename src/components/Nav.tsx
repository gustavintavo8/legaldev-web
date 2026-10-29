import { REPO } from '../data/site';
import styles from './Nav.module.css';

export default function Nav() {
  return (
    <nav className={`wrap ${styles.nav}`} aria-label="Principal">
      <a href="#contenido" className={styles.wordmark}>
        LegalDev
      </a>
      <ul className={styles.links}>
        <li>
          <a href="#como-funciona">Cómo funciona</a>
        </li>
        <li>
          <a href="#normas">Las 22 normas</a>
        </li>
        <li>
          <a href="#demo">Probar</a>
        </li>
        <li>
          <a href={REPO} target="_blank" rel="noopener">
            GitHub
          </a>
        </li>
      </ul>
    </nav>
  );
}
