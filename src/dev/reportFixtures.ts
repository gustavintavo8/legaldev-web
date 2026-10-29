// Worst-case API responses for the Report panel (break-ui). Values are
// realistic for this backend: stems come from legaldev/docs, the markdown
// follows the report shape in legaldev/app/rag.py, the 404 detail is the
// backend's own wording style.
import { EJEMPLO } from '../data/example';
import { NORMAS } from '../data/normas';
import type { RAGResponse } from '../lib/types';

const WORST_MD = `**Sumario ejecutivo**
La plataforma de gestión para autónomos debe adaptar su tratamiento de datos, sus cookies y su asistente de IA a varias normas.

- Debe obtener consentimiento separado para cookies no esenciales (Guía sobre uso de cookies - AEPD).

---

## Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales (RGPD)

> "los datos personales serán tratados de manera lícita, leal y transparente en relación con el interesado («licitud, lealtad y transparencia»)" — Reglamento General de Protección de Datos (UE) 2016/679, Artículo 5.1.a), p. 35

**Interpretación:** Revisa https://www.aepd.es/documento/guia-proteccion-datos-por-defecto-y-desde-el-diseno-version-actualizada-2024.pdf#page=17&zoom=auto,-107,842 antes de diseñar el registro.

**Implementación:**
- Registrar cada consentimiento en \`consent_records(user_id, purpose, granted_at, revoked_at, ip_hash_sha256)\` con un índice compuesto.
  - Guardar la versión del texto informativo aceptado.
    - Variable de entorno \`LEGALDEV_CONSENT_RETENTION_PERIOD_IN_DAYS_FOR_AUDIT_PURPOSES\` sin valor por defecto.

| Obligación | Artículo | Plazo |
|---|---|---|
| Notificar brechas de seguridad a la autoridad de control | 33 | 72 horas |
| Evaluación de impacto relativa a la protección de datos | 35 | Antes de iniciar el tratamiento |

\`\`\`js
const payload = { tipo_proyecto: 'saas', descripcion_breve: 'Plataforma para gestionar presupuestos, facturas y datos de contacto de clientes de autónomos', usa_ia: true };
\`\`\`

## LSSI‑1

> "Es cualquier entidad prestadora de servicios de la sociedad de la información titular de una página web a los que puede accederse" — LSSI-1, Artículo 22, p. 17

**Interpretación:** Aplica.

**Implementación:**
- Mostrar el aviso de cookies antes de instalar ninguna.
`;

export const FIXTURES: Record<string, RAGResponse> = {
  demo: EJEMPLO.respuesta,
  worst: {
    respuesta_completa: WORST_MD,
    normativas_detectadas: NORMAS.map((n) => n.stem),
    chunks_utilizados: 1,
    disclaimer: EJEMPLO.respuesta.disclaimer,
    corpus_version: '7a2029a4dfd8',
    llm_model: 'openai/gpt-oss-20b',
    citas: {
      total: 2,
      verificadas: 1,
      no_verificadas: ['Es cualquier entidad prestadora de servicios de la sociedad de la información titular de una página web a los que puede '],
    },
  },
  empty: { respuesta_completa: '', normativas_detectadas: [], chunks_utilizados: 0, citas: { total: 0, verificadas: 0, no_verificadas: [] } },
  one: {
    respuesta_completa: '## RGPD\n\n> "datos personales" — RGPD, p. 1\n\n**Implementación:**\n- Una sola acción.',
    normativas_detectadas: ['RGPD'],
    chunks_utilizados: 1,
    llm_model: 'openai/gpt-oss-120b',
    citas: { total: 1, verificadas: 1, no_verificadas: [] },
  },
};

export const WORST_ERROR =
  'No se ha encontrado normativa aplicable con suficiente relevancia para la descripción proporcionada. Revisa la descripción e inténtalo de nuevo indicando qué datos personales trata el proyecto y si usa inteligencia artificial.';
