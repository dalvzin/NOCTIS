import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Room } from '../../data/rooms';
import { workPath, type Work } from '../../data/works';
import { fetchWork, findKnown, localCatalog } from '../../services/catalog';
import { validReturnTo } from '../../services/catalogUtils';
import { Information } from '../archive/Pages';
import { WorkContent } from './WorkContent';
import { ItemImage } from '../discovery/ItemImage';
import styles from './Experiences.module.css';
import { usePersonalArchive, useRecordVisit } from '../personal/context';

export function WorkDetail({ room }: { room: Room }) {
  const { workId = '' } = useParams();
  const location = useLocation();
  const { repository } = usePersonalArchive();
  const key = `${room.slug}/${workId}`;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; item: Work | null; loading: boolean; error: boolean }>({ key, item: findKnown(room.slug, workId) ?? null, loading: !findKnown(room.slug, workId), error: false });
  useEffect(() => {
    const controller = new AbortController();
    const known = findKnown(room.slug, workId) ?? repository.findWork(room.slug, workId);
    setState({ key, item: known ?? null, loading: !known, error: false });
    if (!known || known.source.kind === 'live') fetchWork(room.slug, workId, controller.signal, !!known).then(item => { if (!controller.signal.aborted) setState({ key, item: item ?? known ?? null, loading: false, error: false }); }).catch(() => { if (!controller.signal.aborted) setState({ key, item: known ?? null, loading: false, error: true }); });
    return () => controller.abort();
  }, [key, room.slug, workId, attempt, repository]);
  const work = (state.key === key ? state.item : findKnown(room.slug, workId)) ?? repository.findWork(room.slug, workId);
  useRecordVisit(work);
  useEffect(() => { if (work) document.title = `NOCTIS — ${work.title}`; }, [work]);
  if (!work && (state.loading || state.key !== key)) return <section className={styles.detail}><p role="status">Opening the source record…</p></section>;
  if (!work && state.error) return <section className={styles.detail}><h1>The source is temporarily out of reach.</h1><p>We could not load this external record. Your local collections are still available.</p><button className="button" onClick={() => setAttempt(value => value + 1)}>Retry record</button><p><Link to={`/${room.slug}`}>Return to the room</Link></p></section>;
  if (!work) return <Information title="This record is out of reach." description="404 — No catalog work exists at this address. Explore the rooms to find a record."/>;
  const returnTo = validReturnTo(location.state?.returnTo, `/${room.slug}`);
  const related = localCatalog.filter(item => item.category === room.slug && item.id !== work.id && (work.source.kind === 'demo' ? item.source.kind === 'demo' : item.source.kind !== 'demo')).slice(0, 2);
  return <article className={styles.detail}>
    <nav aria-label="Record breadcrumb" className={styles.breadcrumb}><Link to={returnTo}><ArrowLeft size={14}/> {room.name}</Link><span>{work.source.kind === 'demo' ? 'LOCAL DEMONSTRATION' : work.source.kind === 'live' ? 'PROVIDER RECORD' : 'CURATED REAL WORK'}</span></nav>
    <div className={styles.detailGrid}><ItemImage work={work} hero/><div><p className="eyebrow">{room.category} / {work.format}</p><h1>{work.title}</h1>{state.error && <p role="status">Additional source details are unavailable. Showing the metadata already retrieved.</p>}<WorkContent work={work}/><Link to={returnTo} className="textLink">Back to the collection <ArrowUpRight size={14}/></Link></div></div>
    {!!related.length && <section className={styles.related} aria-labelledby="related-title"><p className="eyebrow">KEEP WANDERING</p><h2 id="related-title">Elsewhere in this room</h2><div>{related.map(item => <Link key={item.id} to={workPath(item)} state={{ returnTo }}><span>{item.format} / {item.year ?? 'Date unavailable'}</span><h3>{item.title}<ArrowUpRight size={16}/></h3><p>{item.creator}</p></Link>)}</div></section>}
  </article>;
}
