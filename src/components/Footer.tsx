import { useEffect, useState } from 'react';
import { EJEMPLO } from '../data/example';
import { AUTOR, REPO, TUTOR } from '../data/site';
import { API_BASE } from '../lib/api';
import { stripLeadingEmoji } from '../lib/citations';
import styles from './Footer.module.css';
import PrivacyNotice from './PrivacyNotice';

const CLOCK = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });

function useMadridTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return CLOCK.format(now);
}

export default function Footer() {
  const time = useMadridTime();
  const disclaimer = stripLeadingEmoji(EJEMPLO.respuesta.disclaimer ?? '');

  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.tiles}`}>
        <div className={`${styles.tile} ${styles.statement}`}>
          <p className={styles.statementText}>
            LegalDev es un Trabajo Fin de Grado del Grado en Ingeniería Informática en Tecnologías de la Información
            (GIITIN), en la EPI Gijón de la Universidad de Oviedo.
          </p>
          <p>
            Autor: {AUTOR} · Tutor: {TUTOR}
          </p>
          <div className={styles.notice}>
            <p className={styles.noticeLabel}>Aviso</p>
            <p>{disclaimer}</p>
          </div>
        </div>

        <nav className={`${styles.tile} ${styles.navTile}`} aria-label="Pie de página">
          <ul>
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
              <a href="#privacidad">Privacidad</a>
            </li>
          </ul>
        </nav>

        <div className={`${styles.tile} ${styles.place}`}>
          <p>Gijón</p>
          <p className={styles.time}>{time}</p>
        </div>

        <div className={`${styles.tile} ${styles.links}`}>
          <a href={REPO} target="_blank" rel="noopener">
            Código en GitHub
          </a>
          <a href={`${API_BASE}/docs`} target="_blank" rel="noopener">
            Documentación de la API
          </a>
        </div>

        <div className={`${styles.tile} ${styles.privacyTile}`}>
          <PrivacyNotice />
        </div>

        <div className={`${styles.tile} ${styles.wordmark}`} aria-hidden="true">
          LegalDev
        </div>

        <a href="#demo" className={`${styles.tile} ${styles.cta}`}>
          <span>Analizar mi proyecto</span>
          <svg className={styles.arrow} viewBox="0 0 48 48" aria-hidden="true">
            <path d="M8 40 40 8M16 8h24v24" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
