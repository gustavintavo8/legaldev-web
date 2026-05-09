# LegalDev Landing Page — Design Spec
Date: 2026-05-09

## Overview

Single-file (`index.html`) dark-mode landing page for LegalDev — a RAG-based API that analyzes a software project questionnaire and returns applicable Spanish/EU legal regulations with technical implications for developers. Targeted at Spanish developers. Deployed to Vercel.

---

## Aesthetic Direction

**Clean dark + subtle green glow** (Vercel/Linear/Resend aesthetic with personality):
- JetBrains Mono for all headings, code elements, labels, tech names
- Inter for body text and form descriptions
- Faint green radial glow behind hero headline
- Green glow on primary CTA button (`box-shadow: 0 0 20px rgba(0,208,132,0.3)`)
- Accent word in headline colored `#00d084`
- All other aesthetic elements strictly restrained — no gradients, no heavy effects

---

## Color Palette (CSS Custom Properties)

```css
--bg:        #0a0a0a
--surface:   #111111
--border:    #1f1f1f
--text:      #ededed
--muted:     #888888
--accent:    #00d084
--accent-dim: #00d08420
```

---

## Typography

- Google Fonts import: `JetBrains Mono` (weights 400, 700) + `Inter` (weights 400, 500, 600)
- Headings: JetBrains Mono, letter-spacing: -0.5px
- Body/descriptions: Inter
- Labels, badges, stat values: JetBrains Mono

---

## File Structure

```
legaldev-web/
├── index.html       # Single file — all CSS in <style>, all JS in <script>
└── vercel.json      # Rewrites all routes to index.html
```

---

## vercel.json

```json
{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}
```

---

## Section 1 — Navbar

- Position: sticky top, `z-index: 100`
- Background: `var(--bg)`, `border-bottom: 1px solid var(--border)`
- Height: 56px, `max-width: 1100px`, horizontally centered
- Left: `</legaldev>` in JetBrains Mono, `color: var(--text)`, font-size 15px
- Right: `Ver en GitHub` as `<a href="https://github.com/gustavintavo8/legaldev">`, `color: var(--muted)`, hover → `var(--text)`

---

## Section 2 — Hero

- Min-height: 100vh, vertically centered content
- Background layers (stacked via CSS):
  1. Base: `var(--bg)`
  2. Animated grid: `background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`, `background-size: 40px 40px`, CSS `@keyframes bgscroll` scrolls diagonally (`background-position: 0 0` → `40px 40px`) over 10s linear infinite
  3. Green radial glow: pseudo-element `::before`, `background: radial-gradient(ellipse 800px 400px at 50% 0%, rgba(0,208,132,0.06) 0%, transparent 70%)`, pointer-events none
- Content stack (centered, `max-width: 680px`):
  1. Small label: `// análisis legal automático` — JetBrains Mono, 12px, `color: var(--accent)`, margin-bottom 24px
  2. Headline: `Sabe qué leyes aplican a tu proyecto.` — JetBrains Mono, clamp(32px, 5vw, 56px), weight 700, `color: var(--text)`, last word `proyecto.` wrapped in `<span style="color:var(--accent)">`
  3. Subheadline: `Describe tu proyecto de software. LegalDev analiza RGPD, EU AI Act, LOPDGDD, ENS y más — y te dice exactamente qué implementar.` — Inter, 17px, `color: var(--muted)`, line-height 1.6, margin-top 16px
  4. CTA row: two buttons, gap 12px, margin-top 32px
     - Primary: `Probar ahora →` — solid `var(--accent)` background, `var(--bg)` text, font-weight 600, `box-shadow: 0 0 20px rgba(0,208,132,0.25)`, scrolls to `#demo` via JS smooth scroll
     - Secondary: `Ver documentación` — transparent bg, `1px solid var(--border)`, `color: var(--text)`, `href: https://legaldev-production.up.railway.app/docs`

---

## Section 3 — Interactive Demo

- `id="demo"`, padding 80px 0
- Section title: `Pruébalo ahora` — JetBrains Mono, 28px, weight 700
- Section subtitle: `Rellena el formulario y obtén las normativas aplicables a tu proyecto en segundos.` — Inter, muted
- Form container: `background: var(--surface)`, `border: 1px solid var(--border)`, padding 32px, border-radius 8px, max-width 700px

### Form fields (visible)

All labels in JetBrains Mono 12px uppercase `var(--muted)`. All inputs/selects: `background: var(--bg)`, `border: 1px solid var(--border)`, `color: var(--text)`, font-family Inter, padding 10px 12px, border-radius 4px, focus → `border-color: var(--accent)`.

| Field | Type | Options |
|-------|------|---------|
| `tipo_proyecto` | `<select>` | `app_web`, `app_movil`, `api`, `saas`, `ecommerce` |
| `descripcion_breve` | `<input type="text">` | placeholder: "Describe tu proyecto en una frase" |
| `tipos_datos_personales` | checkboxes | nombre, email, teléfono, ubicación, salud, financieros, ninguno |
| `usa_ia` | toggle (checkbox styled as pill) | label: "¿Usa inteligencia artificial?" |
| `tipo_ia` | `<select>`, hidden unless `usa_ia` checked | generativa, clasificacion, recomendacion, agentes |
| `usa_cookies` | toggle | label: "¿Usa cookies?" |
| `ccaa` | `<select>` | All 17 Spanish autonomous communities |
| `es_empresa` | toggle | label: "¿Es una empresa?" |

### Hidden fields (sent as JSON constants)

```js
tiene_usuarios_registrados: true
acceso_publico: false
usuarios_menores: false
usuarios_ue: true
transferencia_datos_terceros: false
monetizacion: null
contenido_digital: false
colegiado: null
```

### Submit button

Full-width, `background: var(--accent)`, `color: var(--bg)`, JetBrains Mono, font-size 14px, font-weight 700, height 44px, label: `Analizar proyecto →`

### API call

- `POST https://legaldev-production.up.railway.app/analyze`
- `Content-Type: application/json`
- Body: JSON object merging visible fields + hidden constants
- `tipos_datos_personales`: array of checked values

### State machine

| State | What's shown |
|-------|-------------|
| `idle` | Output area hidden |
| `loading` | Animated `·  ·  ·` spinner (CSS keyframe stagger), label `Analizando normativa...` in muted monospace |
| `success` | Response panel (see below) |
| `error` | Red-bordered box with error message |

### Response panel (success state)

- Header bar (`background: var(--bg)`, `border-bottom: 1px solid var(--border)`, padding 12px 16px):
  - Label `normativas →` in muted monospace
  - `normativas_detectadas` as green badges: `background: var(--accent-dim)`, `border: 1px solid var(--accent)`, `color: var(--accent)`, JetBrains Mono 11px, padding 2px 8px, border-radius 3px
  - `chunks_utilizados` right-aligned: `{n} chunks` in muted monospace 11px
- Body (`background: var(--surface)`, padding 24px):
  - `respuesta_completa` rendered via `marked.js` — markdown headings styled with JetBrains Mono, body text Inter, `color: var(--text)`
  - Markdown `h2`/`h3` → `color: var(--text)`, JetBrains Mono, with `border-bottom: 1px solid var(--border)`
- Disclaimer box (`background: var(--bg)`, `border: 1px solid var(--border)`, padding 12px 16px, margin-top 16px):
  - `⚠️ {disclaimer}` — Inter 12px, `color: var(--muted)`

### marked.js

CDN: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`

---

## Section 4 — Cómo funciona

- Padding 80px 0, `background: var(--surface)` (slight contrast from main bg)
- Section title: `Cómo funciona` — JetBrains Mono 28px
- Three steps in a horizontal flex row (desktop), vertical stack (mobile, `<768px`):

| Step | Icon (CSS) | Title | Description |
|------|-----------|-------|-------------|
| 1 | `01` circled in accent | Describes tu proyecto | Rellena el cuestionario con los detalles técnicos de tu proyecto: tipo, datos que maneja, uso de IA, cookies, y más. |
| 2 | `02` circled in accent | Analizamos la normativa | Nuestro sistema RAG busca en 16 documentos legales indexados — RGPD, EU AI Act, LOPDGDD, ENS, guías AEPD y más. |
| 3 | `03` circled in accent | Recibes implicaciones técnicas | Obtienes una lista concreta de lo que debes implementar, organizada por normativa, lista para llevar a código. |

- Steps connected by a dashed line on desktop (`border-top: 1px dashed var(--border)` absolutely positioned)
- Step number circle: 32px, `border: 1px solid var(--accent)`, `color: var(--accent)`, JetBrains Mono 13px

---

## Section 5 — Stack técnico

- Padding 80px 0
- Section title: `Stack` — JetBrains Mono 28px
- Grid: `grid-template-columns: repeat(3, 1fr)` desktop, `repeat(2, 1fr)` tablet, `1fr` mobile
- 6 cards, each: `background: var(--surface)`, `border: 1px solid var(--border)`, padding 20px, hover → `border-color: var(--accent)`, transition 150ms

| Tech | Role |
|------|------|
| FastAPI | Framework API y routing |
| ChromaDB | Vector store local persistente |
| LangChain | Orquestación RAG y cadenas LLM |
| Groq — llama-4-scout | Inferencia LLM de alta velocidad |
| sentence-transformers | Embeddings multilingües |
| Railway | Despliegue y hosting del servicio |

- Tech name: JetBrains Mono 14px weight 700, `color: var(--text)`
- Role: Inter 13px, `color: var(--muted)`, margin-top 6px

---

## Section 6 — Footer

- `border-top: 1px solid var(--border)`, padding 32px 0
- Line 1: `Construido por Gustavo Sobrado · Universidad de Oviedo` — Inter 13px, `color: var(--muted)`
- Line 2: links — `GitHub` → `https://github.com/gustavintavo8/legaldev` + `API Docs` → `https://legaldev-production.up.railway.app/docs`, `color: var(--muted)`, hover → `var(--text)`
- Line 3: `Orientación informativa. No constituye asesoramiento legal.` — Inter 12px, `color: var(--muted)`, opacity 0.7, margin-top 8px

---

## Responsive Breakpoints

| Breakpoint | Changes |
|-----------|---------|
| `<768px` | How it works: vertical stack. Stack grid: 2 cols. Navbar: hide GitHub link text, show icon only. |
| `<480px` | Stack grid: 1 col. CTA buttons: stack vertically. Hero headline: smaller. |

---

## JS Responsibilities

1. Smooth scroll: `Probar ahora →` CTA → `document.querySelector('#demo').scrollIntoView({behavior:'smooth'})`
2. Toggle `tipo_ia` visibility: listen on `usa_ia` checkbox, show/hide `tipo_ia` field wrapper with `display:none/block`
3. Form submit: `preventDefault`, build JSON payload, fetch POST, drive state machine, render response via `marked.parse()`
4. marked.js: called as `marked.parse(data.respuesta_completa)`, result set as `innerHTML` of response body div

---

## Constraints

- No external CSS frameworks — pure CSS only
- No JS frameworks — vanilla only
- Works by opening `file://` locally and via Vercel deploy
- All CSS in a single `<style>` block in `<head>`
- All JS in a single `<script>` block before `</body>`
- marked.js loaded from CDN via `<script src="...">` before the inline script
