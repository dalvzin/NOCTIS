import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import type { Room } from '../../data/rooms';
import { works } from '../../data/works';
import { useCatalogSearch } from '../../hooks/useCatalogSearch';
import { filterWorks } from '../../services/catalogUtils';
import { CatalogResults } from '../discovery/CatalogResults';
import { CatalogFilters } from '../discovery/CatalogFilters';
import { ProviderNotice } from '../discovery/ProviderNotice';
import { RoomEntrance } from './RoomEntrance';
import styles from './Experiences.module.css';

export function RoomExperience({ room }: { room: Room }) {
  const [params, setParams] = useSearchParams();
  const query = (params.get('q') ?? '').slice(0, 120);
  const results = useCatalogSearch(query, room.slug);
  const formats = [...new Set(results.items.map(work => work.format))];
  const format = formats.includes(params.get('format') ?? '') ? params.get('format')! : 'All';
  const effective = new URLSearchParams(params);
  effective.delete('category');
  if (format === 'All') effective.delete('format');
  const visible = filterWorks(results.items, effective);
  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === 'All') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  }
  return <div className={styles.room}>
    <RoomEntrance room={room} work={works.find(work => work.category === room.slug)!}/>
    <section id="collection" className={styles.collection} aria-labelledby="collection-title">
      <div className={styles.collectionHeading}><div><p className="eyebrow">01 / THE COLLECTION</p><h2 id="collection-title">An invitation to explore.</h2></div><p>Curated records and on-demand discovery.<br/>Every source, clearly identified.</p></div>
      <div className={styles.toolbar}>
        <fieldset className={styles.filters}><legend><SlidersHorizontal size={12}/> Format</legend>{['All', ...formats].map(item => <button key={item} aria-pressed={format === item} onClick={() => updateFilter('format', item)}>{item}</button>)}</fieldset>
        <label className={styles.find}>Find in this room<input type="search" maxLength={120} value={query} placeholder="Title, creator or subject…" onChange={event => updateFilter('q', event.target.value)}/></label>
      </div>
      <CatalogFilters items={results.items} params={params} hideFormat onChange={next => setParams(next, { replace: true })}/>
      <p className={styles.resultCount}>Filters refine loaded records. External lookup starts at 2 characters, with up to 12 matches per provider.</p>
      <ProviderNotice {...results}/>
      <p role="status" className={styles.resultCount}>{visible.length} {visible.length === 1 ? 'work' : 'works'} / {params.get('source') === 'demo' ? 'LOCAL DEMONSTRATION' : 'HYBRID CATALOG'}</p>
      {visible.length ? <CatalogResults key={params.toString()} items={visible}/> : <div className={styles.empty}><h3>No works in this corner.</h3><p>Try a different title, creator or format. External sources may be unavailable.</p><button className="button" onClick={() => setParams({}, { replace: true })}>Reset filters</button></div>}
      <div className={styles.roomFoot}><p>Every collection begins with a little curiosity.</p><Link to="/discover" className="textLink">Find another room <ArrowUpRight size={14}/></Link></div>
    </section>
  </div>;
}
