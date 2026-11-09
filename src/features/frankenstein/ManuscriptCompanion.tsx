import type { Work } from '../../types/catalog';
import { Bookmark, ExternalLink } from 'lucide-react';
import { PersonalActions } from '../personal/PersonalActions';
import { ExternalDestinations } from '../discovery/ExternalDestinations';
import { getDestinations } from '../../services/destinations';
import { safeExternalUrl } from '../../services/catalogUtils';
import { sameDestination } from '../../services/recordPresentation';
import styles from './FrankensteinManuscript.module.css';
import { bookPresentation } from './bookPresentation';

export function ManuscriptCompanion({ work }: { work: Work }) {
  const sourceUrl = work.source.kind === 'demo' ? undefined : safeExternalUrl(work.source.url);
  const imageUrl = safeExternalUrl(work.image?.sourceUrl);
  const hasSourceLink = getDestinations(work)
    .slice(0, 2)
    .some((destination) => sameDestination(destination.url, sourceUrl));
  return (
    <section
      id={bookPresentation(work).archiveId}
      className={styles.companion}
      aria-labelledby="companion-title"
      tabIndex={-1}
    >
      <header className={styles.companionHeading}>
        <p className="eyebrow">KEEP WHAT STAYS WITH YOU</p>
        <h2 id="companion-title">Your archive & sources</h2>
        <p>Save this book, make it part of an album, or explore its original record.</p>
      </header>
      <div className={styles.companionGrid}>
        <section
          className={styles.archivePanel}
          aria-labelledby="personal-book-title"
        >
          <p className={styles.panelLabel}>
            <Bookmark
              size={16}
              aria-hidden="true"
            />{' '}
            YOUR COLLECTION
          </p>
          <h3 id="personal-book-title">Keep this book</h3>
          <PersonalActions work={work} />
        </section>
        <section
          className={styles.sourcePanel}
          aria-labelledby="book-sources-title"
        >
          <p className={styles.panelLabel}>
            <ExternalLink
              size={16}
              aria-hidden="true"
            />{' '}
            ORIGINAL RECORD
          </p>
          <h3 id="book-sources-title">Explore the source</h3>
          <ExternalDestinations work={work} />
          <details className={styles.sourceCredits}>
            <summary>Sources & image credits</summary>
            {work.source.kind !== 'demo' && <p>{work.source.attribution}</p>}
            {sourceUrl && !hasSourceLink && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View original source (opens in new tab) ↗
              </a>
            )}
            {hasSourceLink && <p>The source record is linked above.</p>}
            {work.image && (
              <p>
                {work.image.credit} · {work.image.rights}
              </p>
            )}
            {imageUrl && !sameDestination(imageUrl, sourceUrl) && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Image source (opens in new tab) ↗
              </a>
            )}
          </details>
        </section>
      </div>
    </section>
  );
}
