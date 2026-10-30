import { render } from '@testing-library/react';
import App from './App';

it('renderiza el contenedor principal', () => {
  render(<App />);
  expect(document.querySelector('main#contenido')).toBeInTheDocument();
});
