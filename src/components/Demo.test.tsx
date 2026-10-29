import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, vi } from 'vitest';
import { EJEMPLO } from '../data/example';
import { useAnalysis } from '../hooks/useAnalysis';
import type { HealthView } from '../hooks/useHealth';
import { buildPayload, DEFAULT_VALUES } from '../lib/payload';
import Demo from './Demo';

function Harness({ health = { state: 'online', chunks: 13756 } }: { health?: HealthView }) {
  const analysis = useAnalysis();
  const s = analysis.state;
  return (
    <>
      <Demo analysis={analysis} health={health} />
      <div data-testid="estado">
        {s.kind}
        {s.kind === 'success' && s.ejemplo ? ':ejemplo' : ''}
        {s.kind === 'error' ? `:${s.message}` : ''}
      </div>
    </>
  );
}

function pendingFetch() {
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) => new Promise<Response>(() => {}));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

it('es_empresa deshabilita y desmarca colegiado', async () => {
  const user = userEvent.setup();
  render(<Harness />);
  const colegiado = screen.getByLabelText('¿Ingeniero informático colegiado (CCII)?');
  await user.click(colegiado);
  expect(colegiado).toBeChecked();
  await user.click(screen.getByLabelText('¿Es una empresa?'));
  expect(colegiado).toBeDisabled();
  expect(colegiado).not.toBeChecked();
});

it('tipo de IA solo aparece con usa_ia', async () => {
  const user = userEvent.setup();
  render(<Harness />);
  expect(screen.queryByLabelText('Tipo de IA')).not.toBeInTheDocument();
  await user.click(screen.getByLabelText('¿Usa inteligencia artificial?'));
  expect(screen.getByLabelText('Tipo de IA')).toBeInTheDocument();
});

it('incluye los valores nuevos del enum', async () => {
  const user = userEvent.setup();
  render(<Harness />);
  expect(screen.getByLabelText('biométricos')).toBeInTheDocument();
  await user.click(screen.getByLabelText('¿Usa inteligencia artificial?'));
  const tipo = screen.getByLabelText('Tipo de IA');
  expect(within(tipo).getByRole('option', { name: 'Visión' })).toBeInTheDocument();
  expect(within(tipo).getByRole('option', { name: 'Otro' })).toBeInTheDocument();
});

it('sin tocar nada envía el payload actual', async () => {
  const user = userEvent.setup();
  const fetchMock = pendingFetch();
  render(<Harness />);
  await user.type(screen.getByLabelText('Descripción breve'), 'Tienda online de cerámica');
  await user.click(screen.getByRole('button', { name: 'Analizar proyecto' }));
  const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
  expect(body).toEqual(buildPayload({ ...DEFAULT_VALUES, descripcion_breve: 'Tienda online de cerámica' }));
});

it('«Más detalles» está cerrado y contiene los 7 campos', async () => {
  const user = userEvent.setup();
  render(<Harness />);
  const toggle = screen.getByRole('button', { name: 'Más detalles' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByLabelText('¿Tiene usuarios registrados?')).not.toBeInTheDocument();
  await user.click(toggle);
  for (const label of [
    '¿Tiene usuarios registrados?',
    '¿Es de acceso público?',
    '¿Tiene usuarios menores de edad?',
    '¿Tiene usuarios en la UE?',
    '¿Transfiere datos a terceros?',
    '¿Publica contenido digital?',
    'Monetización',
  ]) {
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  }
  expect(screen.getByLabelText('¿Tiene usuarios registrados?')).toBeChecked();
  expect(screen.getByLabelText('¿Tiene usuarios en la UE?')).toBeChecked();
});

it('deshabilita el botón mientras carga y no duplica la petición', async () => {
  const user = userEvent.setup();
  const fetchMock = pendingFetch();
  render(<Harness />);
  const button = screen.getByRole('button', { name: 'Analizar proyecto' });
  await user.click(button);
  await user.click(button);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
});

it('cargar el ejemplo aborta el análisis en curso', async () => {
  const user = userEvent.setup();
  let resolve!: (r: Response) => void;
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) => new Promise<Response>((r) => (resolve = r)));
  vi.stubGlobal('fetch', fetchMock);
  render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Analizar proyecto' }));
  await user.click(screen.getByRole('button', { name: '¿Sin tiempo? Mira un informe real' }));
  expect((fetchMock.mock.calls[0][1]!.signal as AbortSignal).aborted).toBe(true);
  expect(screen.getByTestId('estado')).toHaveTextContent('success:ejemplo');
  await act(async () => {
    resolve(new Response(JSON.stringify({ respuesta_completa: 'tarde', normativas_detectadas: [], chunks_utilizados: 0 })));
  });
  expect(screen.getByTestId('estado')).toHaveTextContent('success:ejemplo');
});

it('el ejemplo rellena el formulario', async () => {
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByRole('button', { name: '¿Sin tiempo? Mira un informe real' }));
  expect(screen.getByLabelText('Descripción breve')).toHaveValue(EJEMPLO.entrada.descripcion_breve);
  expect(screen.getByLabelText('¿Usa cookies?')).toBeChecked();
});

it('muestra el mensaje de error de la API', async () => {
  const user = userEvent.setup();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 429 })));
  render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Analizar proyecto' }));
  expect(await screen.findByTestId('estado')).toHaveTextContent(
    'error:Demasiadas consultas: espera un minuto y vuelve a intentarlo.',
  );
});

describe('línea de estado', () => {
  it('online', () => {
    render(<Harness health={{ state: 'online', chunks: 13756 }} />);
    expect(screen.getByRole('status')).toHaveTextContent('13.756 fragmentos de 22 normas');
  });
  it('despertando', () => {
    render(<Harness health={{ state: 'waking' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('40–60 s');
  });
  it('offline ofrece el ejemplo', () => {
    render(<Harness health={{ state: 'offline' }} />);
    expect(within(screen.getByRole('status')).getByRole('button', { name: 'ver un informe de ejemplo' })).toBeInTheDocument();
  });
});

it('muestra el aviso de privacidad de primera capa', () => {
  render(<Harness />);
  expect(screen.getByText(/No escribas datos personales/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Información de privacidad' })).toHaveAttribute('href', '#privacidad');
});
