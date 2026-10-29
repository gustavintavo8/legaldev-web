// Mirrors legaldev/app/models.py (QuestionnaireInput, RAGResponse).

export type TipoProyecto = 'app_web' | 'api' | 'app_movil' | 'saas' | 'ecommerce';

export type DatoPersonal =
  | 'nombre'
  | 'email'
  | 'telefono'
  | 'ubicacion'
  | 'salud'
  | 'financieros'
  | 'biometricos'
  | 'ninguno';

export type TipoIA = 'generativa' | 'clasificacion' | 'recomendacion' | 'agentes' | 'vision' | 'otro';

export type Monetizacion = 'suscripcion' | 'publicidad' | 'freemium' | 'pago_unico' | 'marketplace' | 'ninguna';

export interface Questionnaire {
  tipo_proyecto: TipoProyecto;
  descripcion_breve: string;
  tiene_usuarios_registrados: boolean;
  acceso_publico: boolean;
  tipos_datos_personales: DatoPersonal[];
  usuarios_menores: boolean;
  usuarios_ue: boolean;
  transferencia_datos_terceros: boolean;
  usa_ia: boolean;
  tipo_ia: TipoIA | null;
  usa_cookies: boolean;
  monetizacion: Monetizacion | null;
  contenido_digital: boolean;
  ccaa: string;
  es_empresa: boolean;
  colegiado: boolean | null;
}

export interface CitationStats {
  total: number;
  verificadas: number;
  no_verificadas: string[];
}

export interface RAGResponse {
  respuesta_completa: string;
  normativas_detectadas: string[];
  chunks_utilizados: number;
  disclaimer?: string;
  corpus_version?: string;
  llm_model?: string;
  citas?: CitationStats;
}
