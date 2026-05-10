# Colegiado Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exponer el campo `colegiado` en el formulario web de LegalDev para que el Código Ético CCII sea alcanzable desde la UI.

**Architecture:** Un único archivo (`index.html`) recibe 4 cambios quirúrgicos: CSS para el estado disabled, HTML para el nuevo toggle, JS para sincronizar el estado con `es_empresa` y JS para leer el valor en el payload.

**Tech Stack:** HTML/CSS/JS vanilla — sin build step, sin dependencias nuevas.

---

## Archivos

- Modificar: `index.html` (sección `<style>`, sección HTML del formulario, sección `<script>`)

---

### Task 1: CSS — estado disabled para toggles

**Files:**
- Modify: `index.html` — bloque `<style>`, después de la regla `.toggle-text` existente (aprox. línea 213)

- [ ] **Step 1: Localizar el bloque de estilos del toggle**

  En `index.html`, buscar la regla:
  ```css
  .toggle-text {
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--text);
  }
  ```

- [ ] **Step 2: Añadir las reglas disabled inmediatamente después**

  Insertar tras el cierre de `.toggle-text { ... }`:

  ```css
  .toggle-input:disabled + .toggle-track { opacity: 0.35; cursor: not-allowed; }
  .toggle-input:disabled ~ .toggle-text  { opacity: 0.35; cursor: not-allowed; }
  ```

- [ ] **Step 3: Verificar visualmente en navegador**

  Abrir `index.html` en un navegador. Inspeccionar el DOM y añadir manualmente `disabled` al input del toggle `es_empresa` desde DevTools. El track y el texto deben aparecer al 35% de opacidad con cursor `not-allowed`. Quitar el atributo manual al terminar la verificación.

- [ ] **Step 4: Commit**

  ```bash
  git add index.html
  git commit -m "style: add disabled state for toggle inputs"
  ```

---

### Task 2: HTML — toggle colegiado

**Files:**
- Modify: `index.html` — columna derecha del `form-grid`, después del `form-group` de `es_empresa`

- [ ] **Step 1: Localizar el punto de inserción**

  Buscar en `index.html` el bloque:
  ```html
              <div class="form-group">
                <label class="toggle-label">
                  <input type="checkbox" class="toggle-input" id="es_empresa" name="es_empresa">
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  <span class="toggle-text">¿Es una empresa?</span>
                </label>
              </div>
  ```

- [ ] **Step 2: Insertar el toggle de colegiado inmediatamente después**

  Añadir este bloque justo después del cierre del `</div>` del form-group de `es_empresa`:

  ```html
              <div class="form-group">
                <label class="toggle-label" title="Aplica solo a personas físicas. Los ingenieros colegiados son individuos.">
                  <input type="checkbox" class="toggle-input" id="colegiado" name="colegiado">
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  <span class="toggle-text">¿Ingeniero informático colegiado (CCII)?</span>
                </label>
              </div>
  ```

- [ ] **Step 3: Verificar en navegador**

  Abrir `index.html`. El toggle "¿Ingeniero informático colegiado (CCII)?" debe aparecer debajo de "¿Es una empresa?" y ser interactivo. Hovear sobre el label debe mostrar el tooltip.

- [ ] **Step 4: Commit**

  ```bash
  git add index.html
  git commit -m "feat: add colegiado toggle to questionnaire form"
  ```

---

### Task 3: JS — sincronización con es_empresa y payload

**Files:**
- Modify: `index.html` — bloque `<script>`, dos puntos: (1) después del listener de `usa_ia`, (2) en el objeto `payload`

- [ ] **Step 1: Localizar el listener de usa_ia**

  Buscar en el `<script>`:
  ```js
  document.getElementById('usa_ia').addEventListener('change', function () {
    document.getElementById('tipo_ia_wrapper').style.display = this.checked ? 'block' : 'none';
  });
  ```

- [ ] **Step 2: Añadir syncColegiado después de ese listener**

  Insertar inmediatamente después:

  ```js
  function syncColegiado() {
    var colegiadoInput = document.getElementById('colegiado');
    var esEmpresa = document.getElementById('es_empresa').checked;
    colegiadoInput.disabled = esEmpresa;
    if (esEmpresa) colegiadoInput.checked = false;
  }

  document.getElementById('es_empresa').addEventListener('change', syncColegiado);
  syncColegiado();
  ```

  La llamada `syncColegiado()` al final establece el estado correcto en page load, sin depender solo del evento `change`.

- [ ] **Step 3: Localizar la línea del payload hardcodeada**

  Buscar en el bloque `payload`:
  ```js
  colegiado:                  null
  ```

- [ ] **Step 4: Reemplazar por la lectura dinámica**

  ```js
  colegiado:                  document.getElementById('colegiado').checked || null
  ```

  Semántica: `true` cuando marcado y activo, `null` en cualquier otro caso (`false || null` → `null`).

- [ ] **Step 5: Verificar comportamiento en navegador**

  1. Con `es_empresa` apagado: marcar `colegiado` → abrir DevTools → Network → enviar el formulario → confirmar que el payload contiene `"colegiado": true`.
  2. Activar `es_empresa` → confirmar que `colegiado` se desmarca y queda desactivado (opacity 0.35).
  3. Enviar el formulario con `es_empresa` activo → confirmar `"colegiado": null` en el payload.

- [ ] **Step 6: Commit**

  ```bash
  git add index.html
  git commit -m "feat: wire colegiado toggle — sync with es_empresa, read in payload"
  ```

---

### Task 4: Smoke test end-to-end

**Files:**
- Ninguno — verificación manual contra la API en producción.

Este paso cierra el ciclo completo: frontend → backend → retrieval → respuesta menciona CCII. Sin él, solo sabemos que el formulario envía datos correctos, pero no que el sistema entero funciona.

- [ ] **Step 1: Preparar la petición de prueba**

  En DevTools Console (o con curl), enviar:

  ```js
  fetch('https://legaldev-production.up.railway.app/v1/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo_proyecto: 'app_web',
      descripcion_breve: 'Plataforma de gestión de proyectos para ingenieros informáticos colegiados',
      tiene_usuarios_registrados: true,
      acceso_publico: false,
      tipos_datos_personales: ['nombre', 'email'],
      usuarios_menores: false,
      usuarios_ue: true,
      transferencia_datos_terceros: false,
      usa_ia: false,
      tipo_ia: null,
      usa_cookies: false,
      monetizacion: null,
      contenido_digital: false,
      ccaa: 'Madrid',
      es_empresa: false,
      colegiado: true
    })
  }).then(r => r.json()).then(console.log)
  ```

- [ ] **Step 2: Verificar el resultado**

  En la respuesta JSON:
  - `normativas_detectadas` debe incluir `"Código Ético y Deontológico CCII"` (o el stem del filename sin `.pdf`).
  - `respuesta_completa` debe mencionar el Código Ético CCII y obligaciones deontológicas del ingeniero.

  Si no aparece, el retrieval no está alcanzando el documento — investigar score del chunk CCII con `MIN_RELEVANCE_SCORE` antes de hacer más cambios.

- [ ] **Step 3: Commit final si todo pasa**

  ```bash
  git add index.html
  git commit -m "chore: verify colegiado end-to-end smoke test passed"
  ```

  (Solo si se ha modificado algo en los pasos anteriores tras la verificación. Si no hay cambios pendientes, no crear commit vacío.)
