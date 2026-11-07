import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Work } from '../../types/catalog';
import { ItemImage } from '../discovery/ItemImage';
import { useMotionPreference } from '../personal/context';
import { ManuscriptLeaf, leafTitles } from './ManuscriptLeaf';
import { ManuscriptContents, ManuscriptControls } from './ManuscriptControls';
import { useManuscriptBook, MANUSCRIPT_PAGE_COUNT } from './useManuscriptBook';
import { ManuscriptCompanion } from './ManuscriptCompanion';
import styles from './FrankensteinManuscript.module.css';
import { bookPresentation } from './bookPresentation';
import { creatorCredit } from '../../services/recordPresentation';

export function BookManuscriptPage({ work, returnTo, sourceStatus }: { work: Work; returnTo: string; sourceStatus?: 'updating' | 'unavailable' }) {
  const presentation = bookPresentation(work);
  const author = creatorCredit(work);
  const preferredReduced = useMotionPreference();
  const reduced = !!preferredReduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { state, mobile, step, go, skip } = useManuscriptBook(reduced);
  const reading = useRef<HTMLDivElement>(null);
  const requestedFocus = useRef(false);
  // A restored scroll position must not start the opening behind the fixed HUD.
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  const busy = state.phase === 'turning';
  const entering = state.phase === 'closed' || state.phase === 'opening';
  const visible = state.page;
  const goTo = (page: number) => { if (state.phase === 'reading' && page !== state.page) { requestedFocus.current = true; go(page); } };
  const skipOpening = () => { requestedFocus.current = true; skip(); };
  useEffect(() => {
    if (state.phase === 'reading' && requestedFocus.current) {
      requestedFocus.current = false;
      reading.current?.focus({ preventScroll: true });
      const bookElement = reading.current?.closest<HTMLElement>('[data-manuscript]');
      const headerHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 88;
      if (bookElement && bookElement.getBoundingClientRect().top < headerHeight) bookElement.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [state.phase, state.page]);
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return;
    if (!(event.target as HTMLElement).closest('[data-manuscript]') || (event.target as HTMLElement).closest('input,select,textarea,summary,a,[contenteditable=true]')) return;
    if (state.phase !== 'reading') return;
    const next = state.page + (event.key === 'ArrowRight' ? step : -step);
    if (next < 0 || next >= MANUSCRIPT_PAGE_COUNT) return;
    event.preventDefault(); goTo(next);
  }
  const backLabel = returnTo.startsWith('/search') ? 'Back to search results' : returnTo.startsWith('/albums/') ? 'Back to the album' : returnTo.startsWith('/my-archive') ? 'Back to My Archive' : 'Back to the collection';
  // During a physical turn, the underlying leaves are the stationary old page
  // and the arriving page. Decorative sheet faces contain no live controls.
  const left = busy && state.direction < 0 ? state.target : state.page;
  const right = busy && state.direction > 0 ? state.target + 1 : state.page + 1;
  return <article className={styles.scene} data-book-tone={presentation.tone} data-book-phase={state.phase} data-reduced={reduced} data-mobile={mobile} onKeyDown={keyboard}>
    <h1 className="srOnly">{work.title}</h1>
    {sourceStatus && <p role="status" className={styles.sourceStatus}>{sourceStatus === 'updating' ? 'Updating source details…' : 'Additional source details are unavailable. Showing the metadata already retrieved.'}</p>}
    <div className={styles.skipBar}><p>THE READING ROOM / AN OPEN BOOK</p>{entering ? <button onClick={skipOpening}>Skip animation <span aria-hidden="true">↗</span></button> : <a href={`#${presentation.archiveId}`}>Your archive & sources <span aria-hidden="true">↓</span></a>}</div>
    <div className={styles.stage}>
      <section className={styles.book} data-manuscript aria-label={`${work.title} manuscript`}>
        <div className={styles.backCover} aria-hidden="true"/>
        <div className={styles.paper} aria-hidden={entering || undefined} inert={entering ? true : undefined}>
          <header className={styles.bookHeader}><nav aria-label="Record breadcrumb"><Link to="/books">The Reading Room</Link>{returnTo !== '/books' && <Link to={returnTo}>{backLabel}</Link>}</nav><p>{work.title} {author && <span> / {author.name}</span>}</p><ManuscriptContents page={visible} busy={busy} go={goTo}/></header>
          <div ref={reading} className={styles.reader} tabIndex={-1} role="region" aria-label={mobile ? `Reading page ${visible + 1}: ${leafTitles[visible]}` : `Spread ${Math.floor(visible / 2) + 1}: ${['The introduction', 'The story'][Math.floor(visible / 2)]}`} aria-busy={busy} inert={busy ? true : undefined}>
            <div className={styles.leaves}>{mobile ? <ManuscriptLeaf key={busy ? state.target : visible} index={busy ? state.target : visible} work={work}/> : <><ManuscriptLeaf index={left} work={work}/><ManuscriptLeaf index={right} work={work}/></>}</div>
            {busy && !mobile && <div key={state.revision} className={`${styles.sheet} ${state.direction > 0 ? styles.forward : styles.backward}`} aria-hidden="true" inert><div className={styles.sheetFront}><ManuscriptLeaf index={state.direction > 0 ? state.page + 1 : state.page} work={work}/></div><div className={styles.sheetBack}><ManuscriptLeaf index={state.direction > 0 ? state.target : state.target + 1} work={work}/></div></div>}
          </div>
          <ManuscriptControls page={visible} step={step} busy={busy} go={goTo}/>
          <div className={styles.bookFooter}><Link to={returnTo}>{backLabel} <span aria-hidden="true">↗</span></Link><span>← → <span className={styles.keyHint}>to turn pages</span></span><span>NOCTIS / THE READING ROOM</span></div>
        </div>
        {entering && <div className={styles.cover} aria-hidden="true"><div className={styles.pageBlock}/><div className={styles.coverHinge}><div className={styles.coverFront}><ItemImage work={work} context="preview" decorative compactCredits/></div><div className={styles.coverInside}><span>THE NOCTIS ARCHIVE</span><strong>{work.title.charAt(0)}</strong><span>{presentation.imprint}</span></div></div></div>}
      </section>
    </div>
    <div hidden={entering}><ManuscriptCompanion work={work}/></div>
  </article>;
}




