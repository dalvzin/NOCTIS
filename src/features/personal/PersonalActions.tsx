import { useId, useState } from 'react';
import { portfolioMode } from '../../config/portfolio';
import { Link } from 'react-router-dom';
import type { Work } from '../../types/catalog';
import { usePersonalArchive } from './context';
import styles from './Personal.module.css';

export function PersonalActions({ work, compact = false, preview = false }: { work: Work; compact?: boolean; preview?: boolean }) {
  const { data, repository, blocked } = usePersonalArchive();
  const entry = data.entries[work.id], id = useId();
  const [title, setTitle] = useState(''), [message, setMessage] = useState('');
  return <section className={`${styles.actions} ${compact ? styles.compactActions : ''}`} aria-label={`Personal archive: ${work.title}`}>
    <div className={styles.row}>
      <button disabled={blocked} aria-pressed={entry?.saved ?? false} onClick={() => void repository.dispatch({ type: 'save', work, value: !entry?.saved })}>{entry?.saved ? 'Saved' : 'Save'}</button>
      <button disabled={blocked} aria-pressed={entry?.wanted ?? false} onClick={() => void repository.dispatch({ type: 'want', work, value: !entry?.wanted })}>Want to Experience{entry?.wanted ? ' ✓' : ''}</button>
      {compact && entry?.rating != null && <span>My rating: {entry.rating} / 5</span>}
    </div>
    {compact&&repository.mode!=='cloud'&&(entry?.saved||entry?.wanted)&&<small>Stored locally{!portfolioMode && <> · <Link to="/account">Use an account</Link></>}</small>}
    {!compact && <>{!preview && <><label htmlFor={id}>My private rating</label><select id={id} disabled={blocked} value={entry?.rating ?? ''} onChange={event => void repository.dispatch({ type: 'rate', work, rating: event.target.value ? Number(event.target.value) : null })}><option value="">Not rated / remove rating</option>{Array.from({ length: 10 }, (_, i) => (i + 1) / 2).map(value => <option key={value} value={value}>{value} / 5 stars</option>)}</select></>}
      <details><summary>Add to Album</summary><p>Bring works together in a collection. Choose an album or make a new one.</p>{data.albums.map(album => <label className={styles.membership} key={album.id}><input type="checkbox" disabled={blocked} checked={album.workIds.includes(work.id)} onChange={event => void repository.dispatch({ type: 'albumWork', id: album.id, work, value: event.target.checked })}/>{album.title}</label>)}
        <form onSubmit={async event => { event.preventDefault(); const result = await repository.dispatch({ type: 'createAlbum', fields: { title, description: '', accent: 'bronze', layout: 'grid' }, work }); setMessage(result.ok ? 'Album created with this work.' : result.error ?? 'Could not create album.'); if (result.ok) setTitle(''); }}><label htmlFor={`${id}-album`}>New album title</label><input id={`${id}-album`} required maxLength={80} value={title} onChange={event => setTitle(event.target.value)}/><button disabled={blocked || !title.trim()}>Create album with this work</button></form>{message && <p role="status">{message}</p>}
      </details>{!preview && <small>{repository.mode==='cloud'?'Cloud account archive. Changes appear after server confirmation.':<>Local to this browser. {portfolioMode ? 'No account needed.' : <><Link to="/account">Sign in or connect a cloud archive</Link>. No automatic upload.</>}</>}</small>}</>}
  </section>;
}
