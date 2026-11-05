import { useEffect, useId, useState, type CSSProperties } from 'react';
import { Modal } from '../../components/ui/Modal';
import { ItemImage } from '../discovery/ItemImage';
import { usePersonalArchive } from './context';
import { coverStore, type CoverStorage } from './images';
import { useMedia } from './MediaContext';
import { changeAlbumCover, uploadAlbumCover } from './covers';
import { findKnown } from '../../services/catalog';
import type { AlbumFields, CommandResult, PersonalAlbum } from './types';
import styles from './Personal.module.css';

export const accentStyle = (accent: PersonalAlbum['accent']): CSSProperties => ({ '--accent': { bronze: '#a78966', sage: '#7f9687', slate: '#8196aa', rose: '#ac8388' }[accent] } as CSSProperties);
export function Confirm({ title, children, action, onClose }: { title: string; children: React.ReactNode; action: () => Promise<CommandResult>; onClose: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <Modal title={title} onClose={() => { if (!busy) onClose(); }}><p>{children}</p><div className={styles.row}><button className="button" disabled={busy} onClick={onClose}>Cancel</button><button className="button" disabled={busy} onClick={async () => { setBusy(true); try { const result = await action(); if (result.ok) onClose(); else setError(result.error ?? 'Could not complete this action.'); } catch { setError('Could not complete this action. Please try again.'); } finally { setBusy(false); } }}>{busy ? 'Working…' : 'Confirm'}</button></div>{error && <p role="alert">{error}</p>}</Modal>;
}
export function AlbumForm({ initial, onSubmit, submitLabel }: { initial?: AlbumFields; onSubmit: (fields: AlbumFields) => Promise<CommandResult>; submitLabel: string }) {
  const [fields, setFields] = useState<AlbumFields>(initial ?? { title: '', description: '', accent: 'bronze', layout: 'grid' });
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false); const id = useId();
  return <form className={styles.form} onSubmit={async event => { event.preventDefault(); setBusy(true); const result = await onSubmit(fields); setBusy(false); setMessage(result.ok ? 'Album saved in this browser.' : result.error ?? 'Could not save album.'); if (result.ok && !initial) setFields({ title: '', description: '', accent: 'bronze', layout: 'grid' }); }}>
    <label htmlFor={`${id}-title`}>Album title</label><input id={`${id}-title`} required maxLength={80} value={fields.title} onChange={e => setFields({ ...fields, title: e.target.value })}/>
    <label htmlFor={`${id}-description`}>Description</label><textarea id={`${id}-description`} maxLength={1000} value={fields.description} onChange={e => setFields({ ...fields, description: e.target.value })}/>
    <label htmlFor={`${id}-accent`}>Accent color</label><select id={`${id}-accent`} value={fields.accent} onChange={e => setFields({ ...fields, accent: e.target.value as AlbumFields['accent'] })}>{['bronze', 'sage', 'slate', 'rose'].map(value => <option key={value}>{value}</option>)}</select>
    <label htmlFor={`${id}-layout`}>Layout preset</label><select id={`${id}-layout`} value={fields.layout} onChange={e => setFields({ ...fields, layout: e.target.value as AlbumFields['layout'] })}><option value="grid">Gallery grid</option><option value="editorial">Editorial opening</option><option value="list">Reading list</option></select>
    <button disabled={busy || !fields.title.trim()}>{submitLabel}</button>{message && <p role="status">{message}</p>}
  </form>;
}
export function AlbumCover({ album }: { album: PersonalAlbum }) {
  const media=useMedia();
  const { data } = usePersonalArchive(); const [image, setImage] = useState<{ id: string; url: string } | null>(null), [missing, setMissing] = useState(false);
  const imageId = album.cover.kind === 'upload' ? album.cover.imageId : '';
  useEffect(() => {
    let active = true, url = ''; setMissing(false);
    if (imageId) void media.get(imageId).then(blob => { if (active && blob) { url = URL.createObjectURL(blob); setImage({ id: imageId, url }); } else if (active) setMissing(true); }).catch(() => { if (active) setMissing(true); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [imageId,media]);
  const savedWork = album.cover.kind === 'work' ? data.entries[album.cover.workId]?.work : undefined;
  const known = savedWork ? findKnown(savedWork.category, savedWork.id) : undefined;
  const work = savedWork?.image ? savedWork : known?.image ? known : savedWork;
  return <div className={`${styles.cover} ${work ? styles.workCover : ''}`} style={accentStyle(album.accent)}>{imageId && image?.id === imageId && !missing ? <img src={image.url} alt={`Uploaded cover for ${album.title}`} loading="lazy" decoding="async" onError={() => setMissing(true)}/> : work ? <ItemImage work={work} context="album"/> : <p>{missing ? 'Cover unavailable in this browser' : imageId ? 'Opening local cover…' : 'A collection of experiences'}</p>}</div>;
}
export async function removeAlbumImage(album: PersonalAlbum, storage:CoverStorage=coverStore) { if (album.cover.kind === 'upload') await storage.remove(album.cover.imageId); }
export function CoverEditor({ album }: { album: PersonalAlbum }) {
  const media=useMedia();
  const { data, repository } = usePersonalArchive(); const cloud=repository.mode==='cloud'; const [message, setMessage] = useState(''), [busy, setBusy] = useState(false); const id = useId();
  const update = async (cover: PersonalAlbum['cover']) => {
    setBusy(true); setMessage('Updating cover…');
    try { const result = await changeAlbumCover(repository, album, cover,media); setMessage(result.ok ? 'Cover updated.' : result.error ?? 'Could not update cover.'); }
    catch { setMessage('Could not update cover. Your previous cover is unchanged.'); }
    finally { setBusy(false); }
  };
  return <section className={styles.panel} aria-busy={busy}><h2>Album cover</h2><p>Changes are saved immediately. No need to save the album form again.</p><label htmlFor={`${id}-cover`}>Choose a work from this album</label><select id={`${id}-cover`} disabled={busy || !album.workIds.length} value={album.cover.kind === 'work' ? album.cover.workId : ''} onChange={e => void update(e.target.value ? { kind: 'work', workId: e.target.value } : { kind: 'none' })}><option value="">{album.cover.kind === 'upload' ? 'Custom uploaded cover' : 'No work selected'}</option>{album.workIds.map(workId => <option key={workId} value={workId}>{data.entries[workId].work.title}</option>)}</select>{!album.workIds.length && <p>Add a work to this album to select its artwork, or upload your own image below.</p>}
    <p><label htmlFor={`${id}-upload`}>Upload a local cover (JPEG, PNG or WebP · up to 2 MB)</label></p><input id={`${id}-upload`} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; setBusy(true); setMessage('Validating and saving cover…');
      try { const result = await uploadAlbumCover(repository, album, file,media); setMessage(result.ok ? (cloud?'Cover saved to your account.':'Cover stored only in this browser.') : result.error ?? 'Could not save cover.'); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save cover.'); }
      finally { setBusy(false); }
    }}/><p><button disabled={busy || album.cover.kind === 'none'} onClick={() => void update({ kind: 'none' })}>Remove cover</button></p>{message && <p role="status">{message}</p>}<small>{cloud?'Files are stored in your private Supabase media bucket. Album visibility controls access.':'Files stay in IndexedDB on this device. They are never sent to a server.'}</small>
  </section>;
}
