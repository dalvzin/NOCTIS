import { historicalArtwork } from '../../data/historicalArtwork';
import styles from './AfterHours.module.css';

/** Real archival photograph; its visible source link is below the exhibition. */
export function NightCity() {
  const image = historicalArtwork['after-hours-city'];
  return (
    <div
      className={styles.cityBackdrop}
      aria-hidden="true"
    >
      <img
        src={image.url}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
