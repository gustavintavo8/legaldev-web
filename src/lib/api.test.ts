import { afterEach, vi } from 'vitest';
import { analyze, API_BASE, ApiError, errorMessage, fetchHealth } from './api';
import { buildPayload, DEFAULT_VALUES } from './payload';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchHealth', () => {
  it('online con los fragmentos indexados', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { status: 'ok', docs_indexed: 13756 })));
    await expect(fetchHealth()).resolves.toEqual({ state: 'online', chunks: 13756 });
  });

  it('despertando si salta el timeout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('timeout', 'TimeoutError')));
    await expect(fetchHealth()).resolves.toEqual({ state: 'waking' });
  });

  it('offline si responde 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(500, {})));
    await expect(fetchHealth()).resolves.toEqual({ state: 'offline' });
  });

  it('offline si falla la red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(fetchHealth()).resolves.toEqual({ state: 'offline' });
  });
});

describe('analyze', () => {
  it('hace POST con JSON a /v1/analyze', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { respuesta_completa: 'x', normativas_detectadas: [], chunks_utilizados: 0 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const q = buildPayload(DEFAULT_VALUES);
    await analyze(q);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE}/v1/analyze`);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual(q);
  });

  it('lanza ApiError con el detail del backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { detail: 'Sin cobertura' })));
    const err = await analyze(buildPayload(DEFAULT_VALUES)).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
    expect(err.detail).toBe('Sin cobertura');
  });
});

describe('errorMessage', () => {
  it('404 usa el detail', () => {
    expect(errorMessage(new ApiError(404, 'Sin cobertura'))).toBe('Sin cobertura');
  });
  it('422', () => {
    expect(errorMessage(new ApiError(422))).toBe(
      'Algún dato del formulario no es válido. Revísalo y vuelve a intentarlo.',
    );
  });
  it('429', () => {
    expect(errorMessage(new ApiError(429))).toBe('Demasiadas consultas: espera un minuto y vuelve a intentarlo.');
  });
  it('503', () => {
    expect(errorMessage(new ApiError(503))).toBe('El servicio no está disponible ahora mismo. Inténtalo en unos minutos.');
  });
  it('fallo de red', () => {
    expect(errorMessage(new TypeError('Failed to fetch'))).toBe(
      'No se ha podido contactar con el servidor. Si estaba dormido, puede tardar hasta un minuto en despertar.',
    );
  });
  it('otro estado', () => {
    expect(errorMessage(new ApiError(418))).toBe('Error inesperado (HTTP 418).');
  });
});
