import { render, screen } from '@testing-library/react';
import { AUTOR, REPO, TUTOR } from '../data/site';
import Footer from './Footer';
import Mcp from './Mcp';
import PrivacyNotice from './PrivacyNotice';

describe('MCP', () => {
  it('presenta las tres herramientas como algo en desarrollo', () => {
    render(<Mcp />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pronto, dentro de tu editor.');
    for (const t of ['analizar_proyecto', 'listar_normativas', 'consultar_obligaciones'])
      expect(screen.getAllByText(new RegExp(t)).length).toBeGreaterThan(0);
    expect(screen.getByText('En desarrollo · demo prevista para diciembre de 2026')).toBeInTheDocument();
  });
});

describe('pie', () => {
  it('identifica el TFG, el autor y el tutor', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    for (const t of [AUTOR, TUTOR, 'EPI Gijón', 'Universidad de Oviedo']) expect(footer).toHaveTextContent(t);
  });

  it('rotula el disclaimer como «Aviso», sin emoji', () => {
    render(<Footer />);
    expect(screen.getByText('Aviso')).toBeInTheDocument();
    expect(screen.queryByText('Aviso legal')).not.toBeInTheDocument();
    const disclaimer = screen.getByText(/^Esta información es orientativa/);
    expect(disclaimer.textContent).not.toContain('⚠'); // taste-skill-ignore: asserts the emoji is stripped
  });

  it('muestra Gijón con la hora local', () => {
    render(<Footer />);
    expect(screen.getByText('Gijón')).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it('la casilla de acción lleva al formulario', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /Analizar mi proyecto/ })).toHaveAttribute('href', '#demo');
  });
});

describe('privacidad', () => {
  it('informa de los tratamientos con los datos de la memoria', () => {
    render(<PrivacyNotice />);
    const notice = document.getElementById('privacidad')!;
    for (const t of [
      'interés legítimo (art. 6.1.f del RGPD)',
      'Groq',
      '30 días',
      'Hugging Face',
      'Vercel',
      'una hora',
      'AEPD',
      'Sin cookies propias ni analítica',
      'comprueba el estado del servidor al cargar la página',
    ])
      expect(notice).toHaveTextContent(t);
  });

  it('sin email publicado, el contacto son las issues del repositorio', () => {
    render(<PrivacyNotice />);
    expect(screen.getByRole('link', { name: 'a través de las issues del repositorio' })).toHaveAttribute(
      'href',
      `${REPO}/issues`,
    );
  });

  it('con email, el contacto es un enlace mailto', () => {
    render(<PrivacyNotice email="autor@example.org" />);
    expect(screen.getByRole('link', { name: 'autor@example.org' })).toHaveAttribute('href', 'mailto:autor@example.org');
  });

  it('se abre al llegar con #privacidad', () => {
    window.location.hash = '#privacidad';
    render(<PrivacyNotice />);
    expect(document.getElementById('privacidad')).toHaveAttribute('open');
    window.location.hash = '';
  });
});
