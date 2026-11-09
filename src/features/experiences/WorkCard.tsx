import { Link } from 'react-router-dom';
import { ArrowUpRight, ScanEye } from 'lucide-react';
import { workPath, type Work } from '../../data/works';
import { ItemImage } from '../discovery/ItemImage';
import styles from './Experiences.module.css';
import { PersonalActions } from '../personal/PersonalActions';
import { rooms } from '../../data/rooms';
import { withKnownArtwork } from '../../services/catalog';

export function WorkCard({
  work: record,
  onPreview,
  returnTo,
}: {
  work: Work;
  onPreview: (work: Work) => void;
  returnTo: string;
}) {
  const work = withKnownArtwork(record);
  return (
    <article className={`${styles.card} ${styles[work.category] ?? ''}`}>
      <button
        className={styles.visualButton}
        onClick={() => onPreview(work)}
        aria-label={`Quick preview: ${work.title}`}
        aria-haspopup="dialog"
      >
        <ItemImage
          work={work}
          context="card"
        />
        <span className={styles.previewHint}>
          <ScanEye size={15} />
          <span>Quick Preview</span>
        </span>
      </button>
      <div className={styles.cardMeta}>
        <span>
          {work.format} / {work.year ?? 'Date unavailable'}
        </span>
        <span>{rooms.find((room) => room.slug === work.category)?.category ?? work.category}</span>
      </div>
      <h3>
        <Link
          to={workPath(work)}
          state={{ returnTo }}
        >
          {work.title}
          <ArrowUpRight size={15} />
        </Link>
      </h3>
      <p>
        {work.creator}{' '}
        <span>
          ·{' '}
          {work.source.kind === 'demo'
            ? 'Legacy demonstration'
            : work.source.kind === 'live'
              ? work.source.label
              : 'From the collection'}
        </span>
      </p>
      <PersonalActions
        work={work}
        compact
      />
    </article>
  );
}
