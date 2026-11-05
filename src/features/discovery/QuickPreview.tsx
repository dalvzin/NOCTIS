import { Link } from 'react-router-dom';
import type { Work } from '../../types/catalog';
import { workPath } from '../../data/works';
import { Modal } from '../../components/ui/Modal';
import { WorkContent } from '../experiences/WorkContent';
import { ItemImage } from './ItemImage';
import styles from '../experiences/Experiences.module.css';
import { useDestinationRecord } from '../../hooks/useDestinationRecord';

export function QuickPreview({ work, returnTo, onClose }: { work: Work; returnTo: string; onClose: () => void }) {
  const record = useDestinationRecord(work);
  return <Modal title={`Quick Preview: ${work.title}`} onClose={onClose}><div className={styles.preview}><ItemImage work={record.item} compactCredits/><div><p className="eyebrow">{work.format} / {work.source.kind === 'demo' ? 'LOCAL DEMO' : work.source.kind === 'live' ? 'PROVIDER RECORD' : 'CURATED RECORD'}</p><h2>{work.title}</h2></div></div>{record.loading && <p role="status">Checking available source destinations…</p>}{record.error && <p role="status">Additional destinations could not be checked. Known source links remain available.</p>}<WorkContent work={record.item} compact/><Link className="button" to={workPath(work)} state={{ returnTo }} onClick={onClose}>Open full record <span aria-hidden="true">↗</span></Link></Modal>;
}
