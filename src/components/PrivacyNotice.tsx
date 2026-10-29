import { useEffect, useState } from 'react';
import { AUTOR, CONTACT_EMAIL, REPO } from '../data/site';
import styles from './Footer.module.css';

// Facts from legaldev-tfg/capitulos/20-requisitos.tex (data minimisation item).
// Any change in the backend's processing must be reflected here.
export default function PrivacyNotice({ email = CONTACT_EMAIL }: { email?: string | null }) {
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === '#privacidad');

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#privacidad') setOpen(true);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const contact = email ? (
    <a href={`mailto:${email}`}>{email}</a>
  ) : (
    <a href={`${REPO}/issues`} target="_blank" rel="noopener">
      a través de las issues del repositorio
    </a>
  );

  return (
    <details id="privacidad" className={styles.privacy} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Información de privacidad</summary>
      <dl className={styles.privacyList}>
        <dt>Responsable</dt>
        <dd>
          {AUTOR}. Contacto: {contact}.
        </dd>
        <dt>Finalidad</dt>
        <dd>
          Generar el informe que pides al enviar el formulario y limitar el número de consultas por dirección IP para
          proteger el servicio.
        </dd>
        <dt>Base jurídica</dt>
        <dd>
          El interés legítimo (art. 6.1.f del RGPD) del responsable en ofrecer una demostración pública de su Trabajo Fin
          de Grado y en proteger el servicio frente a abusos. Puedes oponerte a través del contacto.
        </dd>
        <dt>Datos</dt>
        <dd>El cuestionario que envías, incluida la descripción, y la dirección IP de cada petición.</dd>
        <dt>Encargados del tratamiento</dt>
        <dd>
          Groq, proveedor del modelo de lenguaje (EE. UU.), que puede conservar las entradas y salidas hasta 30 días para
          resolver incidencias o investigar abusos. Hugging Face, que aloja la API (EE. UU.) y registra la IP de cada
          petición. Vercel, que aloja esta web.
        </dd>
        <dt>Conservación</dt>
        <dd>
          LegalDev no almacena los cuestionarios. La respuesta se guarda en una caché en memoria durante una hora,
          asociada a un resumen SHA-256 del cuestionario, y desaparece al reiniciar el servidor.
        </dd>
        <dt>Transferencias internacionales</dt>
        <dd>A EE. UU., a través de los encargados citados.</dd>
        <dt>Derechos</dt>
        <dd>
          Acceso, rectificación, supresión, oposición, limitación y portabilidad, a través del contacto. También puedes
          reclamar ante la Agencia Española de Protección de Datos (AEPD, aepd.es).
        </dd>
        <dt>Cookies</dt>
        <dd>Sin cookies propias ni analítica. Las tipografías se sirven desde esta misma web.</dd>
      </dl>
    </details>
  );
}
