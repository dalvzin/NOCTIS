import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import type { Room } from '../../data/rooms';
import { curatedWorks } from '../../data/curated';
import { useCatalogSearch } from '../../hooks/useCatalogSearch';
import { filterWorks } from '../../services/catalogUtils';
import { CatalogResults } from '../discovery/CatalogResults';
import { CatalogFilters } from '../discovery/CatalogFilters';
import { ProviderNotice } from '../discovery/ProviderNotice';
import { RoomEntrance } from './RoomEntrance';
import styles from './Experiences.module.css';
import { roomCuration } from '../../data/roomCuration';
import type { CategorySlug } from '../../types/catalog';

export function RoomExperience({ room }: { room: Room }) {
  const [params, setParams] = useSearchParams();
  const query = (params.get('q') ?? '').slice(0, 120);
  const results = useCatalogSearch(query, room.slug);
  const formats = [...new Set(results.items.map(work => work.format))];
  const format = formats.includes(params.get('format') ?? '') ? params.get('format')! : 'All';
  const effective = new URLSearchParams(params);
  effective.delete('category'); effective.delete('source');
  if (format === 'All') effective.delete('format');
  const visible = filterWorks(results.items, effective);
  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === 'All') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  }
  const refined = ['format','creator','tag','year'].some(key => params.has(key));
  return <div className={styles.room} data-room={room.slug}>
    <RoomEntrance room={room} work={curatedWorks.find(work => work.id === (room.slug === 'books' ? 'gutenberg:books:84' : '')) ?? curatedWorks.find(work => work.category === room.slug)!}/>
    <section id="collection" tabIndex={-1} className={styles.collection} aria-labelledby="collection-title">
      <div className={styles.collectionHeading}><div><p className="eyebrow">THE COLLECTION</p><h2 id="collection-title">{room.slug === 'books' ? 'On the reading table.' : 'An invitation to explore.'}</h2></div><p>{roomCuration[room.slug as CategorySlug]}</p></div>
      <div className={styles.toolbar}>
        <label className={styles.find}>Find in this room<input type="search" maxLength={120} value={query} placeholder="Title, creator or subject…" onChange={event => updateFilter('q', event.target.value)}/></label>
        <details className={styles.refinements} open={refined || undefined}><summary><SlidersHorizontal size={14}/> Refine selection{refined ? ' · active' : ''}</summary>
          {formats.length > 1 && <fieldset className={styles.filters}><legend>Format</legend>{['All', ...formats].map(item => <button key={item} aria-pressed={format === item} onClick={() => updateFilter('format', item)}>{item}</button>)}</fieldset>}
          <CatalogFilters items={results.items} params={params} hideFormat compact onChange={next => setParams(next, { replace: true })}/>
        </details>
      </div>
      {query && <ProviderNotice {...results}/>}
      <p role="status" className={styles.resultCount}>{visible.length} {visible.length === 1 ? 'work' : 'works'}{results.loading && query ? ' · Searching connected sources…' : ''}</p>
      {visible.length ? <CatalogResults key={params.toString()} items={visible}/> : results.loading && query ? <p>Searching… Local matches will appear here.</p> : <div className={styles.empty}><h3>{results.statuses.some(status => status.state === 'error' || status.state === 'unavailable') ? 'No matches in the local selection.' : 'No works in this corner.'}</h3><p>{results.statuses.some(status => status.state === 'error' || status.state === 'unavailable') ? 'A live source is unavailable or not connected. This is not a complete catalog search.' : 'Try a different title, creator or format.'}</p><button className="button" onClick={() => setParams({}, { replace: true })}>Reset filters</button></div>}
      <div className={styles.roomFoot}><p>Every collection begins with a little curiosity.</p><Link to="/discover" className="textLink">Find another room <ArrowUpRight size={14}/></Link></div>
    </section>
  </div>;
}
