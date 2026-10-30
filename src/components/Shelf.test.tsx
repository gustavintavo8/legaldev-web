import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Norma, NORMAS } from '../data/normas';
import Shelf from './Shelf';

const rgpd = NORMAS.find((n) => n.stem === 'RGPD')!;
const ens = NORMAS.find((n) => n.corto === 'ENS')!;
// The accessible name starts with the visible label (WCAG 2.5.3 label in name).
const nameOf = (n: Norma) => `${n.corto}: ${n.nombre}, ${n.fragmentos} fragmentos`;

it('tiene título y un lomo por norma', () => {
  render(<Shelf />);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Las 22 normas que lee');
  const spines = screen.getAllByRole('button', { name: /fragmentos$/ });
  expect(spines).toHaveLength(22);
  expect(spines[0]).toHaveAccessibleName(nameOf(NORMAS[0]));
});

it('empieza con el RGPD seleccionado', () => {
  render(<Shelf />);
  expect(screen.getByRole('button', { name: nameOf(rgpd) })).toHaveAttribute('aria-pressed', 'true');
  const detail = screen.getByRole('region', { name: 'Detalle de la norma' });
  expect(detail).toHaveTextContent(rgpd.nombre);
  expect(detail).toHaveTextContent('962 fragmentos');
  expect(detail).toHaveTextContent(rgpd.regla);
});

it('al elegir el ENS explica que se excluye siempre', async () => {
  const user = userEvent.setup();
  render(<Shelf />);
  await user.click(screen.getByRole('button', { name: nameOf(ens) }));
  expect(screen.getByRole('region', { name: 'Detalle de la norma' })).toHaveTextContent('Excluida siempre del informe');
});

it('al pasar el ratón muestra el detalle', async () => {
  const user = userEvent.setup();
  render(<Shelf />);
  await user.hover(screen.getByRole('button', { name: nameOf(ens) }));
  expect(screen.getByRole('region', { name: 'Detalle de la norma' })).toHaveTextContent(ens.nombre);
});

it('se recorre con las flechas', async () => {
  const user = userEvent.setup();
  render(<Shelf />);
  const spines = screen.getAllByRole('button', { name: /fragmentos$/ });
  const i = NORMAS.indexOf(rgpd);
  spines[i].focus();
  await user.keyboard('{ArrowRight}');
  expect(spines[i + 1]).toHaveFocus();
  expect(spines[i + 1]).toHaveAttribute('aria-pressed', 'true');
  await user.keyboard('{ArrowLeft}');
  expect(spines[i]).toHaveFocus();
});

it('etiqueta los cuatro grupos', () => {
  render(<Shelf />);
  const shelf = screen.getByRole('group', { name: 'Estantería de normas' });
  for (const g of ['UE', 'España', 'Guías AEPD', 'Deontología']) expect(within(shelf).getByText(g)).toBeInTheDocument();
});

it('no promete alturas proporcionales', () => {
  render(<Shelf />);
  expect(screen.queryByText(/su altura, cuánto texto aporta/)).not.toBeInTheDocument();
  expect(screen.getByText(/cuanto más alto, más fragmentos/)).toBeInTheDocument();
});
