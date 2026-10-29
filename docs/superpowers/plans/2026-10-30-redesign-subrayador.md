# Rediseño «Subrayador» — Plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea a tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** sustituir el `index.html` actual por una SPA de Vite + React + TypeScript + Motion que implementa el rediseño «Subrayador sobre el Diario Oficial», sin perder ninguna funcionalidad.

**Arquitectura:** una sola página. Hay un componente por sección, una carpeta `src/lib` con la lógica pura y testeada (payload, API, markdown, citas) y una carpeta `src/data` con los datos reales (normas, RGPD, informe de ejemplo). El estado del análisis vive en un hook `useAnalysis` que comparten el formulario y el informe.

**Stack:** Vite 8, React 19, TypeScript, Motion (`motion/react`), marked, DOMPurify, CSS Modules y @fontsource. Tests con Vitest, jsdom y Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-29-redesign-subrayador-design.md`. Quien ejecute lee el spec y este plan.

## Restricciones globales

- **Versiones exactas**, con `npm install --save-exact`:
  - Producción: `react@19.3.1`, `react-dom@19.3.1`, `motion@14.8.0`, `marked@18.1.2`, `dompurify@3.4.17`, `@fontsource/hanken-grotesk@5.3.0` y `@fontsource/source-serif-4@5.3.1`.
  - Desarrollo: `vite@8.3.5`, `@vitejs/plugin-react@6.1.2`, `typescript@7.0.2`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `vitest@5.0.5`, `jsdom@30.1.3`, `@testing-library/react@16.3.3`, `@testing-library/user-event@14.6.8` y `@testing-library/jest-dom@7.0.1`.
  - Si una versión no resuelve, usa la más cercana disponible y anótalo en el commit.
- **API:** `API_BASE = 'https://gustavintavo8-legaldev.hf.space'`. Endpoints: `GET /health` y `POST /v1/analyze`.
- **Tokens (spec §5.1):** `--paper #FFFFFF`, `--paper-2 #F3F3EF`, `--ink #111111`, `--ink-soft #5A5A54`, `--hl #E9F542`, `--error #B42318`.
- **Tipos de letra:** Hanken Grotesk 400/500 (sin 700) y Source Serif 4 400 + cursiva, la serif **solo** para texto de ley. Monoespaciada solo en `<pre>`/`<code>`.
- **Escala tipográfica:**
  - `--step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)`
  - `--step-body: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)`
  - `--step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)`
  - `--step-head: clamp(2rem, 1.3rem + 3.2vw, 4rem)`
  - Titular del hero: `clamp(52px, 5.2vw, 80px)`.
  - Nada legible por debajo de 13 px. Las entradas de formulario, a 16 px o más.
- **Forma:**
  - Esquinas rectas fuera de los fragmentos `data-ui`.
  - Botones planos, sin sombra y sin gradiente.
  - Sin líneas separadoras, salvo en los campos de formulario y dentro de `data-ui`.
  - Sin emojis en la interfaz.
- **Textos:**
  - Todo en castellano.
  - Etiquetas en minúscula de frase: nada de versalitas espaciadas ni etiquetas sobre los titulares.
  - Sin numeración 01/02/03.
- **Movimiento:**
  - Solo `transform` y `opacity`; `clip-path` únicamente en la persiana del hero.
  - Las transiciones de interfaz duran menos de 250 ms.
  - Con `prefers-reduced-motion`, nada se desplaza.
  - El contenido nunca puede quedarse oculto.
- **Nunca se commitean** `node_modules/`, `dist/`, `.taste-skill/` ni `.superpowers/`. Nada de push ni PR sin que lo pida el autor.
- Cada commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Foco de revisión

Situaciones que el spec implica pero que ninguna prueba obvia cubre. Cada una tiene su test en la tarea indicada.

1. **Doble envío durante un arranque en frío** (40–60 s): el botón queda deshabilitado mientras carga y un segundo submit no lanza otra petición. Va en la tarea 5.
2. **«Ver ejemplo» mientras hay un análisis real en curso:** la petición en curso se aborta y su respuesta tardía no sobrescribe el ejemplo. Va en la tarea 5.
3. **Respuesta de un backend antiguo sin `citas`, `llm_model`, `corpus_version` o `disclaimer`:** el informe se pinta sin esas piezas y sin errores. Va en la tarea 6.
4. **`citas.total === 0`:** no se muestra «0 de 0». Se muestra «Este informe no contiene citas literales». Va en la tarea 6.
5. **Markdown con HTML o `<script>` reflejado desde la descripción:** se sanea. Va en la tarea 3.

---

### Tarea 1: Andamiaje de Vite + React y tokens

**Archivos:**
- Crear:
  - Configuración: `package.json`, `vite.config.ts`, `tsconfig.json`, `.gitignore`.
  - Código y estilos: `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/global.css`.
  - Tests: `src/test/setup.ts`, `src/App.test.tsx`.
- Sustituir `index.html`: ahora es la entrada de Vite. El contenido anterior se queda en `master`.
- Modificar `vercel.json`.

**Interfaces:**
- Produce:
  - `App()`, que de momento renderiza `<main id="contenido">` vacío.
  - Los tokens CSS globales de las restricciones globales.
  - Los scripts `npm run dev | build | preview | test`.

- [ ] **Paso 1: Escribe `package.json`** con `"type": "module"`, los scripts `dev: vite`, `build: tsc --noEmit && vite build`, `preview: vite preview --port 4173` y `test: vitest run`, y las dependencias de las restricciones globales. Ejecuta `npm install` y comprueba que termina sin errores.
- [ ] **Paso 2: Configura Vite y Vitest:**
  - `vite.config.ts` con el plugin de React y `test: { environment: 'jsdom', setupFiles: ['src/test/setup.ts'], css: { modules: { classNameStrategy: 'non-scoped' } } }`.
  - `src/test/setup.ts` importa `@testing-library/jest-dom/vitest` y crea un stub de `window.matchMedia` y de `IntersectionObserver` para jsdom.
- [ ] **Paso 3: Test que falla.** `src/App.test.tsx` con `it('renderiza el contenedor principal')`: `render(<App/>)` y `expect(document.querySelector('main#contenido')).toBeInTheDocument()`. Ejecuta `npm test` y comprueba que FALLA porque `App` aún no existe.
- [ ] **Paso 4: Implementa:**
  - `index.html`: `lang="es"`, la meta `description` actual, `<title>LegalDev — Qué leyes aplican a tu software</title>`, `<div id="root">` y un `<noscript>`. El `<noscript>` dice «LegalDev analiza 22 normas oficiales y te dice qué obligaciones tiene tu proyecto software. Esta demo necesita JavaScript.» y enlaza a `https://github.com/gustavintavo8/legaldev` y a `https://gustavintavo8-legaldev.hf.space/docs`.
  - `src/main.tsx`: importa `@fontsource/hanken-grotesk/400.css`, `/500.css`, `@fontsource/source-serif-4/400.css`, `/400-italic.css` y los dos CSS de `styles`.
  - `tokens.css`: los tokens en `:root`.
  - `global.css`: un reset mínimo; `body` con `background: var(--paper)`, `color: var(--ink)`, `font: 400 var(--step-body)/1.45 'Hanken Grotesk', system-ui, sans-serif` y `-webkit-tap-highlight-color: transparent`; `:focus-visible` con contorno de 2 px en `--ink` y desplazamiento de 2 px; `::selection` en `--hl`.
- [ ] **Paso 5: Configura el despliegue:**
  - `vercel.json` queda como `{"framework":"vite","buildCommand":"npm run build","outputDirectory":"dist","rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`.
  - `.gitignore` lista `node_modules/`, `dist/`, `.taste-skill/` y `.superpowers/`.
- [ ] **Paso 6: Comprueba.** `npm test` debe pasar y `npm run build` debe generar `dist/index.html` sin errores de tipos.
- [ ] **Paso 7: Commit:** `git add package.json package-lock.json vite.config.ts tsconfig.json .gitignore index.html vercel.json src` con el mensaje `chore: scaffold Vite + React + TS app for redesign`.

### Tarea 2: Payload y cliente de la API

**Archivos:**
- Crear: `src/lib/payload.ts`, `src/lib/api.ts`, `src/lib/types.ts`.
- Tests: `src/lib/payload.test.ts`, `src/lib/api.test.ts`.

**Interfaces:**
- Produce, en `types.ts`:
  - `type DatoPersonal = 'nombre'|'email'|'telefono'|'ubicacion'|'salud'|'financieros'|'biometricos'|'ninguno'`.
  - `type TipoIA = 'generativa'|'clasificacion'|'recomendacion'|'agentes'|'vision'|'otro'`.
  - `type Monetizacion = 'suscripcion'|'publicidad'|'freemium'|'pago_unico'|'marketplace'|'ninguna'`.
  - `interface Questionnaire`: los 16 campos de `legaldev/app/models.py:68-93`.
  - `interface RAGResponse { respuesta_completa: string; normativas_detectadas: string[]; chunks_utilizados: number; disclaimer?: string; corpus_version?: string; llm_model?: string; citas?: { total: number; verificadas: number; no_verificadas: string[] } }`.
- Produce, en `payload.ts`:
  - `interface FormValues` (los mismos 16 campos, con `tipo_ia: TipoIA` siempre presente, `monetizacion: Monetizacion | null` y `colegiado: boolean`).
  - `DEFAULT_VALUES: FormValues`.
  - `buildPayload(v: FormValues): Questionnaire`.
  - `valuesFromQuestionnaire(q: Questionnaire): FormValues`.
- Produce, en `api.ts`:
  - `API_BASE`.
  - `type Health = { state: 'online'; chunks: number } | { state: 'waking' } | { state: 'offline' }`.
  - `fetchHealth(signal?: AbortSignal): Promise<Health>`, con timeout de 8000 ms vía `AbortSignal.timeout`, combinado con `signal` si se pasa.
  - `analyze(q: Questionnaire, signal?: AbortSignal): Promise<RAGResponse>`.
  - `class ApiError extends Error { status: number | null; detail?: string }`.
  - `errorMessage(e: unknown): string`.

- [ ] **Paso 1: Tests que fallan** en `payload.test.ts`:
  - `it('con los valores por defecto produce el payload actual')`: `buildPayload(DEFAULT_VALUES)` debe ser `toEqual` a `{tipo_proyecto:'app_web', descripcion_breve:'', usa_ia:false, tipo_ia:null, usa_cookies:false, ccaa:'Andalucía', es_empresa:false, tipos_datos_personales:['ninguno'], tiene_usuarios_registrados:true, acceso_publico:false, usuarios_menores:false, usuarios_ue:true, transferencia_datos_terceros:false, monetizacion:null, contenido_digital:false, colegiado:null}`.
  - `it('envía tipo_ia solo si usa_ia')`: con `{usa_ia:false, tipo_ia:'agentes'}` → `tipo_ia === null`; con `usa_ia:true` → `'agentes'`.
  - `it('colegiado false se envía como null')` y `it('colegiado true se envía como true')`.
  - `it('es_empresa fuerza colegiado a null')`: `{es_empresa:true, colegiado:true}` → `colegiado === null`.
  - `it('valuesFromQuestionnaire invierte buildPayload')`: con `informe_ejemplo_entrada.json` (tarea 4; mientras tanto, pega el objeto en el test), `buildPayload(valuesFromQuestionnaire(q))` debe ser `toEqual(q)`.
- [ ] **Paso 2: Tests que fallan** en `api.test.ts`, con `vi.stubGlobal('fetch', ...)`:
  - `fetchHealth` → `{state:'online', chunks:13756}` si responde `200 {status:'ok', docs_indexed:13756}`.
  - `fetchHealth` → `{state:'waking'}` si el fetch rechaza con un `DOMException` de nombre `'TimeoutError'`.
  - `fetchHealth` → `{state:'offline'}` si devuelve 500 o falla la red.
  - `analyze` hace POST a `${API_BASE}/v1/analyze` con `Content-Type: application/json` y el body JSON.
  - `analyze` con 404 `{detail:'Sin cobertura'}` lanza `ApiError` con `status 404` y `detail 'Sin cobertura'`.
  - `errorMessage`:
    - 404 con detail → el detail.
    - 422 → `'Algún dato del formulario no es válido. Revísalo y vuelve a intentarlo.'`
    - 429 → `'Demasiadas consultas: espera un minuto y vuelve a intentarlo.'`
    - 503 → `'El servicio no está disponible ahora mismo. Inténtalo en unos minutos.'`
    - `TypeError` de red → `'No se ha podido contactar con el servidor. Si estaba dormido, puede tardar hasta un minuto en despertar.'`
    - Otro estado → `` `Error inesperado (HTTP ${status}).` ``
- [ ] **Paso 3: Comprueba que fallan:** `npm test -- src/lib`.
- [ ] **Paso 4: Implementa los tres archivos.** `DEFAULT_VALUES` toma `tipo_ia:'generativa'`, `ccaa:'Andalucía'`, `tipo_proyecto:'app_web'` y los valores fijos del spec §4.5. `buildPayload` aplica `['ninguno']` cuando no hay ningún dato marcado.
- [ ] **Paso 5: Comprueba que pasan:** `npm test -- src/lib`.
- [ ] **Paso 6: Commit** con el mensaje `feat: add typed payload builder and API client`.

### Tarea 3: Markdown saneado y marcado de citas

**Archivos:**
- Crear: `src/lib/markdown.ts`, `src/lib/citations.ts`.
- Tests: `src/lib/markdown.test.ts`, `src/lib/citations.test.ts`.

**Interfaces:**
- Produce:
  - `renderMarkdown(md: string): string`: `DOMPurify.sanitize(marked.parse(md, { async: false }))`.
  - `normalize(text: string): string`: replica `legaldev/app/citations.py:41,137-138`. Aplica NFKC, quita espacios en blanco, comillas `"“”«»'‘’`, guiones `-–—`, guion blando, `|` y los caracteres invisibles U+200B, U+200C, U+200D, U+2060 y U+FEFF, y pasa a minúsculas con `toLocaleLowerCase('es')`.
  - `markCitations(root: HTMLElement, unverified: string[]): 'marked' | 'neutral'`.
  - `stripLeadingEmoji(s: string): string`.

- [ ] **Paso 1: Tests que fallan** en `markdown.test.ts`:
  - `renderMarkdown('<script>alert(1)</script>**hola**')` no contiene `<script` y sí `<strong>hola</strong>`.
  - `renderMarkdown('<img src=x onerror=alert(1)>')` no contiene `onerror`.
  - `renderMarkdown('> "cita" — RGPD, p. 6')` contiene `<blockquote>`.
- [ ] **Paso 2: Tests que fallan** en `citations.test.ts`:
  - `normalize('«Per files» – de las\u200B personas')` → `'perfilesdelaspersonas'`.
  - **Marca todo:** monta en un `div` el HTML de tres blockquotes (A, B y C) y llama a `markCitations(div, [prefijo120(B)])`. Devuelve `'marked'`. A y C tienen `data-cita="verificada"`. B tiene `data-cita="no-verificada"` y un hermano siguiente `<p class="cita-nota">No encontrada literalmente en el texto oficial</p>`.
  - **Queda neutro:** con `unverified` igual a `['texto que no aparece en ningún blockquote']`, devuelve `'neutral'` y ningún blockquote tiene `data-cita`.
  - **Lista vacía:** `markCitations(div, [])` devuelve `'marked'` y todos llevan `data-cita="verificada"`.
  - `stripLeadingEmoji('⚠️ Esta información es orientativa')` → `'Esta información es orientativa'`.
- [ ] **Paso 3: Comprueba que fallan:** `npm test -- src/lib/markdown src/lib/citations`.
- [ ] **Paso 4: Implementa `markCitations`.** Para cada `blockquote`, extrae el texto entre la primera comilla de apertura y la última de cierre (o todo el texto si no hay comillas) y normalízalo. Una entrada de `unverified` casa con un blockquote si su `normalize` es prefijo del `normalize` del blockquote. Si todas las entradas casan con blockquotes distintos, marca y devuelve `'marked'`. Si no, no toca nada y devuelve `'neutral'`.
- [ ] **Paso 5: Comprueba que pasan.**
- [ ] **Paso 6: Commit** con el mensaje `feat: sanitize report markdown and mark verified citations`.

### Tarea 4: Datos reales

**Archivos:**
- Crear:
  - `src/data/normas.ts` y `src/data/rgpd.ts`.
  - `src/data/informe-ejemplo.json` y `src/data/informe-ejemplo-entrada.json`, copiados sin cambios de `C:\Users\gusta\Documents\legaldev-tfg\datos\informe_ejemplo.json` y `informe_ejemplo_entrada.json`.
  - `src/data/site.ts`.
- Tests: `src/data/data.test.ts`.

**Interfaces:**
- Produce:
  - `type Grupo = 'UE' | 'España' | 'Guías AEPD' | 'Deontología'`.
  - `interface Norma { stem: string; nombre: string; corto: string; grupo: Grupo; fragmentos: number; regla: string }`.
  - `NORMAS: Norma[]` (anexo B, en ese orden).
  - `GRUPOS: Grupo[]`.
  - `TOTAL_FRAGMENTOS = 13756`.
  - `RGPD_PAGINA = { cabecera: ['4.5.2016', 'L 119/6', 'Diario Oficial de la Unión Europea', 'ES'], considerandos: {n: number; texto: string}[] }` (anexo A).
  - `FRASE_CITADA = 'ser utilizadas para elaborar perfiles de las personas físicas e identificarlas.'`
  - `EJEMPLO: { entrada: Questionnaire; respuesta: RAGResponse; etiqueta: string }`, con `etiqueta = 'Informe de ejemplo · SaaS para autónomos con IA generativa · Asturias · generado el 18-09-2026'`.
  - `site.ts` exporta `AUTOR = 'Gustavo Sobrado Aller'`, `TUTOR = 'David Melendi Palacio'`, `REPO = 'https://github.com/gustavintavo8/legaldev'` y `CONTACT_EMAIL: string | null = null`.

- [ ] **Paso 1: Tests que fallan:**
  - `NORMAS.length === 22`.
  - La suma de `fragmentos` es `13756`.
  - El recuento por grupo es UE 10, España 4, Guías AEPD 7 y Deontología 1.
  - Los `stem` son únicos.
  - `RGPD_PAGINA.considerandos.map(c => c.n)` es `[30, 31, 32, 33]`.
  - El considerando 30 termina en `FRASE_CITADA`.
  - `EJEMPLO.respuesta.citas` es `{total:13, verificadas:10}` y tiene 3 `no_verificadas`.
  - `EJEMPLO.respuesta.chunks_utilizados === 21`.
- [ ] **Paso 2: Comprueba que fallan.**
- [ ] **Paso 3: Implementa** con los valores de los anexos A y B. Para importar JSON, activa `resolveJsonModule` en `tsconfig.json`.
- [ ] **Paso 4: Comprueba que pasan.**
- [ ] **Paso 5: Commit** con el mensaje `feat: add real corpus data, RGPD page and example report`.

### Tarea 5: Estado del análisis y sección «Probar»

**Archivos:**
- Crear:
  - `src/hooks/useAnalysis.ts` y `src/hooks/useHealth.ts`.
  - `src/components/Demo.tsx`, `Demo.module.css`, `ServerStatus.tsx`, `Toggle.tsx`, `Chip.tsx` y `Reveal.tsx`.
- Tests: `src/components/Demo.test.tsx` y `src/components/Reveal.test.tsx`.

**Interfaces:**
- Consume:
  - Tarea 2: `buildPayload`, `valuesFromQuestionnaire`, `DEFAULT_VALUES`, `analyze`, `fetchHealth`, `errorMessage`.
  - Tarea 4: `EJEMPLO`.
- Produce:
  - `type AnalysisState = { kind: 'idle' } | { kind: 'loading'; startedAt: number } | { kind: 'success'; data: RAGResponse; ejemplo: boolean } | { kind: 'error'; message: string }`.
  - `useAnalysis(): { state: AnalysisState; values: FormValues; setValues: (v: FormValues) => void; submit: () => void; loadExample: () => void }`.
  - `useHealth(): Health | { state: 'checking' }`.
  - `<Demo analysis={ReturnType<typeof useAnalysis>} health={ReturnType<typeof useHealth>} />`, con `id="demo"`.
  - `<Reveal as? delay?>`: entrada con Motion `whileInView` y `once`. Muestra el contenido sin animación con reduced motion y lo hace visible igualmente pasados 1500 ms aunque el observador no dispare.
  - `App` crea un solo `useAnalysis()` y se lo pasa a `Demo`, a `Hero` (tarea 7) y a `Report` (tarea 6).

- [ ] **Paso 1: Tests que fallan** en `Demo.test.tsx`, con `fetch` simulado:
  - `it('es_empresa deshabilita y desmarca colegiado')`: marca colegiado y después empresa. Colegiado queda `toBeDisabled()` y `not.toBeChecked()`.
  - `it('tipo de IA solo aparece con usa_ia')`: no está el `combobox` «Tipo de IA»; se marca «¿Usa inteligencia artificial?» y aparece.
  - `it('sin tocar nada envía el payload actual')`: escribe «Tienda online de cerámica» en la descripción y envía. El body de `fetch` es igual a `buildPayload({...DEFAULT_VALUES, descripcion_breve:'Tienda online de cerámica'})`, que coincide con el test de la tarea 2.
  - `it('«Más detalles» está cerrado y contiene los 7 campos')`.
  - `it('incluye los valores nuevos del enum')`: hay un chip «biométricos», y con `usa_ia` el select de tipo de IA tiene las opciones «Visión» y «Otro».
  - `it('deshabilita el botón mientras carga y no duplica la petición')`: con un `fetch` que nunca resuelve, dos clics en «Analizar proyecto» → `fetch` se llama una vez y el botón queda `toBeDisabled()`.
  - `it('cargar el ejemplo aborta el análisis en curso')`: con `fetch` pendiente, se pulsa «Ver un informe de ejemplo». La señal del fetch queda `aborted === true`, el estado pasa a `success` con `ejemplo: true` y resolver después el fetch no cambia el estado.
  - `it('el ejemplo rellena el formulario')`: la descripción muestra el texto de `EJEMPLO.entrada.descripcion_breve`.
  - `it('muestra el mensaje de error de la API')`: con un 429, aparece el texto de `errorMessage` de la tarea 2.
  - `it('línea de estado')`: con health `online` y 13756 fragmentos, el texto contiene `13.756 fragmentos de 22 normas`. Con `waking`, contiene `40–60 s`. Con `offline`, contiene un botón «ver un informe de ejemplo».
  - `it('muestra el aviso de privacidad de primera capa')`: contiene «No escribas datos personales» y un enlace a `#privacidad`.
- [ ] **Paso 2: Test que falla** en `Reveal.test.tsx`: con un `IntersectionObserver` simulado que nunca dispara, el hijo es visible (`opacity` distinta de `'0'`) tras `vi.advanceTimersByTime(1500)`.
- [ ] **Paso 3: Comprueba que fallan.**
- [ ] **Paso 4: Implementa.**
  - `useAnalysis` guarda un `AbortController` en una ref y aborta el anterior en cada `submit` o `loadExample`.
  - El estado `loading` muestra «Analizando normativa…», un contador de segundos real con `setInterval` de 1 s y un indicador indeterminado, que es la única animación infinita.
  - Los textos de la línea de estado y del aviso de primera capa son literales del spec §5.2 y §5.2.1.
  - Las etiquetas son `<label>` reales, a 13 px o más y en minúscula de frase.
  - Los `<option>` de comunidad autónoma son los 19 actuales, sin cambios.
  - «Más detalles» es un `<details>` cuya altura anima Motion.
- [ ] **Paso 5: Comprueba que pasan.**
- [ ] **Paso 6: Commit** con el mensaje `feat: analysis form with server status, details and example loading`.

### Tarea 6: Informe

**Archivos:**
- Crear: `src/components/Report.tsx`, `Report.module.css` y `CountUp.tsx`.
- Tests: `src/components/Report.test.tsx`.

**Interfaces:**
- Consume:
  - Tarea 3: `renderMarkdown`, `markCitations`, `stripLeadingEmoji`.
  - Tarea 5: `AnalysisState`.
- Produce: `<Report state={AnalysisState} />`.
  - Con `success`, renderiza `<article data-ui data-ai-generated="true" data-ai-model={llm_model}>`. Si no hay `llm_model`, el valor es `"desconocido"`.
  - `AnimatePresence` gestiona el cambio entre estados.

- [ ] **Paso 1: Tests que fallan**, con `EJEMPLO.respuesta`:
  - Hay 5 chips con los textos de `normativas_detectadas`.
  - Aparece el texto «10 de 13 citas encontradas literalmente en la ley». `CountUp` termina en el valor final, y con reduced motion el valor es final desde el principio.
  - El aviso de IA contiene «redactado por un modelo de lenguaje (openai/gpt-oss-120b)».
  - El disclaimer empieza por «Esta información es orientativa» y no contiene «⚠».
  - `article` tiene `data-ai-generated="true"`.
  - Si `markCitations` devuelve `'marked'`, hay 10 `blockquote[data-cita="verificada"]`. Si devuelve `'neutral'`, no hay ninguno. Para comprobarlo, mockea `citations.ts` en un test aparte.
  - Se ve la etiqueta del ejemplo cuando `ejemplo: true`.
  - **Foco 3:** con una respuesta mínima `{respuesta_completa:'## RGPD\n\ntexto', normativas_detectadas:[], chunks_utilizados:0}`, renderiza sin lanzar, sin cifra de citas, sin aviso de modelo y sin disclaimer, y sigue teniendo el `h2`.
  - **Foco 4:** con `citas:{total:0, verificadas:0, no_verificadas:[]}`, aparece «Este informe no contiene citas literales» y no aparece «0 de 0».
  - Con `error`, el bloque de error contiene el mensaje y no contiene «⚠».
- [ ] **Paso 2: Comprueba que fallan.**
- [ ] **Paso 3: Implementa.**
  - El cuerpo se inyecta con `dangerouslySetInnerHTML` desde `renderMarkdown`. En un `useLayoutEffect`, `markCitations(ref.current, citas?.no_verificadas ?? [])`.
  - Estilos del spec §5.2: chips rellenos, blockquote en serif sobre `--paper-2`, `[data-cita="verificada"]` con subrayado `--hl` y `hr` como espacio.
  - Las secciones del informe entran en cascada con Motion y `once`.
  - El scroll hasta el informe es suave y respeta reduced motion.
- [ ] **Paso 4: Comprueba que pasan.**
- [ ] **Paso 5: Commit** con el mensaje `feat: report panel with verified-citation marking and AI notice`.

### Tarea 7: Navegación y hero con la hoja del Diario Oficial

**Archivos:**
- Crear: `src/components/Nav.tsx`, `Hero.tsx`, `GazetteSheet.tsx` y sus `.module.css`.
- Tests: `src/components/Hero.test.tsx`.

**Interfaces:**
- Consume:
  - Tarea 4: `RGPD_PAGINA`, `FRASE_CITADA`.
  - Tarea 5: `loadExample` de `useAnalysis`.
- Produce: `<Nav/>` y `<Hero onExample={() => void} />`.

- [ ] **Paso 1: Tests que fallan:**
  - El `h1` tiene el texto «Tu código, frente a la ley.»
  - La hoja contiene «L 119/6» y los cuatro considerandos.
  - La frase subrayada es `mark` con el texto `FRASE_CITADA`.
  - La nota al margen contiene «Cita comprobada · RGPD, p. 6».
  - Pulsar «Analizar mi proyecto» llama a `scrollIntoView` de `#demo`.
  - Pulsar «o ver un informe de ejemplo» llama a `onExample`.
  - La navegación tiene enlaces a `#como-funciona`, `#normas`, `#demo` y al repositorio.
- [ ] **Paso 2: Comprueba que fallan.**
- [ ] **Paso 3: Implementa** según el spec §5.2, sección 1, y el plano *Fragment on a shaped stage* de la hoja de dirección (`draw.mjs --show`).
  - El escenario `--hl` va de la columna 5 a la 12, empieza al 42 % de la altura, sangra por la derecha y por abajo y lleva un chaflán con `clip-path` en la esquina superior izquierda.
  - La hoja es `data-ui`, en serif, justificada y a una columna. El considerando 30 va en `--ink` y el resto en `--ink-soft`.
  - La nota va en `--ink` sobre texto blanco y solapa el borde inferior derecho. Su texto es «Tu asistente puede crear perfiles de los freelancers y de sus clientes.» y las viñetas «Seudonimiza los datos antes de generar texto.» y «Documenta el perfilado en el registro de actividades.», sacadas de la sección RGPD del ejemplo.
  - **Movimiento firma:**
    - La persiana abre con `clip-path` de `inset(0 100% 0 0)` a `inset(0)`, en 900 ms, con `[0.22, 1, 0.36, 1]`.
    - Después, el subrayado: `scaleX` de 0 a 1 con `transform-origin: left`, en 600 ms y con 150 ms de retraso.
    - Con reduced motion, todo aparece en su estado final.
  - **Móvil (≤ 640 px):** titular a 10vw en dos líneas y escenario a todo el ancho. La hoja tiene un ancho mínimo de 560 px y se recorta por la derecha con `overflow: hidden`, no se escala.
- [ ] **Paso 4: Comprueba que pasan.**
- [ ] **Paso 5: Commit** con el mensaje `feat: hero with official gazette sheet and highlighter signature move`.

### Tarea 8: «Cómo funciona»

**Archivos:**
- Crear: `src/components/HowItWorks.tsx` y `.module.css`.
- Tests: `src/components/HowItWorks.test.tsx`.

**Interfaces:**
- Consume: `EJEMPLO` y `NORMAS` (tarea 4) y `<Reveal>` (tarea 5).
- Produce: `<HowItWorks/>`, con `id="como-funciona"`.

- [ ] **Paso 1: Tests que fallan:**
  - El título es «Cómo llega a cada obligación».
  - Aparecen las tres frases «Primero, respondes al cuestionario.», «Después, busca en 13.756 fragmentos de la ley.» y «Por último, el modelo redacta y se comprueba cada cita.»
  - Hay un `pre code` con `"tipo_proyecto": "saas"`.
  - Las reglas listan como excluidas `ENS`, `Ley de Propiedad Intelectual` y `Guía de IA agéntica`, y como incluidas `RGPD`, `AI Act`, `LSSI` y `Guía de cookies`.
  - El embudo muestra `100`, `25`, `12` y `21`.
  - Aparece el texto «10 de 13».
  - La línea de tecnologías contiene «FastAPI», «ChromaDB», «LangChain», «Groq (gpt-oss-120b)», «sentence-transformers» y «Hugging Face Spaces».
- [ ] **Paso 2: Comprueba que fallan.**
- [ ] **Paso 3: Implementa** según el plano *Call and response column*.
  - La columna mide 560 px y la tercera respuesta se sale de ella hasta 760 px.
  - El embudo va en filas rellenas de `--paper-2`, sin líneas.
  - Las cifras aparecen con `<Reveal>`.
  - Nada va ligado al scroll de forma continua.
  - La línea de tecnologías va en texto a `--step-lead`.
- [ ] **Paso 4: Comprueba que pasan.**
- [ ] **Paso 5: Commit** con el mensaje `feat: how-it-works call-and-response with real pipeline numbers`.

### Tarea 9: La estantería de las 22 normas

**Archivos:**
- Crear: `src/components/Shelf.tsx` y `.module.css`.
- Tests: `src/components/Shelf.test.tsx`.

**Interfaces:**
- Consume: `NORMAS`, `GRUPOS` y `TOTAL_FRAGMENTOS` (tarea 4).
- Produce: `<Shelf/>`, con `id="normas"`.

- [ ] **Paso 1: Tests que fallan:**
  - El título es «Las 22 normas que lee».
  - Hay 22 `button` de lomo, y cada uno tiene como `aria-label` `` `${nombre}, ${fragmentos} fragmentos` ``.
  - Al cargar, el RGPD tiene `aria-pressed="true"` y el panel de detalle muestra su `nombre`, «962 fragmentos» y su `regla`.
  - Pulsar el lomo del ENS hace que el panel muestre «Excluida siempre del informe».
  - Con las flechas izquierda y derecha, el foco y la selección pasan al lomo vecino.
  - Aparecen las cuatro etiquetas de grupo.
- [ ] **Paso 2: Comprueba que fallan.**
- [ ] **Paso 3: Implementa.**
  - La sección es el único campo `--hl` a sangre.
  - La altura de cada lomo es `fragmentos / 1670 * 100 %` de un contenedor de 260 px, con hueco entre grupos.
  - Los lomos crecen desde la base con `scaleY`, escalonados 30 ms y solo una vez.
  - El nombre del lomo elegido pasa al panel con `layoutId` y un muelle `{ type: 'spring', bounce: 0.15, duration: 0.4 }`.
  - **Móvil (≤ 640 px):** barras horizontales con `corto` legible y la anchura proporcional. El panel de detalle va debajo.
- [ ] **Paso 4: Comprueba que pasan.**
- [ ] **Paso 5: Commit** con el mensaje `feat: interactive shelf of the 22 indexed laws`.

### Tarea 10: MCP, pie y aviso de privacidad

**Archivos:**
- Crear: `src/components/Mcp.tsx`, `Footer.tsx`, `PrivacyNotice.tsx` y sus `.module.css`.
- Tests: `src/components/Footer.test.tsx`.
- Modificar: `src/App.tsx`, que compone todas las secciones en el orden del spec §5.2.

**Interfaces:**
- Consume: `site.ts` (tarea 4) y `EJEMPLO.respuesta.disclaimer`.
- Produce: `<Mcp/>`, `<Footer/>` y `<PrivacyNotice/>`, este último con `id="privacidad"` y abierto cuando la URL lleva el hash `#privacidad`.

- [ ] **Paso 1: Tests que fallan:**
  - **MCP:**
    - El título es «Pronto, dentro de tu editor.»
    - Aparecen `analizar_proyecto`, `listar_normativas` y `consultar_obligaciones`.
    - Aparece la etiqueta «En desarrollo · demo prevista para diciembre de 2026».
  - **Pie:**
    - Contiene `AUTOR`, `TUTOR`, «EPI Gijón» y «Universidad de Oviedo».
    - Lleva el rótulo «Aviso», nunca «Aviso legal», y el disclaimer sin emoji.
    - Muestra «Gijón» y una hora con el formato `HH:MM`.
    - La casilla «Analizar mi proyecto» enlaza a `#demo`.
  - **Privacidad:**
    - Contiene «interés legítimo (art. 6.1.f del RGPD)», «Groq», «30 días», «Hugging Face», «Vercel», «una hora», «AEPD» y «Sin cookies propias ni analítica».
    - Con `CONTACT_EMAIL === null`, el contacto es «a través de las issues del repositorio» con enlace a `${REPO}/issues`.
    - Con un email, el contacto es un enlace `mailto:`.
- [ ] **Paso 2: Comprueba que fallan.**
- [ ] **Paso 3: Implementa** según los planos del spec.
  - El MCP va en campo `--ink` con un `pre code` de los esquemas de las tres herramientas, basados en `legaldev-tfg/capitulos/23-detalle.tex:450-460`.
  - El pie es de casillas con esquinas rectas.
  - La hora sale de `Intl.DateTimeFormat('es-ES', {timeZone:'Europe/Madrid', hour:'2-digit', minute:'2-digit'})` y se refresca cada 30 s.
  - El texto de privacidad es el literal del spec §5.2.1.
- [ ] **Paso 4: Comprueba que pasan.** Tanto `npm test` completo como `npm run build`.
- [ ] **Paso 5: Commit** con el mensaje `feat: MCP preview, footer tiles and privacy notice`.

### Tarea 11: Verificación en navegador y gate de diseño

**Archivos:** solo correcciones en los componentes que hagan falta. Los informes van a `.taste-skill/after/`, que no se commitea.

- [ ] **Paso 1: Arranca el build de producción.** `npm run build`, y `npm run preview` en segundo plano, en el puerto 4173.
- [ ] **Paso 2: Pasa el gate.**
  - `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs src`, y corrige cada FAIL.
  - `node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:4173 --out .taste-skill/after`.
  - Esperado: **0 FAIL**. Cada WARN se corrige o se justifica en el informe final. Puede aparecer `few-pictures` si el inspector no cuenta los fragmentos `data-ui`, y es la excepción prevista en el spec §7.
  - Abre todas las capturas que lista.
- [ ] **Paso 3: Recorre la web con el MCP de Playwright** (`mcp__plugin_playwright_playwright__*`) en `http://localhost:4173`:
  - Análisis real: éxito con normas, «X de Y citas», aviso de IA y disclaimer.
  - `usa_ia` → tipo de IA.
  - Empresa → colegiado deshabilitado.
  - Ejemplo: rellena el formulario y pinta el informe.
  - Errores: bloquea `**/v1/analyze` con `browser_run_code_unsafe`/`route` y comprueba el mensaje de red.
  - Los tres estados del health check.
  - Teclado: tabula por todo el formulario y la estantería.
  - Comprueba la consola sin errores.
  - Saca capturas a 1440, 768 y 390.
- [ ] **Paso 4: Pasadas de skills:**
  - `break-ui` sobre `Report`: nombres de norma larguísimos, 0 y 12 chips, una palabra de 300 caracteres sin cortes, markdown de 50 secciones y `citas` 0/0.
  - `mobile-native` a 390 px: campos a 16 px o más, `100svh`, sin destello al tocar y zonas táctiles de 44 px o más.
  - `review-animations` sobre la persiana, el subrayado, la estantería y el informe.
  - Corrige lo que salga.
- [ ] **Paso 5: Compara antes y después.** Pon en paralelo `.taste-skill/before/*-fold.jpg` y `.taste-skill/after/*-fold.jpg` en los tres anchos, y anota en el informe final los FAIL de antes (16) frente a los de después.
- [ ] **Paso 6: Commit** de las correcciones con el mensaje `fix: address design gate and browser verification findings`.

---

## Anexo A: texto de la página L 119/6 (RGPD)

Es el texto extraído de `legaldev/docs/RGPD.pdf`, página 6 (índice 5), con los artefactos de extracción corregidos. Va literal en `src/data/rgpd.ts`.

- **(30)** Las personas físicas pueden ser asociadas a identificadores en línea facilitados por sus dispositivos, aplicaciones, herramientas y protocolos, como direcciones de los protocolos de internet, identificadores de sesión en forma de «cookies» u otros identificadores, como etiquetas de identificación por radiofrecuencia. Esto puede dejar huellas que, en particular, al ser combinadas con identificadores únicos y otros datos recibidos por los servidores, pueden ser utilizadas para elaborar perfiles de las personas físicas e identificarlas.
- **(31)** Las autoridades públicas a las que se comunican datos personales en virtud de una obligación legal para el ejercicio de su misión oficial, como las autoridades fiscales y aduaneras, las unidades de investigación financiera, las autoridades administrativas independientes o los organismos de supervisión de los mercados financieros encargados de la reglamentación y supervisión de los mercados de valores, no deben considerarse destinatarios de datos si reciben datos personales que son necesarios para llevar a cabo una investigación concreta de interés general, de conformidad con el Derecho de la Unión o de los Estados miembros. Las solicitudes de comunicación de las autoridades públicas siempre deben presentarse por escrito, de forma motivada y con carácter ocasional, y no deben referirse a la totalidad de un fichero ni dar lugar a la interconexión de varios ficheros. El tratamiento de datos personales por dichas autoridades públicas debe ser conforme con la normativa en materia de protección de datos que sea de aplicación en función de la finalidad del tratamiento.
- **(32)** El consentimiento debe darse mediante un acto afirmativo claro que refleje una manifestación de voluntad libre, específica, informada, e inequívoca del interesado de aceptar el tratamiento de datos de carácter personal que le conciernen, como una declaración por escrito, inclusive por medios electrónicos, o una declaración verbal. Esto podría incluir marcar una casilla de un sitio web en internet, escoger parámetros técnicos para la utilización de servicios de la sociedad de la información, o cualquier otra declaración o conducta que indique claramente en este contexto que el interesado acepta la propuesta de tratamiento de sus datos personales. Por tanto, el silencio, las casillas ya marcadas o la inacción no deben constituir consentimiento. El consentimiento debe darse para todas las actividades de tratamiento realizadas con el mismo o los mismos fines. Cuando el tratamiento tenga varios fines, debe darse el consentimiento para todos ellos. Si el consentimiento del interesado se ha de dar a raíz de una solicitud por medios electrónicos, la solicitud ha de ser clara, concisa y no perturbar innecesariamente el uso del servicio para el que se presta.
- **(33)** Con frecuencia no es posible determinar totalmente la finalidad del tratamiento de los datos personales con fines de investigación científica en el momento de su recogida. Por consiguiente, debe permitirse a los interesados dar su consentimiento para determinados ámbitos de investigación científica que respeten las normas éticas reconocidas para la investigación científica. Los interesados deben tener la oportunidad de dar su consentimiento solamente para determinadas áreas de investigación o partes de proyectos de investigación, en la medida en que lo permita la finalidad perseguida.

## Anexo B: las 22 normas

Los `stem` son la raíz de los ficheros de `legaldev/docs`. Los fragmentos salen de `legaldev/chroma_db`. Las reglas salen de `legaldev/app/rag.py:115-218`.

Textos de `regla` que se repiten:
- **(S)** «Entra solo por similitud semántica con tu descripción.»
- **(R)** «Entra siempre que el proyecto trata datos personales (3 fragmentos garantizados).»

| stem | corto | nombre | grupo | fragmentos | regla |
|---|---|---|---|---|---|
| EU AI Act | AI Act | Reglamento de Inteligencia Artificial (UE) 2024/1689 | UE | 1670 | «Entra siempre que el proyecto usa IA (3 fragmentos garantizados).» |
| Digital Services Act (Reglamento UE 2022-2065) | DSA | Reglamento de Servicios Digitales (UE) 2022/2065 | UE | 1164 | (S) |
| Cyber Resilience Act (Reglamento UE 2024-2847) | CRA | Reglamento de Ciberresiliencia (UE) 2024/2847 | UE | 966 | (S) |
| RGPD | RGPD | Reglamento General de Protección de Datos (UE) 2016/679 | UE | 962 | (R) |
| DORA (Reglamento UE 2022-2554) | DORA | Reglamento de Resiliencia Operativa Digital (UE) 2022/2554 | UE | 895 | (S) |
| Data Act (Reglamento UE 2023-2854) | Data Act | Reglamento de Datos (UE) 2023/2854 | UE | 820 | (S) |
| Directiva NIS2 | NIS2 | Directiva NIS2 (UE) 2022/2555 | UE | 791 | (S) |
| Data Governance Act (Reglamento UE 2022-868) | DGA | Reglamento de Gobernanza de Datos (UE) 2022/868 | UE | 541 | (S) |
| Directiva de Responsabilidad por Productos con IA | Productos | Directiva (UE) 2024/2853 de responsabilidad por productos defectuosos | UE | 240 | (S) |
| Directiva ePrivacy (2002-58-CE consolidada) | ePrivacy | Directiva 2002/58/CE sobre privacidad y comunicaciones electrónicas | UE | 185 | (S) |
| Ley de Propiedad Intelectual | LPI | Ley de Propiedad Intelectual (RDL 1/1996) | España | 878 | «Excluida si el proyecto no publica contenido digital; si lo publica, entra por similitud.» |
| LOPDGDD | LOPDGDD | Ley Orgánica 3/2018 de Protección de Datos y garantía de los derechos digitales | España | 654 | «Excluida solo si no hay datos personales ni usuarios registrados; si no, entra por similitud.» |
| Real Decreto 311-2022 ENS | ENS | Real Decreto 311/2022, Esquema Nacional de Seguridad | España | 630 | «Excluida siempre del informe: solo aplica al sector público y el cuestionario no lo pregunta.» |
| LSSI | LSSI | Ley 34/2002 de servicios de la sociedad de la información | España | 355 | «Entra si usa cookies o si es una web, SaaS o tienda online de acceso público (2 fragmentos).» |
| Guía de Análisis de Riesgos para tratamientos de datos personales - AEPD | Riesgos | Guía de análisis de riesgos y EIPD · AEPD | Guías AEPD | 945 | (S) |
| IA Agentica desde la perspectiva de proteccion de datos - AEPD | IA agéntica | IA agéntica desde la protección de datos · AEPD | Guías AEPD | 528 | «Solo si la IA es de tipo agentes; entonces entra siempre (2 fragmentos).» |
| Adecuación al RGPD de tratamientos que incorporan IA - AEPD | RGPD e IA | Adecuación al RGPD de tratamientos que incorporan IA · AEPD | Guías AEPD | 437 | «Excluida si el proyecto no usa IA; si la usa, entra por similitud.» |
| Guía de Privacidad desde el Diseño - AEPD | Diseño | Privacidad desde el diseño · AEPD | Guías AEPD | 389 | (S) |
| Guía sobre uso de cookies - AEPD | Cookies | Guía sobre el uso de cookies · AEPD | Guías AEPD | 300 | «Entra siempre que el proyecto usa cookies (2 fragmentos).» |
| Guía de Anonimización - AEPD | Anonimización | Guía de anonimización · AEPD | Guías AEPD | 202 | (S) |
| Guía para el cumplimiento del deber de informar - AEPD | Informar | Guía para cumplir el deber de informar · AEPD | Guías AEPD | 102 | (S) |
| Código Ético y Deontológico CCII | CCII | Código Ético y Deontológico del CCII | Deontología | 102 | «Entra si el autor es ingeniero informático colegiado (2 fragmentos).» |
