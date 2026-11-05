import type { ProviderStatus } from '../../types/catalog';
import styles from './Discovery.module.css';

export function ProviderNotice({ statuses, loading, retry }: { statuses: ProviderStatus[]; loading: boolean; retry: () => void }) {
  return <div className={styles.providers}>{loading && <p aria-live="polite">Checking external catalogs… Local records are ready to explore.</p>}{statuses.length > 0 && <details><summary>Catalog sources and availability</summary><ul>{statuses.map(status => <li key={status.category}><strong>{status.label}</strong> — {status.message}</li>)}</ul></details>}{statuses.some(status => status.state === 'error') && <button className="textLink" onClick={retry}>Retry external catalogs</button>}</div>;
}

