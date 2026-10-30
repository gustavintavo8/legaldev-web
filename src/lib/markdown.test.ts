import { renderMarkdown } from './markdown';

it('elimina scripts y mantiene el formato', () => {
  // CommonMark keeps the rest of a "<script" line as raw HTML, so the markdown goes on its own line.
  const html = renderMarkdown('<script>alert(1)</script>\n\n**hola**');
  expect(html).not.toContain('<script');
  expect(html).toContain('<strong>hola</strong>');
});

it('elimina manejadores de eventos', () => {
  expect(renderMarkdown('<img src=x onerror=alert(1)>')).not.toContain('onerror');
});

it('convierte las citas en blockquote', () => {
  expect(renderMarkdown('> "cita" — RGPD, p. 6')).toContain('<blockquote>');
});
