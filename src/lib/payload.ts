import type { DatoPersonal, Monetizacion, Questionnaire, TipoIA, TipoProyecto } from './types';

// What the form holds. Differs from Questionnaire only where the form needs a
// value even when the API gets null (tipo_ia stays selected while usa_ia is off).
export interface FormValues {
  tipo_proyecto: TipoProyecto;
  descripcion_breve: string;
  tiene_usuarios_registrados: boolean;
  acceso_publico: boolean;
  tipos_datos_personales: DatoPersonal[];
  usuarios_menores: boolean;
  usuarios_ue: boolean;
  transferencia_datos_terceros: boolean;
  usa_ia: boolean;
  tipo_ia: TipoIA;
  usa_cookies: boolean;
  monetizacion: Monetizacion | null;
  contenido_digital: boolean;
  ccaa: string;
  es_empresa: boolean;
  colegiado: boolean;
}

// The "hidden" values match the constants the old index.html always sent.
export const DEFAULT_VALUES: FormValues = {
  tipo_proyecto: 'app_web',
  descripcion_breve: '',
  tiene_usuarios_registrados: true,
  acceso_publico: false,
  tipos_datos_personales: [],
  usuarios_menores: false,
  usuarios_ue: true,
  transferencia_datos_terceros: false,
  usa_ia: false,
  tipo_ia: 'generativa',
  usa_cookies: false,
  monetizacion: null,
  contenido_digital: false,
  ccaa: 'Andalucía',
  es_empresa: false,
  colegiado: false,
};

export function buildPayload(v: FormValues): Questionnaire {
  return {
    ...v,
    tipos_datos_personales: v.tipos_datos_personales.length > 0 ? v.tipos_datos_personales : ['ninguno'],
    tipo_ia: v.usa_ia ? v.tipo_ia : null,
    // Colegiado applies to individuals only, so a company can never send it.
    colegiado: !v.es_empresa && v.colegiado ? true : null,
  };
}

export function valuesFromQuestionnaire(q: Questionnaire): FormValues {
  return {
    ...q,
    tipo_ia: q.tipo_ia ?? DEFAULT_VALUES.tipo_ia,
    colegiado: q.colegiado === true,
  };
}
