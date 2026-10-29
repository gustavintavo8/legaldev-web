import { buildPayload, DEFAULT_VALUES, valuesFromQuestionnaire } from './payload';
import type { Questionnaire } from './types';

// Copy of legaldev-tfg/datos/informe_ejemplo_entrada.json
const ENTRADA: Questionnaire = {
  es_empresa: false,
  usuarios_menores: false,
  usa_cookies: true,
  ccaa: 'Asturias',
  usuarios_ue: true,
  usa_ia: true,
  transferencia_datos_terceros: true,
  tipo_ia: 'generativa',
  colegiado: null,
  tipo_proyecto: 'saas',
  contenido_digital: false,
  tiene_usuarios_registrados: true,
  tipos_datos_personales: ['nombre', 'email', 'financieros'],
  monetizacion: 'suscripcion',
  acceso_publico: true,
  descripcion_breve:
    'Plataforma web para freelances que gestiona presupuestos, facturas y datos de contacto de sus clientes, con un asistente de IA generativa que redacta propuestas comerciales',
};

it('con los valores por defecto produce el payload actual', () => {
  expect(buildPayload(DEFAULT_VALUES)).toEqual({
    tipo_proyecto: 'app_web',
    descripcion_breve: '',
    usa_ia: false,
    tipo_ia: null,
    usa_cookies: false,
    ccaa: 'Andalucía',
    es_empresa: false,
    tipos_datos_personales: ['ninguno'],
    tiene_usuarios_registrados: true,
    acceso_publico: false,
    usuarios_menores: false,
    usuarios_ue: true,
    transferencia_datos_terceros: false,
    monetizacion: null,
    contenido_digital: false,
    colegiado: null,
  });
});

it('envía tipo_ia solo si usa_ia', () => {
  expect(buildPayload({ ...DEFAULT_VALUES, usa_ia: false, tipo_ia: 'agentes' }).tipo_ia).toBeNull();
  expect(buildPayload({ ...DEFAULT_VALUES, usa_ia: true, tipo_ia: 'agentes' }).tipo_ia).toBe('agentes');
});

it('colegiado false se envía como null', () => {
  expect(buildPayload({ ...DEFAULT_VALUES, colegiado: false }).colegiado).toBeNull();
});

it('colegiado true se envía como true', () => {
  expect(buildPayload({ ...DEFAULT_VALUES, colegiado: true }).colegiado).toBe(true);
});

it('es_empresa fuerza colegiado a null', () => {
  expect(buildPayload({ ...DEFAULT_VALUES, es_empresa: true, colegiado: true }).colegiado).toBeNull();
});

it('valuesFromQuestionnaire invierte buildPayload', () => {
  expect(buildPayload(valuesFromQuestionnaire(ENTRADA))).toEqual(ENTRADA);
});
