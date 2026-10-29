// Indexed corpus: stems are the file names in legaldev/docs, fragment counts
// come from legaldev/chroma_db and the rules from legaldev/app/rag.py:115-218.

export type Grupo = 'UE' | 'España' | 'Guías AEPD' | 'Deontología';

export interface Norma {
  stem: string;
  nombre: string;
  corto: string;
  grupo: Grupo;
  fragmentos: number;
  regla: string;
}

export const GRUPOS: Grupo[] = ['UE', 'España', 'Guías AEPD', 'Deontología'];

const SIMILITUD = 'Entra solo por similitud semántica con tu descripción.';

export const NORMAS: Norma[] = [
  { stem: 'EU AI Act', corto: 'AI Act', nombre: 'Reglamento de Inteligencia Artificial (UE) 2024/1689', grupo: 'UE', fragmentos: 1670, regla: 'Entra siempre que el proyecto usa IA (3 fragmentos garantizados).' },
  { stem: 'Digital Services Act (Reglamento UE 2022-2065)', corto: 'DSA', nombre: 'Reglamento de Servicios Digitales (UE) 2022/2065', grupo: 'UE', fragmentos: 1164, regla: SIMILITUD },
  { stem: 'Cyber Resilience Act (Reglamento UE 2024-2847)', corto: 'CRA', nombre: 'Reglamento de Ciberresiliencia (UE) 2024/2847', grupo: 'UE', fragmentos: 966, regla: SIMILITUD },
  { stem: 'RGPD', corto: 'RGPD', nombre: 'Reglamento General de Protección de Datos (UE) 2016/679', grupo: 'UE', fragmentos: 962, regla: 'Entra siempre que el proyecto trata datos personales (3 fragmentos garantizados).' },
  { stem: 'DORA (Reglamento UE 2022-2554)', corto: 'DORA', nombre: 'Reglamento de Resiliencia Operativa Digital (UE) 2022/2554', grupo: 'UE', fragmentos: 895, regla: SIMILITUD },
  { stem: 'Data Act (Reglamento UE 2023-2854)', corto: 'Data Act', nombre: 'Reglamento de Datos (UE) 2023/2854', grupo: 'UE', fragmentos: 820, regla: SIMILITUD },
  { stem: 'Directiva NIS2', corto: 'NIS2', nombre: 'Directiva NIS2 (UE) 2022/2555', grupo: 'UE', fragmentos: 791, regla: SIMILITUD },
  { stem: 'Data Governance Act (Reglamento UE 2022-868)', corto: 'DGA', nombre: 'Reglamento de Gobernanza de Datos (UE) 2022/868', grupo: 'UE', fragmentos: 541, regla: SIMILITUD },
  { stem: 'Directiva de Responsabilidad por Productos con IA', corto: 'Productos', nombre: 'Directiva (UE) 2024/2853 de responsabilidad por productos defectuosos', grupo: 'UE', fragmentos: 240, regla: SIMILITUD },
  { stem: 'Directiva ePrivacy (2002-58-CE consolidada)', corto: 'ePrivacy', nombre: 'Directiva 2002/58/CE sobre privacidad y comunicaciones electrónicas', grupo: 'UE', fragmentos: 185, regla: SIMILITUD },
  { stem: 'Ley de Propiedad Intelectual', corto: 'LPI', nombre: 'Ley de Propiedad Intelectual (RDL 1/1996)', grupo: 'España', fragmentos: 878, regla: 'Excluida si el proyecto no publica contenido digital; si lo publica, entra por similitud.' },
  { stem: 'LOPDGDD', corto: 'LOPDGDD', nombre: 'Ley Orgánica 3/2018 de Protección de Datos y garantía de los derechos digitales', grupo: 'España', fragmentos: 654, regla: 'Excluida solo si no hay datos personales ni usuarios registrados; si no, entra por similitud.' },
  { stem: 'Real Decreto 311-2022 ENS', corto: 'ENS', nombre: 'Real Decreto 311/2022, Esquema Nacional de Seguridad', grupo: 'España', fragmentos: 630, regla: 'Excluida siempre del informe: solo aplica al sector público y el cuestionario no lo pregunta.' },
  { stem: 'LSSI', corto: 'LSSI', nombre: 'Ley 34/2002 de servicios de la sociedad de la información', grupo: 'España', fragmentos: 355, regla: 'Entra si usa cookies o si es una web, SaaS o tienda online de acceso público (2 fragmentos).' },
  { stem: 'Guía de Análisis de Riesgos para tratamientos de datos personales - AEPD', corto: 'Riesgos', nombre: 'Guía de análisis de riesgos y EIPD · AEPD', grupo: 'Guías AEPD', fragmentos: 945, regla: SIMILITUD },
  { stem: 'IA Agentica desde la perspectiva de proteccion de datos - AEPD', corto: 'IA agéntica', nombre: 'IA agéntica desde la protección de datos · AEPD', grupo: 'Guías AEPD', fragmentos: 528, regla: 'Solo si la IA es de tipo agentes; entonces entra siempre (2 fragmentos).' },
  { stem: 'Adecuación al RGPD de tratamientos que incorporan IA - AEPD', corto: 'RGPD e IA', nombre: 'Adecuación al RGPD de tratamientos que incorporan IA · AEPD', grupo: 'Guías AEPD', fragmentos: 437, regla: 'Excluida si el proyecto no usa IA; si la usa, entra por similitud.' },
  { stem: 'Guía de Privacidad desde el Diseño - AEPD', corto: 'Diseño', nombre: 'Privacidad desde el diseño · AEPD', grupo: 'Guías AEPD', fragmentos: 389, regla: SIMILITUD },
  { stem: 'Guía sobre uso de cookies - AEPD', corto: 'Cookies', nombre: 'Guía sobre el uso de cookies · AEPD', grupo: 'Guías AEPD', fragmentos: 300, regla: 'Entra siempre que el proyecto usa cookies (2 fragmentos).' },
  { stem: 'Guía de Anonimización - AEPD', corto: 'Anonimización', nombre: 'Guía de anonimización · AEPD', grupo: 'Guías AEPD', fragmentos: 202, regla: SIMILITUD },
  { stem: 'Guía para el cumplimiento del deber de informar - AEPD', corto: 'Informar', nombre: 'Guía para cumplir el deber de informar · AEPD', grupo: 'Guías AEPD', fragmentos: 102, regla: SIMILITUD },
  { stem: 'Código Ético y Deontológico CCII', corto: 'CCII', nombre: 'Código Ético y Deontológico del CCII', grupo: 'Deontología', fragmentos: 102, regla: 'Entra si el autor es ingeniero informático colegiado (2 fragmentos).' },
];

export const TOTAL_FRAGMENTOS = 13756;
