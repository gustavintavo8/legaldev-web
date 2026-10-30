// Real production output from legaldev-tfg/datos/informe_ejemplo*.json
// (2026-09-18). Shown unedited, artefacts included.
import type { Questionnaire, RAGResponse } from '../lib/types';
import respuesta from './informe-ejemplo.json';
import entrada from './informe-ejemplo-entrada.json';

export const EJEMPLO: { entrada: Questionnaire; respuesta: RAGResponse; etiqueta: string } = {
  entrada: entrada as Questionnaire,
  respuesta: respuesta as RAGResponse,
  etiqueta: 'Informe de ejemplo · SaaS para autónomos con IA generativa · Asturias · generado el 18-09-2026',
};
