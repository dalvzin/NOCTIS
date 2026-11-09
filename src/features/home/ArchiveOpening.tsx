import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight } from 'lucide-react';
import { NoctisWordmark } from '../../components/brand/NoctisWordmark';
import type { AwakeningPhase } from './useAwakening';
import styles from './ArchiveOpening.module.css';

type Props = {
  phase: AwakeningPhase;
  replaying: boolean;
  onSkip: () => void;
  onContinue: () => void;
  onFocusChange: (focused: boolean) => void;
};

/** A visual overture, never a loading indicator or a second copy of the homepage. */
export function ArchiveOpening({ phase, replaying, onSkip, onContinue, onFocusChange }: Props) {
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (replaying) skip.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onSkip();
      }
      // Reveal navigation before Tab moves focus to anything behind the scene.
      if (event.key === 'Tab') onContinue();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [replaying, onSkip, onContinue]);

  return createPortal(
    <div
      className={styles.opening}
      data-phase={phase}
    >
      <div
        className={styles.stage}
        aria-hidden="true"
        onWheel={onContinue}
        onTouchMove={onContinue}
      >
        <div className={styles.atmosphere} />
        <div className={`${styles.door} ${styles.leftDoor}`} />
        <div className={`${styles.door} ${styles.rightDoor}`} />
        <div className={styles.portal}>
          <div className={styles.innerPortal} />
          <span className={styles.seal}>N</span>
        </div>
        <div className={styles.title}>
          <p className={styles.kicker}>THE MIDNIGHT MUSEUM</p>
          <div className={styles.brand}>
            <NoctisWordmark />
          </div>
          <p className={styles.invitation}>Some things deserve to stay.</p>
          <span className={styles.rule} />
          <p className={styles.caption}>SIX ROOMS. AN OPEN INVITATION.</p>
        </div>
        <div className={styles.folio}>
          <span>NO. 001 / THE LIVING ARCHIVE</span>
          <span>BOOKS · FILMS · GAMES · MUSIC · PHOTOGRAPHY · ART</span>
        </div>
      </div>
      {phase !== 'assembling' && (
        <button
          ref={skip}
          className={styles.skip}
          onClick={onSkip}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
        >
          Skip intro{' '}
          <ArrowUpRight
            size={14}
            aria-hidden="true"
          />
        </button>
      )}
    </div>,
    document.body,
  );
}
