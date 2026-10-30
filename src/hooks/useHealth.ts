import { useEffect, useState } from 'react';
import { fetchHealth, type Health } from '../lib/api';

export type HealthView = Health | { state: 'checking' };

export function useHealth(): HealthView {
  const [health, setHealth] = useState<HealthView>({ state: 'checking' });

  useEffect(() => {
    const ac = new AbortController();
    fetchHealth(ac.signal).then((h) => {
      if (!ac.signal.aborted) setHealth(h);
    });
    return () => ac.abort();
  }, []);

  return health;
}
