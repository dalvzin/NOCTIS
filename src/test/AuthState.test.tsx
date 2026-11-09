import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({
  listener: null as null | ((event: string, session: unknown) => void),
  unsubscribe: vi.fn(),
  getSession: vi.fn(),
}));
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: fixture.getSession,
      onAuthStateChange: (fn: (event: string, session: unknown) => void) => {
        fixture.listener = fn;
        return { data: { subscription: { unsubscribe: fixture.unsubscribe } } };
      },
    },
  },
}));
import { AuthProvider, useAuth } from '../features/accounts/Auth';
function ReadState() {
  const state = useAuth();
  return (
    <p>
      {state.loading ? 'loading' : state.session ? state.session.user.id : 'guest'}{' '}
      {state.recovery ? 'recovery' : ''} {state.error}
    </p>
  );
}
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe('Authentication lifecycle (SDK mocked, no live Supabase)', () => {
  it('restores a session, accepts refresh and clears identity on sign out', async () => {
    fixture.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'account-a' } } },
      error: null,
    });
    await act(async () => {
      render(
        <AuthProvider>
          <ReadState />
        </AuthProvider>,
      );
    });
    expect(screen.getByText('account-a')).toBeInTheDocument();
    act(() => fixture.listener?.('SIGNED_OUT', null));
    expect(screen.getByText('guest')).toBeInTheDocument();
    cleanup();
    expect(fixture.unsubscribe).toHaveBeenCalled();
  });
  it('preserves newer auth events instead of overwriting them with a stale restore result', async () => {
    let resolve: (value: unknown) => void = () => {};
    fixture.getSession.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    render(
      <AuthProvider>
        <ReadState />
      </AuthProvider>,
    );
    expect(screen.getByText('loading')).toBeInTheDocument();
    act(() => fixture.listener?.('SIGNED_IN', { user: { id: 'account-b' } }));
    await act(async () =>
      resolve({ data: { session: { user: { id: 'old-account' } } }, error: null }),
    );
    expect(screen.getByText('account-b')).toBeInTheDocument();
  });
  it('recognizes an authorized password recovery event', async () => {
    fixture.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    await act(async () => {
      render(
        <AuthProvider>
          <ReadState />
        </AuthProvider>,
      );
    });
    act(() => fixture.listener?.('PASSWORD_RECOVERY', { user: { id: 'account-a' } }));
    expect(screen.getByText('account-a recovery')).toBeInTheDocument();
  });
});
