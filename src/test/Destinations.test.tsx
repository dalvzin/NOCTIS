import { manuscriptSpread } from './manuscriptHelpers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../app/App';
import { curatedWorks } from '../data/curated';
import { works, workPath } from '../data/works';
import { rooms } from '../data/rooms';
import type { Work } from '../types/catalog';
import { normalizeMusicBrainz, normalizeOpenLibrary } from '../services/providers';
import { destinationLabel, getDestinations, validateDestination } from '../services/destinations';
import { clearCatalogCache, fetchWork, isWork, searchCatalog } from '../services/catalog';
import { ExternalDestinations } from '../features/discovery/ExternalDestinations';

const spotify = `https://open.spotify.com/album/${'A'.repeat(22)}`; // ID sintético, nunca consultado ao vivo.
const mbid = 'aaaaaaaa-1111-2222-3333-444444444444';
const mb = { id: mbid, title: 'Synthetic link audit record', relations: [{ type: 'free streaming', url: { resource: spotify } }] };
afterEach(() => {
  cleanup(); clearCatalogCache();
  vi.mocked(fetch).mockReset().mockImplementation(async url => new Response(JSON.stringify(String(url).includes('/status') ? [] : { items: [], statuses: [] })));
});

describe('Extraction and destination classification', () => {
  it('extracts a supplied Spotify URL and retains a MusicBrainz information fallback', () => {
    const work = normalizeMusicBrainz(mb)!;
    expect(getDestinations(work).map(destinationLabel)).toEqual(['Listen on Spotify', 'View on MusicBrainz']);
    expect(getDestinations(work)[0].url).toBe(spotify);
  });
  it('does not guess Spotify URLs from titles or accept artist/search links as playback', () => {
    const work = normalizeMusicBrainz({ ...mb, relations: [
      { type: 'free streaming', url: { resource: 'https://open.spotify.com/search/Synthetic' } },
      { type: 'free streaming', url: { resource: 'https://open.spotify.com/artist/' + 'A'.repeat(22) } },
      { type: 'free streaming', url: { resource: 'https://open.spotify.com.attacker.invalid/album/' + 'A'.repeat(22) } },
      { type: 'free streaming', ended: true, url: { resource: spotify } },
    ] })!;
    expect(getDestinations(work).map(destinationLabel)).toEqual(['View on MusicBrainz']);
  });
  it('distinguishes missing relation data from a complete empty list', () => {
    expect(normalizeMusicBrainz({ id: mbid, title: 'Fixture' })!.destinations).toBeUndefined();
    expect(normalizeMusicBrainz({ id: mbid, title: 'Fixture', relations: [] })!.destinations).toEqual([]);
  });
  it('extracts a provider-supplied bookstore product, preserving a catalog fallback', () => {
    const book = normalizeOpenLibrary({ key: '/works/OL123W', title: 'Fixture', links: [
      { title: 'Review', url: 'https://example.org/review' },
      { title: 'Store', url: 'https://www.amazon.com/dp/1234567890' },
    ] })!;
    expect(getDestinations(book).map(destinationLabel)).toEqual(['View Bookstore Page', 'View Book Details']);
    expect(getDestinations(book)[1].url).toBe('https://openlibrary.org/works/OL123W');
  });
  it('recognizes Google Books records with an ID without calling them a purchase', () => {
    const book = normalizeOpenLibrary({ key: '/works/OL124W', title: 'Fixture', links: [{ url: 'https://books.google.com/books?id=record123&q=passage' }] })!;
    expect(getDestinations(book).every(destination => destination.kind === 'book-details')).toBe(true);
    expect(book.destinations).toHaveLength(1);
  });
  it.each(['javascript:alert(1)', 'https://user:password@open.spotify.com/album/' + 'A'.repeat(22), 'https://open.spotify.com:444/album/' + 'A'.repeat(22)])('rejects unsafe destination %s', url => {
    expect(validateDestination({ kind: 'spotify', url, verifiedBy: 'provider' }, 'music')).toBeUndefined();
  });
  it('upgrades legacy HTTP only for known HTTPS services and rejects category/type mismatch', () => {
    expect(validateDestination({ kind: 'spotify', url: spotify.replace('https:', 'http:'), verifiedBy: 'provider' }, 'music')?.url).toBe(spotify);
    expect(validateDestination({ kind: 'spotify', url: spotify, verifiedBy: 'provider' }, 'books')).toBeUndefined();
    expect(validateDestination({ kind: 'tmdb', url: 'https://www.themoviedb.org/search?query=Metropolis', verifiedBy: 'provider' }, 'films')).toBeUndefined();
    expect(validateDestination({ kind: 'streaming', url: 'https://www.themoviedb.org/movie/19', verifiedBy: 'provider' }, 'films')).toBeUndefined();
    expect(validateDestination({ kind: 'bookstore', url: 'https://openlibrary.org/works/OL123W', verifiedBy: 'provider' }, 'books')).toBeUndefined();
  });
});

describe('Coverage and rendering across six categories', () => {
  const expected = { books: 'View Book Details', music: 'View on MusicBrainz', films: 'View on TMDB', games: 'Visit Official Website', photography: 'View Original Photograph', art: 'View Museum Collection' };
  it.each(rooms)('keeps destinations out of preview and exposes verified links in full detail for $slug', async room => {
    const user = userEvent.setup();
    const work = curatedWorks.find(item => item.category === room.slug)!;
    render(<MemoryRouter initialEntries={[`/search?category=${room.slug}&source=real`]}><App/></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: `Quick preview: ${work.title}` }));
    const dialog = screen.getByRole('dialog');
    const label = expected[work.category];
    expect(within(dialog).queryByRole('link', { name: new RegExp(`^${label}`) })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('link', { name: 'Open full record' }));
    if(room.slug === 'books') await manuscriptSpread(user,'archive');
    expect(screen.getByRole('link', { name: new RegExp(`^${label}`) })).toHaveAttribute('href', getDestinations(work)[0].url);
    expect(screen.getByRole('link', { name: new RegExp(`^${label}`) })).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it.each(rooms)('shows an explicit unavailable state for fictional $slug items', room => {
    const work = works.find(item => item.category === room.slug)!;
    render(<ExternalDestinations work={work}/>);
    expect(screen.getByText(/No verified external destination.*fictional demonstration/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it.each(rooms)('keeps $slug metadata without a provider URL and renders unavailable instead of a broken action', room => {
    const base = curatedWorks.find(work => work.category === room.slug)!;
    const work: Work = { ...base, id: `fixture:${room.slug}:missing`, destinations: undefined, source: { kind: 'live', provider: 'fixture', externalId: 'missing', label: 'Synthetic fixture', attribution: 'Test only' } };
    expect(isWork(work)).toBe(true);
    render(<ExternalDestinations work={work}/>);
    expect(screen.getByText('No verified external destination is available for this record.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('retains records without a usable source URL and renders no broken link', () => {
    const work: Work = { ...normalizeMusicBrainz(mb)!, destinations: undefined, source: { kind: 'live', provider: 'unknown', externalId: 'fixture', label: 'Fixture', attribution: 'Synthetic test', url: 'javascript:alert(1)' } };
    expect(isWork(work)).toBe(true);
    render(<ExternalDestinations work={work}/>);
    expect(screen.getByText('No verified external destination is available for this record.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('Normalization and cache preservation', () => {
  it('enriches the full record with a provider-supplied Spotify link, not a generated search URL', async () => {
    const id = 'bbbbbbbb-1111-2222-3333-444444444444';
    const thin = normalizeMusicBrainz({ id, title: 'Preview fixture' })!;
    const full = normalizeMusicBrainz({ ...mb, id, title: 'Preview fixture' })!;
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ item: full })));
    render(<MemoryRouter initialEntries={[workPath(thin)]}><App/></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /^Listen on Spotify/ })).toHaveAttribute('href', spotify);
    expect(screen.getByRole('link', { name: /^View on MusicBrainz/ })).toHaveAttribute('href', `https://musicbrainz.org/release-group/${id}`);
  });
  it('preserves enriched links through thin search and cached results, but accepts explicit removal', async () => {
    const item = normalizeMusicBrainz(mb)!;
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ item })));
    await fetchWork('music', item.id);
    const thin = { ...normalizeMusicBrainz({ id: mbid, title: mb.title })!, source: { ...item.source, url: undefined } };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ items: [thin], statuses: [] })));
    const result = await searchCatalog('synthetic-audit', 'music');
    expect(getDestinations(result.items[0])[0].url).toBe(spotify);
    expect(result.items[0].source.kind !== 'demo' && result.items[0].source.url).toBe(`https://musicbrainz.org/release-group/${mbid}`);
    const withoutLinks = { ...thin, destinations: [] };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ item: withoutLinks })));
    const refreshed = await fetchWork('music', item.id, undefined, true);
    expect(getDestinations(refreshed!).map(destinationLabel)).toEqual(['View on MusicBrainz']);
    const cached = await searchCatalog('synthetic-audit', 'music');
    expect(getDestinations(cached.items[0]).map(destinationLabel)).toEqual(['View on MusicBrainz']);
  });
});
