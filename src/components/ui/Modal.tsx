import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
export function Modal({ title, onClose, children, side = false, search = false }: { title: string; onClose: () => void; children: ReactNode; side?: boolean; search?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    if (search) dialog.querySelector<HTMLInputElement>('input[type=search]')?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [search]);
  return <dialog ref={ref} aria-label={title} className={`${styles.dialog} ${side ? styles.side : ''} ${search ? styles.search : ''}`} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className={styles.content}><div className={styles.heading}><span className="eyebrow">{title}</span><button aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}><X size={20}/></button></div>{children}</div></dialog>;
}
