import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { authRedirect, messageOf, safeNext, supabase } from '../../services/supabase';
import { useAuth } from './Auth';
import styles from '../personal/Personal.module.css';

export function AuthPage() {
  const [params] = useSearchParams(),
    next = safeNext(params.get('next'));
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin'),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const { session, loading } = useAuth();
  if (session && !loading)
    return (
      <Navigate
        to={next}
        replace
      />
    );
  return (
    <section className={styles.page}>
      <p className="eyebrow">YOUR SPACE / ACCOUNT</p>
      <h1>
        {mode === 'signup'
          ? 'Create an account'
          : mode === 'reset'
            ? 'Reset your password'
            : 'Sign in'}
      </h1>
      {!supabase ? (
        <p role="status">
          Account services are not configured yet. You can keep exploring and using your local
          archive. Follow the Supabase setup guide to enable accounts.
        </p>
      ) : (
        <>
          <form
            className={styles.form}
            onSubmit={async (event) => {
              event.preventDefault();
              if (!supabase) return;
              setBusy(true);
              setMessage('');
              try {
                const result =
                  mode === 'signup'
                    ? await supabase.auth.signUp({
                        email,
                        password,
                        options: { emailRedirectTo: authRedirect() },
                      })
                    : mode === 'reset'
                      ? await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: authRedirect('/auth/recovery'),
                        })
                      : await supabase.auth.signInWithPassword({ email, password });
                if (result.error) throw result.error;
                setMessage(
                  mode === 'signup'
                    ? 'Check your email to verify your account, if verification is enabled.'
                    : mode === 'reset'
                      ? 'If this email can receive a reset link, check your inbox.'
                      : 'Signed in.',
                );
              } catch (error) {
                setMessage(messageOf(error));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label htmlFor="account-email">Email</label>
            <input
              id="account-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mode !== 'reset' && (
              <>
                <label htmlFor="account-password">
                  Password {mode === 'signup' ? '(at least 8 characters)' : ''}
                </label>
                <input
                  id="account-password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={mode === 'signup' ? 8 : 1}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            )}
            <button disabled={busy || loading}>
              {busy
                ? 'Working…'
                : mode === 'signup'
                  ? 'Create account'
                  : mode === 'reset'
                    ? 'Send reset link'
                    : 'Sign in'}
            </button>
          </form>
          <button
            className="button"
            disabled={busy || loading}
            onClick={async () => {
              if (!supabase) return;
              setBusy(true);
              try {
                sessionStorage.setItem('noctis.auth.next', next);
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: authRedirect() },
                });
                if (error) throw error;
              } catch (error) {
                setMessage(messageOf(error));
                setBusy(false);
              }
            }}
          >
            Continue with Google
          </button>
          <p className={styles.row}>
            {(['signin', 'signup', 'reset'] as const)
              .filter((item) => item !== mode)
              .map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMode(item);
                    setMessage('');
                    setPassword('');
                  }}
                >
                  {item === 'signin'
                    ? 'Sign in'
                    : item === 'signup'
                      ? 'Create account'
                      : 'Forgot password?'}
                </button>
              ))}
          </p>
        </>
      )}
      {message && <p role="status">{message}</p>}
      <p>
        Signing in does not upload your local archive. Importing requires a separate confirmation.
      </p>
      <Link to="/my-archive">Continue with local archive</Link>
    </section>
  );
}
export function AuthCallback() {
  const { session, loading, error, recovery } = useAuth();
  const [next] = useState(() => {
    try {
      const value = sessionStorage.getItem('noctis.auth.next');
      sessionStorage.removeItem('noctis.auth.next');
      return safeNext(value);
    } catch {
      return '/account';
    }
  });
  if (recovery)
    return (
      <Navigate
        to="/auth/recovery"
        replace
      />
    );
  if (session && !loading)
    return (
      <Navigate
        to={next}
        replace
      />
    );
  return (
    <section className={styles.page}>
      <h1>Confirming your session</h1>
      <p role="status">
        {loading
          ? 'Opening your account…'
          : (error ?? 'The sign-in link could not establish a session. It may have expired.')}
      </p>
      <Link to="/auth">Return to sign in</Link>
    </section>
  );
}
export function PasswordRecovery() {
  const { session, recovery, loading } = useAuth();
  const [password, setPassword] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  useEffect(() => {
    document.title = 'NOCTIS — Password recovery';
  }, []);
  return (
    <section className={styles.page}>
      <h1>Choose a new password</h1>
      {loading ? (
        <p role="status">Checking recovery session…</p>
      ) : !session || !recovery ? (
        <p>
          Open a valid password recovery email in this browser to continue.{' '}
          <Link to="/auth">Request a new link</Link>
        </p>
      ) : done ? (
        <p>
          Password updated. <Link to="/account">Open Account</Link>
        </p>
      ) : (
        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!supabase) return;
            setBusy(true);
            const { error } = await supabase.auth.updateUser({ password });
            setBusy(false);
            setMessage(error ? error.message : 'Password updated.');
            setDone(!error);
          }}
        >
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={busy}>Update password</button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
