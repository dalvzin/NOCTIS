import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Work } from '../../types/catalog';
import { WorkCard } from '../experiences/WorkCard';
import { QuickPreview } from './QuickPreview';
import styles from '../experiences/Experiences.module.css';

export function CatalogResults({ items, limit = 12 }: { items: Work[]; limit?: number }) {
  const location = useLocation();
  const [selected, setSelected] = useState<Work | null>(null);
  const [shown, setShown] = useState(limit);
  const returnTo = location.pathname + location.search;
  return (
    <>
      <div className={styles.workGrid}>
        {items.slice(0, shown).map((work) => (
          <WorkCard
            key={work.id}
            work={work}
            onPreview={setSelected}
            returnTo={returnTo}
          />
        ))}
      </div>
      {shown < items.length && (
        <button
          className="button"
          onClick={() => setShown((value) => value + 12)}
        >
          Show more ({items.length - shown} remaining)
        </button>
      )}
      {selected && (
        <QuickPreview
          work={selected}
          returnTo={returnTo}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
