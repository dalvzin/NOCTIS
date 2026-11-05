import type { Work } from '../../data/works';
import { safeExternalUrl } from '../../services/catalogUtils';
import styles from './Experiences.module.css';
import { ExternalDestinations } from '../discovery/ExternalDestinations';
import { PersonalActions } from '../personal/PersonalActions';

export function WorkContent({ work, compact = false }: { work: Work; compact?: boolean }) {
  return <>
    <p className={styles.byline}>{work.creator} <span aria-hidden="true">/</span> {work.year ?? 'Date unavailable'} <span aria-hidden="true">/</span> {work.format}</p>
    <p className={styles.synopsis}>{compact && work.description.length > 330 ? `${work.description.slice(0, 330).trimEnd()}…` : work.description}</p>
    {!!(work.facts.length || work.mood) && <dl className={styles.facts}>{[...work.facts, ...(work.mood ? [['Atmosphere', work.mood]] : [])].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    {!compact && work.note && <section className={styles.curatorNote}><h2>A note from the curator</h2><p>{work.note}</p></section>}
    <PersonalActions work={work}/>
    <ExternalDestinations work={work}/>
    {work.source.kind === 'demo' ? <p className={styles.disclosure}>Demonstration record. This work, its creator and its metadata are fictional. Visuals are original NOCTIS studies.</p> : <div className={styles.disclosure}><p>{work.source.kind === 'curated' ? 'Curated real work. ' : 'External provider record. '}{work.source.attribution}</p>{safeExternalUrl(work.source.url) && <a href={safeExternalUrl(work.source.url)} target="_blank" rel="noopener noreferrer">View source: {work.source.label} (opens in new tab) ↗</a>}{work.source.provider === 'aic' && <p><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Description metadata license: CC BY 4.0</a></p>}{work.image ? <p>{work.image.credit} · {work.image.rights}</p> : <p>Original NOCTIS placeholder; not the work’s official cover or photograph.</p>}</div>}
  </>;
}
