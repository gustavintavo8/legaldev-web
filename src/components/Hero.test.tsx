import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FRASE_CITADA } from '../data/rgpd';
import { REPO } from '../data/site';
import Hero from './Hero';
import Nav from './Nav';

it('el titular dice qué es', () => {
  render(<Hero onExample={() => {}} />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tu código, frente a la ley.');
});

it('la hoja es la página L 119/6 con los considerandos 30 a 33', () => {
  render(<Hero onExample={() => {}} />);
  expect(screen.getByText('L 119/6')).toBeInTheDocument();
  for (const n of [30, 31, 32, 33]) expect(screen.getByText(`(${n})`)).toBeInTheDocument();
});

it('subraya la frase citada', () => {
  const { container } = render(<Hero onExample={() => {}} />);
  expect(container.querySelector('mark')?.textContent).toBe(FRASE_CITADA);
});

it('anota la cita al margen', () => {
  render(<Hero onExample={() => {}} />);
  expect(screen.getByText('Cita comprobada · RGPD, p. 6')).toBeInTheDocument();
});

it('«Analizar mi proyecto» lleva al formulario', async () => {
  const user = userEvent.setup();
  const demo = document.createElement('div');
  demo.id = 'demo';
  document.body.appendChild(demo);
  const spy = vi.spyOn(demo, 'scrollIntoView');
  render(<Hero onExample={() => {}} />);
  await user.click(screen.getByRole('button', { name: 'Analizar mi proyecto' }));
  expect(spy).toHaveBeenCalled();
  demo.remove();
});

it('el enlace de ejemplo carga el informe', async () => {
  const user = userEvent.setup();
  const onExample = vi.fn();
  render(<Hero onExample={onExample} />);
  await user.click(screen.getByRole('button', { name: 'o ver un informe de ejemplo' }));
  expect(onExample).toHaveBeenCalledTimes(1);
});

it('la navegación enlaza a las secciones y al repositorio', () => {
  render(<Nav />);
  const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
  expect(hrefs).toEqual(expect.arrayContaining(['#como-funciona', '#normas', '#demo', REPO]));
});
