import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  recovery: boolean;
  error: string | null;
}
const Context = createContext<AuthState>({
  session: null,
  loading: false,
  recovery: false,
  error: null,
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: !!supabase,
    recovery: false,
    error: null,
  });
  useEffect(() => {
    if (!supabase) return;
    let active = true,
      eventSeen = false;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      eventSeen = true;
      if (active)
        setState({ session, loading: false, recovery: event === 'PASSWORD_RECOVERY', error: null });
    });
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active && !eventSeen)
          setState({
            session: data.session,
            loading: false,
            recovery: false,
            error: error?.message ?? null,
          });
      })
      .catch(() => {
        if (active)
          setState({
            session: null,
            loading: false,
            recovery: false,
            error: 'Could not restore your session.',
          });
      });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
