import type { Work } from '../../types/catalog';
import { BookOpen, Feather, Library } from 'lucide-react';
import { ItemImage } from '../discovery/ItemImage';
import { recordNote } from '../../data/recordNotes';
import styles from './FrankensteinManuscript.module.css';
import { bookPresentation } from './bookPresentation';
import { creatorCredit } from '../../services/recordPresentation';

export const leafTitles = ['The title page', 'About this book', 'The story', 'A closer look'];

export function ManuscriptLeaf({ index, work }: { index: number; work: Work }) {
  const presentation = bookPresentation(work);
  const author = creatorCredit(work);
  return <section className={`${styles.leaf} ${index % 2 ? styles.recto : styles.verso} ${index === 0 ? styles.titlePage : ''}`} aria-label={`Page ${index + 1}: ${leafTitles[index]}`}>
    <div className={styles.leafRunning}><span>{index < 2 ? 'I / INTRODUCTION' : 'II / THE STORY'}</span><span>NOCTIS · {presentation.recordNumber}</span></div>
    <div className={styles.leafContent}>
      {index === 0 && <>
        {author && <><p className={styles.kicker}>Author</p><p className={styles.author}>{author.name}</p></>}
        <h2 className={styles.bookName}>{work.title}</h2>
        <div className={styles.plate}><ItemImage work={work} context="preview" compactCredits/></div>
        <p className={styles.edition}>{presentation.edition}</p>
        <p className={styles.plateCaption}>The cover of this catalog record.<br/>Not a facsimile of the first edition.</p>
      </>}
      {index === 1 && <>
        <p className={`${styles.chapterBand} ${styles.detailsBand}`}><Library size={16} aria-hidden="true"/> Book details</p>
        <h2>About this book</h2>
        <p className={styles.lead}>{presentation.lead}</p>
        <dl className={styles.catalogFacts}>{author && <div><dt>Author</dt><dd>{author.name}</dd></div>}{work.year !== null && <div><dt>First published</dt><dd>{work.year}</dd></div>}<div><dt>Type</dt><dd>{work.format}</dd></div><div><dt>Edition in this archive</dt><dd>{presentation.edition}</dd></div>{work.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </>}
      {index === 2 && <>
        <p className={`${styles.chapterBand} ${styles.synopsisBand}`}><BookOpen size={16} aria-hidden="true"/> Synopsis</p>
        <h2>The story</h2>
        <div className={styles.prosePanel}><p className={styles.dropCap}>{work.description || 'A description is not available for this record.'}</p></div>
        <div className={styles.rule}/><p className={styles.smallNote}>{work.source.kind === 'curated' ? 'NOCTIS editorial summary. Not an excerpt from a modern edition.' : 'Description from the source record.'}</p>
        <p className={styles.marginNumber}>{presentation.theme}</p>
      </>}
      {index === 3 && <>
        <p className={`${styles.chapterBand} ${styles.editorialBand}`}><Feather size={16} aria-hidden="true"/> Editorial notes</p>
        <h2>A closer look</h2>
        <div className={styles.prosePanel}>{recordNote(work) ? <p className={styles.dropCap}>{recordNote(work)}</p> : <p>Editorial notes are not available for this record.</p>}</div>
        {presentation.reflection && <p className={styles.reflection}>{presentation.reflection}</p>}
        <p className={styles.smallNote}>An original reading by NOCTIS.</p>
        {!!work.tags.length && <ul className={styles.subjects} aria-label="Subjects">{work.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
      </>}
    </div>
    <p className={styles.folio}><span>{index % 2 ? 'THE MODERN ARCHIVE' : work.title}</span><span>{String(index + 1).padStart(2, '0')}</span></p>
  </section>;
}
