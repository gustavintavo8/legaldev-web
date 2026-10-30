import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import HowItWorks from './HowItWorks';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// The strike-throughs, marks and funnel bars draw once their block is seen;
// even if the observer never fires, the fallback marks them seen.
it('las reglas y el embudo se dibujan aunque el observador no dispare', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  render(<HowItWorks />);
  const rules = screen.getByRole('list', { name: 'Normas descartadas' }).closest('[data-draw]')!;
  const funnel = screen.getByRole('list', { name: 'Recuperación de fragmentos' });
  expect(rules).not.toHaveAttribute('data-seen');
  expect(funnel).not.toHaveAttribute('data-seen');
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  vi.useRealTimers();
  await waitFor(() => {
    expect(rules).toHaveAttribute('data-seen');
    expect(funnel).toHaveAttribute('data-seen');
  });
});
