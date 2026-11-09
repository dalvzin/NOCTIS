import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('../features/personal/context', async (original) => ({
  ...(await original<typeof import('../features/personal/context')>()),
  useMotionPreference: () => preference.reduced,
}));
import { Home } from '../features/home/Home';
import { INTRO_SESSION_KEY } from '../features/home/useAwakening';
import { rooms } from '../data/rooms';

function open() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}
function entrance() {
  return screen.getByRole('region', { name: /Not everything deserves/ });
}
beforeEach(() => {
  sessionStorage.removeItem(INTRO_SESSION_KEY);
  localStorage.removeItem('noctis.home.intro-seen.v1');
  preference.reduced = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ items: [], statuses: [] }))),
  );
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('The Awakening becomes the Living Mosaic', () => {
  it('keeps all six semantic links in the same DOM throughout the 4.4 second sequence', () => {
    open();
    const mosaic = screen.getByRole('navigation', { name: 'Six cultural rooms' });
    const links = within(mosaic).getAllByRole('link');
    expect(links).toHaveLength(6);
    expect(entrance()).toHaveAttribute('data-phase', 'darkness');
    act(() => vi.advanceTimersByTime(200));
    expect(entrance()).toHaveAttribute('data-phase', 'wordmark');
    act(() => vi.advanceTimersByTime(1050));
    expect(entrance()).toHaveAttribute('data-phase', 'opening');
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1050));
    expect(entrance()).toHaveAttribute('data-phase', 'assembling');
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2100));
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
    within(mosaic)
      .getAllByRole('link')
      .forEach((link, index) => expect(link).toBe(links[index]));
  });
  it('skips immediately, clears pending transitions and remembers this session', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }));
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(entrance()).toHaveAttribute('data-instant', 'true');
    expect(screen.getByRole('link', { name: /The Reading Room/ })).toHaveFocus();
    act(() => vi.advanceTimersByTime(5000));
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe(String(performance.timeOrigin));
    cleanup();
    open();
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
  });
  it('shows the final composition directly on a return visit without making a network request', () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, String(performance.timeOrigin));
    const requests = vi.mocked(fetch).mock.calls.length;
    open();
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(entrance()).toHaveAttribute('data-instant', 'true');
    expect(vi.mocked(fetch).mock.calls).toHaveLength(requests);
  });
  it('ignores the permanent legacy marker and a previous document timestamp', () => {
    localStorage.setItem('noctis.home.intro-seen.v1', 'seen');
    sessionStorage.setItem(INTRO_SESSION_KEY, 'previous-document');
    open();
    expect(entrance()).toHaveAttribute('data-phase', 'darkness');
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
  });
  it('replays on request and supports Escape without late timer updates', () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, String(performance.timeOrigin));
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Replay intro' }));
    expect(entrance()).toHaveAttribute('data-phase', 'darkness');
    expect(entrance()).toHaveAttribute('data-instant', 'false');
    expect(screen.getByRole('button', { name: 'Skip intro' })).toHaveFocus();
    act(() => vi.advanceTimersByTime(1250));
    expect(entrance()).toHaveAttribute('data-phase', 'opening');
    fireEvent.keyDown(document, { key: 'Escape' });
    act(() => vi.advanceTimersByTime(6000));
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(screen.getByRole('link', { name: /The Reading Room/ })).toHaveFocus();
  });
  it('returns focus to the rooms when a focused intro finishes naturally', () => {
    open();
    act(() => screen.getByRole('button', { name: 'Skip intro' }).focus());
    act(() => vi.advanceTimersByTime(4400));
    expect(screen.getByRole('link', { name: /The Reading Room/ })).toHaveFocus();
  });
  it('reveals the page before keyboard navigation moves behind the intro', () => {
    open();
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true });
    fireEvent(document, event);
    expect(event.defaultPrevented).toBe(false);
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
  });
  it('cleans up timers and the portal when leaving during the opening', () => {
    const view = open();
    act(() => vi.advanceTimersByTime(1300));
    view.unmount();
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('respects reduced motion from the start', () => {
    preference.reduced = true;
    open();
    expect(entrance()).toHaveAttribute('data-reduced', 'true');
    expect(screen.queryByRole('button', { name: 'Replay intro' })).not.toBeInTheDocument();
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
  });
  it('finishes immediately when reduced motion is enabled during entry', () => {
    const view = open();
    act(() => vi.advanceTimersByTime(400));
    preference.reduced = true;
    view.rerender(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
    act(() => vi.advanceTimersByTime(4000));
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
  });
  it('does not restart the intro if reduced motion is subsequently turned off', () => {
    const view = open();
    preference.reduced = true;
    view.rerender(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    preference.reduced = false;
    view.rerender(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
  });
  it('makes essential navigation available during entry and reveals it on keyboard focus', () => {
    open();
    const link = screen.getByRole('link', { name: /The Reading Room/ });
    expect(link).toHaveAttribute('href', '/books');
    expect(link.closest('[aria-hidden=true]')).toBeNull();
    act(() => link.focus());
    expect(link).toHaveFocus();
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
  });
  it.each(rooms)('preserves the $slug route and accessible room name', (room) => {
    open();
    expect(screen.getByRole('link', { name: new RegExp(room.name) })).toHaveAttribute(
      'href',
      `/${room.slug}`,
    );
  });
  it('keeps real editorial works below the mosaic with lazy images and no fabricated popularity', () => {
    open();
    for (const title of [
      'Frankenstein',
      'Journey',
      'Ambient 2 (The Plateaux of Mirror)',
      'Metropolis',
      'Migrant Mother',
      'The Bedroom',
    ])
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText(/never a popularity ranking/)).toBeInTheDocument();
    for (const image of screen.getAllByRole('img'))
      expect(image).toHaveAttribute('loading', 'lazy');
  });
  it('marks offscreen scenes for pausing and disconnects its observer on unmount', () => {
    let callback: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(fn: IntersectionObserverCallback) {
          callback = fn;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    const view = open();
    act(() =>
      callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    );
    expect(entrance()).toHaveAttribute('data-visible', 'false');
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(7);
  });
  it('remains usable and skippable if session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }));
    expect(entrance()).toHaveAttribute('data-phase', 'ready');
  });
});
