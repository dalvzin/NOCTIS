import { useState, type CSSProperties } from 'react';
import type { Work } from '../../types/catalog';
import { artworkRatio, artworkUrls, type ArtworkContext } from '../../services/artwork';
import styles from './Artwork.module.css';

export function ItemImage({
  work,
  hero = false,
  context,
  decorative = false,
  compactCredits = false,
}: {
  work: Work;
  hero?: boolean;
  context?: ArtworkContext;
  decorative?: boolean;
  compactCredits?: boolean;
}) {
  const variant = context ?? (hero ? 'detail' : 'preview');
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState('');
  const candidates = artworkUrls(work.image, variant);
  const url = candidates.find((candidate) => !failed.includes(candidate));
  const ratio = artworkRatio(work);
  const compact = variant === 'card' || variant === 'album' || compactCredits;
  const thumbnail = variant === 'thumbnail';
  const className = `${styles.artwork} ${styles[work.category]} ${styles[variant]}`;
  const unavailable = failed.length > 0 ? 'Source image unavailable' : 'Artwork unavailable';
  return (
    <figure
      className={className}
      data-artwork-category={work.category}
      data-artwork-context={variant}
      data-image-state={url ? (loaded === url ? 'ready' : 'loading') : 'unavailable'}
      style={{ '--art-ratio': ratio } as CSSProperties}
    >
      <div className={styles.stage}>
        <div
          data-artwork-frame
          className={styles.frame}
        >
          {url && loaded !== url && !thumbnail && (
            <span
              className={styles.loading}
              aria-hidden="true"
            >
              Loading artwork…
            </span>
          )}
          {url ? (
            <img
              key={url}
              src={url}
              alt={decorative ? '' : work.image?.alt || `${work.title} — artwork`}
              loading={variant === 'detail' || variant === 'preview' ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(url)}
              onError={() =>
                setFailed((previous) => (previous.includes(url) ? previous : [...previous, url]))
              }
            />
          ) : (
            <div
              className={styles.fallback}
              aria-hidden={decorative || undefined}
            >
              <span aria-hidden="true">N</span>
              {!thumbnail && (
                <>
                  <small>{unavailable}</small>
                  <small>Original NOCTIS placeholder</small>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {!thumbnail && (
        <figcaption
          className={compact ? styles.compactCaption : undefined}
          title={compact && work.image ? `${work.image.credit} · ${work.image.rights}` : undefined}
        >
          {work.image ? (
            <>
              {work.image.credit}
              <span className={compact ? 'srOnly' : undefined}> · {work.image.rights}</span>
              {!url && (
                <span className={styles.imageFallbackNote}>
                  {unavailable} · Original NOCTIS placeholder
                </span>
              )}
            </>
          ) : (
            <>
              {work.source.kind === 'demo' ? 'Fictional demonstration · ' : ''}
              {unavailable} · Original NOCTIS placeholder
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
