import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import Reveal from './Reveal';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('el contenido aparece aunque el observador nunca dispare', async () => {
  // Only the fallback timer is faked: Motion paints on its own frame loop.
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
  render(
    <Reveal>
      <p>Contenido</p>
    </Reveal>,
  );
  const wrapper = screen.getByText('Contenido').parentElement!;
  expect(wrapper.style.opacity).toBe('0');
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  vi.useRealTimers();
  await waitFor(() => expect(wrapper.style.opacity).not.toBe('0'));
});
