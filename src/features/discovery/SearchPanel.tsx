import { useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ItemImage } from './ItemImage';
import { withKnownArtwork } from '../../services/catalog';
import { Modal } from '../../components/ui/Modal';
import { curatedWorks } from '../../data/curated';
import { rooms } from '../../data/rooms';
import { workPath } from '../../data/works';
import { useCatalogSearch } from '../../hooks/useCatalogSearch';
import styles from './Discovery.module.css';

export function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const list = useRef<HTMLDivElement>(null);
  const results = useCatalogSearch(query);
  const items = query.trim() ? results.items.slice(0, 7) : curatedWorks.slice(0, 3);
  function moveFocus(event: KeyboardEvent) {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const links = [...(list.current?.querySelectorAll<HTMLAnchorElement>('[data-search-result]') ?? [])];
    if (!links.length) return;
    event.preventDefault();
    const index = links.findIndex(link => link === document.activeElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % links.length : (index <= 0 ? links.length - 1 : index - 1);
    links[next]?.focus();
  }
  return <Modal title="Search archive" search onClose={onClose}><div onKeyDown={moveFocus}>
    <form role="search" className={styles.panelForm} onSubmit={event => { event.preventDefault(); navigate(`/search?${new URLSearchParams({ q: query.trim() })}`); onClose(); }}><label htmlFor="archive-search">Search works</label><div><input id="archive-search" autoFocus type="search" maxLength={120} value={query} onChange={event => setQuery(event.target.value)} placeholder="Titles, creators, subjects…" aria-controls="search-results"/><button aria-label="See all search results">↵</button></div></form>
    <p className="eyebrow">{query.trim() ? 'MATCHING WORKS' : 'THE CURATOR’S SELECTION'}</p>
    <p role="status" aria-live="polite" className={styles.hint}>{query.trim() ? `${items.length} shown${results.loading ? ' · Checking external catalogs…' : ''}` : 'Editorial starting points — not trending or personalized.'}</p>
    <div ref={list} id="search-results" className={styles.compactResults}>{items.map(work => <Link data-search-result key={work.id} to={workPath(work)} onClick={onClose}><ItemImage work={withKnownArtwork(work)} context="thumbnail" decorative/><span><strong>{work.title}</strong><small>{work.creator} · {work.category} · {work.source.kind === 'demo' ? 'Fictional demo' : work.source.label}</small>{work.image && <small>{work.image.credit} · {work.image.rights}</small>}</span></Link>)}</div>
    {!items.length && !results.loading && <p className={styles.hint}>No works found. Try another title or explore all results.</p>}
    {results.statuses.some(status => status.state === 'error' || status.state === 'unavailable') && <p className={styles.hint}>Some external catalogs are unavailable or not configured. Full results show source availability.</p>}
    <Link className="textLink" to={`/search?${new URLSearchParams({ q: query.trim() })}`} onClick={onClose}>See all results ↗</Link>
    <nav aria-label="Browse rooms" className={styles.roomLinks}>{rooms.filter(room => !query.trim() || room.category.toLowerCase().includes(query.toLowerCase())).map(room => <Link key={room.slug} to={`/${room.slug}`} onClick={onClose}>{room.category}</Link>)}</nav>
    <p className={styles.hint}>↑ ↓ navigate works · Enter searches · Esc closes</p>
  </div></Modal>;
}
