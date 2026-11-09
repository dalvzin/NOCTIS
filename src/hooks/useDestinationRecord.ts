import { useEffect, useState } from 'react';
import type { Work } from '../types/catalog';
import { fetchWork } from '../services/catalog';

export function useDestinationRecord(work: Work) {
  const [state, setState] = useState({ id: work.id, item: work, loading: false, error: false });
  useEffect(() => {
    const controller = new AbortController();
    const enrich = work.source.kind === 'live' && ['books', 'music'].includes(work.category);
    setState({ id: work.id, item: work, loading: enrich, error: false });
    if (enrich)
      fetchWork(work.category, work.id, controller.signal, true)
        .then((item) => {
          if (!controller.signal.aborted)
            setState({ id: work.id, item: item ?? work, loading: false, error: false });
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setState({ id: work.id, item: work, loading: false, error: true });
        });
    return () => controller.abort();
  }, [work]);
  return state.id === work.id ? state : { id: work.id, item: work, loading: false, error: false };
}
