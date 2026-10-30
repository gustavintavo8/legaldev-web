import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EJEMPLO } from '../data/example';
import type { AnalysisState } from '../hooks/useAnalysis';
import Report from './Report';

const ok = (data = EJEMPLO.respuesta, ejemplo = false): AnalysisState => ({ kind: 'success', data, ejemplo });

it('muestra las normas detectadas como chips', () => {
  render(<Report state={ok()} />);
  const list = screen.getByRole('list', { name: 'Normas detectadas' });
  expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(
    EJEMPLO.respuesta.normativas_detectadas,
  );
});

it('muestra la cifra de citas comprobadas', async () => {
  render(<Report state={ok()} />);
  await waitFor(() =>
    expect(screen.getByText(/de 13 citas encontradas literalmente en la ley/)).toHaveTextContent(
      '10 de 13 citas encontradas literalmente en la ley',
    ),
  );
});

it('avisa de que lo ha redactado un modelo de lenguaje', () => {
  render(<Report state={ok()} />);
  expect(screen.getByText(/redactado un modelo de lenguaje \(openai\/gpt-oss-120b\)/)).toBeInTheDocument();
  const article = screen.getByRole('article');
  expect(article).toHaveAttribute('data-ai-generated', 'true');
  expect(article).toHaveAttribute('data-ai-model', 'openai/gpt-oss-120b');
});

it('muestra el disclaimer sin emoji', () => {
  render(<Report state={ok()} />);
  const disclaimer = screen.getByText(/^Esta información es orientativa/);
  expect(disclaimer.textContent).not.toContain('⚠'); // taste-skill-ignore: asserts the emoji is stripped
});

it('marca las 10 citas comprobadas del informe real', () => {
  const { container } = render(<Report state={ok()} />);
  expect(container.querySelectorAll('blockquote[data-cita="verificada"]')).toHaveLength(10);
  expect(container.querySelectorAll('blockquote[data-cita="no-verificada"]')).toHaveLength(3);
});

it('pinta el subrayado de cada cita comprobada cuando se ve, y nunca el de las no comprobadas', async () => {
  // Without IntersectionObserver every verified quote is swept at once.
  vi.stubGlobal('IntersectionObserver', undefined);
  const { container } = render(<Report state={ok()} />);
  await waitFor(() => expect(container.querySelectorAll('blockquote[data-swept]')).toHaveLength(10));
  expect(container.querySelectorAll('blockquote[data-cita="no-verificada"][data-swept]')).toHaveLength(0);
  vi.unstubAllGlobals();
});

it('el barrido va sobre un bloque que contiene la cita entera, no sobre el párrafo en línea', () => {
  const { container } = render(<Report state={ok()} />);
  const q = container.querySelector('blockquote[data-cita="verificada"]')!;
  const wrapper = q.querySelector(':scope > div');
  expect(wrapper).not.toBeNull();
  expect(wrapper!.querySelector(':scope > p')?.textContent?.trim()).toBe(q.textContent?.trim());
});

it('no marca nada si no puede casar las no verificadas', () => {
  const data = { ...EJEMPLO.respuesta, citas: { total: 13, verificadas: 12, no_verificadas: ['frase que no aparece'] } };
  const { container } = render(<Report state={ok(data)} />);
  expect(container.querySelectorAll('blockquote[data-cita]')).toHaveLength(0);
});

it('etiqueta el informe de ejemplo', () => {
  render(<Report state={ok(EJEMPLO.respuesta, true)} />);
  expect(screen.getByText(EJEMPLO.etiqueta)).toBeInTheDocument();
});

it('renderiza una respuesta mínima de un backend antiguo', () => {
  render(
    <Report state={ok({ respuesta_completa: '## RGPD\n\ntexto', normativas_detectadas: [], chunks_utilizados: 0 })} />,
  );
  expect(screen.getByRole('heading', { name: 'RGPD' })).toBeInTheDocument();
  expect(screen.queryByText(/citas encontradas/)).not.toBeInTheDocument();
  expect(screen.queryByText(/modelo de lenguaje/)).not.toBeInTheDocument();
  expect(screen.queryByText(/orientativa/)).not.toBeInTheDocument();
});

it('sin citas no muestra «0 de 0»', () => {
  const data = { ...EJEMPLO.respuesta, citas: { total: 0, verificadas: 0, no_verificadas: [] } };
  render(<Report state={ok(data)} />);
  expect(screen.getByText('Este informe no contiene citas literales')).toBeInTheDocument();
  expect(screen.queryByText(/0 de 0/)).not.toBeInTheDocument();
});

it('pluraliza con una sola cita y un solo fragmento', async () => {
  const data = { respuesta_completa: '## RGPD', normativas_detectadas: ['RGPD'], chunks_utilizados: 1, citas: { total: 1, verificadas: 1, no_verificadas: [] } };
  render(<Report state={ok(data)} />);
  await waitFor(() => expect(screen.getByText(/de 1 cita encontrada literalmente en la ley$/)).toHaveTextContent('1 de 1 cita'));
  expect(screen.getByText(/^1 fragmento de la ley usado/)).toBeInTheDocument();
});

it('avisa si el informe llega sin texto', () => {
  const data = { respuesta_completa: '  ', normativas_detectadas: [], chunks_utilizados: 0 };
  render(<Report state={ok(data)} />);
  expect(screen.getByText('El servidor no ha devuelto el texto del informe.')).toBeInTheDocument();
});

it('con citas.total 0 no marca ninguna cita como comprobada', () => {
  const data = { ...EJEMPLO.respuesta, citas: { total: 0, verificadas: 0, no_verificadas: [] } };
  const { container } = render(<Report state={ok(data)} />);
  expect(container.querySelectorAll('blockquote[data-cita]')).toHaveLength(0);
});

it('sin datos de citas no marca ninguna cita', () => {
  const data = { respuesta_completa: '> "datos personales" — RGPD, p. 1', normativas_detectadas: ['RGPD'], chunks_utilizados: 1 };
  const { container } = render(<Report state={ok(data)} />);
  expect(container.querySelectorAll('blockquote[data-cita]')).toHaveLength(0);
});

it('anuncia el resultado en una frase, no el informe entero', () => {
  const { container } = render(<Report state={ok()} />);
  expect(container.querySelector('#informe')).not.toHaveAttribute('aria-live');
  expect(screen.getByRole('status')).toHaveTextContent('Informe listo: 10 de 13 citas comprobadas.');
});

it('el contador de segundos no se anuncia', () => {
  render(<Report state={{ kind: 'loading', startedAt: Date.now() }} />);
  expect(screen.getByText('0 s')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Analizando normativa…');
});

it('el error de red ofrece el informe de ejemplo', async () => {
  const user = userEvent.setup();
  const onExample = vi.fn();
  render(<Report state={{ kind: 'error', message: 'No se ha podido contactar con el servidor.', offerExample: true }} onExample={onExample} />);
  await user.click(screen.getByRole('button', { name: 'Ver un informe de ejemplo' }));
  expect(onExample).toHaveBeenCalledTimes(1);
});

it('espera al siguiente frame para desplazarse y lleva el foco al informe', async () => {
  const scroll = vi.mocked(Element.prototype.scrollIntoView);
  const { rerender } = render(<Report state={{ kind: 'idle' }} />);
  scroll.mockClear();
  rerender(<Report state={ok()} />);
  expect(scroll).not.toHaveBeenCalled();
  await waitFor(() => expect(scroll).toHaveBeenCalled());
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('article')));
});

it('vuelve a llevar al informe si se pide otra vez el mismo resultado', async () => {
  const scroll = vi.mocked(Element.prototype.scrollIntoView);
  const { rerender } = render(<Report state={ok(EJEMPLO.respuesta, true)} />);
  await waitFor(() => expect(scroll).toHaveBeenCalled());
  scroll.mockClear();
  rerender(<Report state={ok(EJEMPLO.respuesta, true)} />);
  await waitFor(() => expect(scroll).toHaveBeenCalled());
});

it('muestra el error sin emoji', () => {
  render(<Report state={{ kind: 'error', message: 'Demasiadas consultas: espera un minuto y vuelve a intentarlo.', offerExample: false }} />);
  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent('Demasiadas consultas');
  expect(alert.textContent).not.toContain('⚠'); // taste-skill-ignore: asserts the emoji is stripped
});

it('muestra el progreso mientras carga', () => {
  render(<Report state={{ kind: 'loading', startedAt: Date.now() }} />);
  expect(screen.getByText('Analizando normativa…')).toBeInTheDocument();
  expect(screen.getByText('0 s')).toBeInTheDocument();
});
