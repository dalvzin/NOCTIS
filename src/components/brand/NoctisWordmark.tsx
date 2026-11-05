import styles from './NoctisWordmark.module.css';
/** Reuses the original navigation glyph and its inherited typography. */
export function NoctisWordmark({ split = false }: { split?: boolean }) {
 return <span className={styles.wordmark} role="img" aria-label="NOCTIS" data-split={split || undefined}><span data-wordmark-part aria-hidden="true">N<span className={styles.dot}>◦</span>C</span><span data-wordmark-part aria-hidden="true">TIS</span></span>;
}
