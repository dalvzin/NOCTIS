import { Link } from 'react-router-dom';
import type { Work } from '../../types/catalog';
import { workPath } from '../../data/works';
import { Modal } from '../../components/ui/Modal';
import { ItemImage } from './ItemImage';
import { PersonalActions } from '../personal/PersonalActions';
import { creatorCredit, previewDescription } from '../../services/recordPresentation';
import styles from './QuickPreview.module.css';
import { safeExternalUrl } from '../../services/catalogUtils';
import { artworkRatio } from '../../services/artwork';

export function QuickPreview({
  work,
  returnTo,
  onClose,
}: {
  work: Work;
  returnTo: string;
  onClose: () => void;
}) {
  const credit = creatorCredit(work);
  const ratio = artworkRatio(work);
  const wide = ratio > 1.15 && !['books', 'films', 'music'].includes(work.category);
  return (
    <Modal
      title={`Quick Preview: ${work.title}`}
      headingLabel="Quick Preview"
      onClose={onClose}
      wide={wide}
    >
      <div
        className={styles.preview}
        data-composition={wide ? 'landscape' : work.category === 'music' ? 'square' : 'portrait'}
      >
        <div className={styles.identity}>
          <ItemImage
            work={work}
            context="preview"
            compactCredits
          />
          <div className={styles.heading}>
            <p className={styles.metadata}>
              {work.format}
              {work.year !== null && <> / {work.year}</>}
            </p>
            <h2>{work.title}</h2>
            {credit && (
              <p className={styles.creator}>
                <span>{credit.label}</span>
                {credit.name}
              </p>
            )}
          </div>
        </div>
        {work.source.kind === 'demo' && (
          <p className={styles.legacy}>Fictional demonstration · retained archive record.</p>
        )}
        {work.description.trim() ? (
          <p className={styles.description}>{previewDescription(work.description)}</p>
        ) : (
          <p className={styles.description}>A description is not available for this record.</p>
        )}
        <PersonalActions
          work={work}
          preview
        />
        <Link
          className={`button ${styles.open}`}
          to={workPath(work)}
          state={{ returnTo }}
          onClick={onClose}
        >
          Open full record <span aria-hidden="true">↗</span>
        </Link>
        <p className={styles.hint}>Notes, details, destinations and your private rating.</p>
        {work.image && (
          <details className={styles.credits}>
            <summary>Image credit</summary>
            <p>
              {work.image.credit} · {work.image.rights}
            </p>
            {safeExternalUrl(work.image.sourceUrl) && (
              <a
                href={safeExternalUrl(work.image.sourceUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Image source (opens in new tab) ↗
              </a>
            )}
          </details>
        )}
      </div>
    </Modal>
  );
}
