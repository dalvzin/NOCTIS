import { useCallback, useEffect, useRef, useState } from 'react';

export const INTRO_SESSION_KEY = 'noctis.home.awakened.v2';
export type AwakeningPhase = 'darkness' | 'wordmark' | 'opening' | 'assembling' | 'ready';

// A reload has a new time origin. Internal route changes keep the same document.
function seenInThisDocument() {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === String(performance.timeOrigin);
  } catch {
    return false;
  }
}
function rememberDocument() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, String(performance.timeOrigin));
  } catch {
    // Storage is optional; the intro and its skip button still work.
  }
}
function deviceReduced() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function useAwakening(reduced: boolean | null) {
  const [initiallyReady] = useState(() => !!reduced || deviceReduced() || seenInThisDocument());
  const [phase, setPhase] = useState<AwakeningPhase>(initiallyReady ? 'ready' : 'darkness');
  const [instant, setInstant] = useState(initiallyReady);
  const [revision, setRevision] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completed = useRef(initiallyReady);
  const cancelTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const finish = useCallback(() => {
    completed.current = true;
    cancelTimers();
    rememberDocument();
    setInstant(true);
    setPhase('ready');
  }, [cancelTimers]);
  const replay = useCallback(() => {
    if (reduced || deviceReduced()) return;
    cancelTimers();
    completed.current = false;
    setInstant(false);
    setPhase('darkness');
    setRevision((value) => value + 1);
  }, [reduced, cancelTimers]);
  useEffect(() => {
    rememberDocument();
    if (reduced || (initiallyReady && revision === 0) || completed.current) {
      finish();
      return;
    }
    timers.current = [
      setTimeout(() => setPhase('wordmark'), 200),
      setTimeout(() => setPhase('opening'), 1250),
      setTimeout(() => setPhase('assembling'), 2300),
      setTimeout(() => {
        completed.current = true;
        setPhase('ready');
      }, 4400),
    ];
    const visibility = () => {
      if (document.hidden) finish();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelTimers();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [reduced, initiallyReady, revision, finish, cancelTimers]);
  return { phase, instant, finish, replay, revision };
}
