import { useEffect, useState } from 'react';
import { localSearch, searchCatalog, clearCatalogCache } from '../services/catalog';
import type { SearchResponse } from '../types/catalog';

export function useCatalogSearch(query: string, category = '') {
  const key = `${category}|${query}`;
  const [state, setState] = useState<{ key: string; data: SearchResponse; loading: boolean }>({ key: '', data: { items: [], statuses: [] }, loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ key, data: { items: localSearch(query, category), statuses: [] }, loading: true });
    const timer = setTimeout(() => {
      searchCatalog(query, category, controller.signal, data => { if (active) setState({ key, data, loading:true }); }).then(data => { if (active) setState({ key, data, loading: false }); }).catch(() => { if (active && !controller.signal.aborted) setState({key,data:{items:localSearch(query,category),statuses:[{category:(category || 'books') as import('../types/catalog').CategorySlug,label:'Search',state:'error',message:'Online search is unavailable. The local selection is still available.'}]},loading:false}); });
    }, query.trim().length >= 2 ? 400 : 0);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [key, query, category, attempt]);
  const current = state.key === key ? state : { key, data: { items: localSearch(query, category), statuses: [] }, loading: true };
  return { ...current.data, loading: current.loading, retry() { clearCatalogCache(); setAttempt(value => value + 1); } };
}
