import type { Work } from '../../data/works';
import { safeExternalUrl } from '../../services/catalogUtils';
import { getDestinations } from '../../services/destinations';
import { sameDestination } from '../../services/recordPresentation';
import { recordNote } from '../../data/recordNotes';
import { ExternalDestinations } from '../discovery/ExternalDestinations';
import { PersonalActions } from '../personal/PersonalActions';
import styles from './FullRecord.module.css';

/** Full-record content only: the quick preview has its own short presentation. */
export function WorkContent({ work }: { work: Work }) {
  const note = recordNote(work);
  const destinations = getDestinations(work).slice(0, 2);
  const sourceUrl = work.source.kind === 'demo' ? undefined : safeExternalUrl(work.source.url);
  const imageUrl = safeExternalUrl(work.image?.sourceUrl);
  const linked = (url: string | undefined) => !!url && destinations.some(destination => sameDestination(destination.url, url));
  const facts = work.facts.filter(([label, value]) => value.trim() && !/^(author|artist|photographer|director|developer|creator|year|format|type)$/i.test(label));
  return <>
    <div className={styles.body}>
      <div className={styles.reading}>
        {note && <section className={styles.note} aria-labelledby="editorial-note-title"><p className="eyebrow">NOCTIS / EDITORIAL</p><h2 id="editorial-note-title">A closer look</h2><p>{note}</p><small>An original reading by NOCTIS{work.source.kind === 'demo' ? ' of this fictional demonstration' : ''}.</small></section>}
        {!!(facts.length || work.tags.length || work.mood) && <section className={styles.information} aria-labelledby="record-information-title"><h2 id="record-information-title">Inside the record</h2>
          {!!facts.length && <dl>{facts.map(([label, value], index) => <div key={`${label}-${index}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          {work.mood && <p><span>Atmosphere</span> {work.mood}</p>}
          {!!work.tags.length && <div className={styles.tags} aria-label="Subjects">{work.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        </section>}
      </div>
      <aside className={styles.personal} aria-labelledby="your-archive-title"><p className="eyebrow">YOUR RELATIONSHIP WITH THE WORK</p><h2 id="your-archive-title">Your archive</h2><p>Keep it close, plan to experience it, or add a private rating.</p><PersonalActions work={work}/></aside>
    </div>
    <section className={styles.sources} aria-label="Destinations and provenance">
      <div className={styles.destinations}><h2>Beyond this record</h2><ExternalDestinations work={work}/></div>
      <details className={styles.provenance} open={work.source.kind === 'demo' || undefined}><summary>Sources & image credits</summary>
        {work.source.kind === 'demo' ? <p>Demonstration record. This work, its creator and its metadata are fictional. Visuals are original NOCTIS studies.</p> : <>
          <p>{work.source.kind === 'curated' ? 'Curated real work. ' : 'External provider record. '}{work.source.attribution}</p>
          {sourceUrl && (linked(sourceUrl) ? <p>The source record is linked under Beyond this record.</p> : <a href={sourceUrl} target="_blank" rel="noopener noreferrer">View source: {work.source.label} (opens in new tab) ↗</a>)}
          {work.source.provider === 'aic' && <p><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Description metadata license: CC BY 4.0 (opens in new tab)</a></p>}
        </>}
        {work.image ? <><p>{work.image.credit} · {work.image.rights}</p>{imageUrl && !linked(imageUrl) && !sameDestination(imageUrl, sourceUrl) && <a href={imageUrl} target="_blank" rel="noopener noreferrer">View image source (opens in new tab) ↗</a>}</> : <p>Original NOCTIS placeholder; not the work’s official cover or photograph.</p>}
      </details>
    </section>
  </>;
}
