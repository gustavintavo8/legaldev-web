import { act, renderHook } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { useMediaQuery } from './useMediaQuery';

afterEach(() => vi.restoreAllMocks());

function mockMedia(initial: boolean) {
  let listener: ((e: MediaQueryListEvent) => void) | null = null;
  const mql = {
    matches: initial,
    addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => (listener = l),
    removeEventListener: vi.fn(),
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);
  // A real MediaQueryList updates `matches` before notifying.
  return (matches: boolean) => {
    mql.matches = matches;
    listener?.({ matches } as MediaQueryListEvent);
  };
}

it('devuelve si la consulta coincide', () => {
  mockMedia(true);
  const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
  expect(result.current).toBe(true);
});

it('se actualiza cuando cambia', () => {
  const change = mockMedia(false);
  const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
  expect(result.current).toBe(false);
  act(() => change(true));
  expect(result.current).toBe(true);
});
