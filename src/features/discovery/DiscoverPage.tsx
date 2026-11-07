import { useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { curatedWorks, editorialCollections } from '../../data/curated';
import { quietThread } from '../../data/editorialPaths';
import { workPath } from '../../data/works';
import { RoomGrid } from '../archive/Pages';
import { CatalogResults } from './CatalogResults';
import { ItemImage } from './ItemImage';
import styles from './Editorial.module.css';

export function DiscoverPage() {
 const [params]=useSearchParams(); const location=useLocation();
 const selected=editorialCollections.find(item=>item.id===params.get('collection'));
 const selection=useRef<HTMLElement>(null),thread=useRef<HTMLElement>(null);
 const items=selected ? selected.ids.flatMap(id=>curatedWorks.find(work=>work.id===id) ?? []) : curatedWorks.filter(work=>['gutenberg:books:84','thatgamecompany:games:journey','brianeno:music:ambient-2'].includes(work.id));
 useEffect(()=>{const target=selected ? selection.current : location.hash==='#follow-a-thread' ? thread.current : null;if(!target)return;const frame=requestAnimationFrame(()=>{target.scrollIntoView({block:'start',behavior:'auto'});target.focus({preventScroll:true});});return()=>cancelAnimationFrame(frame);},[selected?.id,location.hash]);
 return <div className={styles.page}><header className={styles.intro}><p className="eyebrow">DISCOVER / A CURATOR’S ROUTE</p><h1>Let curiosity<br/><em>lead the way.</em></h1><p>A few works. A different way of seeing what connects them.</p></header>
 <section className={styles.feature} aria-labelledby="after-hours-invitation"><div><p className="eyebrow">SPECIAL EXHIBITION / NO. 001</p><h2 id="after-hours-invitation">After Hours<br/><em>The City Remembers</em></h2><p>A city above us. A passage between strangers. A room with the light left on.</p><Link to="/discover/after-hours" className="button">Enter the exhibition <ArrowUpRight size={16}/></Link></div><Link to="/discover/after-hours" className={styles.featurePicture} aria-label="Explore After Hours — The City Remembers"><span className={styles.architecture} aria-hidden="true"/><ItemImage work={curatedWorks.find(work=>work.id==='aic:art:28560')!} context="preview" compactCredits/><span className={styles.featureIndex}>A NIGHT WALK IN THREE WORKS ↗</span></Link></section>
 <section ref={selection} tabIndex={-1} className={styles.selection} aria-labelledby="curator-title"><p className="eyebrow">ON THE TABLE</p><h2 id="curator-title">{selected?.title ?? 'The Curator’s Selection'}</h2><p>{selected?.description ?? 'A book, a journey and a quiet record. Begin with the distance between them.'}</p><p role="status" className="srOnly">{selected ? `Now showing ${selected.title}. ${items.length} works.` : ''}</p><CatalogResults key={selected?.id ?? 'curator'} items={items}/></section>
 <nav aria-label="Editorial collections" className={styles.collectionLinks}>{editorialCollections.map(item=><Link key={item.id} to={`/discover?collection=${item.id}`} aria-current={selected?.id===item.id?'page':undefined}><span className="eyebrow">ANOTHER CONNECTION</span><strong>{item.title}</strong><span>{item.description}</span><ArrowUpRight size={18}/></Link>)}</nav>
 <section id="follow-a-thread" ref={thread} tabIndex={-1} className={styles.thread} aria-labelledby="thread-title"><p className="eyebrow">FOLLOW A THREAD</p><h2 id="thread-title">Who gets to belong?</h2><p>Three encounters with a world that feels unfamiliar.</p><ol>{quietThread.map((step,index)=>{const work=curatedWorks.find(item=>item.id===step.id)!;return <li key={step.id}><span className={styles.stepNumber}>0{index+1}</span><Link to={workPath(work)} state={{returnTo:'/discover#follow-a-thread'}} className={styles.threadWork}><ItemImage work={work} context="thumbnail" decorative/><span><strong>{work.title}</strong><small>{work.creator} · {work.year}</small></span><ArrowUpRight size={16}/></Link><p>{step.note}</p><p className={styles.passage}>{step.passage}</p></li>;})}</ol></section>
 <section className={styles.rooms}><p className="eyebrow">SIX WAYS IN</p><h2>Find your room.</h2><RoomGrid/></section></div>;
}
