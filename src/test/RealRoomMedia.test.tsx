import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { curatedWorks } from '../data/curated';
import { rooms } from '../data/rooms';
import { roomWorks } from '../data/roomMedia';
import { getDestinations } from '../services/destinations';
import { RoomArtwork, RoomVisualSources } from '../features/experiences/RoomArtwork';

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('../features/personal/context', async (original) => ({
  ...(await original<typeof import('../features/personal/context')>()),
  useMotionPreference: () => preference.reduced,
}));
beforeEach(() => {
  preference.reduced = false;
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Real works replace decorative studies', () => {
  it.each(rooms)('uses only existing, attributed real works for $slug', (room) => {
    const selected = roomWorks(room.slug as Parameters<typeof roomWorks>[0]);
    expect(selected).toHaveLength(3);
    for (const work of selected) {
      expect(work.source.kind).toBe('curated');
      expect(work.image?.url).toMatch(/^\/artworks\/.+\.jpg$/);
      expect(work.image?.sourceUrl).toMatch(/^https:\/\//);
      expect(work.image?.credit).toBeTruthy();
      expect(work.image?.rights).toBeTruthy();
    }
  });
  it('offers four historic photographs with traceable sources and full records', () => {
    const photographs = curatedWorks.filter((work) => work.category === 'photography');
    expect(photographs).toHaveLength(4);
    for (const title of ['Earthrise', 'Sadie Pfeifer, a Cotton Mill Spinner']) {
      const work = photographs.find((item) => item.title === title)!;
      expect(work.facts.length).toBeGreaterThanOrEqual(2);
      expect(
        getDestinations(work).some(
          (destination) => destination.url === (work.source.kind !== 'demo' && work.source.url),
        ),
      ).toBe(true);
    }
  });
  it('provides separate source links without nesting them inside a room link', () => {
    render(<RoomVisualSources category="photography" />);
    fireEvent.click(screen.getByText('Artwork & sources'));
    expect(screen.getByRole('link', { name: /Earthrise/ })).toHaveAttribute(
      'href',
      'https://science.nasa.gov/resource/the-rising-earth-as-seen-by-apollo-8/',
    );
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
  it('loads video only on interaction and pauses when interaction ends', async () => {
    const view = render(<RoomArtwork category="films" />);
    const video = view.container.querySelector('video')!;
    expect(video).not.toHaveAttribute('src');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video.muted).toBe(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    fireEvent.pointerEnter(view.container.firstElementChild!);
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());
    expect(video).toHaveAttribute('src', '/media/trip-to-the-moon-excerpt.mp4');
    fireEvent.pointerLeave(view.container.firstElementChild!);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
  it('does not load or play a video with reduced motion, including a preference change', async () => {
    preference.reduced = true;
    const view = render(
      <RoomArtwork
        category="films"
        active
      />,
    );
    expect(view.container.querySelector('video')).not.toHaveAttribute('src');
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    preference.reduced = false;
    view.rerender(
      <RoomArtwork
        category="films"
        active
      />,
    );
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());
    preference.reduced = true;
    view.rerender(
      <RoomArtwork
        category="films"
        active
      />,
    );
    expect(view.container.querySelector('video')).not.toHaveAttribute('src');
    expect(view.container.firstElementChild).toHaveAttribute('data-active', 'false');
  });
  it('pauses offscreen video and keeps actual posters when playback fails', async () => {
    let observe!: IntersectionObserverCallback;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          observe = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    const view = render(
      <RoomArtwork
        category="films"
        active
      />,
    );
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());
    act(() =>
      observe([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver),
    );
    expect(view.container.firstElementChild).toHaveAttribute('data-active', 'false');
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    fireEvent.error(view.container.querySelector('video')!);
    expect(view.container.querySelector('video')).toBeNull();
    expect(view.container.querySelectorAll('img')).toHaveLength(3);
    expect(view.container.querySelector('svg')).toBeNull();
  });
});
