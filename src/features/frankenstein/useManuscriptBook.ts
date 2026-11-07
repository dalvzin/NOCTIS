import { useEffect, useReducer, useState } from 'react';

export type BookPhase = 'closed' | 'opening' | 'reading' | 'turning';
export interface BookState { phase: BookPhase; page: number; target: number; direction: 1 | -1; revision: number }
export type BookAction =
  | { type: 'open' }
  | { type: 'settle'; revision?: number }
  | { type: 'go'; page: number; step: 1 | 2; reduced: boolean }
  | { type: 'adapt'; step: 1 | 2 };

export const MANUSCRIPT_PAGE_COUNT = 4;
const align = (page: number, step: 1 | 2) => Math.floor(Math.max(0, Math.min(MANUSCRIPT_PAGE_COUNT - 1, page)) / step) * step;
export const initialBookState = (reduced: boolean): BookState => ({ phase: reduced ? 'reading' : 'closed', page: 0, target: 0, direction: 1, revision: 0 });

/** Shared book detail state machine. Busy turns reject new input. */
export function bookReducer(state: BookState, action: BookAction): BookState {
  if (action.type === 'open') return state.phase === 'closed' ? { ...state, phase: 'opening', revision: state.revision + 1 } : state;
  if (action.type === 'settle') {
    if (action.revision !== undefined && action.revision !== state.revision) return state;
    return { ...state, phase: 'reading', page: state.target };
  }
  if (action.type === 'adapt') {
    const page = align(state.phase === 'turning' ? state.target : state.page, action.step);
    return { ...state, page, target: page, phase: state.phase === 'turning' || state.phase === 'opening' ? 'reading' : state.phase, revision: state.revision + 1 };
  }
  if (state.phase !== 'reading') return state;
  const target = align(action.page, action.step);
  if (target === state.page) return state;
  return { phase: action.reduced ? 'reading' : 'turning', page: action.reduced ? target : state.page, target, direction: target > state.page ? 1 : -1, revision: state.revision + 1 };
}

export function useManuscriptBook(reduced: boolean) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const [state, dispatch] = useReducer(bookReducer, reduced, initialBookState);
  const step: 1 | 2 = mobile ? 1 : 2;
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => { dispatch({ type: 'adapt', step }); }, [step]);
  useEffect(() => { if (reduced) dispatch({ type: 'settle' }); }, [reduced]);
  useEffect(() => {
    if (state.phase === 'reading') return;
    const revision = state.revision;
    const delay = state.phase === 'closed' ? 350 : state.phase === 'opening' ? 1480 : mobile ? 260 : 740;
    // Completion timers also recover from a missed animation event or background tab.
    const timer = window.setTimeout(() => dispatch(state.phase === 'closed' ? { type: 'open' } : { type: 'settle', revision }), delay);
    const settleHidden = () => { if (document.hidden) dispatch({ type: 'settle' }); };
    document.addEventListener('visibilitychange', settleHidden);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', settleHidden); };
  }, [state.phase, state.revision, mobile]);
  const go = (page: number) => dispatch({ type: 'go', page, step, reduced });
  return { state, mobile, step, go, skip: () => dispatch({ type: 'settle' }) };
}
