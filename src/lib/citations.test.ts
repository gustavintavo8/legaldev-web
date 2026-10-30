import { markCitations, normalize, stripLeadingEmoji } from './citations';

const A = 'ser utilizadas para elaborar per files de las personas físicas e identificarlas.';
const B =
  'personales o que tratan datos personales para cumplir su función, ha de alentarse a los product ores de los product os, ser vicios y aplicaciones a que tengan en cuenta el derecho a la protección de datos';
const C = 'el prestador de servicios de la sociedad de la información estará obligado a disponer de los medios';

function mount(extra = ''): HTMLDivElement {
  const div = document.createElement('div');
  div.innerHTML =
    [A, B, C]
      .map((q, i) => `<blockquote><p>"${q}" — Norma ${i}, p. ${i + 1}</p></blockquote><p>Interpretación ${i}</p>`)
      .join('') + extra;
  document.body.appendChild(div);
  return div;
}

const citas = (no_verificadas: string[], total = 3) => ({ total, verificadas: total - no_verificadas.length, no_verificadas });

it('normaliza como el backend', () => {
  expect(normalize('«Per files» – de las​ personas')).toBe('perfilesdelaspersonas');
});

it('marca todas si las no verificadas casan', () => {
  const div = mount();
  expect(markCitations(div, citas([B.slice(0, 120)]))).toBe('marked');
  const [a, b, c] = Array.from(div.querySelectorAll('blockquote'));
  expect(a.dataset.cita).toBe('verificada');
  expect(c.dataset.cita).toBe('verificada');
  expect(b.dataset.cita).toBe('no-verificada');
  const note = b.nextElementSibling as HTMLElement;
  expect(note.className).toBe('cita-nota');
  expect(note.textContent).toBe('No encontrada literalmente en el texto oficial');
});

it('deja todo neutro si alguna no casa', () => {
  const div = mount();
  expect(markCitations(div, citas(['texto que no aparece en ningún blockquote']))).toBe('neutral');
  expect(div.querySelectorAll('blockquote[data-cita]')).toHaveLength(0);
  expect(div.querySelectorAll('.cita-nota')).toHaveLength(0);
});

it('sin no verificadas, todas quedan verificadas', () => {
  const div = mount();
  expect(markCitations(div, citas([]))).toBe('marked');
  expect(div.querySelectorAll('blockquote[data-cita="verificada"]')).toHaveLength(3);
});

it('sin datos de citas no marca nada', () => {
  const div = mount();
  expect(markCitations(div, undefined)).toBe('neutral');
  expect(div.querySelectorAll('blockquote[data-cita]')).toHaveLength(0);
});

it('ignora los blockquotes que no contienen una cita', () => {
  const div = mount('<blockquote><p><strong>Nota:</strong> revisa el registro de actividades.</p></blockquote>');
  expect(markCitations(div, citas([]))).toBe('marked');
  expect(div.querySelectorAll('blockquote[data-cita="verificada"]')).toHaveLength(3);
  expect(div.querySelectorAll('blockquote:not([data-cita])')).toHaveLength(1);
});

it('queda neutro si el número de citas no coincide con el total', () => {
  const div = mount();
  expect(markCitations(div, citas([], 13))).toBe('neutral');
  expect(div.querySelectorAll('blockquote[data-cita]')).toHaveLength(0);
});

it('no duplica las notas si se vuelve a marcar', () => {
  const div = mount();
  markCitations(div, citas([B.slice(0, 120)]));
  markCitations(div, citas([B.slice(0, 120)]));
  expect(div.querySelectorAll('.cita-nota')).toHaveLength(1);
});

it('quita el emoji inicial del aviso', () => {
  expect(stripLeadingEmoji('⚠️ Esta información es orientativa')).toBe('Esta información es orientativa'); // taste-skill-ignore: input of the strip test
});
