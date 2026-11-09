import styles from './Artwork.module.css';
export function Artwork({ motif, large = false }: { motif: string; large?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.art} ${styles[motif]} ${large ? styles.large : ''}`}
    >
      <div className={styles.object} />
      <span className={styles.caption}>N / CULTURAL STUDIES</span>
    </div>
  );
}
