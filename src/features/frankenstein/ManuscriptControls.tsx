import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { MANUSCRIPT_PAGE_COUNT } from './useManuscriptBook';
import styles from './FrankensteinManuscript.module.css';

const names = ['Introduction', 'The story'];
export function ManuscriptContents({
  page,
  busy,
  go,
}: {
  page: number;
  busy: boolean;
  go: (page: number) => void;
}) {
  return (
    <nav
      className={styles.contents}
      aria-label="Manuscript contents"
    >
      <span className={styles.contentsLabel}>
        <BookOpen
          size={15}
          aria-hidden="true"
        />{' '}
        In this book
      </span>
      {names.map((name, index) => (
        <button
          key={name}
          aria-label={`Open ${index === 0 ? 'introduction' : 'story'} spread`}
          aria-current={Math.floor(page / 2) === index ? 'page' : undefined}
          aria-disabled={busy}
          onClick={() => go(index * 2)}
        >
          <span aria-hidden="true">0{index + 1}</span>
          {name}
        </button>
      ))}
    </nav>
  );
}
export function ManuscriptControls({
  page,
  step,
  busy,
  go,
}: {
  page: number;
  step: 1 | 2;
  busy: boolean;
  go: (page: number) => void;
}) {
  const atEnd = page >= MANUSCRIPT_PAGE_COUNT - step;
  const nextLabel = atEnd
    ? 'End of book'
    : step === 2 || page === 1
      ? 'Read the story'
      : page === 0
        ? 'About this book'
        : 'Curator’s notes';
  return (
    <footer className={styles.controls}>
      <div className={styles.paging}>
        <button
          aria-label="Previous page"
          aria-disabled={busy || page === 0}
          onClick={() => {
            if (page > 0) go(page - step);
          }}
        >
          <ArrowLeft size={17} />
          <span>Previous page</span>
        </button>
        <p
          role="status"
          aria-live="polite"
        >
          {busy
            ? 'Turning pages…'
            : step === 1
              ? `Page ${page + 1} of ${MANUSCRIPT_PAGE_COUNT}`
              : `Pages ${page + 1}–${page + 2} of ${MANUSCRIPT_PAGE_COUNT}`}
          <span>{names[Math.floor(page / 2)]}</span>
        </p>
        <button
          className={styles.nextPage}
          aria-label="Next page"
          aria-disabled={busy || atEnd}
          onClick={() => {
            if (!atEnd) go(page + step);
          }}
        >
          <span>{nextLabel}</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </footer>
  );
}
