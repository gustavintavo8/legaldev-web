import { render, screen, within } from '@testing-library/react';
import HowItWorks from './HowItWorks';

it('tiene título y las tres frases del recorrido', () => {
  render(<HowItWorks />);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Cómo llega a cada obligación');
  expect(screen.getByText('Primero, respondes al cuestionario.')).toBeInTheDocument();
  expect(screen.getByText('Después, busca en 13.756 fragmentos de la ley.')).toBeInTheDocument();
  expect(screen.getByText('Por último, el modelo redacta y se comprueba cada cita.')).toBeInTheDocument();
});

it('enseña la entrada real del ejemplo como código', () => {
  const { container } = render(<HowItWorks />);
  expect(container.querySelector('pre code')?.textContent).toContain('"tipo_proyecto": "saas"');
});

it('explica qué hacen las reglas con esa entrada', () => {
  render(<HowItWorks />);
  const excluded = screen.getByRole('list', { name: 'Normas descartadas' });
  const included = screen.getByRole('list', { name: 'Normas garantizadas' });
  for (const n of ['ENS', 'Ley de Propiedad Intelectual', 'Guía de IA agéntica']) expect(excluded).toHaveTextContent(n);
  for (const n of ['RGPD', 'AI Act', 'LSSI', 'Guía de cookies']) expect(included).toHaveTextContent(n);
});

it('muestra el embudo con sus cifras reales', () => {
  render(<HowItWorks />);
  const funnel = screen.getByRole('list', { name: 'Recuperación de fragmentos' });
  for (const n of ['100', '25', '12', '21']) expect(within(funnel).getByText(n)).toBeInTheDocument();
});

it('cierra con la verificación de citas', () => {
  render(<HowItWorks />);
  expect(screen.getAllByText(/10 de 13/).length).toBeGreaterThan(0);
});

it('nombra la tecnología en una línea', () => {
  render(<HowItWorks />);
  const stack = screen.getByText(/^Construido con/);
  for (const t of ['FastAPI', 'ChromaDB', 'LangChain', 'Groq (gpt-oss-120b)', 'sentence-transformers', 'Hugging Face Spaces'])
    expect(stack).toHaveTextContent(t);
});
