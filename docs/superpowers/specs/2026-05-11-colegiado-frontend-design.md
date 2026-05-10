# Colegiado frontend — Design Spec
Date: 2026-05-11

## Problema

El campo `colegiado` existe en el modelo Pydantic (`bool | None = None`) y en la query semántica (`rag.py` lo usa para añadir contexto del Código Ético CCII). Sin embargo, el formulario web hardcodea `colegiado: null` en el payload — el valor nunca llega como `true`, haciendo el Código Ético CCII inalcanzable a través de la UI.

## Alcance

Un único archivo: `legaldev-web/index.html`. Sin cambios en el backend.

---

## Cambios

### 1. HTML — nuevo toggle

Insertar justo después del toggle `es_empresa` (dentro de la columna derecha del `form-grid`):

```html
<div class="form-group">
  <label class="toggle-label" title="Aplica solo a personas físicas. Los ingenieros colegiados son individuos.">
    <input type="checkbox" class="toggle-input" id="colegiado" name="colegiado">
    <span class="toggle-track"><span class="toggle-thumb"></span></span>
    <span class="toggle-text">¿Ingeniero informático colegiado (CCII)?</span>
  </label>
</div>
```

- Mismo markup que los toggles existentes — sin CSS nuevo.
- El `title` en el `<label>` explica la restricción persona física sin que el usuario tenga que adivinarla.
- No añadir `disabled` en el markup: el estado inicial se gestiona con `syncColegiado()` (ver sección 3), que se invoca en page load y cubre también el caso de que `es_empresa` estuviera pre-marcado en el HTML.

### 2. CSS — estado disabled

Añadir al bloque `<style>` existente:

```css
.toggle-input:disabled + .toggle-track { opacity: 0.35; cursor: not-allowed; }
.toggle-input:disabled ~ .toggle-text  { opacity: 0.35; cursor: not-allowed; }
```

Aplica a todos los toggles del formulario (genérico, no acoplado a `colegiado`).

### 3. JS — lógica de desactivación

Añadir listener en el `change` de `es_empresa`. Debe ejecutarse también al cargar si `es_empresa` estuviera pre-marcado:

```js
function syncColegiado() {
  var colegiadoInput = document.getElementById('colegiado');
  var esEmpresa = document.getElementById('es_empresa').checked;
  colegiadoInput.disabled = esEmpresa;
  if (esEmpresa) colegiadoInput.checked = false;
}

document.getElementById('es_empresa').addEventListener('change', syncColegiado);
syncColegiado(); // estado inicial correcto sin depender solo del listener
```

Usar una función nombrada (`syncColegiado`) en vez de un lambda para poder invocarla también en page load.

### 4. JS — payload

Cambiar la línea hardcodeada:

```js
// antes
colegiado: null

// después
colegiado: document.getElementById('colegiado').checked || null
```

Semántica: `true` cuando marcado, `null` en cualquier otro caso. El backend trata `null` y `false` igual (`if input.colegiado:`), así que `null` es correcto para "no aplica".

---

## Plan de smoke test (obligatorio)

Todos los pasos son necesarios. El punto 5 es el único que cierra el ciclo end-to-end.

1. Abrir `index.html` en un navegador.
2. Con `es_empresa` apagado, marcar `colegiado` → enviar → verificar en DevTools Network que el payload tiene `"colegiado": true`.
3. Activar `es_empresa` → verificar que `colegiado` se desmarca automáticamente y el toggle queda en opacity 0.35 / cursor not-allowed.
4. Con `es_empresa` activo → enviar → verificar `"colegiado": null` en el payload.
5. Llamar a la API Railway con `colegiado: true`, `es_empresa: false`, descripción de ingeniero individual → verificar que `normativas_detectadas` incluye el Código Ético CCII y que `respuesta_completa` lo menciona.

---

## Lo que no cambia

- Backend: ningún cambio. El modelo ya acepta `colegiado: bool | None`.
- Tests de backend: ningún cambio. `conftest.py` puede mantener `colegiado: None` en los fixtures existentes; si se añade un test específico de `colegiado=True`, es trabajo separado.
- Otros campos hardcodeados (`tiene_usuarios_registrados`, `usuarios_ue`, etc.): fuera de alcance de este cambio.
