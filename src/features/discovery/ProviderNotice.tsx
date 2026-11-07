import type { ProviderStatus } from '../../types/catalog';
import styles from './Discovery.module.css';

export function ProviderNotice({ statuses, loading, retry }: { statuses: ProviderStatus[]; loading: boolean; retry: () => void }) {
  return <div className={styles.providers}>{loading && <p aria-live="polite">Looking a little further…</p>}{statuses.length > 0 && <details><summary>Sources & search availability</summary><ul>{statuses.map(status => <li key={status.category}><strong>{status.label}</strong> — {status.message}</li>)}</ul></details>}{statuses.some(status => status.state === 'error') && <button className="textLink" onClick={retry}>Try online search again</button>}</div>;
}

