import type { Work } from '../../types/catalog';
import styles from './Discovery.module.css';

export function CatalogFilters({ items, params, onChange, hideFormat = false }: { items: Work[]; params: URLSearchParams; onChange: (params: URLSearchParams) => void; hideFormat?: boolean }) {
  function update(key: string, value: string) { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); onChange(next); }
  const formats = [...new Set(items.map(work => work.format))].sort();
  const tags = [...new Set(items.flatMap(work => work.tags))].sort().slice(0, 60);
  const decades = [...new Set(items.flatMap(work => work.year === null ? [] : [Math.floor(work.year / 10) * 10]))].sort((a, b) => b - a);
  return <fieldset className={styles.filters}><legend>Refine the selection</legend>{!hideFormat && <label>Format<select value={params.get('format') ?? ''} onChange={e => update('format', e.target.value)}><option value="">All formats</option>{formats.map(format => <option key={format}>{format}</option>)}</select></label>}<label>Creator / author<input value={params.get('creator') ?? ''} onChange={e => update('creator', e.target.value)} placeholder="Name…"/></label><label>Tag / subject<select value={params.get('tag') ?? ''} onChange={e => update('tag', e.target.value)}><option value="">All tags</option>{tags.map(tag => <option key={tag}>{tag}</option>)}</select></label><label>Period<select value={params.get('year') ?? ''} onChange={e => update('year', e.target.value)}><option value="">All periods</option>{decades.map(decade => <option key={decade} value={decade}>{decade}s</option>)}</select></label><button onClick={() => { const next = new URLSearchParams(); for (const key of ['q', 'category']) { const value = params.get(key); if (value) next.set(key, value); } onChange(next); }} type="button" className="textLink">Clear filters</button></fieldset>;
}
