# LegalDev web — Rediseño «Subrayador sobre el Diario Oficial»

Fecha: 2026-10-29 · Rama: `redesign/subrayador` · Sustituye el aspecto definido en `2026-05-09-landing-page-design.md`. La funcionalidad de `2026-05-11-colegiado-frontend-design.md` se mantiene.

## 1. Intención

`index.html` es la demo pública del RAG de LegalDev para el TFG («LegalDev: asistente de cumplimiento normativo para proyectos software integrado en el flujo de desarrollo mediante MCP», Gustavo Sobrado Aller, GIITIN, EPI Gijón, Universidad de Oviedo).

El autor la quiere como una **mini landing explicativa**: como si LegalDev fuera un producto comercial que se enseña a un cliente potencial, que aquí es el tribunal. Tiene que ser **funcional ante todo**. Tiene que quedar «resultona» y expresar bien lo que el RAG tiene que decir. **No** debe ser una landing recargada ni llevar animaciones locas. Sobre todo, debe perder el aspecto de «hecha por IA» que tiene ahora. El autor rechazó dos rondas de bocetos por **sosos y vacíos**. Quitar adornos no basta: el espacio que dejan se llena con contenido real, color y escala.

El argumento que la página debe hacer visible, tomado de la memoria: los asistentes de código responden a preguntas legales de memoria, sin fuente comprobable. LegalDev aplica reglas deterministas, recupera fragmentos del texto oficial y **comprueba cada cita contra la ley**.

**La idea:** en esta página, *la frase exacta del Diario Oficial que LegalDev cita* se convierte en *la imagen principal, subrayada con rotulador fosforito, con la obligación técnica anotada al margen*. Ningún competidor genérico de «IA legal» puede enseñar su cita comprobada en la hoja original.

**Lo que se puede hacer en la página:**
- El análisis real contra la API.
- Un **informe de ejemplo real** que se carga al instante. Sirve para no depender del arranque en frío del servidor.

## 2. Objetivos, no objetivos y anti-objetivos

**Objetivos**
- En cinco segundos, quien llega entiende qué es LegalDev y qué hacer: analizar su proyecto o ver un ejemplo.
- El formulario, el health check, el aviso de arranque en frío, el toggle de colegiado y el panel de respuesta siguen funcionando igual (§4).
- El informe enseña lo que la API ya devuelve y hoy se pierde: `citas`, `disclaimer`, `llm_model` y `corpus_version`.
- Se corrigen los datos desactualizados:
  - Son 22 normas, no 16.
  - El modelo es `openai/gpt-oss-120b`, no «Groq — llama-4-scout».
  - `/health.docs_indexed` cuenta **fragmentos**, no documentos.
- El gate de taste-skill (`lint.mjs` e `inspect.mjs`) da **0 FAIL** a 1440, 768 y 390 px. Las excepciones se documentan (§7).
- En el móvil la página es una composición propia, no una versión encogida.

**No objetivos**
- Ningún cambio en el backend (`legaldev`).
- Sin SSR, sin rutas y sin librería de componentes.
- Sin interfaz para `/v1/feedback`.
- No se implementa el MCP.
- No se crean páginas nuevas ni rutas.

**Anti-objetivos.** Cualquiera de estas cosas sería un fracaso aunque todo funcione:
- Que parezca la landing de una startup de IA: monoespaciada decorativa, glows, gradientes, rejillas, pastillas, 01/02/03 o tarjetas idénticas.
- Que dé a entender que es asesoramiento legal.
- Que presente el MCP como si ya existiera.
- Que invente pruebas: clientes, testimonios, logos o cifras de negocio.
- Que se sienta vacía o sosa.
- Que el movimiento llame más la atención que el contenido.

## 3. Stack y restricciones técnicas

El autor abrió la puerta a una tecnología de front más avanzada para que el resultado quede mejor y las animaciones sean de más calidad. **La elección del stack es decisión mía.**

- **Vite + React + TypeScript**, como sitio estático de una sola página. Es la base más sencilla para una página con una parte interactiva grande (formulario, informe, estantería), y Vercel la despliega sin servidor. Next.js no aporta nada aquí: no hay rutas, ni SSR, ni backend propio.
- **Motion** (`motion/react`, antes Framer Motion) para el movimiento: muelles, animaciones de layout (por ejemplo, el lomo que pasa a panel de detalle), `AnimatePresence` para entradas y salidas, y `useReducedMotion`.
- **Estilos en CSS propio con custom properties y CSS Modules**, sin Tailwind ni librería de componentes. Los tokens de §5.1 se definen una sola vez en `:root`.
- **Markdown y saneado:** `marked` + `DOMPurify` instalados como dependencias npm, con versión exacta en `package-lock.json` y sin CDN.
- **Fuentes:** Hanken Grotesk y Source Serif 4, autoalojadas con `@fontsource`, o desde Google Fonts si complica.
- **Estructura:** un componente por sección (`Nav`, `Hero`, `Demo`, `Report`, `HowItWorks`, `Shelf`, `Mcp`, `Footer`), más `api.ts` (health, analyze y mapeo de errores) y `data/` (normas, informe de ejemplo y su entrada).
  - El informe de ejemplo se importa como JSON: ya no hace falta incrustarlo en un `<script>`.
  - El `index.html` actual se sustituye.
  - La versión anterior sigue en el historial de git, en `master`.
- **Despliegue:** `vercel.json` pasa a declarar el framework (`"framework": "vite"`, salida `dist`) y mantiene el rewrite a `index.html`. Hay que comprobar en Vercel que el proyecto ejecuta el build. Hasta ahora era un sitio estático sin build.
- Ya **no** hace falta que funcione abriéndolo con `file://`. Basta con el build de producción.
- `API_BASE = 'https://gustavintavo8-legaldev.hf.space'`, en una constante (o en `import.meta.env.VITE_API_BASE` con ese valor por defecto). Los enlaces a `/docs` usan el mismo origen.
- `.taste-skill/`, `.superpowers/`, `node_modules/` y `dist/` no se commitean.
- **Consecuencia para el TFG:** la memoria describe la web y tiene capturas suyas (`legaldev-tfg/figuras/web-*.png`). Habrá que actualizar las capturas y la descripción técnica. Eso queda fuera de este trabajo.

## 4. Funcionalidad que no se puede romper

Este es el comportamiento actual de `index.html` (en `master`). El rediseño lo vuelve a implementar en React con el mismo resultado:

1. **Health check al cargar.**
   - `GET /health` con timeout de 8 s.
   - Si responde `ok`: estado «online» con `docs_indexed`, formateado con `toLocaleString()`.
   - Si salta el timeout (`TimeoutError`): estado «despertando».
   - Cualquier otro fallo: estado «offline».
   - Los textos cambian (ver §5.2), pero los tres estados y su lógica se mantienen.
2. **Aviso de arranque en frío:** «La primera consulta puede tardar 40–60 s si el servidor estaba inactivo». Se fusiona con el estado del servidor (§5.2), pero siempre tiene que ser visible junto al botón de analizar.
3. **`usa_ia` → `tipo_ia`:** el selector de tipo de IA solo se muestra con `usa_ia` marcado. Se envía `tipo_ia: null` si `usa_ia` es falso.
4. **Colegiado:** `syncColegiado()`. Si `es_empresa` está marcado, `colegiado` queda deshabilitado y desmarcado. Se ejecuta al cargar y en cada `change` de `es_empresa`. Se envía `colegiado: checked || null`.
5. **Payload de `POST /v1/analyze`:**
   - Los mismos nombres y tipos que hoy.
   - `tipos_datos_personales` vacío se envía como `['ninguno']`.
   - Los campos que hoy van fijos conservan **los mismos valores por defecto**: `tiene_usuarios_registrados: true`, `acceso_publico: false`, `usuarios_menores: false`, `usuarios_ue: true`, `transferencia_datos_terceros: false`, `monetizacion: null`, `contenido_digital: false`.
6. **Máquina de estados de la salida:** `loading`, `success` y `error`, con scroll suave al resultado o al error.
7. **Render del informe:** `marked.parse(respuesta_completa)` con estilos para h1, h2, h3, p, ul, ol, li, code, strong, blockquote y hr. Ahora se pasa además por `DOMPurify.sanitize`.
8. **Botón del hero:** hace scroll suave a `#demo`.
9. Los `<option>` de comunidad autónoma deben coincidir **exactamente** con el enum del backend, con tildes incluidas (`legaldev/app/models.py:46-65`).

## 5. Diseño (decidido con el autor)

El autor eligió la dirección **A · Subrayador sobre el Diario Oficial**: el boceto `direccion-v2.html`, opción A. La skill `design-taste-frontend` sacó la dirección «The product performs» (semilla 1997028541) con la paleta conservada y la tipografía Hanken Grotesk. Se reimprime con `node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`. La geometría sale de esa hoja; el contenido y el orden, de esta especificación.

### 5.1 Tokens

| Rol | Valor | Uso |
|---|---|---|
| `--paper` | `#FFFFFF` | Fondo de la página |
| `--paper-2` | `#F3F3EF` | Escalón de tono para superficies: formulario, paneles y la hoja del Diario |
| `--ink` | `#111111` | Todo el texto corrido; campos oscuros (sección MCP, nota al margen) |
| `--ink-soft` | `#5A5A54` | Solo notas secundarias, nunca texto corrido |
| `--hl` | `#E9F542` | Subrayador. Va en el subrayado de citas, el botón principal y **un único** campo de color a sangre (la sección de las 22 normas) |
| `--error` | `#B42318` | Texto de error |

- **Tipografía (decisión mía; dos familias como máximo):**
  - **Hanken Grotesk** 400 y 500 para toda la interfaz y los titulares. Sin negrita de 700; la jerarquía la marcan el tamaño y el peso 500.
  - **Source Serif 4** 400, también en cursiva, **solo** para el texto de la ley: la hoja del Diario y los `blockquote` del informe. La ley habla siempre en serif.
  - La monoespaciada solo aparece en `<pre>`/`<code>` reales.
- **Escala:** los cuatro pasos de la hoja (`--step-small`, `--step-body`, `--step-lead`, `--step-head`) más el tamaño del titular del hero, `clamp(52px, 5.2vw, 80px)`. No hay más de cinco tamaños. El texto corrido mide 16 px o más y nada legible baja de 13 px.
- **Forma:**
  - Esquinas rectas en todo lo que queda fuera de los fragmentos `data-ui`.
  - Un solo estilo de botón: rectangular, relleno plano y sin sombra.
  - Los separadores son espacio o escalón de tono, nunca líneas. Las únicas excepciones son los campos de formulario y los fragmentos `data-ui`.
- **Márgenes:** un solo par de márgenes exteriores en toda la página. Entre secciones van de 120 a 240 px en escritorio.

### 5.2 Secciones, en orden

**0. Navegación**
- Una fila sencilla sobre `--paper`, sin línea inferior: «LegalDev» como marca en texto a la izquierda; a la derecha, «Cómo funciona · Las 22 normas · Probar · GitHub».
- No es cristal ni una pastilla flotante. Si se hace fija, lleva fondo opaco.

**1. Hero** (plano de la hoja: *Fragment on a shaped stage*)
- **Titular (`h1`):** «Tu código, frente a la ley.» Tiene que ocupar dos líneas o menos en todos los anchos. Si no cabe, se acorta la frase antes que el tamaño.
- **Frase de apoyo:** «Describe tu proyecto y LegalDev te dice qué te exige el RGPD, la AI Act o la LSSI, subrayando la frase exacta del texto oficial donde lo pone.»
- **Acciones:** «Analizar mi proyecto» como botón principal, que lleva a `#demo`, y «o ver un informe de ejemplo» como enlace de texto (§5.3).
- **Escenario:** un campo plano `--hl` que cubre las columnas 5–12 desde el 42 % de la altura y sangra por la derecha y por abajo. Tiene la esquina superior izquierda cortada con `clip-path`, y ese corte es la única decoración. Encima va el fragmento `data-ui`: **la hoja L 119/6 del Diario Oficial de la Unión Europea (4.5.2016)**.
  - **Cabecera:** «L 119/6 · Diario Oficial de la Unión Europea · 4.5.2016».
  - **Cuerpo (decisión mía):** copia la página real, que se puede comprobar. Lleva el **texto íntegro y real** de los considerandos 30 a 33, que están en la página L 119/6 del PDF `legaldev/docs/RGPD.pdf`. Va en una sola columna, como el original, en serif y justificado, y se corrigen solo los artefactos de extracción. El 30 va en tinta plena y el resto en `--ink-soft`. Así el subrayado queda cerca del principio de la hoja y se ve sin hacer scroll, también en el móvil.
  - **Subrayado:** cubre la frase «ser utilizadas para elaborar perfiles de las personas físicas e identificarlas.»
  - **Nota al margen** (`--ink` sobre blanco, solapando el borde inferior derecho de la hoja): «Cita comprobada · RGPD, p. 6», una línea de interpretación y dos viñetas de implementación sacadas del informe de ejemplo real.
- **En el móvil:**
  - El titular va a unos 10vw en dos líneas, debajo la frase y el botón.
  - El escenario ocupa todo el ancho y sangra por los dos lados.
  - La hoja se recorta por la derecha en vez de encogerse; tiene que seguir siendo legible.

**2. Probar** (`id="demo"`)
- **Título:** «Analiza tu proyecto».
- **Formulario:**
  - Los mismos 9 campos visibles, a dos columnas en escritorio y una en el móvil.
  - Las etiquetas van en minúscula de frase a tamaño legible. Nada de versalitas espaciadas.
  - Los tipos de datos personales son chips rellenos y marcables, con estado de foco visible.
  - Los toggles son interruptores planos, y el deshabilitado se ve claramente.
  - **Añadidos al enum:** `biometricos` en datos personales; `vision` y `otro` en tipo de IA.
- **«Más detalles» (decisión mía):** un `<details>` cerrado por defecto con los 7 campos que hoy van fijos. Son `tiene_usuarios_registrados`, `acceso_publico`, `usuarios_menores`, `usuarios_ue`, `transferencia_datos_terceros`, `contenido_digital` y `monetizacion`. Este último es un select con «Ninguna (sin especificar)» → `null`, `suscripcion`, `publicidad`, `freemium`, `pago_unico`, `marketplace` y `ninguna`. Sus valores iniciales son los de §4.5, así que si nadie abre el desplegable el payload sale idéntico al de hoy.
- **Botón:** «Analizar proyecto», relleno `--hl` con texto `--ink`, a todo el ancho del formulario.
- **Línea de estado del servidor:** está junto al botón y sustituye a la pastilla del hero y al aviso suelto. Tiene tres textos:
  - Online: «Servidor activo · 13.756 fragmentos de 22 normas indexados. Un análisis tarda unos 20 s.»
  - Despertando: «El servidor está arrancando: la primera consulta puede tardar 40–60 s.»
  - Offline: «No se puede contactar con el servidor ahora mismo. Puedes ver un informe de ejemplo.»
  - En los tres casos va un indicador de color, verde o amarillo/gris, nunca con glow.
- **Cargando:** el texto «Analizando normativa…», un **contador real de segundos** transcurridos y un indicador indeterminado discreto. Es la única animación infinita permitida. No se fingen etapas con tiempos inventados.
- **Informe** (fragmento `data-ui`):
  - **Cabecera:**
    - Las normas de `normativas_detectadas` como chips rellenos, no con contorno.
    - El texto «`chunks_utilizados` fragmentos citados».
    - La cifra destacada: «**{verificadas} de {total} citas encontradas literalmente en la ley**».
    - En una línea secundaria: el modelo, la versión del corpus y, si es el informe de ejemplo, su fecha.
  - **Cuerpo:** el markdown saneado.
    - `h2` en Hanken 500.
    - `blockquote` en Source Serif sobre `--paper-2`, en estilo neutro.
    - **El subrayado `--hl` significa «cita comprobada» y no se usa para nada más** (decisión mía). Para aplicarlo:
      - Se normaliza cada `blockquote` igual que en `legaldev/app/citations.py`: mayúsculas, comillas, guiones y espacios.
      - Se compara con los prefijos de 120 caracteres de `citas.no_verificadas`.
      - Si **todas** las no verificadas encuentran su cita, las demás se subrayan como comprobadas y las no verificadas llevan la nota «No encontrada literalmente en el texto oficial».
      - Si falla alguna coincidencia, todas se quedan neutras y solo se muestra la cifra global.
      - El texto del informe no se toca; solo cambia su presentación.
    - «Interpretación» e «Implementación» se mantienen tal como llegan.
    - `hr` se convierte en espacio.
  - **Aviso de IA** (art. 50 del Reglamento de IA, pendiente C-05 de la memoria; decisión mía):
    - Junto a la cabecera del informe va el texto: «Este informe lo ha redactado un modelo de lenguaje ({llm_model}) a partir de fragmentos de la ley recuperados por LegalDev. Las citas se comprueban de forma automática; la interpretación, no».
    - El contenedor del informe lleva un marcado legible por máquina: `data-ai-generated="true"` y `data-ai-model="{llm_model}"`.
    - Si eso cumple del todo el art. 50 lo valora el autor en la memoria.
  - **Pie:** el `disclaimer` de la API, completo, sin el emoji inicial «⚠️» (no se usan emojis en la interfaz).
- **Error:** un bloque sobrio sin emoji (se quita el ⚠), con mensajes en castellano según el caso:
  - 404: el `detail` del backend.
  - 422: datos no válidos.
  - 429: «Demasiadas consultas: espera un minuto».
  - 503: «Servicio no disponible».
  - Fallo de red: sugerencia de arranque en frío y enlace al ejemplo.
- **Ejemplo:** el enlace «¿Sin tiempo? Mira un informe real». Ver §5.3.

**3. Cómo funciona** (`id="como-funciona"`; plano *Call and response column*)
- **Título:** «Cómo llega a cada obligación».
- **Tres intercambios**, cada uno con una frase, la «llamada» (lo que entra) y la «respuesta» (un fragmento `data-ui` con datos reales del caso de ejemplo):
  1. «Primero, respondes al cuestionario.»
     - Llamada: la entrada de ejemplo (`legaldev-tfg/datos/informe_ejemplo_entrada.json`) en `<pre><code>`.
     - Respuesta: qué hacen las reglas deterministas con esa entrada:
       - Excluidas: ENS (siempre), Ley de Propiedad Intelectual (no hay contenido digital) y Guía de IA agéntica (la IA es generativa, no agentes).
       - Inyectadas: RGPD (hay datos personales), AI Act (usa IA), LSSI (cookies y SaaS pública) y Guía de cookies AEPD.
     - Hay que comprobarlo contra `legaldev/app/rag.py:115-218`.
  2. «Después, busca en 13.756 fragmentos de la ley.»
     - Respuesta: el embudo con números reales: 100 candidatos → solo los de similitud ≥ 0,40 → 25 → reordenados por un cross-encoder (`bge-reranker-base`) → 12, como mucho 4 por norma → más las inyecciones = **21 fragmentos** en el ejemplo.
  3. «Por último, el modelo redacta y se comprueba cada cita.»
     - Respuesta: un bloque real del informe, con la cita, su comprobación y «10 de 13 citas verificadas».
     - Este fragmento se sale de la columna y es más ancho que los otros dos.
- **Línea de tecnologías:** «Construido con FastAPI · ChromaDB · LangChain · Groq (gpt-oss-120b) · sentence-transformers · Hugging Face Spaces». Son nombres en texto a unos 22 px, en una fila y sin tarjetas.

**4. Las 22 normas** (`id="normas"`; el único campo de color `--hl` a sangre)
- **Título:** «Las 22 normas que lee».
- **Estantería:** 22 lomos, cada uno con una altura proporcional a sus fragmentos, agrupados por UE (10), España (4), Guías AEPD (7) y Deontología (1). Hay un hueco y una etiqueta por grupo.
- **Cada lomo es un `<button>`:** el foco, el hover o el toque muestran un panel de detalle con:
  - El nombre completo.
  - El grupo.
  - Los fragmentos.
  - Cuándo la meten las reglas («Entra siempre que hay datos personales», «Excluida siempre del informe», «Solo por similitud semántica», etc.).
  - Hay un lomo seleccionado por defecto, el RGPD.
- **Datos por norma:** salen de `legaldev/chroma_db` y de `rag.py`. El recuento por fuente está en el informe de exploración: AI Act 1670, DSA 1164, CRA 966, RGPD 962, DORA 895, Data Act 820, NIS2 791, DGA 541, Directiva productos IA 240, ePrivacy 185, LPI 878, LOPDGDD 654, ENS 630, LSSI 355, Análisis de riesgos/EIPD 945, IA agéntica 528, RGPD-IA 437, Privacidad desde el diseño 389, Cookies 300, Anonimización 202, Deber de informar 102, Código CCII 102. Total: 13.756.
- **En el móvil:** barras horizontales con el nombre legible, en lugar de lomos con texto girado.

**5. Lo siguiente: el MCP** (campo `--ink`, texto `--paper`)
- **Título:** «Pronto, dentro de tu editor.»
- **Frase:** LegalDev pasará a ser un servidor MCP, y el asistente de código podrá llamar a `analizar_proyecto`, `listar_normativas` y `consultar_obligaciones` sin salir del IDE.
- **Fragmento:** los esquemas de las tres herramientas tal como están diseñados (`legaldev-tfg/capitulos/23-detalle.tex:450-460`), en `<pre><code>`.
- **Etiqueta clara:** «En desarrollo · demo prevista para diciembre de 2026». No se muestra nada que parezca funcionar ya.

**6. Pie** (plano *A footer of tiles*; esquinas rectas)
- **Casillas:**
  - Declaración: «LegalDev es un Trabajo Fin de Grado del GIITIN · EPI Gijón · Universidad de Oviedo», con autor, tutor (David Melendi Palacio, decisión mía; se puede quitar) y el `disclaimer` completo de la API. Se rotula «Aviso», no «Aviso legal», para no confundirlo con el aviso de la LSSI.
  - Navegación.
  - Lugar: «Gijón» con la hora local en vivo (`Europe/Madrid`).
  - Enlaces: GitHub y documentación de la API.
  - Marca «LegalDev» grande en `--ink`.
  - Casilla `--hl` «Analizar mi proyecto →», que enlaza a `#demo`.
- Todo el texto del pie mide 13 px o más.

### 5.2.1 Aviso de privacidad (art. 13 del RGPD, pendiente C-04 de la memoria; el autor pidió incluirlo)

No se crea ninguna página nueva. El aviso tiene dos capas:

- **Primera capa, junto al botón de analizar**, siempre visible, a tamaño legible: «Tu descripción se envía al proveedor del modelo (Groq, EE. UU.) para generar el informe. No escribas datos personales. Información de privacidad».
- **Segunda capa:** el enlace abre un `<details>` en el pie (`id="privacidad"`) con el texto completo. Sus hechos salen de `legaldev-tfg/capitulos/20-requisitos.tex:229`:
  - **Responsable:** Gustavo Sobrado Aller. **Contacto:** `{EMAIL}`.
  - **Finalidad:** generar el informe que pide el usuario y limitar el número de peticiones por IP.
  - **Base jurídica** (elegida por el autor): interés legítimo (art. 6.1.f del RGPD) del responsable en ofrecer una demostración pública de su Trabajo Fin de Grado y en proteger el servicio frente a abusos. Hay derecho a oponerse a través del contacto. La ponderación de ese interés se documenta en la memoria, fuera de este trabajo.
  - **Encargados del tratamiento:**
    - Groq: modelo de lenguaje. Puede conservar entradas y salidas hasta 30 días en EE. UU. para resolver incidencias o investigar abusos.
    - Hugging Face: alojamiento de la API, en EE. UU. Registra la IP de cada petición.
    - Vercel: alojamiento de esta web.
  - **Conservación:**
    - El servicio no almacena los cuestionarios.
    - La respuesta se guarda en una caché en memoria durante una hora, asociada a un resumen SHA-256 del cuestionario, y desaparece al reiniciar.
  - **Transferencias internacionales:** a EE. UU., a través de los encargados citados.
  - **Derechos:** acceso, rectificación, supresión, oposición, limitación y portabilidad, a través del contacto. También se puede reclamar ante la AEPD (aepd.es).
  - **Sin cookies propias ni analítica.** Las fuentes van dentro del build.
- `{EMAIL}` lo proporciona el autor. No se publica ningún email sin su confirmación expresa. Como la base es el interés legítimo, el formulario no lleva casilla de consentimiento.
- **Hay que verificarlo antes de publicar:** el texto se contrasta con la memoria, porque cualquier hecho que cambie en el backend obliga a cambiar el aviso.

### 5.3 Informe de ejemplo (decisión mía)

- El JSON real `legaldev-tfg/datos/informe_ejemplo.json` (unos 14 KB) se copia a `src/data/`, junto con su entrada (`informe_ejemplo_entrada.json`), y se importa.
- «Ver un informe de ejemplo» hace dos cosas:
  - Rellena el formulario con esa entrada.
  - Pinta el informe por el mismo camino que `setState('success')`, con la etiqueta «Informe de ejemplo · SaaS para autónomos con IA generativa · Asturias · generado el 18-09-2026». Luego hace scroll hasta él.
- **No se llama a la API.**
- Se muestra **sin editar**, aunque tenga artefactos de extracción («per files») y la afirmación discutible de «alto riesgo». Es la salida real, y el manual la usa como ejemplo de límites. Editarla sería maquillarla.

### 5.4 Movimiento

Sigue las pautas de las skills `emil-design-eng`, `animate` y `review-animations`. El autor quiere animaciones **mejores**, no más: pulidas, interrumpibles y con propósito. Nada «loco». Se implementan con Motion.

- **Movimiento firma**, una sola vez al cargar:
  - El escenario amarillo del hero se abre en persiana con `clip-path`, en unos 900 ms con ease-out.
  - Después el subrayado se «pinta» de izquierda a derecha sobre la frase citada, en unos 600 ms.
  - Se prefiere `transform` (`scaleX`) sobre un pseudo-elemento o un `span` de fondo.
- **Estantería:**
  - Los lomos crecen desde la base, escalonados, la primera vez que la sección entra en pantalla.
  - Al elegir un lomo, su nombre y su color pasan al panel de detalle con una animación de layout (`layoutId`), con un muelle corto y sin rebote exagerado.
- **Informe:**
  - Las secciones del informe entran en cascada al aparecer.
  - La cifra «X de Y citas» cuenta hasta su valor una sola vez.
  - El cambio de cargando a resultado usa `AnimatePresence`, sin saltos de layout.
- **«Cómo funciona»:** las cifras del embudo (100 → 25 → 12 → 21) aparecen al entrar en pantalla. Nada va ligado al scroll de forma continua.
- **«Más detalles»:** abre y cierra con una animación de altura.
- **Entradas por sección:** primero el título, luego el texto, luego el fragmento, escalonados entre 60 y 90 ms, subiendo entre 16 y 24 px con opacidad. Solo una vez (`whileInView` con `once`).
  - Si una animación o el observador fallan, el contenido nunca se queda oculto: hay un temporizador de seguridad que deja todo visible.
  - No se hace prerender ni SSR (decisión mía). Sin JS se muestra un `<noscript>` con una frase sobre qué es LegalDev y enlaces al repositorio y a `/docs` de la API.
- **Respuesta en los controles:**
  - Al pulsar, escala 0,97.
  - Hover y foco visibles.
  - Los chips y los lomos reaccionan.
  - Las transiciones de interfaz duran menos de 250 ms.
- **`prefers-reduced-motion`:** sin desplazamientos. El subrayado aparece ya pintado y la persiana ya abierta.
- **Fuera:** la rejilla animada, el glow y los tres puntos pulsando.

## 6. Qué queda a criterio de quien lo construya

- Los espaciados exactos dentro de cada sección.
- El texto secundario que no fija este documento: las frases de cada intercambio y los textos de detalle de cada lomo, siempre con datos reales.
- El aspecto de los interruptores, los chips y el indicador de carga, dentro de los tokens.
- El corte exacto del `clip-path`.
- La composición fina en el móvil.
- Si la navegación es fija o no.
- Si «ninguno» desmarca los otros tipos de datos.

## 7. Verificación

- `npm run build` sin errores de TypeScript.
- `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs src`.
- `node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs <url de vite preview> --out .taste-skill/after`, sobre el **build de producción** y no sobre el servidor de desarrollo, con **0 FAIL**. Cada WARN se corrige o se defiende en una frase.
- **Excepción esperada:** el aviso `few-pictures`, si el inspector no reconoce como imágenes los fragmentos `data-ui`. El autor no quiere una página recargada de fotos, y las imágenes de este software son su propia interfaz. Si aun así falla, se considera una foto real del mundo del proyecto (la Universidad Laboral, sede de la EPI Gijón, en Wikimedia Commons), con su crédito.
- **Con el MCP de Playwright:**
  - Análisis real contra la API: éxito, normas, citas, disclaimer y modelo.
  - `usa_ia` → `tipo_ia`.
  - `es_empresa` → colegiado deshabilitado y desmarcado.
  - «Más detalles»: el payload sin tocar es idéntico al actual (comparar el cuerpo del `fetch`).
  - Informe de ejemplo.
  - Estados de error: offline o API bloqueada.
  - Los tres estados del health check.
  - Navegación con teclado por el formulario y la estantería.
- **Pasadas de skills:**
  - `break-ui` sobre el panel del informe: nombres de norma larguísimos, 0 o 12 normas, palabras sin cortes, markdown enorme, 0 de 0 citas.
  - `mobile-native` a 390 px: inputs de 16 px o más para que no haga zoom, `100svh`, sin destello al tocar.
  - `review-animations` sobre el movimiento final.
- **Antes y después:** capturas comparadas a 1440, 768 y 390 px (`.taste-skill/before` frente a `.taste-skill/after`).
