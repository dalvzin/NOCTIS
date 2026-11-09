import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
export function Modal({
  title,
  headingLabel,
  onClose,
  children,
  side = false,
  search = false,
  wide = false,
}: {
  title: string;
  headingLabel?: string;
  onClose: () => void;
  children: ReactNode;
  side?: boolean;
  search?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  function keepFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const dialog = event.currentTarget;
    const controls = [
      ...dialog.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => {
      if (!element.getClientRects().length || element.closest('[hidden],[inert]')) return false;
      // Closed disclosures expose their summary, never their nested controls.
      for (
        let parent = element.parentElement;
        parent && parent !== dialog;
        parent = parent.parentElement
      ) {
        if (
          parent instanceof HTMLDetailsElement &&
          !parent.open &&
          !(element.tagName === 'SUMMARY' && element.parentElement === parent)
        )
          return false;
      }
      return true;
    });
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    if (search) dialog.querySelector<HTMLInputElement>('input[type=search]')?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [search]);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`${styles.dialog} ${side ? styles.side : ''} ${search ? styles.search : ''} ${wide ? styles.wide : ''}`}
      onKeyDown={keepFocus}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.content}>
        <div className={styles.heading}>
          <span className="eyebrow">{headingLabel ?? title}</span>
          <button
            aria-label={`Close ${title.toLowerCase()}`}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
