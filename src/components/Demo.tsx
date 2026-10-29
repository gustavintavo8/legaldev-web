import { AnimatePresence, motion } from 'motion/react';
import { type FormEvent, useId, useState } from 'react';
import type { Analysis } from '../hooks/useAnalysis';
import type { HealthView } from '../hooks/useHealth';
import type { FormValues } from '../lib/payload';
import type { DatoPersonal, Monetizacion, TipoIA, TipoProyecto } from '../lib/types';
import Chip from './Chip';
import styles from './Demo.module.css';
import Reveal from './Reveal';
import ServerStatus from './ServerStatus';
import Toggle from './Toggle';

const TIPOS_PROYECTO: [TipoProyecto, string][] = [
  ['app_web', 'App web'],
  ['app_movil', 'App móvil'],
  ['api', 'API'],
  ['saas', 'SaaS'],
  ['ecommerce', 'E-commerce'],
];

const DATOS: [DatoPersonal, string][] = [
  ['nombre', 'nombre'],
  ['email', 'email'],
  ['telefono', 'teléfono'],
  ['ubicacion', 'ubicación'],
  ['salud', 'salud'],
  ['financieros', 'financieros'],
  ['biometricos', 'biométricos'],
  ['ninguno', 'ninguno'],
];

const TIPOS_IA: [TipoIA, string][] = [
  ['generativa', 'Generativa'],
  ['clasificacion', 'Clasificación'],
  ['recomendacion', 'Recomendación'],
  ['agentes', 'Agentes'],
  ['vision', 'Visión'],
  ['otro', 'Otro'],
];

const MONETIZACION: [Monetizacion | '', string][] = [
  ['', 'Sin especificar'],
  ['suscripcion', 'Suscripción'],
  ['publicidad', 'Publicidad'],
  ['freemium', 'Freemium'],
  ['pago_unico', 'Pago único'],
  ['marketplace', 'Marketplace'],
  ['ninguna', 'Ninguna'],
];

// Must match the CCAA enum in legaldev/app/models.py exactly, accents included.
const CCAA = [
  'Andalucía',
  'Aragón',
  'Asturias',
  'Baleares',
  'Canarias',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y León',
  'Cataluña',
  'Ceuta',
  'Extremadura',
  'Galicia',
  'La Rioja',
  'Madrid',
  'Melilla',
  'Murcia',
  'Navarra',
  'País Vasco',
  'Valencia',
];

type BoolField = {
  [K in keyof FormValues]: FormValues[K] extends boolean ? K : never;
}[keyof FormValues];

const DETALLES: [BoolField, string][] = [
  ['tiene_usuarios_registrados', '¿Tiene usuarios registrados?'],
  ['acceso_publico', '¿Es de acceso público?'],
  ['usuarios_menores', '¿Tiene usuarios menores de edad?'],
  ['usuarios_ue', '¿Tiene usuarios en la UE?'],
  ['transferencia_datos_terceros', '¿Transfiere datos a terceros?'],
  ['contenido_digital', '¿Publica contenido digital?'],
];

interface Props {
  analysis: Analysis;
  health: HealthView;
}

export default function Demo({ analysis, health }: Props) {
  const { values, setValues, submit, loadExample, state } = analysis;
  const [details, setDetails] = useState(false);
  const id = useId();
  const loading = state.kind === 'loading';

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues({ ...values, [key]: value });

  const setEmpresa = (esEmpresa: boolean) =>
    // Colegiado applies to individuals only: a company can't be one.
    setValues({ ...values, es_empresa: esEmpresa, colegiado: esEmpresa ? false : values.colegiado });

  const toggleDato = (dato: DatoPersonal, on: boolean) =>
    set(
      'tipos_datos_personales',
      on ? [...values.tipos_datos_personales, dato] : values.tipos_datos_personales.filter((d) => d !== dato),
    );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <section id="demo" className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.intro}>
          <Reveal>
            <h2 id={`${id}-title`} className="title">
              Analiza tu proyecto
            </h2>
          </Reveal>
          <Reveal as="p" delay={0.07} className={styles.lead}>
            Responde lo que sepas de tu proyecto. LegalDev cruza tus respuestas con 22 normas oficiales y te
            devuelve qué tienes que implementar, con la frase exacta de la ley que lo exige.
          </Reveal>
          <Reveal delay={0.14}>
            <button type="button" className={styles.exampleLink} onClick={loadExample}>
              ¿Sin tiempo? Mira un informe real
            </button>
          </Reveal>
        </div>

        <Reveal delay={0.1} className={styles.panelWrap}>
          <form className={styles.panel} onSubmit={onSubmit} noValidate>
            <div className={styles.cols}>
              <div className={styles.col}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${id}-tipo`}>
                    Tipo de proyecto
                  </label>
                  <select
                    id={`${id}-tipo`}
                    className={styles.control}
                    value={values.tipo_proyecto}
                    onChange={(e) => set('tipo_proyecto', e.target.value as TipoProyecto)}
                  >
                    {TIPOS_PROYECTO.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className={styles.field}>
                  <legend className={styles.label}>Tipos de datos personales</legend>
                  <div className={styles.chips}>
                    {DATOS.map(([v, l]) => (
                      <Chip
                        key={v}
                        label={l}
                        checked={values.tipos_datos_personales.includes(v)}
                        onChange={(on) => toggleDato(v, on)}
                      />
                    ))}
                  </div>
                </fieldset>

                <div className={styles.field}>
                  <Toggle label="¿Usa inteligencia artificial?" checked={values.usa_ia} onChange={(v) => set('usa_ia', v)} />
                  <AnimatePresence initial={false}>
                    {values.usa_ia && (
                      <motion.div
                        key="tipo-ia"
                        className={styles.reveal}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className={styles.nested}>
                          <label className={styles.label} htmlFor={`${id}-ia`}>
                            Tipo de IA
                          </label>
                          <select
                            id={`${id}-ia`}
                            className={styles.control}
                            value={values.tipo_ia}
                            onChange={(e) => set('tipo_ia', e.target.value as TipoIA)}
                          >
                            {TIPOS_IA.map(([v, l]) => (
                              <option key={v} value={v}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={styles.field}>
                  <Toggle label="¿Usa cookies?" checked={values.usa_cookies} onChange={(v) => set('usa_cookies', v)} />
                </div>
              </div>

              <div className={styles.col}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${id}-desc`}>
                    Descripción breve
                  </label>
                  <textarea
                    id={`${id}-desc`}
                    className={`${styles.control} ${styles.textarea}`}
                    rows={3}
                    maxLength={500}
                    placeholder="Describe tu proyecto en una frase"
                    value={values.descripcion_breve}
                    onChange={(e) => set('descripcion_breve', e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${id}-ccaa`}>
                    Comunidad autónoma
                  </label>
                  <select
                    id={`${id}-ccaa`}
                    className={styles.control}
                    value={values.ccaa}
                    onChange={(e) => set('ccaa', e.target.value)}
                  >
                    {CCAA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <Toggle label="¿Es una empresa?" checked={values.es_empresa} onChange={setEmpresa} />
                  <Toggle
                    label="¿Ingeniero informático colegiado (CCII)?"
                    title="Aplica solo a personas físicas. Los ingenieros colegiados son individuos."
                    checked={values.colegiado}
                    disabled={values.es_empresa}
                    onChange={(v) => set('colegiado', v)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.details}>
              <button
                type="button"
                className={styles.detailsToggle}
                aria-expanded={details}
                aria-controls={`${id}-detalles`}
                onClick={() => setDetails((d) => !d)}
              >
                Más detalles
                <span className={styles.chevron} data-open={details || undefined} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {details && (
                  <motion.div
                    key="detalles"
                    id={`${id}-detalles`}
                    className={styles.reveal}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={styles.detailsBody}>
                      {DETALLES.map(([key, label]) => (
                        <Toggle key={key} label={label} checked={values[key]} onChange={(v) => set(key, v)} />
                      ))}
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor={`${id}-mon`}>
                          Monetización
                        </label>
                        <select
                          id={`${id}-mon`}
                          className={styles.control}
                          value={values.monetizacion ?? ''}
                          onChange={(e) => set('monetizacion', (e.target.value || null) as Monetizacion | null)}
                        >
                          {MONETIZACION.map(([v, l]) => (
                            <option key={l} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
              Analizar proyecto
            </button>

            <ServerStatus health={health} onExample={loadExample} />

            <p className={styles.privacy}>
              Tu descripción se envía al proveedor del modelo (Groq, EE. UU.) para generar el informe. No escribas datos
              personales. <a href="#privacidad">Información de privacidad</a>
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
