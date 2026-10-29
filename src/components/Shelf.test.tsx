import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NORMAS } from '../data/normas';
import Shelf from './Shelf';

const rgpd = NORMAS.find((n) => n.stem === 'RGPD')!;
const ens = NORMAS.find((n) => n.corto === 'ENS')!;

it('tiene título y un lomo por norma', () => {
  render(<Shelf />);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Las 22 normas que lee');
  const spines = screen.getAllByRole('button', { name: /fragmentos$/ });
  expect(spines).toHaveLength(22);
  expect(spines[0]).toHaveAccessibleName(`${NORMAS[0].nombre}, ${NORMAS[0].fragmentos} fragmentos`);
});

it('empieza con el RGPD seleccionado', () => {
  render(<Shelf />);
  expect(screen.getByRole('button', { name: `${rgpd.nombre}, 962 fragmentos` })).toHaveAttribute('aria-pressed', 'true');
  const detail = screen.getByRole('region', { name: 'Detalle de la norma' });
  expect(detail).toHaveTextContent(rgpd.nombre);
  expect(detail).toHaveTextContent('962 fragmentos');
  expect(detail).toHaveTextContent(rgpd.regla);
});

it('al elegir el ENS explica que se excluye siempre', async () => {
  const user = userEvent.setup();
  render(<Shelf />);
  await user.click(screen.getByRole('button', { name: `${ens.nombre}, ${ens.fragmentos} fragmentos` }));
  expect(screen.getByRole('region', { name: 'Detalle de la norma' })).toHaveTextContent('Excluida siempre del informe');
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
