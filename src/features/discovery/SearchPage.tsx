import { useSearchParams } from 'react-router-dom';
import { rooms } from '../../data/rooms';
import { useCatalogSearch } from '../../hooks/useCatalogSearch';
import { filterWorks } from '../../services/catalogUtils';
import { CatalogResults } from './CatalogResults';
import { CatalogFilters } from './CatalogFilters';
import { ProviderNotice } from './ProviderNotice';
import styles from './Discovery.module.css';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get('q') ?? '').slice(0, 120);
  const category = rooms.some(room => room.slug === params.get('category')) ? params.get('category')! : '';
  const results = useCatalogSearch(query, category);
  const effective = new URLSearchParams(params);
  if (!category) effective.delete('category');
  const visible = filterWorks(results.items, effective);
  return <section className={styles.page}>
    <p className="eyebrow">HYBRID DISCOVERY / THE ARCHIVE</p><h1>Follow a thread.</h1>
    <form role="search" className={styles.searchForm} onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); setParams({ q: String(form.get('q') ?? ''), ...(category ? { category } : {}) }); }}>
      <label htmlFor="full-search">Search works, creators and subjects</label><div><input key={query} id="full-search" name="q" type="search" maxLength={120} defaultValue={query} placeholder="A title, a creator, a curiosity…"/><button className="button">Search</button></div>
    </form>
    <nav aria-label="Search categories" className={styles.categories}>{[{ slug: '', category: 'All categories' }, ...rooms].map(room => <button key={room.slug} aria-pressed={category === room.slug} onClick={() => { const next = new URLSearchParams(); if (query) next.set('q', query); if (room.slug) next.set('category', room.slug); setParams(next); }}>{room.category}</button>)}</nav>
    <CatalogFilters items={results.items} params={params} onChange={next => setParams(next, { replace: true })}/>
    <p className={styles.hint}>Filters apply to loaded records. Each external source returns at most 12 matches per search; counts are not catalog-wide totals.</p>
    <ProviderNotice {...results}/>
    <p role="status" aria-live="polite" className={styles.count}>{visible.length} matching {visible.length === 1 ? 'work' : 'works'}{results.loading ? ' · Updating external results…' : ''}</p>
    {!visible.length && !results.loading && <div className={styles.empty}><h2>No works found.</h2><p>Try a broader query or clear the filters. Check source availability above if an external catalog failed.</p></div>}
    <CatalogResults key={params.toString()} items={visible}/>
  </section>;
}
