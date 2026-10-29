import { EJEMPLO } from './example';
import { NORMAS, TOTAL_FRAGMENTOS } from './normas';
import { FRASE_CITADA, RGPD_PAGINA } from './rgpd';

it('hay 22 normas', () => {
  expect(NORMAS).toHaveLength(22);
});

it('los fragmentos suman 13.756', () => {
  expect(NORMAS.reduce((s, n) => s + n.fragmentos, 0)).toBe(13756);
  expect(TOTAL_FRAGMENTOS).toBe(13756);
});

it('cuenta las normas por grupo', () => {
  const count = (g: string) => NORMAS.filter((n) => n.grupo === g).length;
  expect([count('UE'), count('España'), count('Guías AEPD'), count('Deontología')]).toEqual([10, 4, 7, 1]);
});

it('los stems son únicos', () => {
  expect(new Set(NORMAS.map((n) => n.stem)).size).toBe(22);
});

it('la página del RGPD tiene los considerandos 30 a 33', () => {
  expect(RGPD_PAGINA.considerandos.map((c) => c.n)).toEqual([30, 31, 32, 33]);
  expect(RGPD_PAGINA.considerandos[0].texto.endsWith(FRASE_CITADA)).toBe(true);
});

it('el informe de ejemplo es el real', () => {
  expect(EJEMPLO.respuesta.citas).toMatchObject({ total: 13, verificadas: 10 });
  expect(EJEMPLO.respuesta.citas?.no_verificadas).toHaveLength(3);
  expect(EJEMPLO.respuesta.chunks_utilizados).toBe(21);
});
