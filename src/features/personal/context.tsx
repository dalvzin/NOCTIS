import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { Work } from '../../types/catalog';
import type { ArchiveRepository } from './types';
import { LocalArchiveRepository } from './repository';

const defaultRepository = new LocalArchiveRepository();
const Context = createContext<ArchiveRepository>(defaultRepository);
export function PersonalProvider({
  repository = defaultRepository,
  children,
}: {
  repository?: ArchiveRepository;
  children: ReactNode;
}) {
  return <Context.Provider value={repository}>{children}</Context.Provider>;
}
export function usePersonalArchive() {
  const repository = useContext(Context);
  return { ...useSyncExternalStore(repository.subscribe, repository.getSnapshot), repository };
}
export function PersonalMotion({ children }: { children: ReactNode }) {
  const { data } = usePersonalArchive();
  useEffect(() => {
    document.documentElement.dataset.motion = data.preferences.motion;
  }, [data.preferences.motion]);
  return (
    <MotionConfig reducedMotion={data.preferences.motion === 'reduce' ? 'always' : 'user'}>
      {children}
    </MotionConfig>
  );
}
export function useMotionPreference() {
  const os = useReducedMotion();
  const { data } = usePersonalArchive();
  return os || data.preferences.motion === 'reduce';
}
export function StorageNotice() {
  const { error } = usePersonalArchive();
  return error ? (
    <aside
      role="alert"
      className="storageNotice"
    >
      {error} <Link to="/settings">Open Settings</Link>
    </aside>
  ) : null;
}
export function useRecordVisit(work: Work | null | undefined) {
  const { data, repository } = usePersonalArchive();
  const last = useRef('');
  const enabled = data.preferences.historyEnabled;
  useEffect(() => {
    if (!enabled || !work) {
      last.current = '';
      return;
    }
    if (last.current === work.id) return;
    last.current = work.id;
    void repository.dispatch({ type: 'visit', work });
  }, [work, enabled, repository]);
}
