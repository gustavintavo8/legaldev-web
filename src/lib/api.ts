import type { Questionnaire, RAGResponse } from './types';

// NOTE: the /docs links in Hero and Footer use this origin too.
export const API_BASE = 'https://gustavintavo8-legaldev.hf.space';

const HEALTH_TIMEOUT_MS = 8000;

export type Health = { state: 'online'; chunks: number } | { state: 'waking' } | { state: 'offline' };

export class ApiError extends Error {
  status: number | null;
  detail?: string;

  constructor(status: number | null, detail?: string) {
    super(detail ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

function withTimeout(ms: number, signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(ms);
  if (!signal) return timeout;
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([timeout, signal]);
  // Safari < 17.4 has no AbortSignal.any: combine the two by hand.
  const ac = new AbortController();
  for (const s of [timeout, signal]) s.addEventListener('abort', () => ac.abort(s.reason), { once: true });
  return ac.signal;
}

export async function fetchHealth(signal?: AbortSignal): Promise<Health> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: withTimeout(HEALTH_TIMEOUT_MS, signal) });
    if (!res.ok) return { state: 'offline' };
    const data = await res.json();
    // docs_indexed counts chunks; -1 means the vector store failed.
    if (typeof data.docs_indexed !== 'number' || data.docs_indexed < 0) return { state: 'offline' };
    return { state: 'online', chunks: data.docs_indexed };
  } catch (e) {
    // A Hugging Face Space waking from sleep answers /health after the timeout.
    // DOMException is not always instanceof Error across realms, so check the name.
    if ((e as { name?: string } | null)?.name === 'TimeoutError') return { state: 'waking' };
    return { state: 'offline' };
  }
}

export async function analyze(q: Questionnaire, signal?: AbortSignal): Promise<RAGResponse> {
  const res = await fetch(`${API_BASE}/v1/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(q),
    signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, typeof body.detail === 'string' ? body.detail : undefined);
  }
  return res.json();
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    switch (e.status) {
      case 404:
        return e.detail ?? 'No se ha encontrado normativa aplicable a este proyecto.';
      case 422:
        return 'Algún dato del formulario no es válido. Revísalo y vuelve a intentarlo.';
      case 429:
        return 'Demasiadas consultas: espera un minuto y vuelve a intentarlo.';
      case 503:
        return 'El servicio no está disponible ahora mismo. Inténtalo en unos minutos.';
      default:
        return `Error inesperado (HTTP ${e.status}).`;
    }
  }
  if (e instanceof TypeError) {
    return 'No se ha podido contactar con el servidor. Si estaba dormido, puede tardar hasta un minuto en despertar.';
  }
  return 'Error de conexión. Inténtalo de nuevo.';
}
