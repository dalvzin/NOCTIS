import type { Work } from '../../types/catalog';
import { destinationLabel, destinationNote, getDestinations } from '../../services/destinations';
import styles from '../experiences/Experiences.module.css';

export function ExternalDestinations({ work }: { work: Work }) {
  const destinations = getDestinations(work).slice(0, 2);
  return (
    <div className={styles.disclosure}>
      <p className="eyebrow">KEEP EXPLORING</p>
      {destinations.length ? (
        destinations.map((destination) => (
          <div key={destination.url}>
            <a
              className="textLink"
              href={destination.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {destinationLabel(destination)} <span aria-hidden="true">↗</span>
              <span className="srOnly"> (opens in new tab)</span>
            </a>
            <details>
              <summary>About this destination</summary>
              <p>{destinationNote(destination)}</p>
            </details>
          </div>
        ))
      ) : (
        <p>
          {work.source.kind === 'demo'
            ? 'No verified external destination is available for this fictional demonstration.'
            : 'No verified external destination is available for this record.'}
        </p>
      )}
    </div>
  );
}
