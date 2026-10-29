import { useCallback, useRef, useState } from 'react';
import { EJEMPLO } from '../data/example';
import { analyze, errorMessage } from '../lib/api';
import { buildPayload, DEFAULT_VALUES, type FormValues, valuesFromQuestionnaire } from '../lib/payload';
import type { RAGResponse } from '../lib/types';

export type AnalysisState =
  | { kind: 'idle' }
  | { kind: 'loading'; startedAt: number }
  | { kind: 'success'; data: RAGResponse; ejemplo: boolean }
  | { kind: 'error'; message: string };

export function useAnalysis() {
  const [values, setValuesState] = useState<FormValues>(DEFAULT_VALUES);
  const [state, setState] = useState<AnalysisState>({ kind: 'idle' });
  const valuesRef = useRef(values);
  const controller = useRef<AbortController | null>(null);

  const setValues = useCallback((v: FormValues) => {
    valuesRef.current = v;
    setValuesState(v);
  }, []);

  const submit = useCallback(() => {
    // A cold start can take a minute; a second click must not start a second request.
    if (controller.current) return;
    const ac = new AbortController();
    controller.current = ac;
    setState({ kind: 'loading', startedAt: Date.now() });
    analyze(buildPayload(valuesRef.current), ac.signal)
      .then((data) => {
        if (!ac.signal.aborted) setState({ kind: 'success', data, ejemplo: false });
      })
      .catch((e) => {
        if (!ac.signal.aborted) setState({ kind: 'error', message: errorMessage(e) });
      })
      .finally(() => {
        if (controller.current === ac) controller.current = null;
      });
  }, []);

  const loadExample = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setValues(valuesFromQuestionnaire(EJEMPLO.entrada));
    setState({ kind: 'success', data: EJEMPLO.respuesta, ejemplo: true });
  }, [setValues]);

  return { state, values, setValues, submit, loadExample };
}

export type Analysis = ReturnType<typeof useAnalysis>;
