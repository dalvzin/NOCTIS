import type { ProviderStatus } from '../../types/catalog';
import styles from './Discovery.module.css';

export function ProviderNotice({
  statuses,
  loading,
  retry,
}: {
  statuses: ProviderStatus[];
  loading: boolean;
  retry: () => void;
}) {
  const failed = statuses.some((status) => status.state === 'error');
  const limited = statuses.some((status) => status.state === 'unavailable');
  const searched = statuses.some((status) => status.state === 'success');
  return (
    <div className={styles.providers}>
      <p aria-live="polite">
        {loading
          ? 'Searching connected sources… Local matches stay available.'
          : failed
            ? 'Some sources could not respond. Available results are shown.'
            : searched && limited
              ? 'Connected sources searched. Some rooms use local selections only.'
              : limited
                ? 'A selected editorial catalog. Some live sources are not connected.'
                : searched
                  ? 'Connected sources searched.'
                  : 'Explore the editorial selection or search connected sources.'}
      </p>
      {statuses.length > 0 && (
        <details>
          <summary>Sources & search availability</summary>
          <ul>
            {statuses.map((status) => (
              <li key={status.category}>
                <strong>{status.label}</strong> — {status.message}
              </li>
            ))}
          </ul>
        </details>
      )}
      {failed && (
        <button
          className="textLink"
          onClick={retry}
          disabled={loading}
        >
          Try online search again
        </button>
      )}
    </div>
  );
}
