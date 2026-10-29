// Dev-only page (dev/break-ui.html): the Report panel fed with each fixture.
import { useState } from 'react';
import Report from '../components/Report';
import type { AnalysisState } from '../hooks/useAnalysis';
import { FIXTURES, WORST_ERROR } from './reportFixtures';

const STATES = ['demo', 'worst', 'empty', 'one', 'error'] as const;
type Key = (typeof STATES)[number];
const LABELS: Record<Key, string> = { demo: 'Demo data', worst: 'Worst case', empty: 'Empty', one: 'One', error: 'Error' };

function stateFor(k: Key): AnalysisState {
  return k === 'error' ? { kind: 'error', message: WORST_ERROR } : { kind: 'success', data: FIXTURES[k], ejemplo: false };
}

export default function BreakUi() {
  const [key, setKey] = useState<Key>(() => (new URLSearchParams(location.search).get('data') as Key) || 'worst');
  const pick = (k: Key) => {
    setKey(k);
    history.replaceState(null, '', `?data=${k}`);
  };
  return (
    <>
      <Report key={key} state={stateFor(key)} />
      <div
        style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2,
          padding: 3, background: '#ddd', borderRadius: 999, font: '13px system-ui', zIndex: 10,
        }}
      >
        {STATES.map((k) => (
          <button
            key={k}
            onClick={() => pick(k)}
            style={{ padding: '6px 12px', borderRadius: 999, background: k === key ? '#fff' : 'transparent' }}
          >
            {LABELS[k]}
          </button>
        ))}
      </div>
    </>
  );
}
