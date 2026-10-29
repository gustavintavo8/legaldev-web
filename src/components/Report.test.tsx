import { render, screen, waitFor, within } from '@testing-library/react';
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

it('muestra el error sin emoji', () => {
  render(<Report state={{ kind: 'error', message: 'Demasiadas consultas: espera un minuto y vuelve a intentarlo.' }} />);
  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent('Demasiadas consultas');
  expect(alert.textContent).not.toContain('⚠'); // taste-skill-ignore: asserts the emoji is stripped
});

it('muestra el progreso mientras carga', () => {
  render(<Report state={{ kind: 'loading', startedAt: Date.now() }} />);
  expect(screen.getByText('Analizando normativa…')).toBeInTheDocument();
  expect(screen.getByText('0 s')).toBeInTheDocument();
});
